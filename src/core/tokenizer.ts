import { v4 as uuidv4 } from 'uuid'
import { Token } from './types'
import { calculateOrpIndex, stripPunctuation } from './orp'

export function normalizeText(rawText: string): string {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\S\n]+/g, ' ')
    .trim()
}

export function tokenize(rawText: string): { fullText: string; tokens: Token[] } {
  const fullText = normalizeText(rawText)
  const tokens: Token[] = []
  
  const paragraphs = fullText.split(/\n\n+/)
  let charOffset = 0
  
  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const paragraph = paragraphs[pIdx]
    const words = paragraph.split(/\s+/).filter(w => w.length > 0)
    
    for (let wIdx = 0; wIdx < words.length; wIdx++) {
      const word = words[wIdx]
      const { core } = stripPunctuation(word)
      const orpIndex = calculateOrpIndex(core)
      
      const charStart = fullText.indexOf(word, charOffset)
      const charEnd = charStart + word.length
      
      tokens.push({
        id: uuidv4(),
        display: word,
        core,
        type: 'word',
        orpIndex,
        charStart,
        charEnd,
      })
      
      charOffset = charEnd
    }
    
    if (pIdx < paragraphs.length - 1) {
      const breakStart = charOffset
      charOffset = fullText.indexOf(paragraphs[pIdx + 1], charOffset)
      
      tokens.push({
        id: uuidv4(),
        display: '¶',
        core: '',
        type: 'break',
        orpIndex: 0,
        charStart: breakStart,
        charEnd: charOffset,
      })
    }
  }
  
  return { fullText, tokens }
}

export function getTokenAtCharOffset(tokens: Token[], charOffset: number): number {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].charStart <= charOffset && charOffset < tokens[i].charEnd) {
      return i
    }
    if (tokens[i].charStart > charOffset) {
      return Math.max(0, i - 1)
    }
  }
  return Math.max(0, tokens.length - 1)
}

export function getWordTokens(tokens: Token[]): Token[] {
  return tokens.filter(t => t.type === 'word')
}
