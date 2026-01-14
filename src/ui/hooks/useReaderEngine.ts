import { useState, useEffect, useRef, useCallback } from 'react'
import { ReaderEngine, ReaderEngineState, browserScheduler } from '../../core/readerEngine'
import { Token, ReaderSettings, ReadingMode } from '../../core/types'

export function useReaderEngine(tokens: Token[], initialIndex = 0) {
  const engineRef = useRef<ReaderEngine | null>(null)
  const [state, setState] = useState<ReaderEngineState | null>(null)
  
  useEffect(() => {
    const engine = new ReaderEngine(browserScheduler)
    engineRef.current = engine
    
    const unsubscribe = engine.subscribe(setState)
    
    if (tokens.length > 0) {
      engine.loadTokens(tokens, initialIndex)
    }
    
    return () => {
      unsubscribe()
      engine.destroy()
    }
  }, [])
  
  useEffect(() => {
    if (engineRef.current && tokens.length > 0) {
      const currentIndex = state?.currentIndex ?? initialIndex
      engineRef.current.loadTokens(tokens, currentIndex)
    }
  }, [tokens])
  
  const play = useCallback(() => engineRef.current?.play(), [])
  const pause = useCallback(() => engineRef.current?.pause(), [])
  const stop = useCallback(() => engineRef.current?.stop(), [])
  const togglePlayPause = useCallback(() => engineRef.current?.togglePlayPause(), [])
  const holdStart = useCallback(() => engineRef.current?.holdStart(), [])
  const holdEnd = useCallback(() => engineRef.current?.holdEnd(), [])
  const stepForward = useCallback((count = 1) => engineRef.current?.stepForward(count), [])
  const stepBackward = useCallback((count = 1) => engineRef.current?.stepBackward(count), [])
  const seekTo = useCallback((index: number) => engineRef.current?.seekTo(index), [])
  const adjustWpm = useCallback((delta: number) => engineRef.current?.adjustWpm(delta), [])
  
  const updateSettings = useCallback((partial: Partial<ReaderSettings>) => {
    engineRef.current?.updateSettings(partial)
  }, [])
  
  const setWpm = useCallback((wpm: number) => updateSettings({ wpm }), [updateSettings])
  const setMode = useCallback((mode: ReadingMode) => updateSettings({ mode }), [updateSettings])
  const setPunctuationPause = useCallback((enabled: boolean) => updateSettings({ punctuationPause: enabled }), [updateSettings])
  const setSoftRewind = useCallback((enabled: boolean) => updateSettings({ softRewind: enabled }), [updateSettings])
  
  return {
    state,
    play,
    pause,
    stop,
    togglePlayPause,
    holdStart,
    holdEnd,
    stepForward,
    stepBackward,
    seekTo,
    adjustWpm,
    updateSettings,
    setWpm,
    setMode,
    setPunctuationPause,
    setSoftRewind,
  }
}
