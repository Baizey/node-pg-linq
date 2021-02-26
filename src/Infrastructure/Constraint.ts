import {IColumn, IConstraint} from "./Interfaces/IAtom";
import {ConstraintType} from "./Interfaces/Enums";

export class UniqueConstraint implements IConstraint {
    readonly type: ConstraintType;
    readonly columns: IColumn<any>[];
    readonly name: string;

    constructor(columns: IColumn<any> | IColumn<any>[]) {
        this.type = ConstraintType.unique;
        this.columns = Array.isArray(columns) ? columns : [columns];
        const columnNames = this.columns.map(e => e.name);
        this.name = `${this.type}_${columnNames.join('_')}`;
    }

    generateSql() {
        return `CONSTRAINT ${this.name} UNIQUE (${this.columns.map(e => e.name).join(', ')})`;
    }
}

export class PrimaryConstraint implements IConstraint {
    readonly type: ConstraintType;
    readonly columns: IColumn<any>[];
    readonly name: string;

    constructor(columns: IColumn<any> | IColumn<any>[]) {
        this.type = ConstraintType.primary;
        this.columns = Array.isArray(columns) ? columns : [columns];
        const columnNames = this.columns.map(e => e.name);
        this.name = `${this.type}_${columnNames.join('_')}`;
    }

    generateSql() {
        return `CONSTRAINT ${this.name} PRIMARY KEY (${this.columns.map(e => e.name).join(', ')})`;
    }
}