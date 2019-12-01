import DbContext from "../../src";

export default class Mock {
    /**
     * @param {DbContext} context
     * @param {function(CreateTableQuery):*} tableCreator
     * @returns {Promise<void>}
     */
    static client(context, tableCreator = undefined) {
        return new Promise(async r => {
            const create = context.usingClient().create().ignoreIfExists();
            if (tableCreator)
                tableCreator(create);
            else {
                create.int('id').nullable(false);
                create.text('name').nullable(false);
            }
            await create.run();
            r();
        });
    }

    static finish(context) {
        return new Promise(async r => {
            await context.dropTable();
            context.end();
            r();
        })
    }

}