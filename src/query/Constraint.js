export default class Constraint {
    /**
     * @returns {{unique: string, primary: string}}
     */
    static get types() {
        return {
            unique: 'unique',
            primary: 'primary'
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