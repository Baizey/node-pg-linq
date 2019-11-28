// noinspection ES6UnusedImports
import should from "should";
import CreateQuery from "../src/query/CreateQuery";

describe("CreateQuery", () => {
    describe('column types', () => {
        it('int', () => {
            const query = new CreateQuery('name', undefined);
            query.int('id');
            query.toString().should.equal('CREATE TABLE name (id int)');
        });
        it('bigint', () => {
            const query = new CreateQuery('name', undefined);
            query.bigint('id');
            query.toString().should.equal('CREATE TABLE name (id bigint)');
        });
        it('boolean', () => {
            const query = new CreateQuery('name', undefined);
            query.bool('id');
            query.toString().should.equal('CREATE TABLE name (id boolean)');
        });
        it('text', () => {
            const query = new CreateQuery('name', undefined);
            query.text('id');
            query.toString().should.equal('CREATE TABLE name (id text)');
        });
        it('serial', () => {
            const query = new CreateQuery('name', undefined);
            query.serial('id');
            query.toString().should.equal('CREATE TABLE name (id serial)');
        });
        it('real', () => {
            const query = new CreateQuery('name', undefined);
            query.real('id');
            query.toString().should.equal('CREATE TABLE name (id real)');
        });
    });
    describe('addons', () => {
        it('primary key', () => {
            const query = new CreateQuery('name', undefined);
            query.int('id').primary();
            query.toString().should.equal('CREATE TABLE name (id int PRIMARY KEY)');
        });
        it('foreign key', () => {
            const query = new CreateQuery('name', undefined);
            query.int('id').reference('otherTable', 'otherCol');
            query.toString().should.equal('CREATE TABLE name (id int REFERENCES otherTable(otherCol))');
        });
        it('nullable', () => {
            const query = new CreateQuery('name', undefined);
            query.int('id').nullable(false);
            query.toString().should.equal('CREATE TABLE name (id int NOT NULL)');
        });
        it('unique', () => {
            const query = new CreateQuery('name', undefined);
            query.int('id').unique();
            query.toString().should.equal('CREATE TABLE name (id int UNIQUE)');
        });
        it('default', () => {
            const query = new CreateQuery('name', undefined);
            query.int('id').withDefault(0);
            query.toString().should.equal('CREATE TABLE name (id int DEFAULT 0)');
        });
        it('default', () => {
            const query = new CreateQuery('name', undefined);
            query.text('id').withDefault("text");
            query.toString().should.equal('CREATE TABLE name (id text DEFAULT "text")');
        });
        it('serial', () => {
            const query = new CreateQuery('name', undefined);
            query.int('id').serial();
            query.toString().should.equal('CREATE TABLE name (id int SERIAL)');
        });
    });
    describe('groups', () => {
        it('primary keys', () => {
            const query = new CreateQuery('name', undefined);
            const id = query.int('id');
            const name = query.text('name');
            query.primaryGroup([id, name]);
            query.toString().should.equal('CREATE TABLE name (id int, name text, PRIMARY KEY (id, name))');
        });
        it('unique keys', () => {
            const query = new CreateQuery('name', undefined);
            const id = query.int('id');
            const name = query.text('name');
            query.uniqueGroup([id, name]);
            query.toString().should.equal('CREATE TABLE name (id int, name text, UNIQUE (id, name))');
        });
        it('multiple unique keys', () => {
            const query = new CreateQuery('name', undefined);
            const id = query.int('id');
            const name = query.text('name');
            query.uniqueGroup([id, name]);
            query.uniqueGroup([id]);
            query.uniqueGroup([name]);
            query.toString().should.equal('CREATE TABLE name (id int, name text, UNIQUE (id, name),, UNIQUE (id),, UNIQUE (name))');
        });
        it('both unique and primary', () => {
            const query = new CreateQuery('name', undefined);
            const id = query.int('id');
            const name = query.text('name');
            query.primaryGroup([id]);
            query.uniqueGroup([name]);
            query.toString().should.equal('CREATE TABLE name (id int, name text, PRIMARY KEY (id), UNIQUE (name))');
        });
    });
});