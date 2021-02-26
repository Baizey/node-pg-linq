import {expect} from 'chai';
import {Column} from "../../src";
import {PrimaryConstraint, UniqueConstraint} from "../../src/Infrastructure/Constraint";
import {ColumnType} from "../../src";
import {TableStructure} from "../../src";

export const ConstraintGenerateSql = () =>
    describe("Constraint", () => {
        describe('groups', () => {
            it('primary key', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.int).isKey()}
                } as TableStructure<User>;
                const query = new PrimaryConstraint(userInfo.columns.id);
                expect(query.generateSql()).equal('CONSTRAINT primary_id PRIMARY KEY (id)');
            });
            it('primary keys', () => {
                type User = { id: number, name: string };
                const userInfo = {
                    name: 'users',
                    columns: {
                        id: new Column('id', ColumnType.int).isKey(),
                        name: new Column('name', ColumnType.text).isKey()
                    }
                } as TableStructure<User>;
                const query = new PrimaryConstraint([userInfo.columns.id, userInfo.columns.name]);
                expect(query.generateSql()).equal('CONSTRAINT primary_id_name PRIMARY KEY (id, name)');
            });

            it('unique key', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.int)}
                } as TableStructure<User>;
                const query = new UniqueConstraint(userInfo.columns.id);
                expect(query.generateSql()).equal('CONSTRAINT unique_id UNIQUE (id)');
            });
            it('unique keys', () => {
                type User = { id: number, name: string };
                const userInfo = {
                    name: 'users',
                    columns: {
                        id: new Column('id', ColumnType.int).isKey(),
                        name: new Column('name', ColumnType.text).isKey()
                    }
                } as TableStructure<User>;
                const query = new UniqueConstraint([userInfo.columns.id, userInfo.columns.name]);
                expect(query.generateSql()).equal('CONSTRAINT unique_id_name UNIQUE (id, name)');
            });
        });
    });