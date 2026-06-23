package query

import (
	"strconv"
	"strings"
	"unicode"
)

type tokKind int

const (
	tIdent tokKind = iota
	tNumber
	tString
	tSymbol // , * ( )
	tOp     // = != <> > < >= <=
)

type token struct {
	kind tokKind
	val  string
}

// lex turns a query string into tokens. It understands identifiers, numbers,
// single-quoted strings, comparison operators, and a few symbols.
func lex(s string) []token {
	var toks []token
	r := []rune(s)
	for i := 0; i < len(r); {
		c := r[i]
		switch {
		case unicode.IsSpace(c):
			i++
		case c == '\'':
			i++
			start := i
			for i < len(r) && r[i] != '\'' {
				i++
			}
			toks = append(toks, token{tString, string(r[start:i])})
			if i < len(r) {
				i++ // closing quote
			}
		case c == ',' || c == '*' || c == '(' || c == ')':
			toks = append(toks, token{tSymbol, string(c)})
			i++
		case strings.ContainsRune("=<>!", c):
			start := i
			i++
			if i < len(r) && strings.ContainsRune("=>", r[i]) {
				i++
			}
			toks = append(toks, token{tOp, string(r[start:i])})
		case unicode.IsDigit(c) || (c == '-' && i+1 < len(r) && unicode.IsDigit(r[i+1])):
			start := i
			i++
			for i < len(r) && (unicode.IsDigit(r[i]) || r[i] == '.') {
				i++
			}
			toks = append(toks, token{tNumber, string(r[start:i])})
		case unicode.IsLetter(c) || c == '_':
			start := i
			for i < len(r) && (unicode.IsLetter(r[i]) || unicode.IsDigit(r[i]) || r[i] == '_' || r[i] == '.') {
				i++
			}
			toks = append(toks, token{tIdent, string(r[start:i])})
		default:
			i++ // skip anything unexpected
		}
	}
	return toks
}

type parser struct {
	toks []token
	pos  int
}

func (p *parser) done() bool    { return p.pos >= len(p.toks) }
func (p *parser) peek() token {
	if p.done() {
		return token{}
	}
	return p.toks[p.pos]
}

func (p *parser) eatKeyword(kw string) bool {
	if !p.done() && p.toks[p.pos].kind == tIdent && strings.EqualFold(p.toks[p.pos].val, kw) {
		p.pos++
		return true
	}
	return false
}

func (p *parser) eatSymbol(sym string) bool {
	if !p.done() && p.toks[p.pos].kind == tSymbol && p.toks[p.pos].val == sym {
		p.pos++
		return true
	}
	return false
}

func (p *parser) eatIdent() (string, bool) {
	if !p.done() && p.toks[p.pos].kind == tIdent {
		v := p.toks[p.pos].val
		p.pos++
		return v, true
	}
	return "", false
}

func (p *parser) eatOperator() (string, bool) {
	if !p.done() && p.toks[p.pos].kind == tOp {
		v := p.toks[p.pos].val
		p.pos++
		return v, true
	}
	if p.eatKeyword("LIKE") {
		return "LIKE", true
	}
	return "", false
}

func (p *parser) eatNumber() (float64, bool) {
	if !p.done() && p.toks[p.pos].kind == tNumber {
		f, err := strconv.ParseFloat(p.toks[p.pos].val, 64)
		if err == nil {
			p.pos++
			return f, true
		}
	}
	return 0, false
}

func (p *parser) eatValue() (any, bool) {
	if p.done() {
		return nil, false
	}
	t := p.toks[p.pos]
	switch t.kind {
	case tNumber:
		f, _ := strconv.ParseFloat(t.val, 64)
		p.pos++
		return f, true
	case tString:
		p.pos++
		return t.val, true
	case tIdent:
		switch strings.ToUpper(t.val) {
		case "TRUE":
			p.pos++
			return true, true
		case "FALSE":
			p.pos++
			return false, true
		case "NULL":
			p.pos++
			return nil, true
		}
	}
	return nil, false
}
