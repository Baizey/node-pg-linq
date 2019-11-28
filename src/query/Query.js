export default class Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        this._table = table;
        this._where = null;
        this._variables = [];
        this._parameters = {};
        this._context = context;
    }

    /**
     * @param {function(*):boolean} statement
     * @param {*[]} variables
     * @returns {Query}
     */
    where(statement, variables) {
        this._where = statement;
        this._variables = variables;
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateWhereSql() {
        if (!this._where) return '';

        const str = this._where.toString();
        let row, statement;
        if (str.indexOf('=>') >= 0)
            [, row, statement] = /\s*([^\s=])\s*=>(.*)/.exec(str);
        else
            [, row, statement] = /\s*function\s*\(([^)]+)\)\s*{\s*return\s*([^;}]*)\s*;?\s*}\s*/.exec(str);

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

        if (this._variables && this._variables.length > 0) {
            statement = statement.split('$').map((e, i) => {
                if (i >= this._variables.length) return e;
                const value = this._variables[i];
                const key = `auto_param_${i}`;
                if (Array.isArray(value)) {
                    const values = value.map((v, i) => {
                        const arrayKey = `${key}_${i}`;
                        this._parameters[arrayKey] = v;
                        return `\${${arrayKey}}`;
                    }).join(', ');
                    return `${e}(${values})`;
                } else {
                    this._parameters[key] = value;
                    return `${e}\${${key}}`;
                }
            }).join('');
        }

        return statement ? `WHERE ${statement}` : '';
    }

    /**
     * @returns {Promise<{
     *     rowCount: int,
     *     rows: *[],
     *     fields: {name: string, dataTypeId: *}[],
     *     command: string
     * }>}
     */
    async run() {
        return await this._context.run(this.toString(), this._parameters);
    }
}


