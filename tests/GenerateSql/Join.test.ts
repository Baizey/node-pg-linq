import {expect} from 'chai';
import {Join} from "../../src/Infrastructure/Join";
import {Column, ColumnType, DatabaseStructure, JoinType, TableStructure} from "../../src";

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

export const JoinGenerateSql = () =>
    describe("Join", () => {
        it('left join', () => {
            const filter = new Join<Entities>(info, JoinType.left, 'r', ({u, r}) => u.id === r.id);
            expect(filter.generateSql()).equal(' LEFT JOIN rooms ON users.index = rooms.index');
        });
        it('right join', () => {
            const filter = new Join<Entities>(info, JoinType.right, 'r', ({u, r}) => u.id === r.id);
            expect(filter.generateSql()).equal(' RIGHT JOIN rooms ON users.index = rooms.index');
        });
        it('inner join', () => {
            const filter = new Join<Entities>(info, JoinType.inner, 'r', ({u, r}) => u.id === r.id);
            expect(filter.generateSql()).equal(' INNER JOIN rooms ON users.index = rooms.index');
        });
        it('full join', () => {
            const filter = new Join<Entities>(info, JoinType.full, 'r', ({u, r}) => u.id === r.id);
            expect(filter.generateSql()).equal(' FULL JOIN rooms ON users.index = rooms.index');
        });
    });