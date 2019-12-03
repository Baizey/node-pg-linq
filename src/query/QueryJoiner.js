import FilterClause from "./FilterClause";

export class QueryJoiner {
    /**
     * @param {string} table
     * @param {int} id
     */
    constructor(table, id) {
        this._table = table;
        this._type = 'LEFT';
        this._as = undefined;
        this._statement = new FilterClause(id).asOn;
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
    get naturalLeft() {
        this._type = 'NATURAL LEFT';
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get naturalRight() {
        this._type = 'NATURAL RIGHT';
        return this;
    }

    /**
     * @returns {QueryJoiner}
     */
    get naturalInner() {
        this._type = 'NATURAL INNER';
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
     * @param {*} parameters
     * @returns {QueryJoiner}
     */
    on(statement, ...parameters) {
        this._statement.set(statement, parameters);
        return this;
    }

    get parameters() {
        return this._statement.parameters;
    }

    toString() {
        const as = this._as ? ` AS ${this._as}` : '';
        return `${this._type} JOIN ${this._table}${as}${this._statement.toString()}`;
    }
}