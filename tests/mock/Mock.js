import DbContext from "../../src";

const {Client} = require('pg');

let mockInstance = null;

export default class Mock {
    /**
     * @param {DbContext} context
     * @returns {Promise<PG.Client>}
     */
    static client(context) {
        return new Promise(async r => {
            const client = new Client();
            client.connect();
            context.usingClient(client);
            const create = context.create().ignoreIfExists();
            create.int('id').nullable(false);
            create.text('name').nullable(false);
            await create.run();
            r(client);
        });
    }

    static finish(context, client) {
        return new Promise(async r => {
            await context.dropTable();
            client.end();
            r();
        })
    }

}