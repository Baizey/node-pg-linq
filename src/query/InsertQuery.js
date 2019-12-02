import Query from "./Query.js";
import {QueryJoiner} from "./QueryJoiner";

export default class InsertQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        super(table, context);
    }

    /**
     * @param {string} name
     * @returns {InsertQuery}
     */
    as(name) {
        super.as(name);
        return this;
    }

    /**
     * @param {function():boolean|function(*):boolean|function(*,*):boolean|function(*,*,*):boolean} statement
     * @param {*} variables
     * @returns {InsertQuery}
     */
    where(statement, ...variables) {
        super.where(statement, variables);
        return this;
    }

    /**
     * @param {string} table
     * @param {function(e:QueryJoiner)} options
     * @returns {InsertQuery}
     */
    join(table, options = undefined) {
        super.join(table, options);
        return this;
    }

    /**
     * @param {object} columns
     * @returns {InsertQuery}
     */
    columns(columns) {
        this._parameters = {...this._parameters, ...columns};
        this._columns = columns;
        this._ignoreConflicts = false;
        return this;
    }

    /**
     * @param {boolean} value
     * @returns {InsertQuery}
     */
    ignoreConflicts(value = true) {
        this._ignoreConflicts = !!value;
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateInsertKeysSql() {
        return Object.keys(this._columns).join(', ');
    }

    /**
     * @returns {string}
     */
    get _generateInsertValuesSql() {
        return Object.keys(this._columns).map(key => `\${${key}}`).join(', ');
    }

    /**
     * @returns {string}
     */
    toString() {
        const keys = this._generateInsertKeysSql;
        const values = this._generateInsertValuesSql;
        const ignoreConflict = (this._ignoreConflicts && ' ON CONFLICT DO NOTHING') || '';
        return `INSERT INTO ${this._tableNames} (${keys}) VALUES (${values})${ignoreConflict}`;
    }

    /**
     * Returns how many rows were affected
     * @returns {Promise<int>}
     */
    async run() {
        return (await super.run()).rowCount;
    }
}