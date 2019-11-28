// noinspection ES6UnusedImports
import should from "should";
import UpdateQuery from "../src/query/UpdateQuery";

describe("UpdateQuery", () => {
    it('basic', () => {
        const query = new UpdateQuery('table', null)
            .columns({name: 'newName'});
        query.toString().should.equal('UPDATE table SET name = ${name} ');
    });
    it('where', () => {
        const query = new UpdateQuery('table', null)
            .columns({name: 'newName'})
            .where(e => e.id === $, 1);
        query.toString().should.equal('UPDATE table SET name = ${name} WHERE e.id = ${auto_param_0}');
    });
});