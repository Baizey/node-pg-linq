import {IColumn, IConstraint, IFilterParser, IJoin, ISelect} from "./Interfaces/IAtom";
import {ConstraintType, JoinType} from "./Interfaces/Enums";
import {FilterFunction, KeyPair, ResultSelection, TableStructure, DatabaseStructure} from "./Interfaces/Types";
import {FilterParser} from "./FilterParser";

export class Select<T, R> implements ISelect<T, R> {
    readonly selector: ResultSelection<T, R>;
    readonly tables: DatabaseStructure<T>;
    readonly keyPairs: KeyPair<R>

    constructor(tables: DatabaseStructure<T>, selection: ResultSelection<T, R>) {
        this.tables = tables;
        this.selector = selection;
        const jsWithSqlNames: string = this.filterFunction();
        this.keyPairs = jsWithSqlNames
            .substr(2, jsWithSqlNames.length - 4)
            .split(',')
            .map(p => p.split(':')
                .map(e => e.trim()))
            .reduce((a, [key, value]) => {
                // @ts-ignore
                a[key] = value;
                return a;
            }, {}) as KeyPair<R>
    }

    private filterFunction(): string {
        const raw = this.selector.toString();

        const parts = /^(.*)=>(.*)$/s.exec(raw);
        if (!parts) throw new Error('Filter function has to be arrow function');
        let [, params, statement] = parts;

        const valuePart = /\(.*,\s*(\w+)\s*\)/s.exec(params);
        let values;
        if (!valuePart) values = '';
        else [, values] = valuePart;

        const entries: [string, TableStructure<any>][] = Object.entries(this.tables);
        entries.forEach(([key, value]) => {
            const tableName = value.name;
            const find = new RegExp(`(\\w*\\.)?${key}\\.(\\w+)`, 'g');
            statement = statement.replace(find, (_, __, column) => {
                const columnName = value.columns[column].name;
                return `${tableName}.${columnName}`;
            });
        });

        values = values.trim();
        if (values) {
            const regex = new RegExp(`${values}\\[(\\d+)\\]`, 'g');
            statement = statement.replace(regex, (_, index) => `$${Number(index) + 1}`)
        }
        return statement.trim();
    }

    generateSql(): string {
        if (!this.keyPairs) return '*';
        return Object.entries(this.keyPairs)
            .map(([key, value]) => `${value} AS ${key}`)
            .join(', ')
    }
}