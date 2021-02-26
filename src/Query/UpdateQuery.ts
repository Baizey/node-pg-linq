import {QueryResult} from "pg";
import {QueryBase} from "../Infrastructure/BaseQueries/QueryBase";
import {IUpdateQuery} from "../Infrastructure/Interfaces/Queries/IUpdateQuery";
import {IColumn, IJoin} from "../Infrastructure/Interfaces/IAtom";
import {
    ColumnsSelectionFilter,
    DatabaseStructure,
    DbConnection,
    FilterFunction
} from "../Infrastructure/Interfaces/Types";
import {Where} from "../Infrastructure/Where";

export class UpdateQuery<T> extends QueryBase<T> implements IUpdateQuery<T> {
    private sqlCache?: string;
    readonly _ignoredColumns: { [key: string]: IColumn<any> }
    private _where: string;
    private readonly columns: [string, IColumn<any>][];

    constructor(from: keyof T | (keyof T)[],
                connection: DbConnection,
                definition: DatabaseStructure<T>) {
        super(from, connection, definition);
        this._ignoredColumns = {};
        const columns: IColumn<any>[] = Object.values(this.tables[this._from[0]].columns);
        this.dontUpdate(() => columns.filter(e => e.isPrimary));
        this.columns = Object.entries(this.tables[this._from[0]].columns);
        this._where = '';
    }

    where(filter: FilterFunction<T>): IUpdateQuery<T> {
        this.sqlCache = undefined;
        this._where = new Where<T>(this.tables, filter).generateSql();
        return this;
    }

    include(table: keyof T): IUpdateQuery<T> {
        this.sqlCache = undefined;
        this._from.push(table);
        return this;
    }

    dontUpdate(selection: ColumnsSelectionFilter<T, any>): IUpdateQuery<T> {
        this.sqlCache = undefined;
        let columns = selection(this.tables);
        columns = Array.isArray(columns) ? columns : [columns];
        columns.forEach(column => this._ignoredColumns[column.name] = column);
        return this;
    }

    generateSql(): string {
        if (this.sqlCache) return this.sqlCache;
        const columns: IColumn<any>[] = Object.values(this.tables[this._from[0]].columns);
        const updating = columns
            .filter(column => !this._ignoredColumns[column.name])
            .map(column => `${column.name} = $\{entity_${column.name}\}`).join(', ');
        const tableName = this.tables[this._from[0]].name;
        const include = this._from.length <= 1 ? ''
            : ` FROM ${this._from.splice(1).map(e => this.tables[e].name).join(', ')}`;
        return this.sqlCache = `UPDATE ${tableName} SET ${updating}${include}${this._where}`;
    }


    update(entity: T[keyof T] | T[keyof T][], values: any[] = []): Promise<QueryResult> {
        let sql = this.generateSql();
        values = values.map(e => e);
        Object.entries(entity).forEach(([key, value]) => {
            if (sql.indexOf(`$\{entity_${key}\}`) < 0) return;
            values.push(value);
            const index = values.length;
            sql = sql.replace(`$\{entity_${key}\}`, () => `$${index}`);
        });
        return this.runSql(sql, values);
    }

    updateEntity(entity: T[keyof T]): Promise<QueryResult> {
        this.whereEntity();
        const sql = this.generateSql();
        const values = this.columns
            .filter(([, column]) => column.isPrimary)
            .map(([key]) => entity[key as keyof T[keyof T]]);
        return this.runSql(sql, values);
    }

    private whereEntity(): IUpdateQuery<T> {
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