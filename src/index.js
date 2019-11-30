import CreateQuery from "./query/CreateQuery";
import SelectQuery from "./query/SelectQuery";
import InsertQuery from "./query/InsertQuery";
import DeleteQuery from "./query/DeleteQuery";
import UpdateQuery from "./query/UpdateQuery";

export default class DbContext {
    /**
     * @param {function(sql:string, params:*[]):Promise<{
     *     rowCount: int,
     *     rows: *[],
     *     fields: {name: string, dataTypeId: *}[],
     *     command: string
     * }>} usage
     * @returns {DbContext}
     */
    using(usage) {
        this._usage = usage;
        return this;
    }

    /**
     * @param {PG.Pool|Pool} pool
     * @returns {DbContext}
     */
    usingPool(pool) {
        this._usage = async (sql, params) => {
            const client = await pool.connect();
            const resp = await client.query({
                text: sql,
                values: params
            });
            client.release();
            return resp;
        };
        return this;
    }

    /**
     * @param {PG.Client|Client} client
     * @returns {DbContext}
     */
    usingClient(client) {
        this._usage = (sql, params) => {
            return new Promise((resolve, reject) => {
                client.query(sql, params, function (err, data) {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
        };
        return this;
    }

    /**
     * @param {string} tableName
     */
    constructor(tableName) {
        this.tableName = tableName;
        this._usage = async (sql, params) => {
        };
    }

    /**
     * @param {string} sql
     * @param {object} parameters
     * @returns {[string, *[]]}
     * @private
     */
    _parse(sql, parameters = {}) {
        const values = [];
        sql = sql.replace(/\${([^}]+)}/g, (raw, key) => {
            values.push(parameters[key]);
            return `$${values.length}`;
        });
        return [sql, values];
    }

    /**
     * @param {string} sql
     * @param {object|*[]} parameters
     * @returns {Promise<{
     *     rowCount: int,
     *     rows: *[],
     *     fields: {name: string, dataTypeId: *}[],
     *     command: string
     * }>}
     */
    async run(sql, parameters = []) {
        const [sqlParsed, parametersParsed] = Array.isArray(parameters)
            ? [sql, parameters] : this._parse(sql, parameters);
        return await this._usage(sqlParsed, parametersParsed);
    }

    async dropTable() {
        return await this.run(`DROP TABLE IF EXISTS ${this.tableName}`);
    }

    async beginTransaction() {
        return await this.run('BEGIN');
    }

    async rollback() {
        return await this.run('ROLLBACK');
    }

    async commit() {
        return await this.run('COMMIT');
    }

    /***
     * @returns {CreateQuery}
     */
    create() {
        return new CreateQuery(this.tableName, this);
    }

    /**
     * @param {string[]} columns
     * @returns {SelectQuery}
     */
    select(columns = []) {
        return new SelectQuery(this.tableName, this).columns(columns);
    }

    /**
     * @param {object} object
     * @returns {InsertQuery}
     */
    insert(object = {}) {
        return new InsertQuery(this.tableName, this).columns(object);
    }

    /**
     * @returns {DeleteQuery}
     */
    delete() {
        return new DeleteQuery(this.tableName, this);
    }

    /**
     * @param {object} columns
     * @returns {UpdateQuery}
     */
    update(columns = {}) {
        return new UpdateQuery(this.tableName, this).columns(columns);
    }
}

module.exports = DbContext;