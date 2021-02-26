import {PoolClient, QueryResult} from "pg";
import {IUpdateQuery} from "./IUpdateQuery";
import {ISelectQuery} from "./ISelectQuery";
import {IInsertQuery} from "./IInsertQuery";
import {IDeleteQuery} from "./IDeleteQuery";
import {ICreateQuery} from "./ICreateQuery";
import {Entities, FilterFunction, ResultSelection, DatabaseStructure, DbConnection} from "../Types";
import {TransactionResult} from "../Enums";

export interface IDbSet<T extends Entities> {
    readonly connection: DbConnection;
    readonly tableName: keyof T;
    readonly tables: DatabaseStructure<T>

    createQuery(): ICreateQuery<T>;

    insertQuery(): IInsertQuery<T>;

    updateQuery(where: FilterFunction<T>): IUpdateQuery<T>;

    deleteQuery(where: FilterFunction<T>): IDeleteQuery<T>;

    selectQuery<R>(selection: ResultSelection<T, R>): ISelectQuery<T, R>;


    select<R>(selection: ResultSelection<T, R>): ISelectQuery<T, R>;

    include<R>(table: (keyof T) | (keyof T)[]): ISelectQuery<T, R>;

    where<R>(where: FilterFunction<T>): ISelectQuery<T, R>;

    groupBy<R>(columns: (keyof R) | (keyof R)[]): ISelectQuery<T, R>;

    orderBy<R>(column: keyof R, ascending: boolean): ISelectQuery<T, R>;

    single(where: FilterFunction<T>): Promise<(T[keyof T]) | null>;

    toList(): Promise<(T[keyof T])[]>;


    add(entity: T[keyof T] | (T[keyof T])[]): Promise<QueryResult>;

    update(entity: (T[keyof T])): Promise<QueryResult>;

    remove(entity: T[keyof T]): Promise<QueryResult>;


    runSql(sql: string, values?: any[]): Promise<QueryResult>;

    transaction(transaction: (client: IDbSet<T>) => Promise<TransactionResult>): Promise<void>;

    dispose(): Promise<void>;
}
