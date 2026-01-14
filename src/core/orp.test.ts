import { describe, it, expect } from 'vitest'
import { calculateOrpIndex, stripPunctuation, getOrpLetter } from './orp'

describe('calculateOrpIndex', () => {
  it('returns 0 for single character words', () => {
    expect(calculateOrpIndex('a')).toBe(0)
    expect(calculateOrpIndex('I')).toBe(0)
  })

  it('returns 1 for 2-5 character words', () => {
    expect(calculateOrpIndex('to')).toBe(1)
    expect(calculateOrpIndex('the')).toBe(1)
    expect(calculateOrpIndex('hello')).toBe(1)
  })

  it('returns 2 for 6-9 character words', () => {
    expect(calculateOrpIndex('reading')).toBe(2)
    expect(calculateOrpIndex('beautiful')).toBe(2)
  })

  it('returns 3 for 10-13 character words', () => {
    expect(calculateOrpIndex('programming')).toBe(3)
    expect(calculateOrpIndex('understanding')).toBe(3)
  })

  it('returns 4 for 14+ character words', () => {
    expect(calculateOrpIndex('internationally')).toBe(4)
    expect(calculateOrpIndex('extraordinarily')).toBe(4)
  })
})

describe('stripPunctuation', () => {
  it('strips leading punctuation', () => {
    const result = stripPunctuation('"Hello')
    expect(result.leadingPunct).toBe('"')
    expect(result.core).toBe('Hello')
    expect(result.trailingPunct).toBe('')
  })

  it('strips trailing punctuation', () => {
    const result = stripPunctuation('world!')
    expect(result.leadingPunct).toBe('')
    expect(result.core).toBe('world')
    expect(result.trailingPunct).toBe('!')
  })

  it('strips both leading and trailing punctuation', () => {
    const result = stripPunctuation('"Hello,"')
    expect(result.leadingPunct).toBe('"')
    expect(result.core).toBe('Hello')
    expect(result.trailingPunct).toBe(',"')
  })

  it('handles words without punctuation', () => {
    const result = stripPunctuation('hello')
    expect(result.leadingPunct).toBe('')
    expect(result.core).toBe('hello')
    expect(result.trailingPunct).toBe('')
  })

  it('handles multiple punctuation marks', () => {
    const result = stripPunctuation('...wait...')
    expect(result.leadingPunct).toBe('...')
    expect(result.core).toBe('wait')
    expect(result.trailingPunct).toBe('...')
  })
})

describe('getOrpLetter', () => {
  it('splits word correctly at ORP position', () => {
    const result = getOrpLetter('hello', 1)
    expect(result.left).toBe('h')
    expect(result.orp).toBe('e')
    expect(result.right).toBe('llo')
  })

  it('handles punctuation correctly', () => {
    const result = getOrpLetter('"Hello,"', 1)
    expect(result.left).toBe('"H')
    expect(result.orp).toBe('e')
    expect(result.right).toBe('llo,"')
  })

  it('handles single character words', () => {
    const result = getOrpLetter('I', 0)
    expect(result.left).toBe('')
    expect(result.orp).toBe('I')
    expect(result.right).toBe('')
  })

  it('handles empty string', () => {
    const result = getOrpLetter('', 0)
    expect(result.left).toBe('')
    expect(result.orp).toBe('')
    expect(result.right).toBe('')
  })

  it('clamps ORP index to word length', () => {
    const result = getOrpLetter('hi', 5)
    expect(result.left).toBe('h')
    expect(result.orp).toBe('i')
    expect(result.right).toBe('')
  })
})
