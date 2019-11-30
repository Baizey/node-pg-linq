import Query from "./Query.js";

export default class SelectQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        super(table, context);
        this._columns = [];
        this._limit = 0;
        this._offset = 0;
        this._order = [];
    }

    /**
     * @param {string[]} columns
     * @returns {SelectQuery}
     */
    columns(columns) {
        this._columns = columns || [];
        return this;
    }

    /**
     * @param {function():boolean|function(*):boolean|function(*,*):boolean|function(*,*,*):boolean} statement
     * @param {*} variables
     * @returns {SelectQuery}
     */
    where(statement, ...variables) {
        super.where(statement, variables);
        return this;
    }

    /**
     * ASC is default in postgres, so we have it as default as well
     * @param {string} column
     * @param {boolean} ascending
     * @returns {SelectQuery}
     */
    orderBy(column, ascending = true) {
        this._order.push(`${column} ${ascending ? 'ASC' : 'DESC'}`);
        return this;
    }

    /**
     * @param {boolean|string} value
     * @returns {SelectQuery}
     */
    distinct(value = true) {
        if (typeof value === 'string') {
            this._columns = this._columns.filter(e => e !== value);
            this._columns.push(`DISTINCT ON (${value}) ${value}`);
        } else
            this._distinct = !!value;
        return this;
    }

    /**
     * @param {int} limit
     * @returns {SelectQuery}
     */
    limit(limit) {
        this._limit = limit;
        return this;
    }

    /**
     * @param {int} n
     * @returns {SelectQuery}
     */
    offset(n) {
        this._offset = n;
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateSelectSql() {
        return this._columns.length === 0 ? '*' : this._columns.join(', ');
    }

    /**
     * @returns {string}
     */
    toString() {
        const limit = (this._limit && ` LIMIT ${this._limit}`) || '';
        const offset = (this._offset && ` OFFSET ${this._offset}`) || '';
        const order = (this._order.length && ` ORDER BY ${this._order.join(', ')}`) || '';
        const distinct = this._distinct ? 'DISTINCT ' : '';

        return `SELECT ${distinct}${this._generateSelectSql} FROM ${this._tableName}${this._generateFilterSql}${order}${limit}${offset}`;
    }

    /**
     * Returns how many rows were affected
     * @returns {Promise<*>}
     */
    async one() {
        return (await super.run()).rows[0];
    }

    /**
     * Returns how many rows were affected
     * @returns {Promise<*[]>}
     */
    async all() {
        return (await super.run()).rows;
    }
}