import {DbSet} from "./Query/DbSet";
import {Column} from './Infrastructure/Column'
import {Entities, TableStructure, DatabaseStructure} from "./Infrastructure/Interfaces/Types";
import {ColumnType, JoinType} from "./Infrastructure/Interfaces/Enums";

function SUM(arg: any): number {
    throw new Error('This function should never be executed');
}

function COUNT(arg: any): number {
    throw new Error('This function should never be executed');
}

function AVG(arg: any): number {
    throw new Error('This function should never be executed');
}

function MAX(arg: any): number {
    throw new Error('This function should never be executed');
}

function ABS(arg: any): number {
    throw new Error('This function should never be executed');
}

function MIN(arg: any): number {
    throw new Error('This function should never be executed');
}

function LENGTH(arg: any): number {
    throw new Error('This function should never be executed');
}

function UPPER(arg: string): string {
    throw new Error('This function should never be executed');
}

function LOWER(arg: string): string {
    throw new Error('This function should never be executed');
}

function ANY(arg: any): any {
    throw new Error('This function should never be executed');
}

export {DbSet, Column, ColumnType, JoinType, SUM, COUNT, AVG, ABS, MAX, MIN, LENGTH, UPPER, LOWER, ANY};
export type {TableStructure, DatabaseStructure, Entities};