// Package seed loads a small, themed sample dataset so a fresh install has
// something to explore: a relational source, a document source, and a
// key-value source — one of each shape the UI knows how to render.
package seed

import (
	"context"
	"time"

	"shellhaki/poneglyph/internal/id"
	"shellhaki/poneglyph/internal/model"
	"shellhaki/poneglyph/internal/store"
)

// Apply seeds the store if it has no sources yet. It is safe to call on every
// startup.
func Apply(ctx context.Context, st store.Store) error {
	existing, err := st.ListSources(ctx)
	if err != nil {
		return err
	}
	if len(existing) > 0 {
		return nil
	}

	b := builder{ctx: ctx, st: st, now: time.Now().UTC()}
	if err := b.relationalDemo(); err != nil {
		return err
	}
	if err := b.documentDemo(); err != nil {
		return err
	}
	if err := b.keyValueDemo(); err != nil {
		return err
	}
	return b.err
}

type builder struct {
	ctx context.Context
	st  store.Store
	now time.Time
	err error
}

func (b *builder) source(name string, kind model.Kind, cfg model.Config) string {
	if b.err != nil {
		return ""
	}
	s, err := b.st.CreateSource(b.ctx, model.Source{
		ID: id.New("src"), Name: name, Kind: kind, Config: cfg, CreatedAt: b.now,
	})
	b.err = err
	return s.ID
}

func (b *builder) table(sourceID, name, pk string, cols []model.Column, rows []map[string]any) string {
	if b.err != nil {
		return ""
	}
	t, err := b.st.CreateTable(b.ctx, model.Table{
		ID: id.New("tbl"), SourceID: sourceID, Name: name, PrimaryKey: pk, Columns: cols,
	})
	if err != nil {
		b.err = err
		return ""
	}
	for _, fields := range rows {
		if _, err := b.st.CreateRecord(b.ctx, model.Record{
			ID: id.New("rec"), TableID: t.ID, Fields: fields,
		}); err != nil {
			b.err = err
			return t.ID
		}
	}
	return t.ID
}

func (b *builder) relate(sourceID, fromTable, fromCol, toTable, toCol string) {
	if b.err != nil {
		return
	}
	_, b.err = b.st.CreateRelationship(b.ctx, model.Relationship{
		ID: id.New("rel"), SourceID: sourceID,
		FromTable: fromTable, FromColumn: fromCol, ToTable: toTable, ToColumn: toCol,
	})
}

func col(name string, t model.ColumnType, opts ...func(*model.Column)) model.Column {
	c := model.Column{Name: name, Type: t}
	for _, o := range opts {
		o(&c)
	}
	return c
}

func pk() func(*model.Column)  { return func(c *model.Column) { c.PrimaryKey = true } }
func fk(table, column string) func(*model.Column) {
	return func(c *model.Column) { c.ForeignKey = &model.ForeignKey{Table: table, Column: column} }
}

func (b *builder) relationalDemo() error {
	src := b.source("Poneglyph Demo", model.Postgres, model.Config{
		Host: "localhost", Port: "5432", Database: "poneglyph_demo", User: "postgres", Schema: "public",
	})

	b.table(src, "owners", "owner_id",
		[]model.Column{
			col("owner_id", model.TypeInt, pk()),
			col("name", model.TypeText),
			col("email", model.TypeText),
			col("city", model.TypeText),
		},
		[]map[string]any{
			{"owner_id": 1, "name": "Nico Robin", "email": "robin@poneglyph.dev", "city": "Ohara"},
			{"owner_id": 2, "name": "Dan Jukes", "email": "dan@grandline.co", "city": "Water 7"},
			{"owner_id": 3, "name": "Franky Cutty", "email": "franky@galley.la", "city": "Water 7"},
			{"owner_id": 4, "name": "Vivi Nefel", "email": "vivi@alabasta.gov", "city": "Alubarna"},
		})

	b.table(src, "pets", "pet_id",
		[]model.Column{
			col("pet_id", model.TypeInt, pk()),
			col("owner_id", model.TypeInt, fk("owners", "owner_id")),
			col("name", model.TypeText),
			col("species", model.TypeText),
			col("age", model.TypeInt),
		},
		[]map[string]any{
			{"pet_id": 1, "owner_id": 1, "name": "Rex", "species": "Dog", "age": 4},
			{"pet_id": 2, "owner_id": 1, "name": "Milo", "species": "Cat", "age": 2},
			{"pet_id": 3, "owner_id": 2, "name": "Felix", "species": "Cat", "age": 6},
			{"pet_id": 4, "owner_id": 3, "name": "Toto", "species": "Dog", "age": 1},
			{"pet_id": 5, "owner_id": 4, "name": "Rocky", "species": "Dog", "age": 2},
		})

	b.table(src, "appointments", "appointment_id",
		[]model.Column{
			col("appointment_id", model.TypeInt, pk()),
			col("pet_id", model.TypeInt, fk("pets", "pet_id")),
			col("description", model.TypeText),
			col("paid", model.TypeBoolean),
		},
		[]map[string]any{
			{"appointment_id": 1, "pet_id": 1, "description": "General Check-up", "paid": true},
			{"appointment_id": 2, "pet_id": 2, "description": "Vaccination", "paid": true},
			{"appointment_id": 3, "pet_id": 3, "description": "Dental Cleaning", "paid": false},
			{"appointment_id": 4, "pet_id": 5, "description": "Grooming", "paid": true},
		})

	b.relate(src, "pets", "owner_id", "owners", "owner_id")
	b.relate(src, "appointments", "pet_id", "pets", "pet_id")

	if b.err == nil {
		_, b.err = b.st.CreateDiagram(b.ctx, model.Diagram{
			ID: id.New("dia"), SourceID: src, Name: "Clinic overview",
			Nodes: []model.DiagramNode{
				{ID: "n1", Label: "owners", X: 0, Y: 80},
				{ID: "n2", Label: "pets", X: 280, Y: 0},
				{ID: "n3", Label: "appointments", X: 560, Y: 80},
			},
			Edges: []model.DiagramEdge{
				{ID: "e1", Source: "n1", Target: "n2", Label: "owner_id"},
				{ID: "e2", Source: "n2", Target: "n3", Label: "pet_id"},
			},
			CreatedAt: b.now, UpdatedAt: b.now,
		})
	}
	return b.err
}

func (b *builder) documentDemo() error {
	src := b.source("Mongo Playground", model.MongoDB, model.Config{
		Host: "localhost", Port: "27017", Database: "playground",
	})

	b.table(src, "accounts", "_id",
		[]model.Column{
			col("_id", model.TypeText, pk()),
			col("handle", model.TypeText),
			col("verified", model.TypeBoolean),
			col("followers", model.TypeInt),
			col("profile", model.TypeJSON),
		},
		[]map[string]any{
			{"_id": "64f1a", "handle": "@goingmerry", "verified": true, "followers": 12400,
				"profile": map[string]any{"bio": "ship", "crew": "straw hat"}},
			{"_id": "64f1b", "handle": "@thousandsunny", "verified": true, "followers": 88100,
				"profile": map[string]any{"bio": "ship v2", "crew": "straw hat"}},
			{"_id": "64f1d", "handle": "@redforce", "verified": true, "followers": 50230,
				"profile": map[string]any{"bio": "yonko", "crew": "red hair"}},
		})

	b.table(src, "posts", "_id",
		[]model.Column{
			col("_id", model.TypeText, pk()),
			col("account_id", model.TypeText, fk("accounts", "_id")),
			col("body", model.TypeText),
			col("likes", model.TypeInt),
		},
		[]map[string]any{
			{"_id": "p001", "account_id": "64f1a", "body": "Set sail at dawn", "likes": 230},
			{"_id": "p002", "account_id": "64f1b", "body": "Coup de Burst ready", "likes": 1820},
			{"_id": "p003", "account_id": "64f1d", "body": "Meeting at Onigashima", "likes": 9400},
		})

	b.relate(src, "posts", "account_id", "accounts", "_id")
	return b.err
}

func (b *builder) keyValueDemo() error {
	src := b.source("Redis Cache", model.Redis, model.Config{Host: "localhost", Port: "6379"})

	b.table(src, "cache:keys", "key",
		[]model.Column{
			col("key", model.TypeText, pk()),
			col("type", model.TypeText),
			col("value", model.TypeText),
			col("ttl", model.TypeInt),
		},
		[]map[string]any{
			{"key": "session:luffy", "type": "string", "value": "active", "ttl": 3600},
			{"key": "rank:bounties", "type": "zset", "value": "12 members", "ttl": -1},
			{"key": "queue:tasks", "type": "list", "value": "4 items", "ttl": 120},
			{"key": "lock:helm", "type": "string", "value": "zoro", "ttl": 30},
		})
	return b.err
}
