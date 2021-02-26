import {QueryResult} from "pg";
import {QueryBase} from "../Infrastructure/BaseQueries/QueryBase";
import {IDeleteQuery} from "../Infrastructure/Interfaces/Queries/IDeleteQuery";
import {IColumn} from "../Infrastructure/Interfaces/IAtom";
import {DatabaseStructure, DbConnection, FilterFunction} from "../Infrastructure/Interfaces/Types";
import {Where} from "../Infrastructure/Where";

export class DeleteQuery<T> extends QueryBase<T> implements IDeleteQuery<T> {
    private sqlCache?: string;
    private _where: string;
    private readonly columns: [string, IColumn<any>][];

    constructor(from: (keyof T) | (keyof T)[],
                connection: DbConnection,
                definition: DatabaseStructure<T>) {
        super(from, connection, definition);
        this.columns = Object.entries(this.tables[this._from[0]].columns);
        this._where = '';
    }

    include(table: keyof T): IDeleteQuery<T> {
        this.sqlCache = undefined;
        this._from.push(table);
        return this;
    }

    where(filter: FilterFunction<T>): IDeleteQuery<T> {
        this.sqlCache = undefined;
        this._where = new Where<T>(this.tables, filter).generateSql();
        return this;
    }

    generateSql(): string {
        if (this.sqlCache) return this.sqlCache;
        const tableName = this.tables[this._from[0]].name;
        const include = this._from.length <= 1 ? ''
            : ` USING ${this._from.splice(1).map(e => this.tables[e].name).join(', ')}`;
        return this.sqlCache = `DELETE FROM ${tableName}${include}${this._where}`;
    }

    delete(values: any[] = []): Promise<QueryResult> {
        return this.runSql(this.generateSql(), values);
    }

    deleteEntity(entity: T[keyof T]): Promise<QueryResult> {
        this.whereEntity();
        const sql = this.generateSql();
        const values = this.columns
            .filter(([, column]) => column.isPrimary)
            .map(([key]) => entity[key as keyof T[keyof T]]);
        return this.runSql(sql, values);
    }

    private whereEntity(): IDeleteQuery<T> {
        this.sqlCache = undefined;
        const table = this.tables[this._from[0]].name;
        let i = 1;
        this._where = ` WHERE ${this.columns
            .filter(([, column]) => column.isPrimary)
            .map(([, column]) => column.name)
            .map(name => `${table}.${name} = $${i++}`)
            .join(' AND ')}`;
        return this;
    }
}