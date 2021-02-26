import {expect} from 'chai';
import {Where} from "../../src/Infrastructure/Where";
import {Column, ColumnType, DatabaseStructure, TableStructure} from "../../src";

type User = { id: number };
type Rooms = { id: number };
type Entities = { u: User, r: Rooms };

const userInfo = {
    name: 'users',
    columns: {id: new Column('index', ColumnType.int)}
} as TableStructure<User>;

const roomInfo = {
    name: 'rooms',
    columns: {id: new Column('index', ColumnType.int)}
} as TableStructure<Rooms>;

const info = {u: userInfo, r: roomInfo} as DatabaseStructure<Entities>;

export const WhereGenerateSql = () =>
    describe("Where", () => {
        it('using direct table access', () => {
            const filter = new Where<Entities>(info, ({u}, values) => u.id === values[0]);
            expect(filter.generateSql()).equal(' WHERE users.index = $1');
        });
        it('using indirect table access', () => {
            const filter = new Where<Entities>(info, (tables, values) => tables.u.id === values[0]);
            expect(filter.generateSql()).equal(' WHERE users.index = $1');
        });
        it('using only constants', () => {
            const filter = new Where<Entities>(info, ({u, r}) => r.id === 1);
            expect(filter.generateSql()).equal(' WHERE rooms.index = 1');
        });
        it('using two tables', () => {
            const filter = new Where<Entities>(info, ({u, r}, values) => u.id === values[0] && r.id === values[1]);
            expect(filter.generateSql()).equal(' WHERE users.index = $1 AND rooms.index = $2');
        });
        it('=== constant', () => {
            const filter = new Where<Entities>(info, ({u}) => u.id === 1);
            expect(filter.generateSql()).equal(' WHERE users.index = 1');
        });
        it('===', () => {
            const filter = new Where<Entities>(info, ({u}, values) => u.id === values[0]);
            expect(filter.generateSql()).equal(' WHERE users.index = $1');
        });
        it('and', () => {
            const filter = new Where<Entities>(info, ({u}) => u.id === 1 && u.id === 1);
            expect(filter.generateSql()).equal(' WHERE users.index = 1 AND users.index = 1');
        });
        it('or', () => {
            const filter = new Where<Entities>(info, ({u}) => u.id === 1 || u.id === 1);
            expect(filter.generateSql()).equal(' WHERE users.index = 1 OR users.index = 1');
        });
        it('is null', () => {
            const filter = new Where<Entities>(info, ({u}) => u.id === null);
            expect(filter.generateSql()).equal(' WHERE users.index IS NULL');
        });
        it('is not null', () => {
            const filter = new Where<Entities>(info, ({u}) => u.id !== null);
            expect(filter.generateSql()).equal(' WHERE users.index IS NOT NULL');
        });
        it('not mixing = and IS', () => {
            const filter = new Where<Entities>(info, ({u}) => u.id !== null && u.id === 5);
            expect(filter.generateSql()).equal(' WHERE users.index IS NOT NULL AND users.index = 5');
        });
        it('!==', () => {
            const filter = new Where<Entities>(info, ({u}) => u.id !== 5);
            expect(filter.generateSql()).equal(' WHERE users.index <> 5');
        });
        it('==', () => {
            const filter = new Where<Entities>(info, ({u}) => u.id == 5);
            expect(filter.generateSql()).equal(' WHERE users.index LIKE 5');
        });
        it('!=', () => {
            const filter = new Where<Entities>(info, ({u}) => u.id != 5);
            expect(filter.generateSql()).equal(' WHERE users.index NOT LIKE 5');
        });
    });