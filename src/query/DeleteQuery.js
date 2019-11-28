import Query from "./Query.js";

export default class DeleteQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        super(table, context);
    }

    /**
     * @param {function(*):boolean} statement
     * @param {*} variables
     * @returns {DeleteQuery}
     */
    where(statement, ...variables) {
        super.where(statement, variables);
        return this;
    }

    /**
     * @returns {string}
     */
    toString() {
        return `DELETE FROM ${this._tableName} ${this._generateWhereSql}`;
    }

    /**
     * Returns how many rows were affected
     * @returns {Promise<int>}
     */
    async run() {
        return (await super.run()).rowCount;
    }
}