import {Column} from "./Column";

const Type = {
    bool: 'boolean',
    int: 'int',
    bigint: 'bigint',
    text: 'text',
    serial: 'serial',
    real: 'real'
};

export default class CreateTableQuery {
    /**
     * @returns {{bool: string, serial: string, text: string, real: string, bigint: string, int: string}}
     * @constructor
     */
    static get Types() {
        return Type;
    }

    /**
     * @param {string} tableName
     * @param {DbContext} context
     */
    constructor(tableName, context) {
        this._table = tableName;
        this._columns = [];
        this._uniqueGroups = [];
        this._primaryGroup = [];
        this._context = context;
        this._ignoreExists = false;
    }

    /**
     * @param {boolean} value
     * @returns {CreateTableQuery}
     */
    ignoreIfExists(value = true) {
        this._ignoreExists = !!value;
        return this;
    }

    /**
     * @returns {string}
     */
    get tableName() {
        return this._table;
    }

    /**
     * @returns {Column[]}
     */
    get columns() {
        return this._columns;
    }

    /**
     * @param {Column[]} columns
     * @returns {CreateTableQuery}
     */
    uniqueGroup(columns) {
        if (columns) this._uniqueGroups.push(columns);
        return this;
    }

    /**
     * @param {Column[]} columns
     * @returns {CreateTableQuery}
     */
    primaryGroup(columns) {
        this._primaryGroup = columns || [];
        return this;
    }

    /**
     * @param {string} name
     * @returns {Column}
     */
    bool(name) {
        return this.addColumn(name, Type.bool);
    }

    /**
     * @param {string} name
     * @returns {Column}
     */
    bigint(name) {
        return this.addColumn(name, Type.bigint);
    }

    /**
     * @param {string} name
     * @returns {Column}
     */
    int(name) {
        return this.addColumn(name, Type.int);
    }

    /**
     * @param {string} name
     * @returns {Column}
     */
    text(name) {
        return this.addColumn(name, Type.text);
    }

    /**
     * @param {string} name
     * @returns {Column}
     */
    serial(name) {
        return this.addColumn(name, Type.serial);
    }

    /**
     * @param {string} name
     * @returns {Column}
     */
    real(name) {
        return this.addColumn(name, Type.real);
    }

    /**
     * @param {string} name
     * @param {string} type
     * @returns {Column}
     */
    addColumn(name, type) {
        const column = new Column(name, type);
        this._columns.push(column);
        return column;
    }

    /**
     * @returns {string}
     */
    toString() {
        const primaryGroup = (
            this._primaryGroup.length &&
            `, PRIMARY KEY (${this._primaryGroup.map(e => e._name).join(', ')})`
        ) || '';
        const uniqueGroups = (
            this._uniqueGroups.length &&
            this._uniqueGroups.map(e => `, UNIQUE (${e.map(e => e._name).join(', ')})`)
        ) || '';
        const columns = this._columns.join(', ');
        const ignoreExists = (this._ignoreExists && ' IF NOT EXISTS') || '';
        return `CREATE TABLE${ignoreExists} ${this._table} (${columns}${primaryGroup}${uniqueGroups})`;
    }

    /**
     * @returns {Promise<{void}>}
     */
    async run() {
        await this._context.run(this.toString());
    }
}

