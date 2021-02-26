import {IWhere} from "./Interfaces/IAtom";
import {FilterFunction, DatabaseStructure} from "./Interfaces/Types";
import {FilterParser} from "./FilterParser";

export class Where<T> implements IWhere<T> {
    readonly parserSql: string;
    readonly tables: DatabaseStructure<T>;

    constructor(tables: DatabaseStructure<T>, filter: FilterFunction<T> | string) {
        if (typeof (filter) === 'string')
            this.parserSql = filter;
        else
            this.parserSql = new FilterParser<T>(tables, filter).generateSql();
        this.tables = tables;
    }

    generateSql(): string {
        return ` WHERE ${this.parserSql}`
    }
}