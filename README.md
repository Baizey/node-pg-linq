# pg-linq

[![Build Status](https://travis-ci.org/Baizey/node-pg-linq.svg?branch=master)](https://travis-ci.org/Baizey/node-pg-linq)
[![Build Status](https://david-dm.org/Baizey/node-pg-linq.svg?branch=master)](https://david-dm.org/)

 An npm package to create Postgres queries in a linq-ish way with a sprinkle of entity framework
 
 It is suggested to use an IDE which can utilize the extensive jsdoc to give you proper support on what and how functions are used

# Compatible with
node 12.\*, 13.\*, other versions may be supported, but aren't tested

PostgreSQL 9.6, 10, 11, 12, other versions may be supported, but aren't tested

Feature implementations aim towards being complete for lowest PostgreSQL version, newer features will not be supported

# Usage

## Simple usage
```javascript
// Setup DbContext
import DbContext from 'pg-linq';
const users = new DbContext('users');
users.usingPool();

// Create users table if it doesnt exist
const create = users.create().ignoreIfExists();
create.serial('id').primary();
create.text('name').nullable(false);
create.real('score').nullable(false).default(0);
await create.run();

// Execute queries on users table
await users.insert({name: 'John'}).run();
await users.update({score: 10}).where(() => users.name === "John").run();
const select = await users.select().where(() => users.name === $, 'John').one();
await users.delete().where(() => users.score > 5).run();
```

## DbContext
### Initialization
```javascript
import DbContext from 'pg-linq';
import {Pool, Client} from 'pg';
const table = new DbContext('tablename');
// Initialize with a pool, if no argument is given new Pool() is the default
table.usingPool(new Pool({user: 'postgres', ...}));
table.usingPool();
// Initialize with a client, if no argument is given new Client() is the default
table.usingClient(new Client({user: 'postgres', ...}));
table.usingClient();

// You can access the used pool/client through
const pool = table.connection;

// Lastly you can tell it to use a custom query system if you want something else
table.using((sql, params) => {...});
```
### DbContext API
`[]` indicates optional parameter.

- `run(sql, [params])` runs the sql as a query with params given, returns what a query from pg would return
- `commit()` calls `run('commit')` and returns `Promise<void>`
- `rollback()` calls `run('rollback')` and returns `Promise<void>`
- `dropTable()` drops the table and returns `Promise<void>`
- `beginTransaction()` returns `Promise<void>`
- `create()` returns a new `CreateQuery`
- `delete([statement], [parameters])` returns a new `DeleteQuery`, optionally give the `WHERE` statement immediately
- `insert([object])` returns a new `InsertQuery`, optionally give the object to insert immediately
- `select([columns])` returns a new `SelectQuery`, optionally select the columns to be returned immediately
- `update([object])` returns a new `UpdateQuery`, optionally give the columns to update immediately

## WHERE

where clauses are given as lambda function

| postgres | javascript |
|----------|------------|
| AND | && |
| OR | |
| = | === |
| <> | !== |
| IS NULL | === null |
| IS NOT NULL | !== null |
| LIKE | == |
| NOT LIKE | != |

for everything else you need to write it as it should look in postgresql

to pass variables into the queries you need to add a $ where they should be and add them as arguments after the function

```javascript
query.where(() => id === $, 5);
query.where(() => id in $, [1,2,3,4]);
query.where(() => id in $ && name === $, [1,2,3,4], "John");
query.where(() => SUM(score) === 5);
```

## JOIN

joins are used in a different way from all other func in this package

```javascript
query.as('t').join('otherTable', joiner => joiner.as('o').inner.on(() => o.id === t.id));
```

When you use .join() on a query it expects 2 parameters, the first is the name of the table you join on.

The second parameter is a lambda function which gets a QueryJoiner as argument and expects no result

on the QueryJoiner object you will have 3 types of functions, .as(alias) to give the new table an alias,
 a number of options as to which type of join it should be (inner, left, right, leftOuter, rightOuter, fullOuter), and finally you have the on(lambda) function which expects a similar input to the where clause
 
 A thing to note is that when you have multiple tables in the same query you need to refer to which table you get variables from, you do not need to do this if there is only 1 table
 
## CreateQuery
 
Creating table queries act much in the same way C#'s fluent API for entity framework works.

Directly supported column types:
- int `create.int('name')`
- bigint `create.bigint('name')`
- bool `create.bool('name')`
- text `create.text('name')`
- real `create.real('name')`
- serial `create.serial('name')`

for anything else there is:

`create.addColumn(name, type)` where type is a `string`, fx 'int'

All these functions takes an argument name as a `string` and returns a `Column` object

When columns has been created there are a few more functions you can utilize:

- `uniqueGroup(Column[])` creates indexing for a group of columns
- `primaryGroup(Column[])` creates primary key for a group of columns
- `ignoreIfExists(bool)` ignores conflicts where table already exists

The `column` object has a number of functions on itself, all functions return the `Column` object back
- `nullable(bool)` (columns are by default nullable)
- `primary(bool)` makes this column a primary key for itself same as `primaryGroup(Column[])` with only this column
- `unique(bool)` makes this column a unique index for itself same as `uniqueGroup(Column[])` with only this column
- `reference(tableName, columnName)`
- `withDefault(anything)`

after everything is configured `create.run()` can be executed, it returns `Promise<void>` which you can await for the query to finish

## Shared clauses for INSERT, UPDATE, SELECT and DELETE
- FROM `query.from('other')` or `query.from(['other1', 'other2'])`. Note this is only for extra tables, your default table as given in DbContext is always included
- WHERE `query.where(() => id === 5)` or `query.where(() => id === $ && name === $, 5, 'John')`
- ALIAS (AS) `query.as('alias')`
- JOIN
  - ALIAS (AS) `query.join('other', opt => opt.as('alias')`
  - ON `query.join('other', opt => opt.on(() => other.id === table.id))`
  - NATURAL LEFT        `query.join('other', opt => opt.naturalLeft)`
  - NATURAL INNER       `query.join('other', opt => opt.naturalInner)`
  - NATURAL RIGHT       `query.join('other', opt => opt.naturalRight)`
  - INNER       `query.join('other', opt => opt.inner)`
  - FULL OUTER  `query.join('other', opt => opt.fullOuter)`
  - LEFT        `query.join('other', opt => opt.left)`
  - LEFT OUTER  `query.join('other', opt => opt.leftOuter)`
  - RIGHT       `query.join('other', opt => opt.right)`
  - RIGHT OUTER `query.join('other', opt => opt.rightOuter)`
  
Note alias is optional, and if you select any NATURAL joins, ON is disabled

## DeleteQuery
- run `query.run()` executes the query and returns `Promise<int>` with how many rows were affected
- toString `query.toString()` returns the query as an sql string

## UpdateQuery
- columns to update `query.columns({name: 'John', score: 4}).where(() => id === 5)`
- run `query.run()` executes the query and returns `Promise<int>` with how many rows were affected
- toString `query.toString()` returns the query as an sql string

## InsertQuery
- columns to insert values for `query.columns({name: 'John', score: 4})`
 - ON CONFLICT
   - IGNORE     `query.ignoreConflicts(true)`
- run `query.run()` executes the query and returns `Promise<void>`
- toString `query.toString()` returns the query as an sql string

## SelectQuery
Supported clauses
- columns to return `query.columns(['id', 'name', 'score'])`
- LIMIT     `query.limit(5)`
- OFFSET    `query.offset(5)`
- ORDER BY  `query.orderBy('name')` with optional secondary parameter bool ascending default `ascending = true` 
- GROUP BY  `query.groupBy('name')` or `query.groupBy(['name', 'id'])`
- HAVING `query.having(statement, parameters)` works similar to `WHERE`
- DISTINCT
    - DISTINCT ON (column)  `query.distinct('name')`
    - DISTINCT              `query.distinct(true)`
- one `query.one()` executes the query and returns the first result row `Promise<object|undefined>` (if no rows, returns undefined)
- all `query.all()` executes the query and returns `Promise<object[]>` all rows (if none, returns empty array)
- toString `query.toString()` returns the query as an sql string