import {QueryResult} from "pg";
import {Entities, FilterFunction} from "../Types";
import {IQuery} from "./IQuery";

export interface IDeleteQuery<T extends Entities> extends IQuery<T> {
    where(filter: FilterFunction<T>): IDeleteQuery<T>;

    include(tables: (keyof T) | (keyof T)[]): IDeleteQuery<T>;

    delete(values: any[]): Promise<QueryResult>;

     deleteEntity(entity: T[keyof T]): Promise<QueryResult>;
}