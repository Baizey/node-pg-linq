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
    //this.timeout(10000);
    it('connect and use client', async function () {
        const name = 'DbContextClientTests';
        const context = new DbContext(name).usingClient();
        await createEmptyTable(context);
        context.end();
        true.should.True();
    }).timeout(10000);

    it('connect and use pool', async function () {
        const name = 'DbContextPoolTests';
        const context = new DbContext(name).usingPool();
        await createEmptyTable(context);
        context.end();
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