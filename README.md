# pg-linq

[![Build Status](https://travis-ci.org/Baizey/node-pg-linq.svg?branch=master)](https://travis-ci.org/Baizey/node-pg-linq)
[![Build Status](https://david-dm.org/Baizey/node-pg-linq.svg?branch=master)](https://david-dm.org/)
[![Coverage Status](https://coveralls.io/repos/github/Baizey/node-pg-linq/badge.svg)](https://coveralls.io/github/Baizey/node-pg-linq)

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
await users.insert([{name: 'John'}, {name: 'Bob'}]).run();
await users.update({score: 10}).where(() => users.name === "John").run();
const select = await users.select().where(() => users.name === $, 'John').one();
await users.delete(() => users.score > 5).run();
```

All functions are 

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
### DbContext functions
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


## Query clauses in general

### ALIAS (AS)
`query.as(string)`

same as adding 'AS string' in a query for the FROM table AS string.

fx `query.as('t')`

### FROM
`query.from(string[])` or `query.from(string)`

here to support from many tables, these are included with the original table for the DbContext

if you want aliases for these tables they need to be added in the string

fx `query.from('other AS o')`

### WHERE
`query.where(function)` or `query.where(function, arg1, arg2, ..., argN)`

given a function which returns a bool with variables stated as $ and then passed on as extra arguments

For postgres functions such as `SUM` simply do `SUM(x)` in the function and ignore whether the function exists

For things where JavaScript doesnt support the format there is conversions from JavaScript ways

| postgres | javascript |
|----------|------------|
| AND | && |
| OR | \|\| |
| = | === |
| <> | !== |
| IS NULL | === null |
| IS NOT NULL | !== null |
| LIKE | == |
| NOT LIKE | != |

To specify which table a column is from simply do

`query.where(() => table.score)> 5)`

Here are a number of simple examples

 `query.where(() => score)> $, 5)` if 5 is variable

or `query.where(() => score > 5)` if 5 is a constant

or `query.where(() => $ < score && score < $, 5, 10)` if there are multiple variables

or `query.where(() => id in $, [1, 2, 3, 4])` equivalent to `query.where(() => id in ($, $, $, $), 1, 2, 3, 4)`

### JOIN
`query.join(string, function(QueryJoiner))`

join expects a tableName as string and a function which will be fed an QueryJoiner object.

QueryJoiner has a number of function on itself

#### QueryJoiner

##### ON
`opt.on(function)` or `query.opt(function, arg1, arg2, ..., argN)`

Works similarly to WHERE, but is for joining tables

fx `opt.on(() => otherTable.id === table.id)`

##### ALIAS (AS)
`opt.as(string)`

Same as ALIAS (AS) for queries

##### NATURAL LEFT        
`query.join(otherTable, opt => opt.naturalLeft)`

Note this is not to be used with ON
##### NATURAL INNER       
`query.join(otherTable, opt => opt.naturalInner)`

Note this is not to be used with ON
##### NATURAL RIGHT       
`query.join(otherTable, opt => opt.naturalRight)`

Note this is not to be used with ON
##### INNER       
`query.join(otherTable, opt => opt.inner)`
##### FULL OUTER  
`query.join(otherTable, opt => opt.fullOuter)`
##### LEFT        
`query.join(otherTable, opt => opt.left)`
##### LEFT OUTER  
`query.join(otherTable, opt => opt.leftOuter)`
##### RIGHT       
`query.join(otherTable, opt => opt.right)`
##### RIGHT OUTER 
`query.join(otherTable, opt => opt.rightOuter)`

## CreateQuery

CreateTable queries act much in the same way C#'s fluent API for the entity framework.

### Adding columns

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
### Group constraints

- `uniqueGroup(Column[])` creates indexing for a group of columns
- `primaryGroup(Column[])` creates primary key for a group of columns

### Other

- `ignoreIfExists(bool)` ignores conflicts where table already exists

### Columns

The `column` object has a number of functions on itself, all functions return the `Column` object back
- `nullable(bool)` (columns are by default nullable)
- `primary(bool)` makes this column a primary key for itself same as `primaryGroup(Column[])` with only this column
- `unique(bool)` makes this column a unique index for itself same as `uniqueGroup(Column[])` with only this column
- `reference(tableName, columnName)`
- `withDefault(anything)`

### Execution
`query.run()`

Returns `Promise<void>` when the query has finished

## DeleteQuery

### Execution
`query.run()`

Returns `Promise<int>` with the int being number of affected rows

## UpdateQuery

### Columns to insert (SET)
`query.columns(object)`

fx `query.columns({name: 'John', score: 0})`

### Execution
`query.run()`

Returns `Promise<int>` with the int being number of affected rows

## InsertQuery

### Columns to insert (VALUES)
`query.columns(object[])` or `query.columns(object)`

If an array is given the first object determines the columns for insertion

fx `query.columns({name: 'John', score: 0})` or `query.columns([{name: 'John'}, {name: 'Bob'}])`

### CONFLICT
`query.ignoreConflicts(bool = true)`
Currently only the action `IGNORE` is supported

### Execution
`query.run()`

Returns `Promise<int>` with the int being number of affected rows

## SelectQuery

### Columns to return (SELECT)
`query.columns(string[])` or `query.columns(string)`

This directly conflicts with `query.distinct(string)`, and reverts these selected columns to non-distinct

fx `query.columns(['id', 'name', 'score'])`

### LIMIT 
`query.limit(int)`

fx: `query.limit(5)`

### OFFSET    
`query.offset(int)`

fx: `query.offset(5)`

### ORDER BY  
`query.orderBy(string, [ascending = true])`

takes a string argument and an optional bool which defaults to true whether or not the ordering is done ascending.

fx `query.orderBy('name', true)`

### GROUP BY  
`query.groupBy(string[])` or `query.groupBy(string)`

fx `query.columns(['id', 'name', 'score'])`


### HAVING  
`query.having(function)` or `query.having(function, arg1, arg2, ..., argN)`

Works similarly to WHERE, but is for filtering groupBy

fx `query.having(() => SUM(score) > 5)`

### DISTINCT
`query.distinct(bool = true)` or `query.distinct(string)`

default is true,

if a bool is given, all columns are distinct

if a string is given query is distinct for that single column. If a column were previously added through `.columns(...)` this row will be converted to distinct.

this can be used multiple times to have it be distinct for a subset of columns

### Execution
`query.one()` or `query.all()`

both returns a promise

`query.one()` returns either the first row or undefined if no rows were found.

`query.all()` returns an array of rows, an empty array if no rows were found.

A row in this case is an object like

`{ id: 5,  name: "John",  score: 0 }`