import {IColumn} from "./IAtom";
import {Client, Pool, PoolClient} from "pg";

export type ColumnsSelectionFilter<T, R> = (tables: DatabaseStructure<T>) => (IColumn<any> | IColumn<any>[]);
export type FilterFunction<T> = (entities: T, values: any[]) => boolean;

export type DbConnection = Pool | Client | PoolClient;
export type Entities = { [name: string]: any }
export type TableStructure<T extends {}> = { name: string, columns: { [key in keyof T]: IColumn<T[key]> } };
export type DatabaseStructure<T extends Entities> = { [key in keyof T]: TableStructure<T[key]> }
export type ResultSelection<T, R> = (tables: T, values: any[]) => R;
export type KeyPair<R> = { [key in keyof R]: string }