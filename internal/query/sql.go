package query

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"strings"

	"shellhaki/poneglyph/internal/model"
)

// Supported SQL subset:
//
//	SELECT <*|col,col>
//	FROM <table>
//	[WHERE <col> <op> <value>]   op: = != <> > < >= <= LIKE
//	[ORDER BY <col> [ASC|DESC]]
//	[LIMIT <n>]
//
// It is deliberately small — enough to explore data, not a full SQL engine.
func (e *Engine) runSQL(ctx context.Context, src model.Source, q string) (Result, error) {
	stmt, err := parseSelect(q)
	if err != nil {
		return Result{}, err
	}

	table, records, err := e.loadTable(ctx, src.ID, stmt.table)
	if err != nil {
		return Result{}, err
	}

	rows := make([]map[string]any, 0, len(records))
	for _, r := range records {
		if stmt.where == nil || stmt.where.eval(r.Fields) {
			rows = append(rows, r.Fields)
		}
	}

	if stmt.orderBy != "" {
		sort.SliceStable(rows, func(i, j int) bool {
			less := compare(rows[i][stmt.orderBy], rows[j][stmt.orderBy]) < 0
			if stmt.orderDesc {
				return !less
			}
			return less
		})
	}

	if stmt.limit > 0 && stmt.limit < len(rows) {
		rows = rows[:stmt.limit]
	}

	cols := stmt.columns
	if len(cols) == 0 {
		for _, c := range table.Columns {
			cols = append(cols, c.Name)
		}
	}

	if len(stmt.columns) > 0 {
		projected := make([]map[string]any, len(rows))
		for i, r := range rows {
			p := make(map[string]any, len(cols))
			for _, c := range cols {
				p[c] = r[c]
			}
			projected[i] = p
		}
		rows = projected
	}

	return rowsToResult(cols, rows), nil
}

type selectStmt struct {
	columns   []string // empty means *
	table     string
	where     *condition
	orderBy   string
	orderDesc bool
	limit     int
}

type condition struct {
	column string
	op     string
	value  any
}

func (c *condition) eval(fields map[string]any) bool {
	got, ok := fields[c.column]
	if !ok {
		return false
	}
	switch c.op {
	case "=":
		return compare(got, c.value) == 0
	case "!=", "<>":
		return compare(got, c.value) != 0
	case ">":
		return compare(got, c.value) > 0
	case "<":
		return compare(got, c.value) < 0
	case ">=":
		return compare(got, c.value) >= 0
	case "<=":
		return compare(got, c.value) <= 0
	case "LIKE":
		needle := strings.ToLower(strings.Trim(fmt.Sprint(c.value), "%"))
		return strings.Contains(strings.ToLower(fmt.Sprint(got)), needle)
	}
	return false
}

func parseSelect(q string) (*selectStmt, error) {
	toks := lex(q)
	p := &parser{toks: toks}
	stmt := &selectStmt{}

	if !p.eatKeyword("SELECT") {
		return nil, fmt.Errorf("query must start with SELECT")
	}
	if p.eatSymbol("*") {
		// all columns
	} else {
		for {
			name, ok := p.eatIdent()
			if !ok {
				return nil, fmt.Errorf("expected a column name")
			}
			stmt.columns = append(stmt.columns, name)
			if !p.eatSymbol(",") {
				break
			}
		}
	}

	if !p.eatKeyword("FROM") {
		return nil, fmt.Errorf("expected FROM")
	}
	table, ok := p.eatIdent()
	if !ok {
		return nil, fmt.Errorf("expected a table name after FROM")
	}
	stmt.table = table

	if p.eatKeyword("WHERE") {
		col, ok := p.eatIdent()
		if !ok {
			return nil, fmt.Errorf("expected a column in WHERE")
		}
		op, ok := p.eatOperator()
		if !ok {
			return nil, fmt.Errorf("expected an operator in WHERE")
		}
		val, ok := p.eatValue()
		if !ok {
			return nil, fmt.Errorf("expected a value in WHERE")
		}
		stmt.where = &condition{column: col, op: op, value: val}
	}

	if p.eatKeyword("ORDER") {
		if !p.eatKeyword("BY") {
			return nil, fmt.Errorf("expected BY after ORDER")
		}
		col, ok := p.eatIdent()
		if !ok {
			return nil, fmt.Errorf("expected a column after ORDER BY")
		}
		stmt.orderBy = col
		if p.eatKeyword("DESC") {
			stmt.orderDesc = true
		} else {
			p.eatKeyword("ASC")
		}
	}

	if p.eatKeyword("LIMIT") {
		n, ok := p.eatNumber()
		if !ok {
			return nil, fmt.Errorf("expected a number after LIMIT")
		}
		stmt.limit = int(n)
	}

	if !p.done() {
		return nil, fmt.Errorf("unexpected input near %q", p.peek().val)
	}
	return stmt, nil
}

// compare orders two values numerically when both look like numbers, otherwise
// as strings. Returns -1, 0, or 1.
func compare(a, b any) int {
	an, aok := toNumber(a)
	bn, bok := toNumber(b)
	if aok && bok {
		switch {
		case an < bn:
			return -1
		case an > bn:
			return 1
		default:
			return 0
		}
	}
	as, bs := strings.ToLower(fmt.Sprint(a)), strings.ToLower(fmt.Sprint(b))
	return strings.Compare(as, bs)
}

func toNumber(v any) (float64, bool) {
	switch n := v.(type) {
	case int:
		return float64(n), true
	case int64:
		return float64(n), true
	case float64:
		return n, true
	case string:
		f, err := strconv.ParseFloat(n, 64)
		return f, err == nil
	}
	return 0, false
}
