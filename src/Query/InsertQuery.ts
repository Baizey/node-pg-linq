import {Pool, PoolClient, QueryResult} from "pg";
import {QueryBase} from "../Infrastructure/BaseQueries/QueryBase";
import {IInsertQuery} from "../Infrastructure/Interfaces/Queries/IInsertQuery";
import {IColumn} from "../Infrastructure/Interfaces/IAtom";
import {DatabaseStructure, DbConnection} from "../Infrastructure/Interfaces/Types";

export class InsertQuery<T> extends QueryBase<T> implements IInsertQuery<T> {
    private isIgnoringConflicts: boolean;
    private sqlCache?: string;
    private readonly columns: [string, IColumn<any>][];

    constructor(table: keyof T,
                connection: DbConnection,
                definition: DatabaseStructure<T>) {
        super(table, connection, definition);
        this.isIgnoringConflicts = false;

        const columns: [string, IColumn<any>][] = Object.entries(this.tables[this._from[0]].columns);
        this.columns = columns.filter(([, column]) => !column.isDatabaseGenerated);
    }

    willIgnoreConflict(): IInsertQuery<T> {
        this.sqlCache = undefined;
        this.isIgnoringConflicts = true;
        return this;
    }

    generateSql(entities: number = 1): string {
        if (this.sqlCache && entities === 1) return this.sqlCache;

        const keys = this.columns.map(([, column]) => column.name).join(', ');

        let i = 1;
        const values = [...new Array(entities)]
            .map(() => `(${this.columns.map(() => `$${i++}`).join(', ')})`)
            .join(', ');

        const ignoreConflict = (this.isIgnoringConflicts && ' ON CONFLICT DO NOTHING') || '';
        const tableName = this.tables[this._from[0]].name;

        return this.sqlCache = `INSERT INTO ${tableName} (${keys}) VALUES ${values}${ignoreConflict}`;
    }

    add(entities: T[keyof T] | T[keyof T][]): Promise<QueryResult> {
        entities = Array.isArray(entities) ? entities : [entities];

        const sql = this.generateSql(entities.length);
        const values = entities
            .map(entity => this.columns
                .map(([key]) => entity[key as keyof T[keyof T]]))
            .reduce((a, b) => a.concat(b));

        return this.runSql(sql, values);
    }


}