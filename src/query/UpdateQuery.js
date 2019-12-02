import Query from "./Query.js";
import {QueryJoiner} from "./QueryJoiner";

export default class UpdateQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        super(table, context);
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
        this._parameters = {...this._parameters, ...columns};
        this._columns = columns;
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateUpdateSql() {
        return Object.keys(this._columns).map(key => `${key} = \${${key}}`).join(', ');
    }

    /**
     * @returns {string}
     */
    toString() {
        return `UPDATE ${this._tableName} SET ${this._generateUpdateSql}${this._generateFilterSql}`;
    }

    /**
     * Returns how many rows were affected
     * @returns {Promise<int>}
     */
    async run() {
        return (await super.run()).rowCount;
    }
}