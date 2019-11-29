// noinspection ES6UnusedImports
import should from "should";
import 'regenerator-runtime';
import DbContext from "../src";
import Mock from "./mock/Mock";

describe("DbContext", () => {

    it('test client', async () => {
        const conn = await new Mock().mock();
        const client = conn.client;
        const context = new DbContext('client');
        context.usingClient(client);

        const create = context.create();
        create.int('id');
        await create.run();

        await context.insert({id: 1}).run();
        const rows = await context.select().all();
        rows.should.deepEqual([{id: 1}]);
        conn.done();
    });
});