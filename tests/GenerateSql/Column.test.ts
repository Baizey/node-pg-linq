import {expect} from 'chai';
import {Column} from "../../src";
import {ColumnType} from "../../src";

export const ColumnGenerateSql = () =>
    describe("Column", () => {
        describe('types', () => {
            it('int', () => {
                const column = new Column<number>('id', ColumnType.int);
                expect(column.generateSql()).equal('id int');
            });
            it('bigint', () => {
                const column = new Column<number>('id', ColumnType.bigint);
                expect(column.generateSql()).equal('id bigint');
            });
            it('boolean', () => {
                const query = new Column<number>('id', ColumnType.boolean);
                expect(query.generateSql()).equal('id boolean');
            });
            it('text', () => {
                const query = new Column<number>('id', ColumnType.text);
                expect(query.generateSql()).equal('id text');
            });
            it('serial', () => {
                const query = new Column<number>('id', ColumnType.serial);
                expect(query.generateSql()).equal('id serial');
            });
            it('real', () => {
                const query = new Column<number>('id', ColumnType.real);
                expect(query.generateSql()).equal('id real');
            });
        });
        describe('addons', () => {
            it('foreign key', () => {
                const other = new Column<number>('cake', ColumnType.int);
                const query = new Column<number>('id', ColumnType.int).hasForeignKey('other', other);
                expect(query.generateSql()).equal('id int REFERENCES other(cake)');
            });
            it('not nullable', () => {
                const query = new Column<number>('id', ColumnType.int).isRequired();
                expect(query.generateSql()).equal('id int NOT NULL');
            });
            it('default number', () => {
                const query = new Column<number>('id', ColumnType.int).hasDefaultValue(0);
                expect(query.generateSql()).equal('id int DEFAULT 0');
            });
            it('default string', () => {
                const query = new Column<string>('id', ColumnType.text).hasDefaultValue('text');
                expect(query.generateSql()).equal('id text DEFAULT "text"');
            });
            it('default sql', () => {
                const query = new Column<string>('id', ColumnType.text).hasDefaultValueSql('getDate()')
                expect(query.generateSql()).equal('id text DEFAULT getDate()');
            });
        });
    });