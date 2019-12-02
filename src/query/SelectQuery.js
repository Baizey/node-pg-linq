import Query from "./Query.js";
import {QueryJoiner} from "./QueryJoiner";

export default class SelectQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        super(table, context);
        this._having = '';
        this._columns = [];
        this._limit = 0;
        this._offset = 0;
        this._order = [];
        this._grouping = [];
        this._distincts = [];
    }

    /**
     * @param {string} name
     * @returns {SelectQuery}
     */
    as(name) {
        super.as(name);
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
     * @param {string} table
     * @param {function(e:QueryJoiner)} options
     * @returns {SelectQuery}
     */
    join(table, options = undefined) {
        super.join(table, options);
        return this;
    }

    /**
     * @param {string[]} columns
     * @returns {SelectQuery}
     */
    columns(columns) {
        this._columns = columns || [];
        this._distincts = this._distincts.filter(e => e === this._columns.indexOf(e) === -1);
        return this;
    }

    /**
     * ASC is default in postgres, so we have it as default as well
     * @param {string|string[]} columns
     * @returns {SelectQuery}
     */
    groupBy(columns) {
        this._grouping = Array.isArray(columns) ? columns : [columns];
        return this;
    }

    /**
     * @param {function():boolean|function(*):boolean|function(*,*):boolean|function(*,*,*):boolean} statement
     * @param {*} variables
     * @returns {SelectQuery}
     */
    having(statement, ...variables) {
        variables = Array.isArray(variables) ? variables : [variables];
        this._having = ' HAVING ' + super._functionToSqlQuery(statement, variables);
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
            this._distincts.push(value);
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
        const columns = this._columns.length === 0 ? '*' : this._columns.join(', ');
        const distinct = this._distincts.length === 0 ? '' : this._distincts.map(e => `DISTINCT ON (${e}) ${e}`).join(', ');
        if (!distinct) return ' ' + columns;
        return ` ${distinct}, ${columns}`;
    }

    /**
     * @returns {string}
     */
    toString() {
        const limit = (this._limit && ` LIMIT ${this._limit}`) || '';
        const offset = (this._offset && ` OFFSET ${this._offset}`) || '';
        const order = (this._order.length && ` ORDER BY ${this._order.join(', ')}`) || '';
        const group = (this._grouping.length && ` GROUP BY ${this._grouping.join(', ')}`) || '';
        const distinct = this._distinct ? ' DISTINCT' : '';
        this._having = this._having || '';

        return `SELECT${distinct}${this._generateSelectSql} FROM ${this._tableNames}${this._generateFilterSql}${group}${this._having}${order}${limit}${offset}`;
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