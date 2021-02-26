import {IColumn} from "./Interfaces/IAtom";
import {ColumnType} from "./Interfaces/Enums";

export class Column<T> implements IColumn<T> {
    readonly name: string;
    readonly type: ColumnType | string;
    isPrimary: boolean;
    isNullable: boolean;
    defaultValue: any;
    referenceValue?: string;
    isDatabaseGenerated: boolean;

    constructor(columnName: string, type: ColumnType | string) {
        this.name = columnName;
        this.type = type;
        this.isPrimary = false;
        this.isNullable = true;
        this.defaultValue = undefined;
        this.referenceValue = undefined;
        this.isDatabaseGenerated = false;
    }

    isKey(): Column<T> {
        this.isPrimary = true;
        return this;
    }

    isRequired(): Column<T> {
        this.isNullable = false;
        return this;
    }

    hasForeignKey(tableName: string, columnName: Column<T> | string): Column<T> {
        columnName = typeof columnName === 'string' ? columnName : columnName.name;
        this.referenceValue = `${tableName}(${columnName})`;
        return this;
    }

    hasDefaultValue(value: T): Column<T> {
        this.defaultValue = typeof value === 'string' ? `"${value}"` : value;
        return this;
    }

    hasDefaultValueSql(value: string): IColumn<T> {
        this.defaultValue = value;
        return this;
    }

    hasDatabaseGeneratedValue(): IColumn<T> {
        this.isDatabaseGenerated = true;
        return this;
    }

    generateSql(): string {
        const nullable = (!this.isNullable && ' NOT NULL') || '';
        const defaultValue = ((typeof this.defaultValue !== 'undefined') && ` DEFAULT ${this.defaultValue}`) || '';
        const foreign = (this.referenceValue && ` REFERENCES ${this.referenceValue}`) || '';
        return `${this.name} ${this.type}${nullable}${defaultValue}${foreign}`;
    }
}