import {IColumn, IConstraint, IFilterParser} from "./Interfaces/IAtom";
import {ConstraintType} from "./Interfaces/Enums";
import {FilterFunction, TableStructure, DatabaseStructure} from "./Interfaces/Types";

export class FilterParser<T> implements IFilterParser<T> {
    readonly filter: FilterFunction<T>;
    readonly tables: DatabaseStructure<T>;

    constructor(tableInfo: DatabaseStructure<T>, filter: FilterFunction<T>) {
        this.filter = filter;
        this.tables = tableInfo;
    }

    generateSql(): string {
        return this.parseSql();
    }

    private parseSql(): string {
        const rawFunction = this.filter.toString();

        const result = /\((.*)\s*,\s*(.*)\)\s*=>(.*)/.exec(rawFunction) || /\((.*)(\s*)\)\s*=>(.*)/.exec(rawFunction);
        if (!result) {
            throw new Error('Filter function has to be arrow function');
        }
        let [, , values, statement] = result;

        const entries: [string, TableStructure<any>][] = Object.entries(this.tables);
        entries.forEach(([key, value]) => {
            const tableName = value.name;
            const find = new RegExp(`(\\w*\\.)?${key}\\.(\\w+)`, 'g');
            statement = statement.replace(find, (_, __, column) => {
                const columnName = value.columns[column].name;
                return `${tableName}.${columnName}`;
            });
        });

        // Convert general js to GenerateSql usage
        statement = statement
            .replace(/\s*&&\s*/g, ' AND ')
            .replace(/\s*\|\|\s*/g, ' OR ')
            .replace(/\s*===\s*null\s*/g, ' IS NULL ')
            .replace(/\s*!==\s*null\s*/g, ' IS NOT NULL ')
            .replace(/\s*===\s*/g, ' = ')
            .replace(/\s*!==\s*/g, ' <> ')
            .replace(/\s*==\s*/g, ' LIKE ')
            .replace(/\s*!=\s*/g, ' NOT LIKE ')
            .replace(/!!/g, '')
            .replace(/!/g, 'NOT ')
            //.split(`${row}.`).join('')
            .trim()
            .replace(/ {2,}/g, ' ');

        // Convert values array to parameters
        values = values.trim();
        if (values) {
            const regex = new RegExp(`${values}\\[(\\d+)\\]`, 'g');
            statement = statement.replace(regex, (_, index) => `$${Number(index) + 1}`)
        }

        return statement;
    }
}