// noinspection ES6UnusedImports
import should from "should";
import DbContext from "../src";
import Mock from "./mock/Mock";
import InsertQuery from "../src/query/InsertQuery";

describe("InsertQuery", () => {
    describe('sql', () => {
        it('basic', () => {
            const query = new InsertQuery('table', null).columns({name: 'newName'});
            query.toString().should.equal('INSERT INTO table (name) VALUES (${name0}) ');
        });
        it('where', () => {
            const query = new InsertQuery('table', null).columns({name: 'newName'});
            query.toString().should.equal('INSERT INTO table (name) VALUES (${name0}) ');
        });
    });
    describe('queries', () => {
        const context = new DbContext('InsertQueryTests');
        beforeEach(async () => await Mock.client(context, create => create.int('id').unique().nullable(false)));
        afterEach(async () => await Mock.finish(context));

        it('basic', async () => {
            await context.insert({id: 1}).run();
            (await context.select().all()).should.deepEqual([{id: 1}]);
        });
        it('multiple', async () => {
            await context.insert({id: 1}).run();
            await context.insert({id: 2}).run();
            (await context.select().all()).should.deepEqual([{id: 1}, {id: 2}]);
        });
        it('collision, ignore', async () => {
            await context.insert({id: 1}).run();
            await context.insert({id: 1}).ignoreConflicts().run();
            (await context.select().all()).should.deepEqual([{id: 1}]);
        });
        it('collision, crash', async () => {
            await context.insert({id: 1}).run();
            await context.insert({id: 1}).run().catch(err => err.should.not.equal(null));
        });
    });
});