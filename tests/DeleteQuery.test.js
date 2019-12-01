// noinspection ES6UnusedImports
import should from "should";
import DeleteQuery from "../src/query/DeleteQuery";
import DbContext from "../src";
import Mock from "./mock/Mock";

describe("DeleteQuery", () => {
    describe('sql', () => {
        it('basic', () => {
            const query = new DeleteQuery('table', null);
            query.toString().should.equal('DELETE FROM table');
        });
        it('where', () => {
            const query = new DeleteQuery('table', null)
                .where(e => e.id === $, 1);
            query.toString().should.equal('DELETE FROM table WHERE e.id = ${auto_0_0}');
        });
    });

    describe('queries', () => {
        let client, context = new DbContext('DeleteQueryTests');
        beforeEach(async () => client = await Mock.client(context));
        afterEach(async () => await Mock.finish(context, client));

        it('basic', async () => {
            await context.insert({name: 'John', id: 1}).run();
            await context.delete().run();
            (await context.select().all()).should.deepEqual([]);
        });
        it('where', async () => {
            await context.insert({name: 'John', id: 1}).run();
            await context.insert({name: 'Bob', id: 2}).run();
            await context.delete().where(() => name === $, 'Bob').run();
            (await context.select().all()).should.deepEqual([{name: 'John', id: 1}]);
        });
    });
});