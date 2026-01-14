export const PUNCTUATION_MULTIPLIERS = {
  comma: 1.5,
  semicolon: 1.5,
  colon: 1.5,
  period: 2.0,
  question: 2.0,
  exclamation: 2.0,
  paragraph: 2.5,
} as const

export function getBaseIntervalMs(wpm: number): number {
  return 60000 / wpm
}

export function getPunctuationMultiplier(display: string, isBreak: boolean): number {
  if (isBreak) {
    return PUNCTUATION_MULTIPLIERS.paragraph
  }
  
  const lastChar = display.trim().slice(-1)
  
  switch (lastChar) {
    case ',':
      return PUNCTUATION_MULTIPLIERS.comma
    case ';':
      return PUNCTUATION_MULTIPLIERS.semicolon
    case ':':
      return PUNCTUATION_MULTIPLIERS.colon
    case '.':
      return PUNCTUATION_MULTIPLIERS.period
    case '?':
      return PUNCTUATION_MULTIPLIERS.question
    case '!':
      return PUNCTUATION_MULTIPLIERS.exclamation
    default:
      return 1.0
  }
}

export function calculateDelayMs(
  wpm: number,
  display: string,
  isBreak: boolean,
  punctuationPause: boolean
): number {
  const baseMs = getBaseIntervalMs(wpm)
  
  if (!punctuationPause) {
    return baseMs
  }
  
  const multiplier = getPunctuationMultiplier(display, isBreak)
  return Math.round(baseMs * multiplier)
}
