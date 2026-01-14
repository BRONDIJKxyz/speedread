import { Token, ReaderState, ReaderSettings, DEFAULT_SETTINGS } from './types'
import { calculateDelayMs } from './timing'

export interface Scheduler {
  schedule(callback: () => void, delayMs: number): number
  cancel(id: number): void
  now(): number
}

export const browserScheduler: Scheduler = {
  schedule: (callback, delayMs) => window.setTimeout(callback, delayMs),
  cancel: (id) => window.clearTimeout(id),
  now: () => performance.now(),
}

export interface ReaderEngineState {
  tokens: Token[]
  currentIndex: number
  state: ReaderState
  settings: ReaderSettings
  pausedAt: number | null
}

export type ReaderEngineListener = (state: ReaderEngineState) => void

export class ReaderEngine {
  private tokens: Token[] = []
  private currentIndex = 0
  private state: ReaderState = 'idle'
  private settings: ReaderSettings = { ...DEFAULT_SETTINGS }
  private scheduler: Scheduler
  private timerId: number | null = null
  private listeners: Set<ReaderEngineListener> = new Set()
  private pausedAt: number | null = null
  private wasPlayingBeforePause = false

  constructor(scheduler: Scheduler = browserScheduler) {
    this.scheduler = scheduler
  }

  loadTokens(tokens: Token[], startIndex = 0): void {
    this.stop()
    this.tokens = tokens
    this.currentIndex = Math.max(0, Math.min(startIndex, tokens.length - 1))
    this.state = 'idle'
    this.notify()
  }

  getState(): ReaderEngineState {
    return {
      tokens: this.tokens,
      currentIndex: this.currentIndex,
      state: this.state,
      settings: { ...this.settings },
      pausedAt: this.pausedAt,
    }
  }

  subscribe(listener: ReaderEngineListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    const state = this.getState()
    this.listeners.forEach(listener => listener(state))
  }

  updateSettings(partial: Partial<ReaderSettings>): void {
    this.settings = { ...this.settings, ...partial }
    this.notify()
  }

  play(): void {
    if (this.tokens.length === 0) return
    if (this.state === 'playing') return
    
    if (this.state === 'paused' && this.settings.softRewind) {
      const rewindAmount = this.settings.softRewindWords
      this.currentIndex = Math.max(0, this.currentIndex - rewindAmount)
    }
    
    this.state = 'playing'
    this.pausedAt = null
    this.scheduleNext()
    this.notify()
  }

  pause(): void {
    if (this.state !== 'playing') return
    
    this.cancelScheduled()
    this.state = 'paused'
    this.pausedAt = this.currentIndex
    this.notify()
  }

  stop(): void {
    this.cancelScheduled()
    this.state = 'idle'
    this.pausedAt = null
    this.notify()
  }

  togglePlayPause(): void {
    if (this.state === 'playing') {
      this.pause()
    } else {
      this.play()
    }
  }

  holdStart(): void {
    if (this.settings.mode !== 'hold-space') return
    this.wasPlayingBeforePause = this.state === 'playing'
    if (this.state !== 'playing') {
      this.play()
    }
  }

  holdEnd(): void {
    if (this.settings.mode !== 'hold-space') return
    if (this.state === 'playing') {
      this.pause()
    }
  }

  stepForward(count = 1): void {
    this.cancelScheduled()
    const wasPlaying = this.state === 'playing'
    this.currentIndex = Math.min(this.tokens.length - 1, this.currentIndex + count)
    this.notify()
    
    if (wasPlaying) {
      this.scheduleNext()
    }
  }

  stepBackward(count = 1): void {
    this.cancelScheduled()
    const wasPlaying = this.state === 'playing'
    this.currentIndex = Math.max(0, this.currentIndex - count)
    this.notify()
    
    if (wasPlaying) {
      this.scheduleNext()
    }
  }

  seekTo(index: number): void {
    this.cancelScheduled()
    const wasPlaying = this.state === 'playing'
    this.currentIndex = Math.max(0, Math.min(index, this.tokens.length - 1))
    this.notify()
    
    if (wasPlaying) {
      this.scheduleNext()
    }
  }

  adjustWpm(delta: number): void {
    const newWpm = Math.max(50, Math.min(1000, this.settings.wpm + delta))
    this.updateSettings({ wpm: newWpm })
  }

  private scheduleNext(): void {
    if (this.state !== 'playing') return
    if (this.currentIndex >= this.tokens.length - 1) {
      this.state = 'paused'
      this.notify()
      return
    }

    const token = this.tokens[this.currentIndex]
    const delayMs = calculateDelayMs(
      this.settings.wpm,
      token.display,
      token.type === 'break',
      this.settings.punctuationPause
    )

    this.timerId = this.scheduler.schedule(() => {
      this.currentIndex++
      this.notify()
      this.scheduleNext()
    }, delayMs)
  }

  private cancelScheduled(): void {
    if (this.timerId !== null) {
      this.scheduler.cancel(this.timerId)
      this.timerId = null
    }
  }

  destroy(): void {
    this.cancelScheduled()
    this.listeners.clear()
  }
}
