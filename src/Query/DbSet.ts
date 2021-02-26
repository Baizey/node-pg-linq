import {Client, Pool, QueryResult} from "pg";
import {IDbSet} from "../Infrastructure/Interfaces/Queries/IDbSet";
import {DatabaseStructure, DbConnection, FilterFunction, ResultSelection} from "../Infrastructure/Interfaces/Types";
import {ICreateQuery} from "../Infrastructure/Interfaces/Queries/ICreateQuery";
import {CreateQuery} from "./CreateQuery";
import {IInsertQuery} from "../Infrastructure/Interfaces/Queries/IInsertQuery";
import {InsertQuery} from "./InsertQuery";
import {IUpdateQuery} from "../Infrastructure/Interfaces/Queries/IUpdateQuery";
import {UpdateQuery} from "./UpdateQuery";
import {ISelectQuery} from "../Infrastructure/Interfaces/Queries/ISelectQuery";
import {SelectQuery} from "./SelectQuery";
import {IDeleteQuery} from "../Infrastructure/Interfaces/Queries/IDeleteQuery";
import {DeleteQuery} from "./DeleteQuery";
import {TransactionResult} from "../Infrastructure/Interfaces/Enums";

export class DbSet<T> implements IDbSet<T> {
    readonly connection: DbConnection;
    readonly tableName: keyof T;
    readonly tables: DatabaseStructure<T>

    constructor(
        tableName: keyof T,
        definition: DatabaseStructure<T>,
        connection: DbConnection) {
        this.tableName = tableName;
        this.connection = connection;
        this.tables = definition;
    }

    createQuery(): ICreateQuery<T> {
        return new CreateQuery<T>(this.tableName, this.connection, this.tables);
    }

    insertQuery(): IInsertQuery<T> {
        return new InsertQuery<T>(this.tableName, this.connection, this.tables);
    }

    updateQuery(where: FilterFunction<T>): IUpdateQuery<T> {
        return new UpdateQuery<T>(this.tableName, this.connection, this.tables)
            .where(where);
    }

    selectQuery<R>(selection?: ResultSelection<T, R>): ISelectQuery<T, R> {
        const query = new SelectQuery<T, R>(this.tableName, this.connection, this.tables)
        if (selection) query.select(selection);
        return query;
    }

    deleteQuery(where: FilterFunction<T>): IDeleteQuery<T> {
        return new DeleteQuery<T>(this.tableName, this.connection, this.tables)
            .where(where);
    }

    runSql(sql: string, values: any[] = []): Promise<QueryResult> {
        return this.connection.query(sql, values);
    }

    select<R>(selection: ResultSelection<T, R>): ISelectQuery<T, R> {
        return this.selectQuery<R>().select(selection);
    }

    include<R>(table: keyof T): ISelectQuery<T, R> {
        return this.selectQuery<R>().include(table);
    }

    where<R>(where: FilterFunction<T>): ISelectQuery<T, R> {
        return this.selectQuery<R>().where(where);
    }

    groupBy<R>(columns: (keyof R) | (keyof R)[]): ISelectQuery<T, R> {
        return this.selectQuery<R>().groupBy(columns);
    }

    orderBy<R>(column: keyof R, ascending: boolean): ISelectQuery<T, R> {
        return this.selectQuery<R>().orderBy(column, ascending);
    }

    async single<R>(where: FilterFunction<T>): Promise<R | null> {
        return await this.selectQuery<R>().where(where).single();
    }

    async toList(): Promise<(T[keyof T])[]> {
        return await this.selectQuery<T[keyof T]>().toList();
    }

    add(entities: T[keyof T] | T[keyof T][]): Promise<QueryResult> {
        return this.insertQuery().add(entities);
    }

    remove(entity: T[keyof T]): Promise<QueryResult> {
        return new DeleteQuery(this.tableName, this.connection, this.tables).deleteEntity(entity);
    }

    update(entity: T[keyof T]): Promise<QueryResult> {
        return new UpdateQuery(this.tableName, this.connection, this.tables).updateEntity(entity);
    }

    async transaction(transaction: (client: IDbSet<T>) => Promise<TransactionResult>): Promise<void> {
        if (!((this.connection instanceof Pool) || (this.connection instanceof Client)))
            throw new Error('connection is not PoolClient and cannot have transactions internal transactions');

        const client = (this.connection instanceof Pool)
            ? await this.connection.connect()
            : this.connection;

        if (!client) throw new Error('Unable to get pool client');

        const conn = new DbSet<T>(this.tableName, this.tables, client);
        await conn.runSql('BEGIN TRANSACTION;');

        await transaction(conn)
            .catch(err => err)
            .then(async resp => {
                switch (resp) {
                    case TransactionResult.commit:
                        return await conn.runSql('COMMIT TRANSACTION;');
                    case TransactionResult.rollback:
                        return await conn.runSql('ROLLBACK TRANSACTION;');
                    default:
                        await conn.runSql('ROLLBACK TRANSACTION;');
                        throw resp;
                }

            })
            .finally(() => {
                if ((this.connection instanceof Pool) || (this.connection instanceof Client))
                    return;
                this.connection.release();
            });
    }

    async dispose(): Promise<void> {
        if (this.connection instanceof Pool)
            return await this.connection.end();
        else if (this.connection instanceof Client)
            return await this.connection.end();
        else
            return this.connection.release();
    }
}