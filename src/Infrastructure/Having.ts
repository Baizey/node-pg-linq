import {FilterParser} from "./FilterParser";
import {IHaving} from "./Interfaces/IAtom";
import {FilterFunction, DatabaseStructure} from "./Interfaces/Types";

export class Having<T> implements IHaving<T> {
    readonly parserSql: string;
    readonly tables: DatabaseStructure<T>;

    constructor(tables: DatabaseStructure<T>, filter: FilterFunction<T>) {
        this.tables = tables;
        this.parserSql = new FilterParser<T>(tables, filter).generateSql();
    }

    generateSql() {
        return ` HAVING ${this.parserSql}`;
    }
}