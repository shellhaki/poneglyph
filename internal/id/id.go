// Package id generates short, URL-safe, prefixed identifiers.
package id

import (
	"crypto/rand"
	"encoding/hex"
)

// New returns an id like "rec_9f3a1b2c4d5e6f70".
func New(prefix string) string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return prefix + "_" + hex.EncodeToString(b)
}
