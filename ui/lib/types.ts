export type DbKindId = "postgres" | "mysql" | "mongodb" | "sqlite" | "redis";

export type ColumnType =
  | "uuid"
  | "int"
  | "text"
  | "timestamp"
  | "boolean"
  | "numeric"
  | "json";

export interface Column {
  name: string;
  type: ColumnType;
  primaryKey?: boolean;
  foreignKey?: { table: string; column: string };
  nullable?: boolean;
}

export type Cell = string | number | boolean | null;
export type Row = Record<string, Cell>;

export interface TableMeta {
  name: string;
  primaryKey: string;
  rowCount: number;
  columns: Column[];
  rows: Row[];
}

export interface ConnectionConfig {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
  schema: string;
  ssl: boolean;
}

export interface Session {
  id: string;
  kind: DbKindId;
  label: string;
  config: ConnectionConfig;
  tables: string[];
  createdAt: number;
}
