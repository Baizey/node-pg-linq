import {Entities, FilterFunction, KeyPair, ResultSelection, DatabaseStructure} from "./Types";
import {ColumnType, JoinType} from "./Enums";

export interface GeneratesSql {
    generateSql(): string;
}

export interface IColumn<T extends Entities> extends GeneratesSql {
    readonly name: string;
    readonly type: ColumnType | string;
    isPrimary: boolean;
    isNullable: boolean;
    defaultValue: any;
    referenceValue?: string;
    isDatabaseGenerated: boolean;

    isKey(): IColumn<T>;

    isRequired(): IColumn<T>;

    hasForeignKey(tableName: string, columnName: IColumn<T> | string): IColumn<T>;

    hasDefaultValue(value: T): IColumn<T>;

    hasDefaultValueSql(value: string): IColumn<T>;

    hasDatabaseGeneratedValue(): IColumn<T>;
}

export interface IColumnOrdering<R> extends GeneratesSql {
    readonly column: keyof R;
    readonly ascending: boolean;
}

export interface IConstraint extends GeneratesSql {
    readonly columns: IColumn<any>[];
    readonly name: string;
}

export interface IFilterParser<T extends Entities> extends GeneratesSql {
    readonly filter: FilterFunction<T>;
    readonly tables: DatabaseStructure<T>;
}

export interface IWhere<T extends Entities> extends GeneratesSql {
    readonly parserSql: string;
    readonly tables: DatabaseStructure<T>;
}

export interface IHaving<T extends Entities> extends GeneratesSql {
    readonly parserSql: string;
    readonly tables: DatabaseStructure<T>;
}

export interface IJoin<T extends Entities> extends GeneratesSql {
    readonly parserSql: string;
    readonly tables: DatabaseStructure<T>;
    readonly table: keyof T;
    readonly type: JoinType;
}

export interface ISelect<T extends Entities, R> extends GeneratesSql {
    readonly selector: ResultSelection<T, R>;
    readonly tables: DatabaseStructure<T>;
    readonly keyPairs: KeyPair<R>;
}