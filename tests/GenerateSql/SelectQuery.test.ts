import {Client} from "pg";
import {expect} from 'chai';
import {SelectQuery} from "../../src/Query/SelectQuery";
import {Column, ColumnType, DatabaseStructure, TableStructure} from "../../src";
type User = { id: number, name: string };
type Room = { id: number };
type Entities = { user: User, room: Room };

const userInfo = {
    name: 'users',
    columns: {
        id: new Column('index', ColumnType.int),
        name: new Column('name', ColumnType.text),
    }
} as TableStructure<User>;
const roomInfo = {
    name: 'rooms',
    columns: {id: new Column('index', ColumnType.int)}
} as TableStructure<Room>;

const info = {user: userInfo, room: roomInfo} as DatabaseStructure<Entities>;
const connection = new Client();

export const SelectQueryGenerateSql = () =>
    describe('SelectQuery', () => {
        it('limit', () => {
            const select = new SelectQuery<Entities, User>('user', connection, info)
                .limit(5);
            expect(select.generateSql()).equal('SELECT * FROM users LIMIT 5');
        });
        it('offset', () => {
            const select = new SelectQuery<Entities, User>('user', connection, info)
                .offset(5);
            expect(select.generateSql()).equal('SELECT * FROM users OFFSET 5');
        });
        it('limit and offset', () => {
            const select = new SelectQuery<Entities, User>('user', connection, info)
                .limit(5)
                .offset(5);
            expect(select.generateSql()).equal('SELECT * FROM users LIMIT 5 OFFSET 5');
        });
        describe("orderBy", () => {
            it('asc', () => {
                const select = new SelectQuery<Entities, User>('user', connection, info)
                    .orderBy('id', true)
                expect(select.generateSql()).equal('SELECT * FROM users ORDER BY id ASC');
            });
            it('desc', () => {
                const select = new SelectQuery<Entities, User>('user', connection, info)
                    .orderBy('id', false)
                expect(select.generateSql()).equal('SELECT * FROM users ORDER BY id DESC');
            });
            it('multiple', () => {
                const select = new SelectQuery<Entities, User>('user', connection, info)
                    .orderBy('id', true)
                    .orderBy('name', true)
                expect(select.generateSql()).equal('SELECT * FROM users ORDER BY id ASC, name ASC');
            });
        });
        describe("groupBy", () => {
            it('asc', () => {
                const select = new SelectQuery<Entities, User>('user', connection, info)
                    .groupBy('id')
                expect(select.generateSql()).equal('SELECT * FROM users GROUP BY id');
            });
            it('multiple', () => {
                const select = new SelectQuery<Entities, User>('user', connection, info)
                    .groupBy(['id', 'name'])
                expect(select.generateSql()).equal('SELECT * FROM users GROUP BY id, name');
            });
        });

        /*
        describe("distinct", () => {
            it('all', () => {
                table.select()
                    .distinct()
                    .toString().should.equal('SELECT DISTINCT * FROM table AS table');
            });
            it('one', () => {
                table.select()
                    .distinct('id')
                    .toString().should.equal('SELECT DISTINCT ON (id) id, * FROM table AS table');
            });
            it('combo', () => {
                table.select(['name'])
                    .distinct('id')
                    .toString().should.equal('SELECT DISTINCT ON (id) id, name FROM table AS table');
            });
            it('override', () => {
                table.select(['id'])
                    .distinct('id')
                    .toString().should.equal('SELECT DISTINCT ON (id) id, * FROM table AS table');
            });
        });
         */
    });