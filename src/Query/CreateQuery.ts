import {Pool, PoolClient, QueryResult} from "pg";
import {PrimaryConstraint, UniqueConstraint} from "../Infrastructure/Constraint";
import {QueryBase} from "../Infrastructure/BaseQueries/QueryBase";
import {ICreateQuery} from "../Infrastructure/Interfaces/Queries/ICreateQuery";
import {IColumn, IConstraint} from "../Infrastructure/Interfaces/IAtom";
import {DatabaseStructure, DbConnection} from "../Infrastructure/Interfaces/Types";

export class CreateQuery<T> extends QueryBase<T> implements ICreateQuery<T> {
    readonly uniqueGroups: IConstraint[];
    ignoreIfExist: boolean;
    private readonly primaryConstraint: IConstraint;

    constructor(tableName: keyof T | (keyof T)[],
                connection: DbConnection,
                definition: DatabaseStructure<T>
    ) {
        super(tableName, connection, definition);
        this.uniqueGroups = [];
        this.ignoreIfExist = false;
        const columns: IColumn<any>[] = Object.values(this.tables[this._from[0]].columns);
        this.primaryConstraint = new PrimaryConstraint(columns.filter(e => e.isPrimary));
    }

    get constraints(): IConstraint[] {
        const result = [];
        this.uniqueGroups.forEach(e => result.push(e));
        if (this.primaryConstraint) result.push(this.primaryConstraint);
        return result;
    }

    onConflictIgnore(ignore: boolean = true): ICreateQuery<T> {
        this.ignoreIfExist = ignore;
        return this;
    }

    addUniqueGroup(columns: IColumn<any> | IColumn<any>[]): ICreateQuery<T> {
        const constraint = new UniqueConstraint(columns);
        this.uniqueGroups.push(constraint);
        return this;
    }

    generateSql(): string {
        const primary = this.primaryConstraint.columns.length > 0 ? [this.primaryConstraint] : [];
        const unique = this.uniqueGroups.map(e => e);

        const columns: IColumn<any>[] = Object.values(this.tables[this._from[0]].columns)

        const attributes = [...columns, ...primary, ...unique];
        const ignoreExists = (this.ignoreIfExist && ' IF NOT EXISTS') || '';

        const text = attributes.map(e => e.generateSql());
        return `CREATE TABLE${ignoreExists} ${this._from.join(', ')} (${text.join(', ')})`;
    }

    createTable(): Promise<QueryResult> {
        return this.runSql(this.generateSql());
    }
}

