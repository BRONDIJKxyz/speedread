import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReaderEngine, Scheduler } from './readerEngine'
import { tokenize } from './tokenizer'

function createMockScheduler(): Scheduler & { 
  callbacks: Map<number, () => void>
  tick: (id: number) => void 
} {
  let nextId = 1
  const callbacks = new Map<number, () => void>()
  
  return {
    callbacks,
    schedule: (callback, _delayMs) => {
      const id = nextId++
      callbacks.set(id, callback)
      return id
    },
    cancel: (id) => {
      callbacks.delete(id)
    },
    now: () => Date.now(),
    tick: (id) => {
      const callback = callbacks.get(id)
      if (callback) {
        callbacks.delete(id)
        callback()
      }
    },
  }
}

describe('ReaderEngine', () => {
  let engine: ReaderEngine
  let scheduler: ReturnType<typeof createMockScheduler>
  
  beforeEach(() => {
    scheduler = createMockScheduler()
    engine = new ReaderEngine(scheduler)
  })
  
  describe('loadTokens', () => {
    it('loads tokens and sets initial state', () => {
      const { tokens } = tokenize('Hello world test')
      engine.loadTokens(tokens)
      
      const state = engine.getState()
      expect(state.tokens).toHaveLength(3)
      expect(state.currentIndex).toBe(0)
      expect(state.state).toBe('idle')
    })
    
    it('respects startIndex parameter', () => {
      const { tokens } = tokenize('Hello world test')
      engine.loadTokens(tokens, 1)
      
      expect(engine.getState().currentIndex).toBe(1)
    })
  })
  
  describe('play/pause', () => {
    it('transitions to playing state on play', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.play()
      
      expect(engine.getState().state).toBe('playing')
    })
    
    it('transitions to paused state on pause', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.play()
      engine.pause()
      
      expect(engine.getState().state).toBe('paused')
    })
    
    it('schedules next word on play', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.play()
      
      expect(scheduler.callbacks.size).toBe(1)
    })
    
    it('cancels scheduled callback on pause', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.play()
      engine.pause()
      
      expect(scheduler.callbacks.size).toBe(0)
    })
  })
  
  describe('togglePlayPause', () => {
    it('plays when idle', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.togglePlayPause()
      
      expect(engine.getState().state).toBe('playing')
    })
    
    it('pauses when playing', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.play()
      engine.togglePlayPause()
      
      expect(engine.getState().state).toBe('paused')
    })
    
    it('plays when paused', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.play()
      engine.pause()
      engine.togglePlayPause()
      
      expect(engine.getState().state).toBe('playing')
    })
  })
  
  describe('stepping', () => {
    it('steps forward by 1', () => {
      const { tokens } = tokenize('Hello world test')
      engine.loadTokens(tokens)
      engine.stepForward()
      
      expect(engine.getState().currentIndex).toBe(1)
    })
    
    it('steps backward by 1', () => {
      const { tokens } = tokenize('Hello world test')
      engine.loadTokens(tokens, 2)
      engine.stepBackward()
      
      expect(engine.getState().currentIndex).toBe(1)
    })
    
    it('does not step past end', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens, 1)
      engine.stepForward()
      
      expect(engine.getState().currentIndex).toBe(1)
    })
    
    it('does not step before start', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.stepBackward()
      
      expect(engine.getState().currentIndex).toBe(0)
    })
  })
  
  describe('seeking', () => {
    it('seeks to specific index', () => {
      const { tokens } = tokenize('Hello world test foo bar')
      engine.loadTokens(tokens)
      engine.seekTo(3)
      
      expect(engine.getState().currentIndex).toBe(3)
    })
    
    it('clamps seek to valid range', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.seekTo(100)
      
      expect(engine.getState().currentIndex).toBe(1)
    })
  })
  
  describe('hold-space mode', () => {
    it('starts playing on holdStart in hold-space mode', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.updateSettings({ mode: 'hold-space' })
      engine.holdStart()
      
      expect(engine.getState().state).toBe('playing')
    })
    
    it('pauses on holdEnd in hold-space mode', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.updateSettings({ mode: 'hold-space' })
      engine.holdStart()
      engine.holdEnd()
      
      expect(engine.getState().state).toBe('paused')
    })
    
    it('does nothing in autoplay mode', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.updateSettings({ mode: 'autoplay' })
      engine.holdStart()
      
      expect(engine.getState().state).toBe('idle')
    })
  })
  
  describe('soft rewind', () => {
    it('rewinds on resume when enabled', () => {
      const { tokens } = tokenize('one two three four five six seven eight')
      engine.loadTokens(tokens, 6)
      engine.updateSettings({ softRewind: true, softRewindWords: 3 })
      engine.play()
      engine.pause()
      
      const indexAfterPause = engine.getState().currentIndex
      engine.play()
      
      expect(engine.getState().currentIndex).toBe(indexAfterPause - 3)
    })
    
    it('does not rewind below 0', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens, 1)
      engine.updateSettings({ softRewind: true, softRewindWords: 5 })
      engine.play()
      engine.pause()
      engine.play()
      
      expect(engine.getState().currentIndex).toBe(0)
    })
  })
  
  describe('WPM adjustment', () => {
    it('adjusts WPM up', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.adjustWpm(50)
      
      expect(engine.getState().settings.wpm).toBe(350)
    })
    
    it('adjusts WPM down', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.adjustWpm(-50)
      
      expect(engine.getState().settings.wpm).toBe(250)
    })
    
    it('clamps WPM to min', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.adjustWpm(-1000)
      
      expect(engine.getState().settings.wpm).toBe(50)
    })
    
    it('clamps WPM to max', () => {
      const { tokens } = tokenize('Hello world')
      engine.loadTokens(tokens)
      engine.adjustWpm(1000)
      
      expect(engine.getState().settings.wpm).toBe(1000)
    })
  })
  
  describe('subscription', () => {
    it('notifies listeners on state change', () => {
      const listener = vi.fn()
      const { tokens } = tokenize('Hello world')
      
      engine.subscribe(listener)
      engine.loadTokens(tokens)
      
      expect(listener).toHaveBeenCalled()
    })
    
    it('unsubscribes correctly', () => {
      const listener = vi.fn()
      const { tokens } = tokenize('Hello world')
      
      const unsubscribe = engine.subscribe(listener)
      unsubscribe()
      listener.mockClear()
      
      engine.loadTokens(tokens)
      
      expect(listener).not.toHaveBeenCalled()
    })
  })
})
