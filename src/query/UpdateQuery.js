import Query from "./Query.js";

export default class UpdateQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        super(table, context);
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
     * @param {function(*):boolean} statement
     * @param {*} variables
     * @returns {UpdateQuery}
     */
    where(statement, ...variables) {
        super.where(statement, variables);
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
        return `UPDATE ${this._table} SET ${this._generateUpdateSql} ${this._generateWhereSql}`;
    }

    /**
     * Returns how many rows were affected
     * @returns {Promise<int>}
     */
    async run() {
        return (await super.run()).rowCount;
    }
}