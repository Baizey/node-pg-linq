export default class Constraint {
    /**
     * @returns {{unique: string, primary: string, foreign: string}}
     */
    static get types() {
        return {
            unique: 'unique',
            primary: 'primary',
            foreign: 'foreign'
        };
    }

    /**
     * @param {string} type
     * @param {Column[]|Column} columns
     */
    constructor(type, columns) {
        this.type = type;
        this.columns = Array.isArray(columns) ? columns : [columns];
    }

    /**
     * @returns {string}
     */
    get name() {
        return `${this.type}_${this.columnNames.join('_')}`;
    }

    /**
     * @returns {string[]}
     */
    get columnNames() {
        return this.columns.map(e => e.name);
    }

}

export class ReferenceConstraint extends Constraint {
    /**
     * @param {Column} column
     * @param {string} referenceTable
     * @param {string} referenceColumn
     */
    constructor(column, referenceTable, referenceColumn) {
        super(Constraint.types.foreign, []);
        this.column = column;
        this.referenceTable = referenceTable;
        this.referenceColumn = referenceColumn;
    }

    /**
     * @returns {string}
     */
    get name() {
        return `${this.type}_${this.column.name}_${this.referenceTable}_${this.referenceColumn}`;
    }

    /**
     * @returns {string}
     */
    get reference() {
        return `${this.referenceTable}(${this.referenceColumn})`;
    }
}