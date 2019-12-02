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
     * @param {function():boolean|function(*):boolean|function(*,*):boolean|function(*,*,*):boolean} statement
     * @param {*} variables
     * @returns {DeleteQuery}
     */
    where(statement, ...variables) {
        variables = Array.isArray(variables) ? variables : [variables];
        super.where(statement, ...variables);
        return this;
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