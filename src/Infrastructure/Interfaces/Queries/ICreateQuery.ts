import {QueryResult} from "pg";
import {IColumn, IConstraint} from "../IAtom";
import {IQuery} from "./IQuery";

export interface ICreateQuery<T> extends IQuery<T> {
    readonly constraints: IConstraint[];

    onConflictIgnore(ignore: boolean): ICreateQuery<T>;

    addUniqueGroup(columns: IColumn<any> | IColumn<any>[]): ICreateQuery<T>;

    createTable(): Promise<QueryResult>;
}