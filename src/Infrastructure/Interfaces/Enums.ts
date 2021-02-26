export enum ColumnType {
    int = 'int',
    bigint = 'bigint',
    boolean = 'boolean',
    text = 'text',
    real = 'real',
    serial = 'serial',
}

export enum ConstraintType {
    unique = "unique",
    primary = "primary"
}

export enum JoinType {
    inner = 'INNER JOIN',
    left = 'LEFT JOIN',
    right = 'RIGHT JOIN',
    full = 'FULL JOIN'
}

export enum TransactionResult {
    commit,
    rollback
}