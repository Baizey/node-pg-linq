// noinspection ES6UnusedImports
import should from "should";
import DeleteQuery from "../src/query/DeleteQuery";

describe("DeleteQuery", () => {
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