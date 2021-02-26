import {IColumnOrdering} from "./Interfaces/IAtom";

export class ColumnOrdering<R> implements IColumnOrdering<R> {
    readonly column: keyof R;
    readonly ascending: boolean;

    constructor(column: keyof R, ascending: boolean) {
        this.ascending = ascending;
        this.column = column;
    }

    generateSql(): string {
        return `${this.column} ${this.ascending ? 'ASC' : 'DESC'}`;
    }
}