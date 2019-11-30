const pgtest = require('pgtest');

let mockInstance = null;

export default class Mock {
    constructor() {
    }

    static get instance() {
        return mockInstance ? mockInstance : (mockInstance = new Mock());
    }

    static check() {
        return pgtest.check();
    }

    /**
     * @param {string} sql
     * @param {{
     *     rowCount: int,
     *     rows: *[]
     * }} data
     * @returns {*|void}
     */
    static expect(sql, data) {
        return pgtest.expect(sql).returning(null, data);
    }

    static get mock() {
        return Mock.instance.mock();
    }

    /**
     * @returns {Promise<{
     *     finish: function,
     *     client: Client,
     *     expect: function(string):returning
     * }>}
     */
    async mock() {
        return await new Promise((resolve) => {
            pgtest.connect('testdb', (err, client, done) => {
                resolve({
                    client: client,
                    finish: () => done(),
                });
            });
        });
    }
}