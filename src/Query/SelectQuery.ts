import {QueryBase} from "../Infrastructure/BaseQueries/QueryBase";
import {ISelectQuery} from "../Infrastructure/Interfaces/Queries/ISelectQuery";
import {IColumnOrdering, IHaving, IJoin, ISelect, IWhere} from "../Infrastructure/Interfaces/IAtom";
import {FilterFunction, ResultSelection, DatabaseStructure, DbConnection} from "../Infrastructure/Interfaces/Types";
import {Select} from "../Infrastructure/Select";
import {ColumnOrdering} from "../Infrastructure/ColumnOrdering";
import {Having} from "../Infrastructure/Having";
import {Where} from "../Infrastructure/Where";
import {JoinType} from "../Infrastructure/Interfaces/Enums";
import {Join} from "../Infrastructure/Join";
import {Pool, PoolClient} from "pg";


export class SelectQuery<T, R> extends QueryBase<T> implements ISelectQuery<T, R> {
    private _sqlCache?: string;
    private _having?: IHaving<T>;
    private _limit?: number;
    private _offset?: number;
    private _groupColumns: (keyof R)[];
    private _orderColumns: IColumnOrdering<R>[];
    private _distinctColumns: null | (keyof R)[];
    private _select?: ISelect<T, R>;
    private _where?: IWhere<T>;
    private _joins: IJoin<T>[];

    constructor(from: keyof T | (keyof T)[],
                connection: DbConnection,
                definition: DatabaseStructure<T>) {
        super(from, connection, definition);
        this._groupColumns = [];
        this._orderColumns = [];
        this._distinctColumns = null;
        this._joins = [];
    }

    select(selection: ResultSelection<T, R>): ISelectQuery<T, R> {
        this._sqlCache = undefined;
        this._select = new Select<T, R>(this.tables, selection);
        return this;
    }

    include(table: keyof T): ISelectQuery<T, R> {
        this._sqlCache = undefined;
        this._from.push(table);
        return this;
    }

    distinctByAll(): ISelectQuery<T, R> {
        this._sqlCache = undefined;
        this._distinctColumns = [];
        return this;
    }

    distinctBy(columns: (keyof R) | (keyof R)[]): ISelectQuery<T, R> {
        this._sqlCache = undefined;
        this._distinctColumns = Array.isArray(columns) ? columns : [columns];
        return this;
    }

    groupBy(columns: (keyof R) | (keyof R)[]): ISelectQuery<T, R> {
        this._sqlCache = undefined;
        this._groupColumns = Array.isArray(columns) ? columns : [columns];
        return this;
    }

    orderBy(column: keyof R, ascending: boolean): ISelectQuery<T, R> {
        this._sqlCache = undefined;
        this._orderColumns.push(new ColumnOrdering<R>(column, ascending));
        return this;
    }

    limit(limit: number): ISelectQuery<T, R> {
        this._sqlCache = undefined;
        this._limit = limit;
        return this;
    }

    offset(offset: number): ISelectQuery<T, R> {
        this._sqlCache = undefined;
        this._offset = offset;
        return this;
    }

    having(filter: FilterFunction<T>): ISelectQuery<T, R> {
        this._sqlCache = undefined;
        this._having = new Having<T>(this.tables, filter);
        return this;
    }

    where(filter: FilterFunction<T>): ISelectQuery<T, R> {
        this._sqlCache = undefined;
        this._where = new Where<T>(this.tables, filter);
        return this;
    }

    join(type: JoinType, table: keyof T, filter: FilterFunction<T>): ISelectQuery<T, R> {
        this._sqlCache = undefined;
        this._joins.push(new Join<T>(this.tables, type, table, filter));
        return this;
    }

    generateSql(): string {
        const select = this._select?.generateSql || '*';
        const where = this._where?.generateSql || '';
        const having = this._having?.generateSql || '';
        const join = this._joins.map(e => e.generateSql()).join(', ') || '';

        const limit = (this._limit && ` LIMIT ${this._limit}`) || '';
        const offset = (this._offset && ` OFFSET ${this._offset}`) || '';

        const order = (this._orderColumns.length && ` ORDER BY ${this._orderColumns.map(e => e.generateSql()).join(', ')}`) || '';
        const group = (this._groupColumns.length && ` GROUP BY ${this._groupColumns.join(', ')}`) || '';
        const distinct = !this._distinctColumns ? ' DISTINCT' : '';

        const tableNames = this._from.map(e => this.tables[e].name).join(', ');

        return `SELECT ${select} FROM ${tableNames}${join}${where}${group}${having}${order}${limit}${offset}`;
    }

    async single(values?: any[]): Promise<R | null> {
        values = values || [];
        const result = await this.runSql(this.generateSql(), values);
        return result.rows[0] || null;
    }

    async toList(values?: any[]): Promise<R[]> {
        values = values || [];
        const result = await this.runSql(this.generateSql(), values);
        return result.rows;
    }
}