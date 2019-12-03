import Constraint from "./Constraint";

export class Column {
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
        this._defaultValue = undefined;
        this._referenceValue = undefined;
    }

    /**
     * @returns {Constraint}
     */
    get uniqueConstraint() {
        return this.isUnique ? new Constraint(Constraint.types.unique, this) : undefined;
    }

    /**
     * @returns {Constraint}
     */
    get primaryConstraint() {
        return this.isPrimaryKey ? new Constraint(Constraint.types.primary, this) : undefined;
    }

    get type() {
        return this._type;
    }

    get name() {
        return this._name;
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
        const unique = (this._isUnique && ` CONSTRAINT ${this.uniqueConstraint.name} UNIQUE`) || '';
        const primary = (this._isPrimary && ` CONSTRAINT ${this.primaryConstraint.name} PRIMARY KEY`) || '';
        return `${this._name} ${this._type}${nullable}${defaultValue}${foreign}${unique}${primary}`;
    }
}