# Poneglyph — Backend endpoints

The mock frontend fakes everything through `lib/mock-data.ts`. To go live, implement
the endpoints below and point the app at your backend (set `NEXT_PUBLIC_API_URL` and
replace the calls that currently read from `lib/mock-data.ts`).

Conventions
- Base URL: `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:8080`).
- `kind` is one of: `postgres | mysql | mongodb | sqlite | redis`.
- Connections are opened per browser session. The backend returns a short-lived
  `connectionId`; the frontend stores it locally (no accounts, no server-side users).
- All bodies are JSON.

---

### 1. Test a connection

```
method: POST /connect
expected input:
  {
    "kind": "postgres",
    "config": {
      "host": "localhost",
      "port": "5432",
      "database": "my_db",
      "user": "postgres",
      "password": "••••••",
      "schema": "public",
      "ssl": false
    }
  }
expected output:                       // 200 on success
  {
    "connectionId": "c_8f3a1b",
    "tables": ["owners", "pets", "appointments"]
  }
                                       // 400/401 on failure
  { "error": "password authentication failed for user \"postgres\"" }
```

---

### 2. List tables / collections

```
method: GET /connections/:connectionId/tables
expected input:  (path) connectionId
expected output:
  {
    "tables": [
      { "name": "owners", "rowCount": 6, "primaryKey": "owner_id" },
      { "name": "pets",   "rowCount": 8, "primaryKey": "pet_id" }
    ]
  }
```

---

### 3. Get a table's schema

```
method: GET /connections/:connectionId/tables/:table/schema
expected input:  (path) connectionId, table
expected output:
  {
    "name": "pets",
    "primaryKey": "pet_id",
    "columns": [
      { "name": "pet_id",   "type": "int",  "primaryKey": true },
      { "name": "owner_id", "type": "int",  "foreignKey": { "table": "owners", "column": "owner_id" } },
      { "name": "name",     "type": "text", "nullable": false },
      { "name": "age",      "type": "int",  "nullable": true }
    ]
  }
```
> `type` is normalized to: `uuid | int | text | timestamp | boolean | numeric | json`.

---

### 4. Read rows (paginated, filtered, sorted)

```
method: GET /connections/:connectionId/tables/:table/rows
expected input:  (query)
  limit   = 50            // page size
  offset  = 0             // page start
  sort    = "age"         // optional column name
  order   = "asc|desc"    // optional
  q       = "rex"         // optional full-text-ish filter across columns
expected output:
  {
    "rows": [
      { "pet_id": 1, "owner_id": 1, "name": "Rex", "species": "Dog", "age": 4 }
    ],
    "total": 8,            // total rows matching q (for pagination)
    "limit": 50,
    "offset": 0
  }
```

---

### 5. Relationships (for the graph view)

```
method: GET /connections/:connectionId/tables/:table/relationships
expected input:  (path) connectionId, table
expected output:
  {
    "edges": [
      { "fromTable": "pets", "fromColumn": "owner_id", "toTable": "owners", "toColumn": "owner_id" }
    ]
  }
```
> Optional — the frontend can also derive edges from the foreign keys in `/schema`.
> Provide this if you want server-resolved relationships (e.g. Mongo refs, junction tables).

---

### 6. Close a connection (optional)

```
method: DELETE /connections/:connectionId
expected input:  (path) connectionId
expected output: { "ok": true }
```

---

## Notes for the relational vs non-relational cases
- **MongoDB**: "tables" = collections, "columns" = inferred from a sample of documents,
  `primaryKey` = `_id`. `foreignKey` is best-effort (manual refs).
- **Redis**: "tables" can be key namespaces (e.g. `cache:*`); rows = `{ key, type, value, ttl }`.
- **SQLite**: same shape as Postgres/MySQL; `config.database` is a file path, no user/password.
