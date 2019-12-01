// noinspection ES6UnusedImports
import should from "should";
import Query from "../src/query/Query";
import DbContext from "../src";
import Mock from "./mock/Mock";

describe("Query", () => {
    describe('where', () => {
        it('empty', () => {
            const query = new Query('table', null);
            query._generateFilterSql.should.empty();
        });
        it('=== constant', () => {
            const query = new Query('table', null)
                .where(e => e.id === 1);
            query._generateFilterSql.should.equal(' WHERE e.id = 1');
        });
        it('===', () => {
            const query = new Query('table', null)
                .where(e => e.id === $, [1]);
            query._generateFilterSql.should.equal(' WHERE e.id = ${auto_0_0}');
        });
        it('and', () => {
            const query = new Query('table', null)
                .where(table => table.id === $ && table.id === $, [1, 2]);
            query._generateFilterSql.should.equal(' WHERE table.id = ${auto_0_0} AND table.id = ${auto_0_1}');
        });
        it('or', () => {
            const query = new Query('table', null)
                .where(table => table.id === $ || table.id === $, [1, 2]);
            query._generateFilterSql.should.equal(' WHERE table.id = ${auto_0_0} OR table.id = ${auto_0_1}');
        });
        it('!==', () => {
            const query = new Query('table', null)
                .where(table => table.id !== $, [1]);
            query._generateFilterSql.should.equal(' WHERE table.id <> ${auto_0_0}');
        });
        it('==', () => {
            const query = new Query('table', null)
                .where(table => table.id == $, [1]);
            query._generateFilterSql.should.equal(' WHERE table.id LIKE ${auto_0_0}');
        });
        it('!=', () => {
            const query = new Query('table', null)
                .where(table => table.id != $, [1]);
            query._generateFilterSql.should.equal(' WHERE table.id NOT LIKE ${auto_0_0}');
        });
        it('in', () => {
            const query = new Query('table', null)
                .where(table => table.id in $, [[1, 2, 3]]);
            query._generateFilterSql.should.equal(' WHERE table.id in (${auto_0_0_0}, ${auto_0_0_1}, ${auto_0_0_2})');
        });
    });
    describe('join', () => {
        let client1, context1 = new DbContext('JoinQueryTest1');
        let client2, context2 = new DbContext('JoinQueryTest2');

        beforeEach(async () => {
            client1 = await Mock.client(context1);
            client2 = await Mock.client(context2, create => {
                create.int('id2').nullable(false);
                create.text('name2').nullable(false);
            });
            await context1.delete().run();
            await context2.delete().run();
        });
        afterEach(async () => {
            await Mock.finish(context1, client1);
            await Mock.finish(context2, client2);
        });

        it('basic', async () => {
            await context1.insert({id: 1, name: 'John'}).run();
            await context2.insert({id2: 1, name2: 'Bob'}).run();

            const query = context1.select().as('a').join(context2.tableName, opt => opt.as('b').right.on((a, b) => a.id === b.id2));
            const sql = query.toString();
            (await query.all())
                .should.deepEqual([{ id: 1, name: 'John', id2: 1, name2: 'Bob' }]);
        });
    })
});