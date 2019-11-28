import CreateQuery from "./query/CreateQuery";
import SelectQuery from "./query/SelectQuery";
import InsertQuery from "./query/InsertQuery";
import DeleteQuery from "./query/DeleteQuery";
import UpdateQuery from "./query/UpdateQuery";
import * as pgTemp from 'pg';

const pg = pgTemp.defaults;

export default class DbContext {
    /**
     * @param {string} tableName
     * @param {Pool} pool
     * @returns {DbContext}
     */
    static usingPool(tableName, pool) {
        const usage = async (sql, params) => {
            const client = await pool.connect();
            const resp = await client.query({
                text: sql,
                values: params
            });
            client.release();
            return resp;
        };
        return new DbContext(tableName, usage);
    }

    /**
     * @param {string} tableName
     * @param {Client} client
     * @returns {DbContext}
     */
    static usingClient(tableName, client) {
        const usage = async (sql, params) => await client.query({
            text: sql,
            values: params
        });
        return new DbContext(tableName, usage);
    }

    /**
     * @param {string} tableName
     * @param {function(sql:string, params:*[]):*} queryRunner
     */
    constructor(tableName, queryRunner) {
        this.tableName = tableName;
        this._usage = queryRunner;
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
        return [sql, parameters];
    }

    /**
     * @param {string} sql
     * @param {object|*[]} parameters
     */
    async run(sql, parameters = []) {
        const [sqlParsed, sqlParameterized] = Array.isArray(parameters)
            ? [sql, parameters] : this._parse(sqlParsed, parameters);
        return await this._usage(sqlParameterized, sqlParameterized);
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