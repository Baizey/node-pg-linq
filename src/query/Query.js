import {QueryJoiner} from "./QueryJoiner";

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
     * @param {function():boolean|function(*):boolean|function(*,*):boolean|function(*,*,*):boolean} statement
     * @param {*} variables
     * @returns {Query}
     */
    where(statement, ...variables) {
        this._where = statement;
        this._variables = Array.isArray(variables) ? variables : [variables];
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
        const autoId = this._nextUID;
        const str = func.toString();
        let row, statement;
        if (str.indexOf('=>') >= 0)
            [, row, statement] = /\s*([^\s=]*)\s*=>(.*)/.exec(str);
        else
            [, row, statement] = /\s*function\s*\(([^)]*)\)\s*{\s*return\s*([^;}]*)\s*;?\s*}\s*/.exec(str);

        statement = statement
            .replace(/\s*&&\s*/g, ' AND ')
            .replace(/\s*\|\|\s*/g, ' OR ')
            .replace(/\s*===\s*null\s*/g, ' IS NULL ')
            .replace(/\s*!==\s*null\s*/g, ' IS NOT NULL ')
            .replace(/\s*===\s*/g, ' = ')
            .replace(/\s*!==\s*/g, ' <> ')
            .replace(/\s*==\s*/g, ' LIKE ')
            .replace(/\s*!=\s*/g, ' NOT LIKE ')
            //.split(`${row}.`).join('')
            .trim()
            .replace(/ {2,}/g, ' ');

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
        if (!where && !joins) return '';
        if (!where) return ' ' + joins;
        if (!joins) return ' ' + where;
        return ' ' + joins + ' ' + where;
    }

    /**
     * @returns {Promise<{rowCount: int, rows: *[], fields: {name: string, dataTypeId: *}[], command: string}>}
     */
    async run() {
        const sql = this.toString();
        const parameters = this._parameters;
        return await this._context.run(sql, parameters);
    }
}

