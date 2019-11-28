# pg-linq
 An npm package to create Postgres queries in a linq-ish way

# Compatible
node 12.*

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

## CreateQuery API (Under construction)
## DeleteQuery API (Under construction)
## SelectQuery API (Under construction)
## UpdateQuery API (Under construction)
