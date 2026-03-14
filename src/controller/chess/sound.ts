import { loadBoardPreferences } from './boardPreferences'

type SoundKind = 'move' | 'capture' | 'check' | 'castle' | 'promotion'

const FREQUENCIES: Record<SoundKind, number> = {
  move: 440,
  capture: 300,
  check: 560,
  castle: 500,
  promotion: 640
}

let sharedContext: AudioContext | null = null

const getAudioContext = () => {
  if (typeof window === 'undefined') return null
  if (sharedContext) return sharedContext
  const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  sharedContext = new Ctx()
  return sharedContext
}

export const playMoveSound = (kind: SoundKind) => {
  const prefs = loadBoardPreferences()
  if (!prefs.moveSounds) return
  const ctx = getAudioContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = kind === 'capture' ? 'square' : 'triangle'
  osc.frequency.value = FREQUENCIES[kind]
  gain.gain.value = 0.001
  osc.connect(gain)
  gain.connect(ctx.destination)
  const now = ctx.currentTime
  gain.gain.exponentialRampToValueAtTime(0.07, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11)
  osc.start(now)
  osc.stop(now + 0.12)
}

