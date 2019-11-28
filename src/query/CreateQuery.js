const Type = {
    bool: 'boolean',
    int: 'int',
    bigint: 'bigint',
    text: 'text',
    serial: 'serial',
    real: 'real'
};

export default class CreateQuery {
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
     * @returns {CreateQuery}
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
     * @returns {CreateQuery}
     */
    uniqueGroup(columns) {
        if (columns) this._uniqueGroups.push(columns);
        return this;
    }

    /**
     * @param {Column[]} columns
     * @returns {CreateQuery}
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

class Column {
    /**
     * @param {string} name
     * @param {string} type
     */
    constructor(name, type) {
        this._name = name;
        this._type = type;
        this._isUnique = false;
        this._isPrimary = false;
        this._isNullable = true;
        this._isSerial = false;
        this._defaultValue = undefined;
        this._referenceValue = undefined;
    }

    get type() {
        return this._type;
    }

    get name() {
        return this._name;
    }

    get isSerial() {
        return this._isSerial;
    }

    get isNullable() {
        return this._isNullable;
    }

    get defaultValue() {
        return this._defaultValue;
    }

    get isUnique() {
        return this._isUnique;
    }

    get isPrimaryKey() {
        return this._isPrimary;
    }

    /**
     * @param {boolean} value
     * @returns {Column}
     */
    unique(value = true) {
        this._isUnique = !!value;
        return this;
    }

    /**
     * @param {boolean} value
     * @returns {Column}
     */
    serial(value = true) {
        this._isSerial = !!value;
        return this;
    }

    /**
     * @param {boolean} value
     * @returns {Column}
     */
    nullable(value = true) {
        this._isNullable = !!value;
        return this;
    }

    /**
     * @param {*} value
     * @returns {Column}
     */
    withDefault(value) {
        this._defaultValue = typeof value === 'string' ? `"${value}"` : value;
        return this;
    }

    /**
     * @param {boolean} value
     * @returns {Column}
     */
    primary(value = true) {
        this._isPrimary = !!value;
        return this;
    }

    /**
     * @param {string} tableName
     * @param {string} columnName
     * @returns {Column}
     */
    reference(tableName, columnName) {
        this._referenceValue = `${tableName}(${columnName})`;
        return this;
    }

    /**
     * @returns {string}
     */
    toString() {
        const nullable = (!this._isNullable && ' NOT NULL') || '';
        const defaultValue = ((typeof this._defaultValue !== 'undefined') && ` DEFAULT ${this._defaultValue}`) || '';
        const foreign = (this._referenceValue && ` REFERENCES ${this._referenceValue}`) || '';
        const unique = (this._isUnique && ` UNIQUE`) || '';
        const primary = (this._isPrimary || ` PRIMARY KEY`) || '';
        const serial = (this._isSerial && ' SERIAL') || '';
        return `${this._name} ${this._type}${nullable}${defaultValue}${foreign}${unique}${primary}${serial}`;
    }
}