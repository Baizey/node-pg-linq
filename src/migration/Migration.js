import Constraint from "../query/Constraint";

export default class MigrationQueries {
    /**
     * @param {CreateTableQuery} currentTable
     * @param {CreateTableQuery} newTable
     * @param {function(*):*|object} columnRenaming, expects keys to be old column names and values to be their new names,
     * expects all values to be strings
     */
    static createMigration(currentTable, newTable, columnRenaming = {}) {
        const newColumns = newTable.columns.reduce((a, b) => (a[b.name] = b) && a, {});
        const oldColumns = currentTable.columns.reduce((a, b) => (a[b.name] = b) && a, {});

        const query = new MigrationQueries(currentTable.tableName, currentTable._context);

        // Drop old constraints
        currentTable.constraints.forEach(constraint => query.dropConstraint(constraint));

        // Rename columns
        Object.keys(columnRenaming).forEach(oldName => {
            const newName = columnRenaming[oldName];
            query.renameColumn(oldName, newName);
        });

        // Drop old columns
        oldColumns.filter(oldColumn => !newColumns[oldColumn.name])
            .forEach(oldColumn => query.dropColumn(oldColumn));

        // Add and alter columns
        newColumns
            .map(newColumn => ({new: newColumn, old: oldColumns[newColumn.name]}))
            .forEach(columns => columns.old
                ? query.alterColumn(columns.old, columns.new)
                : query.addColumn(columns.new));

        // Create group constraints
        newTable.uniqueGroupConstraints.forEach(constraint => query.addConstraint(constraint));
        if (newTable.primaryGroupConstraints) query.addConstraint(newTable.primaryGroupConstraints);

        // Rename table
        if (newTable.tableName !== currentTable.tableName)
            query.renameTable(newTable.tableName);

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
        this._renamingLookup = {};
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
    renameTable(newName) {
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
        // Only drop if we aren't renaming
        if (!this._renamingLookup[column.name])
            this._queries.push(`ALTER TABLE ${this._name} DROP COLUMN IF EXISTS ${column.name}`);
        return this;
    }

    /**
     * @param {Column} oldColumn
     * @param {Column} newColumn
     * @returns {MigrationQueries}
     */
    alterColumn(oldColumn, newColumn) {
        if (oldColumn.type !== newColumn.type) {
            this._queries.push(`ALTER TABLE ${this._name} ALTER COLUMN ${oldColumn.name} DROP DEFAULT`);
            this._queries.push(`ALTER TABLE ${this._name} ALTER COLUMN ${oldColumn.name} SET DATA TYPE ${newColumn.type}`);
            if (typeof newColumn.defaultValue !== 'undefined')
                this._queries.push(`ALTER TABLE ${this._name} ALTER COLUMN ${oldColumn.name} DEFAULT ${newColumn.defaultValue}`);
        }

        if (oldColumn.isNullable !== newColumn.isNullable)
            this._queries.push(`ALTER TABLE ${this._name} ALTER COLUMN ${oldColumn.name} ${newColumn.isNullable ? 'SET' : 'DROP'} NOT NULL`);

        if (newColumn.isUnique)
            this.addConstraint(newColumn.uniqueConstraint);

        if (newColumn.isPrimaryKey)
            this.addConstraint(newColumn.primaryConstraint);

        if (newColumn.hasReference)
            this.addConstraint(newColumn.referenceConstraint);

        return this;
    }

    /**
     * @param {Constraint|ReferenceConstraint} constraint
     * @returns {MigrationQueries}
     */
    addConstraint(constraint) {
        switch (constraint.type) {
            case Constraint.types.unique:
                this._queries.push(`ALTER TABLE ${this._name} ADD CONSTRAINT ${constraint.name} UNIQUE (${constraint.columnNames.join(', ')})`);
                break;
            case Constraint.types.primary:
                this._queries.push(`ALTER TABLE ${this._name} ADD CONSTRAINT ${constraint.name} PRIMARY KEY (${constraint.columnNames.join(', ')})`);
                break;
            case Constraint.types.foreign:
                this._queries.push(`ALTER TABLE ${this._name} ADD CONSTRAINT ${constraint.name} FOREIGN KEY (${constraint.column.name}) REFERENCES ${constraint.reference} MATCH FULL`);
                break;
        }
        return this;
    }

    /**
     * @param {Constraint} constraint
     * @returns {MigrationQueries}
     */
    dropConstraint(constraint) {
        this._queries.push(`ALTER TABLE ${this._name} DROP CONSTRAINT IF EXISTS ${constraint.name}`);
        return this;
    }

    /**
     * @param {string} oldName
     * @param {string} newName
     * @returns {MigrationQueries}
     */
    renameColumn(oldName, newName) {
        this._renamingLookup[oldName] = newName;
        this._queries.push(`ALTER TABLE ${this._name} RENAME ${oldName} TO ${newName}`);
        return this;
    }

    /**
     * @returns {Promise<void>}
     */
    async run() {
        return await this._context.beginTransaction()
            .then(async () => {
                for (let i in this.queries)
                    await this._context.run(this.queries[i]);
                await this._context.commit();
            })
            .catch(async err => {
                await this._context.rollback();
                throw err;
            })
    }
}