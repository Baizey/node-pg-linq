// noinspection ES6UnusedImports
import should from "should";
import Query from "../src/query/Query";

describe("Query", () => {
    describe('where', () => {
        it('empty', () => {
            const query = new Query('table', null);
            query._generateFilterSql.should.empty();
        });
        it('=== constant', () => {
            const query = new Query('table', null)
                .where(e => e.id === 1);
            query._generateFilterSql.should.equal('WHERE e.id = 1');
        });
        it('===', () => {
            const query = new Query('table', null)
                .where(e => e.id === $, [1]);
            query._generateFilterSql.should.equal('WHERE e.id = ${auto_0_0}');
        });
        it('and', () => {
            const query = new Query('table', null)
                .where(table => table.id === $ && table.id === $, [1, 2]);
            query._generateFilterSql.should.equal('WHERE table.id = ${auto_0_0} AND table.id = ${auto_0_1}');
        });
        it('or', () => {
            const query = new Query('table', null)
                .where(table => table.id === $ || table.id === $, [1, 2]);
            query._generateFilterSql.should.equal('WHERE table.id = ${auto_0_0} OR table.id = ${auto_0_1}');
        });
        it('!==', () => {
            const query = new Query('table', null)
                .where(table => table.id !== $, [1]);
            query._generateFilterSql.should.equal('WHERE table.id <> ${auto_0_0}');
        });
        it('==', () => {
            const query = new Query('table', null)
                .where(table => table.id == $, [1]);
            query._generateFilterSql.should.equal('WHERE table.id LIKE ${auto_0_0}');
        });
        it('!=', () => {
            const query = new Query('table', null)
                .where(table => table.id != $, [1]);
            query._generateFilterSql.should.equal('WHERE table.id NOT LIKE ${auto_0_0}');
        });
        it('in', () => {
            const query = new Query('table', null)
                .where(table => table.id in $, [[1, 2, 3]]);
            query._generateFilterSql.should.equal('WHERE table.id in (${auto_0_0_0}, ${auto_0_0_1}, ${auto_0_0_2})');
        });
    });
    describe('join', () => {
        it('basic', () => {
            const query = new Query('table', null)
                .join('other', opt => opt.inner.on(() => table.id === other.id));
            query._generateFilterSql.should.equal('INNER JOIN other ON (table.id = other.id)');
        });
    })
});