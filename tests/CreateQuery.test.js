// noinspection ES6UnusedImports
import should from "should";
import CreateQuery from "../src/query/CreateQuery";

describe("Create tests", () => {
    it('basic', () => {
        const query = new CreateQuery('name', undefined);
        query.int('id');
        query.toString().should.equal('CREATE TABLE name (id int PRIMARY KEY)');
    })
});