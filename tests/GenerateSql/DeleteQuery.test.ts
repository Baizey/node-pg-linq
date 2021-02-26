import {Client} from "pg";
import {expect} from 'chai';
import {Column, ColumnType, DatabaseStructure, JoinType, TableStructure} from "../../src";
import {DeleteQuery} from "../../src/Query/DeleteQuery";

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

export const DeleteQueryGenerateSql = () =>
    describe("DeleteQuery", () => {
        it('basic', () => {
            const query = new DeleteQuery<Entities>('user', connection, info);
            expect(query.generateSql()).equal('DELETE FROM users');
        });
        it('where', () => {
            const query = new DeleteQuery<Entities>('user', connection, info)
                .where(({user}) => user.id === 5);
            expect(query.generateSql()).equal('DELETE FROM users WHERE users.index = 5');
        });
        it('include where', () => {
            const query = new DeleteQuery<Entities>('user', connection, info)
                .include('room')
                .where(({user}) => user.id === 5);
            expect(query.generateSql()).equal('DELETE FROM users USING rooms WHERE users.index = 5');
        });
    });