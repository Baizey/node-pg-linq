import {QueryResult} from "pg";
import {ColumnsSelectionFilter, Entities, FilterFunction} from "../Types";
import {IQuery} from "./IQuery";

export interface IUpdateQuery<T extends Entities> extends IQuery<T> {
    where(filter: FilterFunction<T>): IUpdateQuery<T>;

    include(table: keyof T): IUpdateQuery<T>;

    dontUpdate(selection: ColumnsSelectionFilter<T, any>): IUpdateQuery<T>;

    update(entity: T[keyof T] | T[keyof T][], values: any[]): Promise<QueryResult>;
}