// Package config loads runtime settings from the environment with sensible
// defaults, so the server runs with zero configuration during development.
package config

import (
	"os"
	"strings"
)

// Config is the fully-resolved server configuration.
type Config struct {
	Port     string   // HTTP port to listen on
	Store    string   // "memory" or "mongo"
	MongoURI string   // used when Store == "mongo"
	MongoDB  string   // mongo database name
	Origins  []string // allowed CORS origins
	Seed     bool     // seed sample data on startup
}

// Load reads configuration from the environment.
func Load() Config {
	return Config{
		Port:     env("PORT", "8080"),
		Store:    env("STORE", "memory"),
		MongoURI: env("MONGO_URI", "mongodb://localhost:27017"),
		MongoDB:  env("MONGO_DB", "poneglyph"),
		Origins:  splitList(env("CORS_ORIGINS", "http://localhost:3000")),
		Seed:     env("SEED", "true") == "true",
	}
}

func env(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func splitList(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}
