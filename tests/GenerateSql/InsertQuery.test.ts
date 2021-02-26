import {Client} from "pg";
import {expect} from 'chai';
import {InsertQuery} from "../../src/Query/InsertQuery";
import {Column, ColumnType, DatabaseStructure, TableStructure} from "../../src";

type User = { id: number, name: string };
type Entities = { user: User };

const userInfo = {
    name: 'users',
    columns: {
        id: new Column('index', ColumnType.int).isKey(),
        name: new Column('name', ColumnType.text),
    }
} as TableStructure<User>;

const info = {user: userInfo} as DatabaseStructure<Entities>;
const connection = new Client();

export const InsertQueryGenerateSql = () =>
    describe("InsertQuery", () => {
        it('basic', () => {
            const query = new InsertQuery<Entities>('user', connection, info);
            expect(query.generateSql()).equal('INSERT INTO users (index, name) VALUES ($1, $2)');
        });

        it('multiple', () => {
            const query = new InsertQuery<Entities>('user', connection, info);
            expect(query.generateSql(2)).equal('INSERT INTO users (index, name) VALUES ($1, $2), ($3, $4)');
        });

        it('ignore db generated', () => {
            const userInfo = {
                name: 'users',
                columns: {
                    id: new Column('index', ColumnType.int).hasDatabaseGeneratedValue(),
                    name: new Column('name', ColumnType.text),
                }
            } as TableStructure<User>;
            const info = {user: userInfo} as DatabaseStructure<Entities>;
            const connection = new Client();
            const query = new InsertQuery<Entities>('user', connection, info);
            expect(query.generateSql()).equal('INSERT INTO users (name) VALUES ($1)');
        });

        it('withIgnore', () => {
            const query = new InsertQuery<Entities>('user', connection, info).willIgnoreConflict();
            expect(query.generateSql()).equal('INSERT INTO users (index, name) VALUES ($1, $2) ON CONFLICT DO NOTHING');
        });
    });