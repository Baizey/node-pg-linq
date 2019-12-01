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
        this._isNatual = false;
    }

    /**
     * @returns {QueryJoiner}
     */
    get fullOuter() {
        this._type = 'FULL OUTER';
        this._isNatual = false;
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get leftOuter() {
        this._type = 'LEFT OUTER';
        this._isNatual = false;
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get rightOuter() {
        this._type = 'RIGHT OUTER';
        this._isNatual = false;
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get left() {
        this._type = 'LEFT';
        this._isNatual = false;
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get naturalLeft() {
        this._type = 'NATURAL LEFT';
        this._isNatual = true;
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get naturalRight() {
        this._type = 'NATURAL RIGHT';
        this._isNatual = true;
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get naturalInner() {
        this._type = 'NATURAL INNER';
        this._isNatual = true;
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get right() {
        this._type = 'RIGHT';
        this._isNatual = false;
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get inner() {
        this._type = 'INNER';
        this._isNatual = false;
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
        return `${this._type} JOIN ${this._table}${as}${this._isNatual ? '' : ` ON (${this._statement})`}`;
    }
}