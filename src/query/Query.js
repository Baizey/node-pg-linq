import {QueryJoiner} from "./QueryJoiner";
import FilterClause from "./FilterClause";

export default class Query {

    get _nextUID() {
        return this._autoId++;
    }

    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        this._autoId = 0;
        this._table = table;
        this._where = new FilterClause(this._nextUID).asWhere;
        this._tables = [];
        this._context = context;
        this._joins = [];
    }

    /**
     * @param {string|string[]} tables
     * @returns {Query}
     */
    from(tables) {
        this._tables = Array.isArray(tables) ? tables : [tables];
        return this;
    }

    /**
     * @param {function():boolean|function(*):boolean|function(*,*):boolean|function(*,*,*):boolean} statement
     * @param {*[]} variables
     * @returns {Query}
     */
    where(statement, variables) {
        this._where.set(statement, variables);
        return this;
    }

    /**
     * @param {string} table
     * @param {function(e:QueryJoiner)} options
     * @returns {Query}
     */
    join(table, options = undefined) {
        const join = new QueryJoiner(table, this._nextUID);
        if (options) options(join);
        this._joins.push(join);
        return this;
    }

    /**
     * @param {string} name
     * @returns {Query}
     */
    as(name) {
        this._as = name;
        return this;
    }

    get _tableNames() {
        const first = this._as ? ` AS ${this._as}` : '';
        const others = (this._tables.length > 0 ? ', ' : '') + this._tables.join(', ');
        return `${this._table}${first}${others}`;
    }

    /**
     * @returns {string}
     */
    get _joinsSql() {
        return this._joins.length ? ' ' + this._joins.map(e => e.toString()).join(' ') : '';
    }

    /**
     * @returns {Promise<{rowCount: int, rows: *[], fields: {name: string, dataTypeId: *}[], command: string}>}
     */
    async run(parameters = {}) {
        const sql = this.toString();
        parameters = {...parameters, ...this._where.parameters};
        for (let i = 0; i < this._joins.length; i++)
            parameters = {...parameters, ...this._joins[i].parameters};
        return await this._context.run(sql, parameters);
    }
}

