package query

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"shellhaki/poneglyph/internal/model"
)

// Supported MongoDB subset:
//
//	db.<collection>.find(<json filter?>)
//	  optionally chained: .limit(<n>) and .sort({ field: 1 | -1 })
//
// Filter values may be a literal (equality) or an operator object using
// $eq $ne $gt $gte $lt $lte.
func (e *Engine) runMongo(ctx context.Context, src model.Source, q string) (Result, error) {
	collection, filterJSON, limit, sortField, sortDesc, err := parseFind(q)
	if err != nil {
		return Result{}, err
	}

	var filter map[string]any
	if strings.TrimSpace(filterJSON) != "" {
		if err := json.Unmarshal([]byte(filterJSON), &filter); err != nil {
			return Result{}, fmt.Errorf("invalid filter JSON: %v", err)
		}
	}

	table, records, err := e.loadTable(ctx, src.ID, collection)
	if err != nil {
		return Result{}, err
	}

	rows := make([]map[string]any, 0, len(records))
	for _, r := range records {
		if matchFilter(r.Fields, filter) {
			rows = append(rows, r.Fields)
		}
	}

	if sortField != "" {
		sort.SliceStable(rows, func(i, j int) bool {
			less := compare(rows[i][sortField], rows[j][sortField]) < 0
			if sortDesc {
				return !less
			}
			return less
		})
	}
	if limit > 0 && limit < len(rows) {
		rows = rows[:limit]
	}

	cols := make([]string, 0, len(table.Columns))
	for _, c := range table.Columns {
		cols = append(cols, c.Name)
	}
	return rowsToResult(cols, rows), nil
}

func parseFind(q string) (collection, filter string, limit int, sortField string, sortDesc bool, err error) {
	q = strings.TrimSpace(q)
	if !strings.HasPrefix(q, "db.") {
		return "", "", 0, "", false, fmt.Errorf("query must start with db.<collection>.find(...)")
	}
	rest := q[len("db."):]

	dot := strings.Index(rest, ".find(")
	if dot < 0 {
		return "", "", 0, "", false, fmt.Errorf("expected .find(...)")
	}
	collection = rest[:dot]
	rest = rest[dot+len(".find("):]

	close := matchingParen(rest)
	if close < 0 {
		return "", "", 0, "", false, fmt.Errorf("unbalanced parentheses in find()")
	}
	filter = strings.TrimSpace(rest[:close])
	tail := rest[close+1:]

	if arg, ok := chainArg(tail, ".limit("); ok {
		fmt.Sscanf(arg, "%d", &limit)
	}
	if arg, ok := chainArg(tail, ".sort("); ok {
		var spec map[string]int
		if json.Unmarshal([]byte(arg), &spec) == nil {
			for k, v := range spec {
				sortField, sortDesc = k, v < 0
			}
		}
	}
	return collection, filter, limit, sortField, sortDesc, nil
}

// matchingParen returns the index of the ')' that closes the find() argument,
// accounting for nested braces and parentheses.
func matchingParen(s string) int {
	depth := 0
	for i, c := range s {
		switch c {
		case '(', '{', '[':
			depth++
		case ')':
			if depth == 0 {
				return i
			}
			depth--
		case '}', ']':
			depth--
		}
	}
	return -1
}

func chainArg(tail, method string) (string, bool) {
	i := strings.Index(tail, method)
	if i < 0 {
		return "", false
	}
	inner := tail[i+len(method):]
	close := matchingParen(inner)
	if close < 0 {
		return "", false
	}
	return strings.TrimSpace(inner[:close]), true
}

func matchFilter(fields, filter map[string]any) bool {
	for key, want := range filter {
		got := fields[key]
		if ops, ok := want.(map[string]any); ok {
			for op, v := range ops {
				if !matchOp(got, op, v) {
					return false
				}
			}
			continue
		}
		if compare(got, want) != 0 {
			return false
		}
	}
	return true
}

func matchOp(got any, op string, want any) bool {
	switch op {
	case "$eq":
		return compare(got, want) == 0
	case "$ne":
		return compare(got, want) != 0
	case "$gt":
		return compare(got, want) > 0
	case "$gte":
		return compare(got, want) >= 0
	case "$lt":
		return compare(got, want) < 0
	case "$lte":
		return compare(got, want) <= 0
	}
	return false
}
