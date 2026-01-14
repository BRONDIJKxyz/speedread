import { useRef, useCallback, useMemo } from 'react'

const measurementCache = new Map<string, number>()

export function useTextMeasure(fontFamily: string, fontSize: number, fontWeight: number = 400) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  const getCanvas = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }
    return canvasRef.current
  }, [])
  
  const fontString = useMemo(() => `${fontWeight} ${fontSize}px ${fontFamily}`, [fontFamily, fontSize, fontWeight])
  
  const measureText = useCallback((text: string): number => {
    const cacheKey = `${fontString}:${text}`
    
    if (measurementCache.has(cacheKey)) {
      return measurementCache.get(cacheKey)!
    }
    
    const canvas = getCanvas()
    const ctx = canvas.getContext('2d')
    if (!ctx) return 0
    
    ctx.font = fontString
    const width = ctx.measureText(text).width
    
    measurementCache.set(cacheKey, width)
    return width
  }, [fontString, getCanvas])
  
  return { measureText }
}

export function clearMeasurementCache(): void {
  measurementCache.clear()
}
