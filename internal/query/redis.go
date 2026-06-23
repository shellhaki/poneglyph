package query

import (
	"context"
	"fmt"
	"strings"

	"shellhaki/poneglyph/internal/model"
)

// Supported Redis commands (the keyspace is the source's key table):
//
//	KEYS <pattern>   glob with * — e.g. KEYS session:*
//	SCAN             list every key
//	GET <key>        the stored value
//	TYPE <key>       the key's type
//	TTL <key>        seconds to live (-1 = no expiry)
func (e *Engine) runRedis(ctx context.Context, src model.Source, q string) (Result, error) {
	parts := strings.Fields(strings.TrimSpace(q))
	if len(parts) == 0 {
		return Result{}, fmt.Errorf("empty command")
	}
	cmd := strings.ToUpper(parts[0])

	keys, err := e.keyspace(ctx, src.ID)
	if err != nil {
		return Result{}, err
	}

	switch cmd {
	case "KEYS", "SCAN":
		pattern := "*"
		if cmd == "KEYS" && len(parts) > 1 {
			pattern = parts[1]
		}
		rows := []map[string]any{}
		for _, k := range keys {
			if globMatch(pattern, fmt.Sprint(k["key"])) {
				rows = append(rows, map[string]any{"key": k["key"], "type": k["type"]})
			}
		}
		return rowsToResult([]string{"key", "type"}, rows), nil

	case "GET", "TYPE", "TTL":
		if len(parts) < 2 {
			return Result{}, fmt.Errorf("%s requires a key", cmd)
		}
		for _, k := range keys {
			if fmt.Sprint(k["key"]) == parts[1] {
				field := map[string]string{"GET": "value", "TYPE": "type", "TTL": "ttl"}[cmd]
				return rowsToResult([]string{field}, []map[string]any{{field: k[field]}}), nil
			}
		}
		return rowsToResult([]string{"result"}, []map[string]any{{"result": nil}}), nil

	default:
		return Result{}, fmt.Errorf("unsupported command %q (try KEYS, SCAN, GET, TYPE, TTL)", cmd)
	}
}

// keyspace returns every key record across the source's tables.
func (e *Engine) keyspace(ctx context.Context, sourceID string) ([]map[string]any, error) {
	tables, err := e.st.ListTables(ctx, sourceID)
	if err != nil {
		return nil, err
	}
	var keys []map[string]any
	for _, t := range tables {
		records, _, err := e.st.ListRecords(ctx, t.ID, model.Query{})
		if err != nil {
			return nil, err
		}
		for _, r := range records {
			keys = append(keys, r.Fields)
		}
	}
	return keys, nil
}

// globMatch supports a leading/trailing/standalone '*' wildcard, which covers
// the common Redis KEYS patterns (session:*, *lock*, *).
func globMatch(pattern, s string) bool {
	if pattern == "*" || pattern == "" {
		return true
	}
	star := strings.Contains(pattern, "*")
	if !star {
		return pattern == s
	}
	switch {
	case strings.HasPrefix(pattern, "*") && strings.HasSuffix(pattern, "*"):
		return strings.Contains(s, strings.Trim(pattern, "*"))
	case strings.HasSuffix(pattern, "*"):
		return strings.HasPrefix(s, strings.TrimSuffix(pattern, "*"))
	case strings.HasPrefix(pattern, "*"):
		return strings.HasSuffix(s, strings.TrimPrefix(pattern, "*"))
	default:
		i := strings.Index(pattern, "*")
		return strings.HasPrefix(s, pattern[:i]) && strings.HasSuffix(s, pattern[i+1:])
	}
}
