// Package memory is an in-memory [store.Store]. It needs no external services,
// which makes it the default for local development and quick trials. Data lives
// only for the lifetime of the process.
package memory

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"sync"

	"shellhaki/poneglyph/internal/model"
	"shellhaki/poneglyph/internal/store"
)

// Store keeps every entity in maps guarded by a single mutex. Simplicity over
// cleverness: the data volumes a browser viewer works with are tiny.
type Store struct {
	mu            sync.RWMutex
	sources       map[string]model.Source
	tables        map[string]model.Table
	records       map[string]model.Record
	relationships map[string]model.Relationship
	diagrams      map[string]model.Diagram
}

// New returns an empty in-memory store.
func New() *Store {
	return &Store{
		sources:       map[string]model.Source{},
		tables:        map[string]model.Table{},
		records:       map[string]model.Record{},
		relationships: map[string]model.Relationship{},
		diagrams:      map[string]model.Diagram{},
	}
}

func (s *Store) Close(context.Context) error { return nil }

// --- Sources ---

func (s *Store) ListSources(context.Context) ([]model.Source, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]model.Source, 0, len(s.sources))
	for _, v := range s.sources {
		out = append(out, v)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].CreatedAt.Before(out[j].CreatedAt) })
	return out, nil
}

func (s *Store) GetSource(_ context.Context, id string) (model.Source, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	v, ok := s.sources[id]
	if !ok {
		return model.Source{}, store.ErrNotFound
	}
	return v, nil
}

func (s *Store) CreateSource(_ context.Context, src model.Source) (model.Source, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sources[src.ID] = src
	return src, nil
}

func (s *Store) DeleteSource(_ context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.sources[id]; !ok {
		return store.ErrNotFound
	}
	delete(s.sources, id)
	for tid, t := range s.tables {
		if t.SourceID == id {
			s.deleteTableLocked(tid)
		}
	}
	for rid, r := range s.relationships {
		if r.SourceID == id {
			delete(s.relationships, rid)
		}
	}
	for did, d := range s.diagrams {
		if d.SourceID == id {
			delete(s.diagrams, did)
		}
	}
	return nil
}

// --- Tables ---

func (s *Store) ListTables(_ context.Context, sourceID string) ([]model.Table, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []model.Table{}
	for _, t := range s.tables {
		if t.SourceID == sourceID {
			out = append(out, t)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out, nil
}

func (s *Store) GetTable(_ context.Context, id string) (model.Table, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	v, ok := s.tables[id]
	if !ok {
		return model.Table{}, store.ErrNotFound
	}
	return v, nil
}

func (s *Store) CreateTable(_ context.Context, t model.Table) (model.Table, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.tables[t.ID] = t
	return t, nil
}

func (s *Store) DeleteTable(_ context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.tables[id]; !ok {
		return store.ErrNotFound
	}
	s.deleteTableLocked(id)
	return nil
}

func (s *Store) deleteTableLocked(id string) {
	delete(s.tables, id)
	for rid, r := range s.records {
		if r.TableID == id {
			delete(s.records, rid)
		}
	}
}

// --- Records ---

func (s *Store) ListRecords(_ context.Context, tableID string, q model.Query) ([]model.Record, int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	rows := []model.Record{}
	for _, r := range s.records {
		if r.TableID == tableID {
			rows = append(rows, r)
		}
	}

	if q.Search != "" {
		needle := strings.ToLower(q.Search)
		filtered := rows[:0:0]
		for _, r := range rows {
			if recordMatches(r, needle) {
				filtered = append(filtered, r)
			}
		}
		rows = filtered
	}

	if q.Sort != "" {
		sort.SliceStable(rows, func(i, j int) bool {
			less := fmt.Sprint(rows[i].Fields[q.Sort]) < fmt.Sprint(rows[j].Fields[q.Sort])
			if q.Order == "desc" {
				return !less
			}
			return less
		})
	} else {
		sort.SliceStable(rows, func(i, j int) bool { return rows[i].ID < rows[j].ID })
	}

	total := len(rows)
	rows = paginate(rows, q.Offset, q.Limit)
	return rows, total, nil
}

func (s *Store) GetRecord(_ context.Context, id string) (model.Record, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	v, ok := s.records[id]
	if !ok {
		return model.Record{}, store.ErrNotFound
	}
	return v, nil
}

func (s *Store) CreateRecord(_ context.Context, r model.Record) (model.Record, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.records[r.ID] = r
	return r, nil
}

func (s *Store) UpdateRecord(_ context.Context, r model.Record) (model.Record, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.records[r.ID]; !ok {
		return model.Record{}, store.ErrNotFound
	}
	s.records[r.ID] = r
	return r, nil
}

func (s *Store) DeleteRecord(_ context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.records[id]; !ok {
		return store.ErrNotFound
	}
	delete(s.records, id)
	return nil
}

// --- Relationships ---

func (s *Store) ListRelationships(_ context.Context, sourceID string) ([]model.Relationship, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []model.Relationship{}
	for _, r := range s.relationships {
		if r.SourceID == sourceID {
			out = append(out, r)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out, nil
}

func (s *Store) CreateRelationship(_ context.Context, r model.Relationship) (model.Relationship, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.relationships[r.ID] = r
	return r, nil
}

func (s *Store) DeleteRelationship(_ context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.relationships[id]; !ok {
		return store.ErrNotFound
	}
	delete(s.relationships, id)
	return nil
}

// --- Diagrams ---

func (s *Store) ListDiagrams(_ context.Context, sourceID string) ([]model.Diagram, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []model.Diagram{}
	for _, d := range s.diagrams {
		if d.SourceID == sourceID {
			out = append(out, d)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].CreatedAt.Before(out[j].CreatedAt) })
	return out, nil
}

func (s *Store) GetDiagram(_ context.Context, id string) (model.Diagram, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	v, ok := s.diagrams[id]
	if !ok {
		return model.Diagram{}, store.ErrNotFound
	}
	return v, nil
}

func (s *Store) CreateDiagram(_ context.Context, d model.Diagram) (model.Diagram, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.diagrams[d.ID] = d
	return d, nil
}

func (s *Store) UpdateDiagram(_ context.Context, d model.Diagram) (model.Diagram, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.diagrams[d.ID]; !ok {
		return model.Diagram{}, store.ErrNotFound
	}
	s.diagrams[d.ID] = d
	return d, nil
}

func (s *Store) DeleteDiagram(_ context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.diagrams[id]; !ok {
		return store.ErrNotFound
	}
	delete(s.diagrams, id)
	return nil
}

// --- helpers ---

func recordMatches(r model.Record, needle string) bool {
	for _, v := range r.Fields {
		if strings.Contains(strings.ToLower(fmt.Sprint(v)), needle) {
			return true
		}
	}
	return false
}

func paginate[T any](items []T, offset, limit int) []T {
	if offset < 0 {
		offset = 0
	}
	if offset >= len(items) {
		return []T{}
	}
	end := len(items)
	if limit > 0 && offset+limit < end {
		end = offset + limit
	}
	return items[offset:end]
}
