import Query from "./Query.js";
import {QueryJoiner} from "./QueryJoiner";

export default class UpdateQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        super(table, context);
        this._parameters = {};
    }

    /**
     * @param {string|string[]} tables
     * @returns {UpdateQuery}
     */
    from(tables) {
        super.from(tables);
        return this;
    }

    /**
     * @param {string} name
     * @returns {UpdateQuery}
     */
    as(name) {
        super.as(name);
        return this;
    }

    /**
     * @param {function():boolean|function(*):boolean|function(*,*):boolean|function(*,*,*):boolean} statement
     * @param {*} variables
     * @returns {UpdateQuery}
     */
    where(statement, ...variables) {
        super.where(statement, variables);
        return this;
    }

    /**
     * @param {string} table
     * @param {function(e:QueryJoiner)} options
     * @returns {UpdateQuery}
     */
    join(table, options = undefined) {
        super.join(table, options);
        return this;
    }

    /**
     * @param {object} columns
     * @returns {UpdateQuery}
     */
    columns(columns) {
        this._parameters = columns;
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateUpdateSql() {
        return Object.keys(this._parameters).map(key => `${key} = \${${key}}`).join(', ');
    }

    /**
     * @returns {string}
     */
    toString() {
        return `UPDATE ${this._tableNames} SET ${this._generateUpdateSql}${this._joinsSql}${this._where.toString()}`;
    }

    /**
     * Returns how many rows were affected
     * @returns {Promise<int>}
     */
    async run() {
        return (await super.run(this._parameters)).rowCount;
    }
}