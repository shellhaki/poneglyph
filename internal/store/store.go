// Package store defines the storage contract for Poneglyph. Every backend
// (in-memory, MongoDB, or a future SQL adapter) implements the same Store
// interface, so the API layer never depends on a specific database.
package store

import (
	"context"
	"errors"

	"shellhaki/poneglyph/internal/model"
)

// ErrNotFound is returned when a requested entity does not exist.
var ErrNotFound = errors.New("not found")

// Store is the full persistence surface used by the API. Implementations must
// be safe for concurrent use.
type Store interface {
	// Sources
	ListSources(ctx context.Context) ([]model.Source, error)
	GetSource(ctx context.Context, id string) (model.Source, error)
	CreateSource(ctx context.Context, s model.Source) (model.Source, error)
	DeleteSource(ctx context.Context, id string) error

	// Tables
	ListTables(ctx context.Context, sourceID string) ([]model.Table, error)
	GetTable(ctx context.Context, id string) (model.Table, error)
	CreateTable(ctx context.Context, t model.Table) (model.Table, error)
	DeleteTable(ctx context.Context, id string) error

	// Records
	ListRecords(ctx context.Context, tableID string, q model.Query) (rows []model.Record, total int, err error)
	GetRecord(ctx context.Context, id string) (model.Record, error)
	CreateRecord(ctx context.Context, r model.Record) (model.Record, error)
	UpdateRecord(ctx context.Context, r model.Record) (model.Record, error)
	DeleteRecord(ctx context.Context, id string) error

	// Relationships
	ListRelationships(ctx context.Context, sourceID string) ([]model.Relationship, error)
	CreateRelationship(ctx context.Context, r model.Relationship) (model.Relationship, error)
	DeleteRelationship(ctx context.Context, id string) error

	// Diagrams
	ListDiagrams(ctx context.Context, sourceID string) ([]model.Diagram, error)
	GetDiagram(ctx context.Context, id string) (model.Diagram, error)
	CreateDiagram(ctx context.Context, d model.Diagram) (model.Diagram, error)
	UpdateDiagram(ctx context.Context, d model.Diagram) (model.Diagram, error)
	DeleteDiagram(ctx context.Context, id string) error

	// Close releases any resources held by the store.
	Close(ctx context.Context) error
}
