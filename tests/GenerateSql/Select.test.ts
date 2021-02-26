import {expect} from 'chai';
import {Select} from "../../src/Infrastructure/Select";
import {Column, ColumnType, DatabaseStructure, TableStructure} from "../../src";

type User = { id: number };
type Rooms = { name: string };
type Entities = { u: User, r: Rooms };

const userInfo = {
    name: 'users',
    columns: {id: new Column('index', ColumnType.int)}
} as TableStructure<User>;

const roomInfo = {
    name: 'rooms',
    columns: {name: new Column('name', ColumnType.int)}
} as TableStructure<Rooms>;

const info = {u: userInfo, r: roomInfo} as DatabaseStructure<Entities>;

type SelectAll = User & Rooms;

export const SelectGenerateSql = () =>
    describe("Select", () => {
        it('simple', () => {
            const selector = new Select<Entities, User>(info, ({u}) => ({id: u.id}));
            expect(selector.generateSql()).equal('users.index AS id');
        });
        it('with multiplication', () => {
            const selector = new Select<Entities, User>(info, ({u}) => ({id: u.id * 2}));
            expect(selector.generateSql()).equal('users.index * 2 AS id');
        });
        it('from multiple tables', () => {
            const selector = new Select<Entities, SelectAll>(info, ({u, r}) => ({
                id: u.id,
                name: r.name
            }));
            expect(selector.generateSql()).equal('users.index AS id, rooms.name AS name');
        });
    });