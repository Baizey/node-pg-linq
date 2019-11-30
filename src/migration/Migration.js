export default class MigrationQueries {
    /**
     * @param {CreateTableQuery} currentTable
     * @param {CreateTableQuery} newTable
     */
    static createMigration(currentTable, newTable) {
        const query = new MigrationQueries(currentTable.tableName, currentTable._context);

        if (newTable.tableName !== currentTable.tableName)
            query.changeName(newTable.tableName);

        return query;
    }

    /**
     * @param {string} name
     * @param {DbContext} context
     */
    constructor(name, context) {
        this._context = context;
        this._name = name;
        this._queries = [];
    }

    /**
     * @returns {string[]}
     */
    get queries() {
        return this._queries;
    }

    /**
     * @param {string} newName
     * @returns {MigrationQueries}
     */
    changeName(newName) {
        this._queries.push(`ALTER TABLE ${this._name} RENAME TO ${newName}`);
        this._name = newName;
        return this;
    }

    /**
     * @param {Column} column
     * @returns {MigrationQueries}
     */
    addColumn(column) {
        this._queries.push(`ALTER TABLE ${this._name} ADD COLUMN ${column.toString()}`);
        return this;
    }

    /**
     * @param {Column} column
     * @returns {MigrationQueries}
     */
    dropColumn(column) {
        this._queries.push(`ALTER TABLE ${this._name} DROP COLUMN IF EXISTS ${column.name}`);
        return this;
    }

    /**
     * @param {Column} oldColumn
     * @param {Column} newColumn
     * @returns {MigrationQueries}
     */
    alterColumn(oldColumn, newColumn) {
        if (oldColumn.isNullable !== newColumn.isNullable)
            this._queries.push(`ALTER TABLE ${this._name} ALTER COLUMN ${oldColumn.name} ${newColumn.isNullable ? 'SET' : 'DROP'} NOT NULL`);


        if (oldColumn.type !== newColumn.type) {
            this._queries.push(`ALTER TABLE ${this._name} ALTER COLUMN ${oldColumn.name} DROP DEFAULT`);
            this._queries.push(`ALTER TABLE ${this._name} ALTER COLUMN ${oldColumn.name} SET DATA TYPE ${newColumn.type}`);
        }
        
        if ((typeof newColumn.defaultValue !== 'undefined'))
            this._queries.push(`ALTER TABLE ${this._name} ALTER COLUMN ${oldColumn.name} SET DEFAULT ${newColumn.defaultValue}`);

        if (oldColumn.name !== newColumn.name)
            this._queries.push(`ALTER TABLE ${this._name} RENAME COLUMN ${oldColumn.name} TO ${newColumn.name}`);
        return this;
    }

    /**
     * @returns {Promise<void>}
     */
    async run() {
        for (let i in this.queries)
            await this._context.run(this.queries[i]);
    }
}