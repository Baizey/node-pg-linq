// noinspection ES6UnusedImports
import should from "should";
import UpdateQuery from "../src/query/UpdateQuery";
import DbContext from "../src";
import Mock from "./mock/Mock";

describe("UpdateQuery", () => {
    describe('sql', () => {
        it('basic', () => {
            const query = new UpdateQuery('table', null)
                .columns({name: 'newName'});
            query.toString().should.equal('UPDATE table SET name = ${name}');
        });
        it('where', () => {
            const query = new UpdateQuery('table', null)
                .columns({name: 'newName'})
                .where(e => e.id === $, 1);
            query.toString().should.equal('UPDATE table SET name = ${name} WHERE e.id = ${auto_0_0}');
        });
    });
    describe('queries', () => {
        const context = new DbContext('UpdateQueryTests');
        beforeEach(async () => await Mock.client(context));
        afterEach(async () => await Mock.finish(context));

        it('basic', async () => {
            const insert = context.insert({name: 'John', id: 1});
            await insert.run();
            await context.update({name: 'Bob'}).run();
            (await context.select().all()).should.deepEqual([{name: 'Bob', id: 1}]);
        });
        it('where', async () => {
            await context.insert([{name: 'John', id: 1}, {name: 'Bob', id: 2}]).run();
            await context.update({name: 'Alice'}).where(() => name === $, 'Bob').run();
            (await context.select().all()).should.deepEqual([{name: 'John', id: 1}, {name: 'Alice', id: 2}]);
        });
    });
});