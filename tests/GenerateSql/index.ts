import {DeleteQueryGenerateSql} from "./DeleteQuery.test";
import {InsertQueryGenerateSql} from "./InsertQuery.test";
import {WhereGenerateSql} from "./Where.test";
import {JoinGenerateSql} from "./Join.test";
import {UpdateQueryGenerateSql} from "./UpdateQuery.test";
import {CreateQueryGenerateSql} from "./CreateQuery.test";
import {SelectGenerateSql} from "./Select.test";
import {HavingGenerateSql} from "./Having.test";
import {ColumnGenerateSql} from "./Column.test";
import {ConstraintGenerateSql} from "./Constraint.test";
import {SelectQueryGenerateSql} from "./SelectQuery.test";

export const GenerateSqlTests = () => describe("Generate SQL", () => {
    WhereGenerateSql();
    SelectGenerateSql();
    JoinGenerateSql();
    HavingGenerateSql();

    ColumnGenerateSql();
    ConstraintGenerateSql();

    CreateQueryGenerateSql();
    InsertQueryGenerateSql();
    UpdateQueryGenerateSql();
    SelectQueryGenerateSql();
    DeleteQueryGenerateSql();
});