# pg-linq
 An npm package to create Postgres queries in a linq-ish way

# Compatible
node 12.\*.\*

# Usage

## Simple usage
```javascript
// Setup DbContext
import DbContext from 'pg-linq';
import {Pool, Client} from 'pg';
const users = new DbContext('users');
users.usingPool(Pool());

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
// Initialize either with a pool
table.usingPool(Pool());
// Or with a client
table.usingClient(Client());
// Or a custom function
table.using((sql, params) => {...});
```
### API
`[]` indicates optional parameter.

- `run(sql, [params])` runs the sql as a query with params given, returns what a query from pg would return
- `commit()` calls `run('commit')` and returns `Promise<void>`
- `rollback()` calls `run('rollback')` and returns `Promise<void>`
- `beginTransaction()` returns `Promise<void>`
- `create()` returns a new `CreateQuery`
- `delete()` returns a new `DeleteQuery`
- `insert([object])` returns a new `InsertQuery`
- `select([columns])` returns a new `SelectQuery`
- `update([object])` returns a new `UpdateQuery`

## WHERE

where clauses are given as lambda function

| postgres | javascript |
|----------|------------|
| AND | && |
| OR | |
| = | === |
| <> | !== |
| LIKE | == |
| NOT LIKE | != |

for everything else you need to write it as it should look in postgresql

to pass variables into the queries you need to add a $ where they should be and add them as arguments after the function

currently things like "X IS NULL" is not supported

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
 
Create table queries share no similarities with other queries and act much in the same way C#'s fluent API for entity framework.

When you have a CreateQuery you have a number of functions to use, most of these are to add a new column of a certain type (int, bigint, real, bool, text, serial). You also have addColumn(name, type) where you can add a custom type or something this package is missing

You also have 2 other functions, `primaryKeysGroup(Column[])` and `uniqueGroup(Column[])` which are for creating primary keys and unique constraints on groups of columns.

To finish you also have the `ignoreIfExists(bool)` function to have the query not error if the table already exists

When you call `create.int(name)` you will get a Column object, these are the objects expected in the group calls

The column object also has a number of functions on itself

- nullable(bool) (columns are by default nullable)
- primary(bool)
- unique(bool)
- serial(bool)
- reference(tableName, columnName)
- withDefault(anything)

after everything is configured `create.run()` can be executed, it returns `Promise<void>` which you can await for the query to finish
 
 ## DeleteQuery
  Supported clauses:
 - WHERE
 - JOIN
 ## UpdateQuery
  Supported clauses:
 - WHERE
 - JOIN
 ## InsertQuery
  Supported clauses:
 - WHERE
 - JOIN
 - ON CONFLICT
   - IGNORE
 ## SelectQuery
 Supported clauses:
- WHERE
- JOIN
- LIMIT
- OFFSET
- DISTINCT
    - DISTINCT ON (column)
    - DISTINCT
- ORDER BY
 