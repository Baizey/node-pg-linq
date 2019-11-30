import DbContext from "../../src";

const {Pool, Client} = require('pg');

/**
 * @param {DbContext} context
 * @returns {Promise<void>}
 */
const createEmptyTable = async (context) => {
    const create = context.create().ignoreIfExists();
    create.serial('id').primary();
    create.text('name').nullable(false);
    await create.run();
    await context.delete().run();
};
/**
 * @param {DbContext} context
 * @returns {PG.Client}
 */
const addClient = context => {
    const client = new Client();
    client.connect();
    context.usingClient(client);
    return client;
};

/**
 * @param {DbContext} context
 * @returns {PG.Pool}
 */
const addPool = context => {
    const pool = new Pool();
    context.usingPool(pool);
    return pool;
};

describe("DbContext", () => {
    it('connect and use client', async () => {
        const name = 'pg-linq-test-table-client';
        const context = new DbContext(name);
        const conn = addClient(context);
        await createEmptyTable(context);
        conn.end();
    });

    it('connect and use pool', async () => {
        const name = 'pg-linq-test-table-pool';
        const context = new DbContext(name);
        const conn = addPool(context);
        await createEmptyTable(context);
        conn.end();
    });
});