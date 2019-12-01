// noinspection ES6UnusedImports
import should from "should";
import SelectQuery from "../src/query/SelectQuery";
import DbContext from "../src";
import Mock from "./mock/Mock";

describe("SelectQuery", () => {

    describe('sql ', () => {
        const table = new DbContext('table');
        it('limit', () => {
            table.select().limit(5).toString().should.equal('SELECT * FROM table LIMIT 5');
        });
        it('offset', () => {
            table.select().offset(5).toString().should.equal('SELECT * FROM table OFFSET 5');
        });
        it('limit and offset', () => {
            table.select().offset(4).limit(4).toString().should.equal('SELECT * FROM table LIMIT 4 OFFSET 4');
        });
        describe("orderBy", () => {
            it('asc', () => {
                table.select()
                    .orderBy('id', true)
                    .toString().should.equal('SELECT * FROM table ORDER BY id ASC');
            });
            it('desc', () => {
                table.select()
                    .orderBy('id', false)
                    .toString().should.equal('SELECT * FROM table ORDER BY id DESC');
            });
            it('multiple', () => {
                table.select()
                    .orderBy('id')
                    .orderBy('name')
                    .toString().should.equal('SELECT * FROM table ORDER BY id ASC, name ASC');
            });
        });
        describe("groupBy", () => {
            it('asc', () => {
                table.select()
                    .groupBy('id', true)
                    .toString().should.equal('SELECT * FROM table GROUP BY id');
            });
            it('desc', () => {
                table.select()
                    .groupBy('id', false)
                    .toString().should.equal('SELECT * FROM table GROUP BY id DESC');
            });
            it('multiple', () => {
                table.select()
                    .groupBy('id')
                    .groupBy('name')
                    .toString().should.equal('SELECT * FROM table GROUP BY id, name');
            });
        });

        describe("distinct", () => {
            it('all', () => {
                table.select()
                    .distinct()
                    .toString().should.equal('SELECT DISTINCT * FROM table');
            });
            it('one', () => {
                table.select()
                    .distinct('id')
                    .toString().should.equal('SELECT DISTINCT ON (id) id, * FROM table');
            });
            it('combo', () => {
                table.select(['name'])
                    .distinct('id')
                    .toString().should.equal('SELECT DISTINCT ON (id) id, name FROM table');
            });
            it('override', () => {
                table.select(['id'])
                    .distinct('id')
                    .toString().should.equal('SELECT DISTINCT ON (id) id, * FROM table');
            });
        });
    });

    describe('queries', () => {
        const context = new DbContext('SelectQueryTests');
        beforeEach(async () => await Mock.client(context));
        afterEach(async () => await Mock.finish(context));
        it('limit', async () => {
            await context.insert({name: 'John', id: 1}).run();
            await context.insert({name: 'Bob', id: 2}).run();
            (await context.select().limit(1).all()).should.deepEqual([{name: 'John', id: 1}]);
        });
        it('offset', async () => {
            await context.insert({name: 'John', id: 1}).run();
            await context.insert({name: 'Bob', id: 2}).run();
            (await context.select().offset(1).all()).should.deepEqual([{name: 'Bob', id: 2}]);
        });
        it('distinct on', async () => {
            await context.insert({name: 'Bob', id: 1}).run();
            await context.insert({name: 'Bob', id: 2}).run();
            (await context.select().distinct('name').all())
                .should.deepEqual(
                [
                    {id: 1, name: 'Bob'}
                ]);
        });
        it('distinct', async () => {
            await context.insert({name: 'Bob', id: 1}).run();
            await context.insert({name: 'Bob', id: 1}).run();
            (await context.select().distinct().all())
                .should.deepEqual(
                [
                    {name: 'Bob', id: 1}
                ]);
        });
        it('orderBy', async () => {
            await context.insert({name: 'John', id: 1}).run();
            await context.insert({name: 'Bob', id: 2}).run();
            (await context.select().orderBy('id', false).all())
                .should.deepEqual(
                [
                    {name: 'Bob', id: 2},
                    {name: 'John', id: 1}
                ]);
        });
        it('groupBy', async () => {
            await context.insert({name: 'Bob', id: 2}).run();
            await context.insert({name: 'Bob', id: 3}).run();
            await context.insert({name: 'Bob', id: 2}).run();
            (await context.select(['SUM(id) as sum', 'name']).groupBy('name').all())
                .should.deepEqual([{sum: '7', name: 'Bob'}]);
        });
    });
});