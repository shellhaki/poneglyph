// Package query runs read-only queries against a source's data. Each database
// family speaks its own dialect, so the engine dispatches by [model.Kind]:
// a small SQL subset for relational sources, a find() subset for MongoDB, and
// a handful of commands for Redis. The supported grammar of each lives in its
// own file (sql.go, mongo.go, redis.go).
package query

import (
	"context"
	"fmt"

	"shellhaki/poneglyph/internal/model"
	"shellhaki/poneglyph/internal/store"
)

// Result is the tabular shape every dialect returns, so the frontend renders
// query output exactly like a table.
type Result struct {
	Columns []string         `json:"columns"`
	Rows    []map[string]any `json:"rows"`
	Count   int              `json:"count"`
}

// Engine executes queries by reading records through a [store.Store].
type Engine struct {
	st store.Store
}

// New builds an Engine backed by st.
func New(st store.Store) *Engine { return &Engine{st: st} }

// Run executes q against src and returns the matching rows.
func (e *Engine) Run(ctx context.Context, src model.Source, q string) (Result, error) {
	switch src.Kind {
	case model.Postgres, model.MySQL, model.SQLite:
		return e.runSQL(ctx, src, q)
	case model.MongoDB:
		return e.runMongo(ctx, src, q)
	case model.Redis:
		return e.runRedis(ctx, src, q)
	default:
		return Result{}, fmt.Errorf("queries are not supported for %q sources", src.Kind)
	}
}

// loadTable fetches a table by name within a source along with all its rows.
func (e *Engine) loadTable(ctx context.Context, sourceID, name string) (model.Table, []model.Record, error) {
	tables, err := e.st.ListTables(ctx, sourceID)
	if err != nil {
		return model.Table{}, nil, err
	}
	for _, t := range tables {
		if t.Name == name {
			rows, _, err := e.st.ListRecords(ctx, t.ID, model.Query{})
			return t, rows, err
		}
	}
	return model.Table{}, nil, fmt.Errorf("unknown table %q", name)
}

func rowsToResult(cols []string, rows []map[string]any) Result {
	if rows == nil {
		rows = []map[string]any{}
	}
	return Result{Columns: cols, Rows: rows, Count: len(rows)}
}
