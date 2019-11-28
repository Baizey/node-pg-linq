// noinspection ES6UnusedImports
import should from "should";
import Query from "../src/query/Query";

describe("Query", () => {
    it('empty where', () => {
        const query = new Query('table', null);
        query._generateWhereSql.should.empty();
    });

    it('where === constant', () => {
        const query = new Query('table', null)
            .where(e => e.id === 1);
        query._generateWhereSql.should.equal('WHERE e.id = 1');
    });

    it('where ===', () => {
        const query = new Query('table', null)
            .where(e => e.id === $, [1]);
        query._generateWhereSql.should.equal('WHERE e.id = ${auto_param_0}');
    });

    it('where and', () => {
        const query = new Query('table', null)
            .where(table => table.id === $ && table.id === $, [1, 2]);
        query._generateWhereSql.should.equal('WHERE table.id = ${auto_param_0} AND table.id = ${auto_param_1}');
    });

    it('where or', () => {
        const query = new Query('table', null)
            .where(table => table.id === $ || table.id === $, [1, 2]);
        query._generateWhereSql.should.equal('WHERE table.id = ${auto_param_0} OR table.id = ${auto_param_1}');
    });

    it('where !==', () => {
        const query = new Query('table', null)
            .where(table => table.id !== $, [1]);
        query._generateWhereSql.should.equal('WHERE table.id <> ${auto_param_0}');
    });

    it('where ==', () => {
        const query = new Query('table', null)
            .where(table => table.id == $, [1]);
        query._generateWhereSql.should.equal('WHERE table.id LIKE ${auto_param_0}');
    });

    it('where !=', () => {
        const query = new Query('table', null)
            .where(table => table.id != $, [1]);
        query._generateWhereSql.should.equal('WHERE table.id NOT LIKE ${auto_param_0}');
    });

    it('where in', () => {
        const query = new Query('table', null)
            .where(table => table.id in $, [[1, 2, 3]]);
        query._generateWhereSql.should.equal('WHERE table.id in (${auto_param_0_0}, ${auto_param_0_1}, ${auto_param_0_2})');
    });
});