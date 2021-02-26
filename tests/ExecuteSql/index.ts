import {DeleteQueryExecuteSql} from "./DeleteQuery.test";
import {InsertQueryExecuteSql} from "./InsertQuery.test";
import {UpdateQueryExecuteSql} from "./UpdateQuery.test";
import {CreateQueryExecuteSql} from "./CreateQuery.test";
import {SelectQueryExecuteSql} from "./SelectQuery.test";
import {DbSetExecuteSql} from "./DbSet.test";

export const ExecuteSqlTests = () => describe("Execute SQL", () => {
    CreateQueryExecuteSql();
    InsertQueryExecuteSql();
    UpdateQueryExecuteSql();
    SelectQueryExecuteSql();
    DeleteQueryExecuteSql();
    DbSetExecuteSql();
});