import { Database, Layers, Leaf, HardDrive, Zap, type LucideIcon } from "lucide-react";
import type { DbKindId } from "./types";

export interface DbKind {
  id: DbKindId;
  name: string;
  family: "relational" | "document" | "key-value" | "embedded";
  blurb: string;
  defaultPort: string;
  color: string;
  icon: LucideIcon;
  abbr: string;
  hasSchema: boolean;
  hasPassword: boolean;
}

export const DB_KINDS: DbKind[] = [
  {
    id: "postgres",
    name: "PostgreSQL",
    family: "relational",
    blurb: "Relational",
    defaultPort: "5432",
    color: "#3b82f6",
    icon: Database,
    abbr: "PG",
    hasSchema: true,
    hasPassword: true,
  },
  {
    id: "mysql",
    name: "MySQL / MariaDB",
    family: "relational",
    blurb: "Relational",
    defaultPort: "3306",
    color: "#0ea5e9",
    icon: Layers,
    abbr: "SQL",
    hasSchema: false,
    hasPassword: true,
  },
  {
    id: "mongodb",
    name: "MongoDB",
    family: "document",
    blurb: "Document",
    defaultPort: "27017",
    color: "#22c55e",
    icon: Leaf,
    abbr: "DOC",
    hasSchema: false,
    hasPassword: true,
  },
  {
    id: "sqlite",
    name: "SQLite",
    family: "embedded",
    blurb: "Embedded file",
    defaultPort: "",
    color: "#a855f7",
    icon: HardDrive,
    abbr: "LITE",
    hasSchema: false,
    hasPassword: false,
  },
  {
    id: "redis",
    name: "Redis",
    family: "key-value",
    blurb: "Key–value",
    defaultPort: "6379",
    color: "#ef4444",
    icon: Zap,
    abbr: "KV",
    hasSchema: false,
    hasPassword: true,
  },
];

export const DB_KIND_MAP: Record<DbKindId, DbKind> = DB_KINDS.reduce(
  (acc, k) => ({ ...acc, [k.id]: k }),
  {} as Record<DbKindId, DbKind>,
);
