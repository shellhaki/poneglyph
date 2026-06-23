// Package model holds the core domain types shared across the API and stores.
// These are plain data structures with no behaviour, so any storage backend
// can read and write them without coupling to a database.
package model

import "time"

// Kind is the family of database a Source represents. It is metadata only —
// Poneglyph stores the data itself, so the kind drives icons and defaults
// rather than a real driver.
type Kind string

const (
	Postgres Kind = "postgres"
	MySQL    Kind = "mysql"
	MongoDB  Kind = "mongodb"
	SQLite   Kind = "sqlite"
	Redis    Kind = "redis"
)

// Source is a saved connection: a logical database the user is browsing.
type Source struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Kind      Kind      `json:"kind"`
	Config    Config    `json:"config"`
	CreatedAt time.Time `json:"createdAt"`
}

// Config holds connection details. Password is never returned to clients
// (see [Config.Public]).
type Config struct {
	Host     string `json:"host"`
	Port     string `json:"port"`
	Database string `json:"database"`
	User     string `json:"user"`
	Password string `json:"password,omitempty"`
	Schema   string `json:"schema"`
	SSL      bool   `json:"ssl"`
}

// Public returns a copy of the config safe to send to clients.
func (c Config) Public() Config {
	c.Password = ""
	return c
}

// ColumnType is a normalized field type understood by the frontend.
type ColumnType string

const (
	TypeUUID      ColumnType = "uuid"
	TypeInt       ColumnType = "int"
	TypeText      ColumnType = "text"
	TypeTimestamp ColumnType = "timestamp"
	TypeBoolean   ColumnType = "boolean"
	TypeNumeric   ColumnType = "numeric"
	TypeJSON      ColumnType = "json"
)

// ForeignKey points a column at another table's column.
type ForeignKey struct {
	Table  string `json:"table"`
	Column string `json:"column"`
}

// Column describes one field of a Table.
type Column struct {
	Name       string      `json:"name"`
	Type       ColumnType  `json:"type"`
	PrimaryKey bool        `json:"primaryKey,omitempty"`
	Nullable   bool        `json:"nullable,omitempty"`
	ForeignKey *ForeignKey `json:"foreignKey,omitempty"`
}

// Table is a collection of records (a SQL table or a Mongo collection).
type Table struct {
	ID         string   `json:"id"`
	SourceID   string   `json:"sourceId"`
	Name       string   `json:"name"`
	PrimaryKey string   `json:"primaryKey"`
	Columns    []Column `json:"columns"`
}

// Record is a single row. Fields are kept as a free-form map so any shape of
// data round-trips without a fixed schema.
type Record struct {
	ID      string         `json:"id"`
	TableID string         `json:"tableId"`
	Fields  map[string]any `json:"fields"`
}

// Relationship connects two tables, e.g. pets.owner_id -> owners.owner_id.
type Relationship struct {
	ID         string `json:"id"`
	SourceID   string `json:"sourceId"`
	FromTable  string `json:"fromTable"`
	FromColumn string `json:"fromColumn"`
	ToTable    string `json:"toTable"`
	ToColumn   string `json:"toColumn"`
}

// DiagramNode is one box on a saved canvas.
type DiagramNode struct {
	ID    string  `json:"id"`
	Label string  `json:"label"`
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
}

// DiagramEdge is one connection on a saved canvas.
type DiagramEdge struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
	Label  string `json:"label,omitempty"`
}

// Diagram is a saved canvas layout the user can revisit and edit.
type Diagram struct {
	ID        string        `json:"id"`
	SourceID  string        `json:"sourceId"`
	Name      string        `json:"name"`
	Nodes     []DiagramNode `json:"nodes"`
	Edges     []DiagramEdge `json:"edges"`
	CreatedAt time.Time     `json:"createdAt"`
	UpdatedAt time.Time     `json:"updatedAt"`
}

// Query controls how records are listed.
type Query struct {
	Limit  int
	Offset int
	Sort   string
	Order  string // "asc" or "desc"
	Search string
}
