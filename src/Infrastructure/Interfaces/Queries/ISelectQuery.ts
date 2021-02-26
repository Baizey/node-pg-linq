import {Entities, FilterFunction, ResultSelection} from "../Types";
import {JoinType} from "../Enums";
import {IQuery} from "./IQuery";

export interface ISelectQuery<T extends Entities, R> extends IQuery<T> {

    include(tables: keyof T): ISelectQuery<T, R>;

    where(filter: FilterFunction<T>): ISelectQuery<T, R>;

    join(type: JoinType, table: keyof T, filter: FilterFunction<T>): ISelectQuery<T, R>;

    select(selection: ResultSelection<T, R>): ISelectQuery<T, R>;

    limit(limit: number): ISelectQuery<T, R>;

    offset(offset: number): ISelectQuery<T, R>;

    having(filter: FilterFunction<T>): ISelectQuery<T, R>;

    distinctByAll(): ISelectQuery<T, R>;

    distinctBy(columns: (keyof R) | (keyof R)[]): ISelectQuery<T, R>;

    groupBy(columns: (keyof R) | (keyof R)[]): ISelectQuery<T, R>;

    orderBy(column: keyof R, ascending: boolean): ISelectQuery<T, R>;

    single(values?: any[]): Promise<R | null>;

    toList(values?: any[]): Promise<R[]>;
}