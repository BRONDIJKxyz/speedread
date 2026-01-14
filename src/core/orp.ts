export function calculateOrpIndex(coreText: string): number {
  const len = coreText.length
  if (len <= 1) return 0
  if (len <= 5) return 1
  if (len <= 9) return 2
  if (len <= 13) return 3
  return 4
}

export function stripPunctuation(text: string): { core: string; leadingPunct: string; trailingPunct: string } {
  const leadingMatch = text.match(/^[^\p{L}\p{N}]*/u)
  const trailingMatch = text.match(/[^\p{L}\p{N}]*$/u)
  
  const leadingPunct = leadingMatch ? leadingMatch[0] : ''
  const trailingPunct = trailingMatch ? trailingMatch[0] : ''
  
  const core = trailingPunct.length > 0 
    ? text.slice(leadingPunct.length, text.length - trailingPunct.length)
    : text.slice(leadingPunct.length)
  
  return { core: core || text, leadingPunct, trailingPunct }
}

export function getOrpLetter(display: string, orpIndex: number): {
  left: string
  orp: string
  right: string
} {
  if (display.length === 0) {
    return { left: '', orp: '', right: '' }
  }
  
  const { core, leadingPunct, trailingPunct } = stripPunctuation(display)
  
  const safeIndex = Math.min(orpIndex, core.length - 1)
  
  const left = leadingPunct + core.slice(0, safeIndex)
  const orp = core[safeIndex] || ''
  const right = core.slice(safeIndex + 1) + trailingPunct
  
  return { left, orp, right }
}
