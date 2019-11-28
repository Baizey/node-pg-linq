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
        this._where = null;
        this._variables = [];
        this._parameters = {};
        this._context = context;
        this._joins = [];
    }

    /**
     * @param {function():boolean} statement
     * @param {*[]} variables
     * @returns {Query}
     */
    where(statement, variables = []) {
        this._where = statement;
        this._variables = variables;
        return this;
    }

    /**
     * @param {string} table
     * @param {function(e:QueryJoiner)} options
     * @returns {Query}
     */
    join(table, options = undefined) {
        const join = new QueryJoiner(table, this);
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

    get _tableName() {
        const as = this._as ? ` AS ${this._as}` : '';
        return `${this._table}${as}`;
    }

    /**
     * @param {function():*} func
     * @param {*} variables
     * @returns {[string, object]}
     */
    _functionToSqlQuery(func, variables) {
        const str = func.toString();
        let row, statement;
        if (str.indexOf('=>') >= 0)
            [, row, statement] = /\s*([^\s=]*)\s*=>(.*)/.exec(str);
        else
            [, row, statement] = /\s*function\s*\(([^)]*)\)\s*{\s*return\s*([^;}]*)\s*;?\s*}\s*/.exec(str);

        statement = statement
            .replace(/\s*&&\s*/g, ' AND ')
            .replace(/\s*\|\|\s*/g, ' OR ')
            .replace(/\s*===\s*/g, ' = ')
            .replace(/\s*!==\s*/g, ' <> ')
            .replace(/\s*==\s*/g, ' LIKE ')
            .replace(/\s*!=\s*/g, ' NOT LIKE ')
            //.split(`${row}.`).join('')
            .trim()
            .replace(/ {2,}/g, ' ');

        const autoId = this._nextUID;
        const parameters = {};
        if (variables && variables.length > 0) {
            statement = statement.split('$').map((e, i) => {
                if (i >= variables.length) return e;
                const value = variables[i];
                const key = `auto_${autoId}_${i}`;
                if (Array.isArray(value)) {
                    const values = value.map((v, i) => {
                        const arrayKey = `${key}_${i}`;
                        parameters[arrayKey] = v;
                        return `\${${arrayKey}}`;
                    }).join(', ');
                    return `${e}(${values})`;
                } else {
                    parameters[key] = value;
                    return `${e}\${${key}}`;
                }
            }).join('');
        }
        this._parameters = {...this._parameters, ...parameters};
        return statement;
    }

    /**
     * @returns {string}
     */
    get _generateJoinSql() {
        if (this._joins.length === 0) return '';
        return this._joins.map(e => e.toString()).join(' ');
    }

    /**
     * @returns {string}
     */
    get _generateWhereSql() {
        if (!this._where) return '';
        const statement = this._functionToSqlQuery(this._where, this._variables);
        return statement ? `WHERE ${statement}` : '';
    }

    /**
     * @returns {string}
     */
    get _generateFilterSql() {
        const where = this._generateWhereSql;
        const joins = this._generateJoinSql;
        return joins + (joins && where ? ' ' : '') + where;
    }
}

class QueryJoiner {
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
     * @param {function():void} statement
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