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
     * @returns {string}
     */
    toString() {
        const filter = this._generateFilterSql;
        const table = this._tableName;
        return `DELETE FROM ${table}${filter}`;
    }

    /**
     * Returns how many rows were affected
     * @returns {Promise<int>}
     */
    async run() {
        return (await super.run()).rowCount;
    }
}