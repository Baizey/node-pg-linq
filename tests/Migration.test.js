// noinspection ES6UnusedImports
import should from "should";
import CreateTableQuery from "../src/query/CreateTableQuery";
import MigrationQueries from "../src/migration/Migration";
import DbContext from "../src";

describe("MigrationQuery", () => {
    describe('sql', () => {
        const original = new CreateTableQuery('table', null);
        original.serial('id').primary();

        it('No changes', () => {
            const migration = MigrationQueries.createMigration(original, original);
            migration.queries.should.deepEqual([
                'ALTER TABLE table DROP CONSTRAINT IF EXISTS primary_id',
                'ALTER TABLE table ADD CONSTRAINT primary_id PRIMARY KEY (id)'
            ]);
        });
    });


    describe('queries', () => {
    });
});