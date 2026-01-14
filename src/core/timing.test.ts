import { describe, it, expect } from 'vitest'
import { 
  getBaseIntervalMs, 
  getPunctuationMultiplier, 
  calculateDelayMs,
  PUNCTUATION_MULTIPLIERS 
} from './timing'

describe('getBaseIntervalMs', () => {
  it('calculates correct interval for 60 WPM', () => {
    expect(getBaseIntervalMs(60)).toBe(1000)
  })

  it('calculates correct interval for 300 WPM', () => {
    expect(getBaseIntervalMs(300)).toBe(200)
  })

  it('calculates correct interval for 600 WPM', () => {
    expect(getBaseIntervalMs(600)).toBe(100)
  })
})

describe('getPunctuationMultiplier', () => {
  it('returns 1.0 for words without punctuation', () => {
    expect(getPunctuationMultiplier('hello', false)).toBe(1.0)
  })

  it('returns comma multiplier for comma', () => {
    expect(getPunctuationMultiplier('hello,', false)).toBe(PUNCTUATION_MULTIPLIERS.comma)
  })

  it('returns semicolon multiplier for semicolon', () => {
    expect(getPunctuationMultiplier('hello;', false)).toBe(PUNCTUATION_MULTIPLIERS.semicolon)
  })

  it('returns period multiplier for period', () => {
    expect(getPunctuationMultiplier('hello.', false)).toBe(PUNCTUATION_MULTIPLIERS.period)
  })

  it('returns question multiplier for question mark', () => {
    expect(getPunctuationMultiplier('hello?', false)).toBe(PUNCTUATION_MULTIPLIERS.question)
  })

  it('returns exclamation multiplier for exclamation mark', () => {
    expect(getPunctuationMultiplier('hello!', false)).toBe(PUNCTUATION_MULTIPLIERS.exclamation)
  })

  it('returns paragraph multiplier for breaks', () => {
    expect(getPunctuationMultiplier('', true)).toBe(PUNCTUATION_MULTIPLIERS.paragraph)
  })
})

describe('calculateDelayMs', () => {
  it('returns base delay when punctuation pause is disabled', () => {
    expect(calculateDelayMs(300, 'hello.', false, false)).toBe(200)
  })

  it('applies punctuation multiplier when enabled', () => {
    const baseMs = 200
    const expected = Math.round(baseMs * PUNCTUATION_MULTIPLIERS.period)
    expect(calculateDelayMs(300, 'hello.', false, true)).toBe(expected)
  })

  it('applies paragraph multiplier for breaks', () => {
    const baseMs = 200
    const expected = Math.round(baseMs * PUNCTUATION_MULTIPLIERS.paragraph)
    expect(calculateDelayMs(300, '', true, true)).toBe(expected)
  })
})
