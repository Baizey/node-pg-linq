import {Client} from "pg";
import {expect} from 'chai';
import {Column} from "../../src";
import {CreateQuery} from "../../src/Query/CreateQuery";
import {ColumnType} from "../../src";
import {TableStructure, DatabaseStructure} from "../../src";

const connection = new Client();

export const CreateQueryGenerateSql = () =>
    describe("CreateQuery", () => {
        describe('column types', () => {
            it('int', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.int)}
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info);
                expect(query.generateSql()).equal('CREATE TABLE users (id int)');
            });
            it('bigint', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.bigint)}
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info);
                expect(query.generateSql()).equal('CREATE TABLE users (id bigint)');
            });
            it('boolean', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.boolean)}
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info);
                expect(query.generateSql()).equal('CREATE TABLE users (id boolean)');
            });
            it('text', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.text)}
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info);
                expect(query.generateSql()).equal('CREATE TABLE users (id text)');
            });
            it('serial', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.serial)}
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info);
                expect(query.generateSql()).equal('CREATE TABLE users (id serial)');
            });
            it('real', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.real)}
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info);
                expect(query.generateSql()).equal('CREATE TABLE users (id real)');
            });
        });
        describe('addons', () => {
            it('foreign key', () => {
                type Other = { id: number };
                const otherInfo = {
                    name: 'other',
                    columns: {id: new Column('id', ColumnType.int)}
                }

                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.int).hasForeignKey('other', otherInfo.columns.id)}
                } as TableStructure<User>;

                type Entities = { users: User, other: Other };
                const info = {users: userInfo, other: otherInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info);
                expect(query.generateSql()).equal('CREATE TABLE users (id int REFERENCES other(id))');
            });
            it('not nullable', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.int).isRequired()}
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info);
                expect(query.generateSql()).equal('CREATE TABLE users (id int NOT NULL)');
            });
            it('default', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.int).hasDefaultValue(0)}
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info);
                expect(query.generateSql()).equal('CREATE TABLE users (id int DEFAULT 0)');
            });
            it('default', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.text).hasDefaultValue('text')}
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info);
                expect(query.generateSql()).equal('CREATE TABLE users (id text DEFAULT "text")');
            });
        });
        describe('groups', () => {
            it('primary keys', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.int).isKey()}
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info)
                expect(query.generateSql()).equal('CREATE TABLE users (id int, CONSTRAINT primary_id PRIMARY KEY (id))');
            });

            it('unique keys', () => {
                type User = { id: number };
                const userInfo = {
                    name: 'users',
                    columns: {id: new Column('id', ColumnType.int)}
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info)
                    .addUniqueGroup(userInfo.columns.id)
                expect(query.generateSql()).equal('CREATE TABLE users (id int, CONSTRAINT unique_id UNIQUE (id))');
            });
            it('multiple unique keys', () => {
                type User = { id: number, name: string };
                const userInfo = {
                    name: 'users',
                    columns: {
                        id: new Column('id', ColumnType.int),
                        name: new Column('name', ColumnType.text)
                    }
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info)
                    .addUniqueGroup([userInfo.columns.id, userInfo.columns.name])
                    .addUniqueGroup(userInfo.columns.id)
                    .addUniqueGroup(userInfo.columns.name);

                expect(query.generateSql()).equal('CREATE TABLE users (id int, name text, CONSTRAINT unique_id_name UNIQUE (id, name), CONSTRAINT unique_id UNIQUE (id), CONSTRAINT unique_name UNIQUE (name))');
            });
            it('both unique and primary', () => {
                type User = { id: number, name: string };
                const userInfo = {
                    name: 'users',
                    columns: {
                        id: new Column('id', ColumnType.int).isKey(),
                        name: new Column('name', ColumnType.text)
                    }
                } as TableStructure<User>;
                type Entities = { users: User };
                const info = {users: userInfo} as DatabaseStructure<Entities>;

                const query = new CreateQuery<Entities>('users', connection, info)
                    .addUniqueGroup(userInfo.columns.name);

                expect(query.generateSql()).equal('CREATE TABLE users (id int, name text, CONSTRAINT primary_id PRIMARY KEY (id), CONSTRAINT unique_name UNIQUE (name))');
            });
        });
    });