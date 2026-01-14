import { describe, it, expect } from 'vitest'
import { normalizeText, tokenize, getTokenAtCharOffset, getWordTokens } from './tokenizer'

describe('normalizeText', () => {
  it('converts CRLF to LF', () => {
    expect(normalizeText('hello\r\nworld')).toBe('hello\nworld')
  })

  it('converts CR to LF', () => {
    expect(normalizeText('hello\rworld')).toBe('hello\nworld')
  })

  it('collapses multiple newlines to double newline', () => {
    expect(normalizeText('hello\n\n\n\nworld')).toBe('hello\n\nworld')
  })

  it('collapses multiple spaces to single space', () => {
    expect(normalizeText('hello    world')).toBe('hello world')
  })

  it('trims leading and trailing whitespace', () => {
    expect(normalizeText('  hello world  ')).toBe('hello world')
  })
})

describe('tokenize', () => {
  it('tokenizes simple text', () => {
    const { tokens } = tokenize('Hello world')
    expect(tokens).toHaveLength(2)
    expect(tokens[0].display).toBe('Hello')
    expect(tokens[1].display).toBe('world')
  })

  it('preserves punctuation in display', () => {
    const { tokens } = tokenize('Hello, world!')
    expect(tokens[0].display).toBe('Hello,')
    expect(tokens[1].display).toBe('world!')
  })

  it('strips punctuation for core', () => {
    const { tokens } = tokenize('Hello, world!')
    expect(tokens[0].core).toBe('Hello')
    expect(tokens[1].core).toBe('world')
  })

  it('calculates ORP index correctly', () => {
    const { tokens } = tokenize('I am reading')
    expect(tokens[0].orpIndex).toBe(0) // I - single char
    expect(tokens[1].orpIndex).toBe(1) // am - 2 chars
    expect(tokens[2].orpIndex).toBe(2) // reading - 7 chars
  })

  it('adds break tokens for paragraphs', () => {
    const { tokens } = tokenize('Hello.\n\nWorld.')
    expect(tokens).toHaveLength(3)
    expect(tokens[0].display).toBe('Hello.')
    expect(tokens[1].type).toBe('break')
    expect(tokens[2].display).toBe('World.')
  })

  it('tracks character offsets', () => {
    const { fullText, tokens } = tokenize('Hello world')
    expect(tokens[0].charStart).toBe(0)
    expect(tokens[0].charEnd).toBe(5)
    expect(tokens[1].charStart).toBe(6)
    expect(tokens[1].charEnd).toBe(11)
    expect(fullText.slice(tokens[0].charStart, tokens[0].charEnd)).toBe('Hello')
    expect(fullText.slice(tokens[1].charStart, tokens[1].charEnd)).toBe('world')
  })
})

describe('getTokenAtCharOffset', () => {
  it('returns correct token index for offset', () => {
    const { tokens } = tokenize('Hello world test')
    expect(getTokenAtCharOffset(tokens, 0)).toBe(0)
    expect(getTokenAtCharOffset(tokens, 3)).toBe(0)
    expect(getTokenAtCharOffset(tokens, 6)).toBe(1)
    expect(getTokenAtCharOffset(tokens, 12)).toBe(2)
  })

  it('returns last token for offset beyond text', () => {
    const { tokens } = tokenize('Hello world')
    expect(getTokenAtCharOffset(tokens, 100)).toBe(1)
  })
})

describe('getWordTokens', () => {
  it('filters out break tokens', () => {
    const { tokens } = tokenize('Hello.\n\nWorld.')
    const wordTokens = getWordTokens(tokens)
    expect(wordTokens).toHaveLength(2)
    expect(wordTokens.every(t => t.type === 'word')).toBe(true)
  })
})
