// noinspection ES6UnusedImports
import should from "should";
import SelectQuery from "../src/query/SelectQuery";
import DbContext from "../src";

describe("SelectQuery", () => {
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

    describe("distinct", () => {
        it('all', () => {
            table.select()
                .distinct()
                .toString().should.equal('SELECT DISTINCT * FROM table');
        });
        it('one', () => {
            table.select()
                .distinct('id')
                .toString().should.equal('SELECT DISTINCT ON (id) id FROM table');
        });
        it('combo', () => {
            table.select(['name'])
                .distinct('id')
                .toString().should.equal('SELECT name, DISTINCT ON (id) id FROM table');
        });
        it('override', () => {
            table.select(['id'])
                .distinct('id')
                .toString().should.equal('SELECT DISTINCT ON (id) id FROM table');
        });
    });
});