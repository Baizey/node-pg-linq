export default class FilterClause {

    /**
     * @param {int} id
     */
    constructor(id) {
        this.id = id;
        this.parameters = {};
        this.statement = undefined;
        this.prefix = '';
    }

    /**
     * @param {function():boolean|function(*):boolean|function(*,*):boolean|function(*,*,*):boolean} statement
     * @param {*[]} parameters
     */
    set(statement, parameters) {
        this.parameters = {};
        this.statement = this._functionToSqlQuery(statement, parameters);
    }

    /**
     * @returns {FilterClause}
     */
    get asWhere() {
        this.prefix = ' WHERE';
        return this;
    }

    /**
     * @returns {FilterClause}
     */
    get asOn() {
        this.prefix = ' ON';
        return this;
    }

    /**
     * @returns {FilterClause}
     */
    get asHaving() {
        this.prefix = ' HAVING';
        return this;
    }

    /**
     * @param {function():*} func
     * @param {*[]} variables
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
            .replace(/\s*===\s*null\s*/g, ' IS NULL ')
            .replace(/\s*!==\s*null\s*/g, ' IS NOT NULL ')
            .replace(/\s*===\s*/g, ' = ')
            .replace(/\s*!==\s*/g, ' <> ')
            .replace(/\s*==\s*/g, ' LIKE ')
            .replace(/\s*!=\s*/g, ' NOT LIKE ')
            //.split(`${row}.`).join('')
            .trim()
            .replace(/ {2,}/g, ' ');

        if (variables && variables.length > 0) {
            statement = statement.split('$').map((e, i) => {
                if (i >= variables.length) return e;
                const value = variables[i];
                const key = `auto_${this.id}_${i}`;
                if (Array.isArray(value)) {
                    const values = value.map((v, i) => {
                        const arrayKey = `${key}_${i}`;
                        this.parameters[arrayKey] = v;
                        return `\${${arrayKey}}`;
                    }).join(', ');
                    return `${e}(${values})`;
                } else {
                    this.parameters[key] = value;
                    return `${e}\${${key}}`;
                }
            }).join('');
        }
        return statement;
    }

    toString() {
        if (!this.statement) return '';
        return `${this.prefix} ${this.statement}`
    }
}