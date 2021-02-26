import {IJoin} from "./Interfaces/IAtom";
import {JoinType} from "./Interfaces/Enums";
import {FilterFunction, DatabaseStructure} from "./Interfaces/Types";
import {FilterParser} from "./FilterParser";

export class Join<T> implements IJoin<T> {
    readonly table: keyof T;
    readonly tables: DatabaseStructure<T>;
    readonly type: JoinType;
    readonly parserSql: string;

    constructor(tables: DatabaseStructure<T>, type: JoinType, table: keyof T, filter: FilterFunction<T>) {
        this.tables = tables;
        this.table = table;
        this.type = type;
        this.parserSql = new FilterParser<T>(tables, filter).generateSql();
    }

    generateSql() {
        const tableName = this.tables[this.table].name;
        return ` ${this.type} ${tableName} ON ${this.parserSql}`
    }
}