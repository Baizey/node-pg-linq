import CreateTableQuery from "./query/CreateTableQuery";
import SelectQuery from "./query/SelectQuery";
import InsertQuery from "./query/InsertQuery";
import DeleteQuery from "./query/DeleteQuery";
import UpdateQuery from "./query/UpdateQuery";

const {Pool, Client} = require('pg');

/*
- run: npm run release
- run: git push "https://${{secrets.user_name}}:${{secrets.github_registry_token}}@github.com/${{secrets.user_name}}/node-pg-linq.git" HEAD:master_temp
 */

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
    usingPool(pool = undefined) {
        if (!pool) pool = new Pool();
        this._conn = pool;
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
    usingClient(client = undefined) {
        if (!client) {
            client = new Client();
            client.connect();
        }
        this._conn = client;
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
     * @returns {PG.Client|PG.Pool|undefined}
     */
    get connection() {
        return this._conn;
    }

    /**
     * @param {string} tableName
     */
    constructor(tableName) {
        this.tableName = tableName;
        this._conn = undefined;
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
     * @returns {CreateTableQuery}
     */
    create() {
        return new CreateTableQuery(this.tableName, this);
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
     * @param {function():boolean|function(*):boolean|function(*,*):boolean|function(*,*,*):boolean} statement
     * @param {*} variables
     * @returns {DeleteQuery}
     */
    delete(statement = undefined, variables = []) {
        if (statement)
            if (variables)
                return new DeleteQuery(this.tableName, this).where(statement, ...variables);
            else
                return new DeleteQuery(this.tableName, this).where(statement);
        return new DeleteQuery(this.tableName, this);
    }

    end() {
        const conn = this.connection;
        if (conn) conn.end();
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