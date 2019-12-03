import Query from "./Query.js";
import {QueryJoiner} from "./QueryJoiner";

export default class InsertQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        super(table, context);
        this._parameters = {};
        this._inserting = [];
    }

    /**
     * @param {string|string[]} tables
     * @returns {InsertQuery}
     */
    from(tables) {
        super.from(tables);
        return this;
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
     * @param {object|object[]} columns
     * @returns {InsertQuery}
     */
    columns(columns) {
        this._inserting = Array.isArray(columns) ? columns : [columns];
        this._parameters = {};
        const keys = Object.keys(this._inserting[0]);
        this._inserting.forEach((obj, i) => keys.forEach(key => this._parameters[key + i] = obj[key]));
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
        return Object.keys(this._inserting[0]).join(', ');
    }

    /**
     * @returns {string}
     */
    get _generateInsertValuesSql() {
        const keys = Object.keys(this._inserting[0]);
        return this._inserting
            .map((_, i) =>
                '(' + keys.map(key => `\${${key + i}}`) + ')')
            .join(', ');
    }

    /**
     * @returns {string}
     */
    toString() {
        const keys = this._generateInsertKeysSql;
        const values = this._generateInsertValuesSql;
        const ignoreConflict = (this._ignoreConflicts && ' ON CONFLICT DO NOTHING') || '';
        return `INSERT INTO ${this._tableNames} (${keys}) VALUES ${values} ${ignoreConflict}`;
    }

    /**
     * Returns how many rows were affected
     * @returns {Promise<int>}
     */
    async run() {
        return (await super.run(this._parameters)).rowCount;
    }
}