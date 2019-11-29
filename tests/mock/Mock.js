const pgtest = require('pgtest');

export default class Mock {
    /**
     * @returns {Promise<{
     *     error: *,
     *     client: Client,
     *     done: function
     * }>}
     */
    async mock() {
        return await new Promise((resolve) => {
            pgtest.connect('testdb', (err, client, done) => {
                resolve({
                    error: err,
                    client: client,
                    done: done
                })
            });
        });
    }
}