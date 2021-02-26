import {QueryResult} from "pg";
import {IQuery} from "./IQuery";

export interface IInsertQuery<T> extends IQuery<T> {

    willIgnoreConflict(value: boolean): IInsertQuery<T>;

    add(entity: T[keyof T] | T[keyof T][]): Promise<QueryResult>;
}