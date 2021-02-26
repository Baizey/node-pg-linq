import {QueryResult} from "pg";
import {IQuery} from "../Interfaces/Queries/IQuery";
import {DatabaseStructure, DbConnection} from "../Interfaces/Types";

export abstract class QueryBase<T> implements IQuery<T> {
    readonly connection: DbConnection;
    protected readonly _from: (keyof T)[];
    readonly tables: DatabaseStructure<T>;

    protected constructor(tableName: keyof T | (keyof T)[],
                          connection: DbConnection,
                          tables: DatabaseStructure<T>) {
        this.connection = connection;
        this._from = Array.isArray(tableName) ? tableName : [tableName];
        this.tables = tables;
    }

    runSql(sql: string, values: any[] = []): Promise<QueryResult> {
        return this.connection.query(sql, values);
    }

    abstract generateSql(): string;
}

