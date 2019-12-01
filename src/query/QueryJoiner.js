export class QueryJoiner {
    /**
     * @param {string} table
     * @param {Query|InsertQuery|UpdateQuery|DeleteQuery|SelectQuery} query
     */
    constructor(table, query) {
        this._table = table;
        this._type = 'LEFT';
        this._query = query;
        this._as = undefined;
    }

    /**
     * @returns {QueryJoiner}
     */
    get fullOuter() {
        this._type = 'FULL OUTER';
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get leftOuter() {
        this._type = 'LEFT OUTER';
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get rightOuter() {
        this._type = 'RIGHT OUTER';
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get left() {
        this._type = 'LEFT';
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get right() {
        this._type = 'RIGHT';
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get inner() {
        this._type = 'INNER';
        return this;
    }

    /**
     * @param {string} name
     * @returns {QueryJoiner}
     */
    as(name) {
        this._as = name;
        return this;
    }

    /**
     * @param {function():*|function(*):*|function(*,*):*|function(*,*,*):*} statement
     * @param {*} variables
     * @returns {QueryJoiner}
     */
    on(statement, ...variables) {
        this._statement = this._query._functionToSqlQuery(statement, variables || []);
        return this;
    }

    toString() {
        const as = this._as ? ` AS ${this._as}` : '';
        return `${this._type} JOIN ${this._table}${as} ON (${this._statement})`
    }
}