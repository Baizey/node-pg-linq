import {Client} from "pg";
import {expect} from 'chai';
import {UpdateQuery} from "../../src/Query/UpdateQuery";
import {Column, ColumnType, DatabaseStructure, JoinType, TableStructure} from "../../src";

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

export const UpdateQueryGenerateSql = () =>
    describe("UpdateQuery", () => {
        it('basic', () => {
            const query = new UpdateQuery<Entities>('user', connection, info);
            expect(query.generateSql()).equal('UPDATE users SET index = ${entity_index}, name = ${entity_name}');
        });
        it('ignore column', () => {
            const query = new UpdateQuery<Entities>('user', connection, info)
                .dontUpdate(({user}) => user.columns.id)
            expect(query.generateSql()).equal('UPDATE users SET name = ${entity_name}');
        });
        it('where', () => {
            const query = new UpdateQuery<Entities>('user', connection, info)
                .where(({user}) => user.id === 5);
            expect(query.generateSql()).equal('UPDATE users SET index = ${entity_index}, name = ${entity_name} WHERE users.index = 5');
        });
        it('join where', () => {
            const query = new UpdateQuery<Entities>('user', connection, info)
                .include('room')
                .where(({user}) => user.id === 5);
            expect(query.generateSql()).equal('UPDATE users SET index = ${entity_index}, name = ${entity_name} FROM rooms WHERE users.index = 5');
        });
    });