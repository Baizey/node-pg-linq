// noinspection ES6UnusedImports
import should from "should";
import 'regenerator-runtime';
import DbContext from "../src";

const {Pool, Client} = require('pg');

/**
 * @param {DbContext} context
 * @returns {Promise<void>}
 */
const createEmptyTable = async (context) => {
    await context.dropTable();
    const create = context.create().ignoreIfExists();
    create.serial('id').primary();
    create.text('name').nullable(false);
    await create.run();
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

describe("DbContext", function () {
    //this.timeout(10000);
    it('connect and use client', async function () {
        const name = 'pg_linq_test_table_client';
        const context = new DbContext(name);
        const conn = addClient(context);
        await createEmptyTable(context);
        conn.end();
        true.should.True();
    }).timeout(10000);

    it('connect and use pool', async function () {
        const name = 'pg_linq_test_table_pool';
        const context = new DbContext(name);
        const conn = addPool(context);
        await createEmptyTable(context);
        conn.end();
        true.should.True();
    }).timeout(10000);

    it('get select query', () => {
        const context = new DbContext('table');
        context.select().toString().should.equal('SELECT * FROM table');
    });

    it('get delete query', () => {
        const context = new DbContext('table');
        context.delete().toString().should.equal('DELETE FROM table');
    });

    it('get update query', () => {
        const context = new DbContext('table');
        context.update().toString().should.equal('UPDATE table SET ');
    });

    it('get insert query', () => {
        const context = new DbContext('table');
        context.insert().toString().should.equal('INSERT INTO table () VALUES ()');
    });

    it('get create query', () => {
        const context = new DbContext('table');
        context.create().toString().should.equal('CREATE TABLE table ()');
    });
});