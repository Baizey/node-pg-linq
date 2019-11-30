// noinspection ES6UnusedImports
import should from "should";
import 'regenerator-runtime';
import DbContext from "../src";

describe("DbContext", () => {
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
        context.update().toString().should.equal('UPDATE table SET  ');
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