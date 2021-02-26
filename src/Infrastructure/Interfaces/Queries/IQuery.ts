import {Entities, DatabaseStructure, DbConnection} from "../Types";
import {QueryResult} from "pg";
import {GeneratesSql} from "../IAtom";

export interface IQuery<T extends Entities> extends GeneratesSql {
    readonly connection: DbConnection;
    readonly tables: DatabaseStructure<T>;

    runSql(sql: string, values: any[]): Promise<QueryResult>;
}