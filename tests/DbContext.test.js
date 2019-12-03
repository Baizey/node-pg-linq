// noinspection ES6UnusedImports
import should from "should";
import 'regenerator-runtime';
import DbContext from "../src";

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

describe("DbContext", function () {

    describe("queries", () => {
        const context = new DbContext('DbContextTests');
        beforeEach(async () => {
            context.using(() => undefined);
        });
        afterEach(async () => {
            await context.dropTable();
            context.end();
        });

        it('connect and use client', async function () {
            context.usingClient();
            await createEmptyTable(context);
            true.should.True();
        });

        it('connect and use pool', async function () {
            context.usingPool();
            await createEmptyTable(context);
            true.should.True();
        });
    });

    it('get select query', () => {
        const context = new DbContext('table');
        context.select().toString().should.equal('SELECT * FROM table AS table');
    });

    it('get delete query', () => {
        const context = new DbContext('table');
        context.delete().toString().should.equal('DELETE FROM table AS table');
    });

    it('get update query', () => {
        const context = new DbContext('table');
        context.update().toString().should.equal('UPDATE table AS table SET ');
    });

    it('get insert query', () => {
        const context = new DbContext('table');
        context.insert({a: 1}).toString().should.equal('INSERT INTO table AS table (a) VALUES (${a0}) ');
    });

    it('get create query', () => {
        const context = new DbContext('table');
        context.create().toString().should.equal('CREATE TABLE table ()');
    });
});