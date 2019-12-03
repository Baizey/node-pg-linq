// noinspection ES6UnusedImports
import should from "should";
import Query from "../src/query/Query";
import DbContext from "../src";
import Mock from "./mock/Mock";
import InsertQuery from "../src/query/InsertQuery";
import SelectQuery from "../src/query/SelectQuery";

describe("Query", () => {
    describe('where', () => {
        it('empty', () => {
            const query = new InsertQuery('table', null);
            query._where.toString().should.empty();
        });
        it('=== constant', () => {
            const query = new InsertQuery('table', null)
                .where(e => e.id === 1);
            query._where.toString().should.equal(' WHERE e.id = 1');
        });
        it('===', () => {
            const query = new InsertQuery('table', null)
                .where(e => e.id === $, 1);
            query._where.toString().should.equal(' WHERE e.id = ${auto_0_0}');
        });
        it('and', () => {
            const query = new InsertQuery('table', null)
                .where(table => table.id === $ && table.id === $, 1, 2);
            query._where.toString().should.equal(' WHERE table.id = ${auto_0_0} AND table.id = ${auto_0_1}');
        });
        it('or', () => {
            const query = new InsertQuery('table', null)
                .where(table => table.id === $ || table.id === $, 1, 2);
            query._where.toString().should.equal(' WHERE table.id = ${auto_0_0} OR table.id = ${auto_0_1}');
        });
        it('is null', () => {
            const query = new InsertQuery('table', null)
                .where(table => table.id === null);
            query._where.toString().should.equal(' WHERE table.id IS NULL');
        });
        it('is not null', () => {
            const query = new InsertQuery('table', null)
                .where(table => table.id !== null);
            query._where.toString().should.equal(' WHERE table.id IS NOT NULL');
        });
        it('not mixing = and IS', () => {
            const query = new InsertQuery('table', null)
                .where(table => table.id !== null && table.id === 5);
            query._where.toString().should.equal(' WHERE table.id IS NOT NULL AND table.id = 5');
        });
        it('!==', () => {
            const query = new InsertQuery('table', null)
                .where(table => table.id !== $, 1);
            query._where.toString().should.equal(' WHERE table.id <> ${auto_0_0}');
        });
        it('==', () => {
            const query = new InsertQuery('table', null)
                .where(table => table.id == $, 1);
            query._where.toString().should.equal(' WHERE table.id LIKE ${auto_0_0}');
        });
        it('!=', () => {
            const query = new InsertQuery('table', null)
                .where(table => table.id != $, 1);
            query._where.toString().should.equal(' WHERE table.id NOT LIKE ${auto_0_0}');
        });
        it('in', () => {
            const query = new InsertQuery('table', null)
                .where(table => table.id in $, [1, 2, 3]);
            query._where.toString().should.equal(' WHERE table.id in (${auto_0_0_0}, ${auto_0_0_1}, ${auto_0_0_2})');
        });
    });
    it('from', () => {
        const query = new SelectQuery('table', null).from('other');
        query.toString().should.equal('SELECT * FROM table, other');
    });
    describe('join', () => {
        const context1 = new DbContext('JoinQueryTest1'),
            context2 = new DbContext('JoinQueryTest2');

        beforeEach(async () => {
            await Mock.client(context1);
            await Mock.client(context2, create => {
                create.int('id2').nullable(false);
                create.text('name2').nullable(false);
            });
        });
        afterEach(async () => {
            await Mock.finish(context1);
            await Mock.finish(context2);
        });

        it('basic', async () => {
            await context1.insert({id: 1, name: 'John'}).run();
            await context2.insert({id2: 1, name2: 'Bob'}).run();

            const query = context1.select().as('a').join(context2.tableName, opt => opt.as('b').right.on((a, b) => a.id === b.id2));
            (await query.all())
                .should.deepEqual([{id: 1, name: 'John', id2: 1, name2: 'Bob'}]);
        });
    })
});