export type TelemetrySeverity = 'fast' | 'warn' | 'slow'

export type TelemetryEvent = {
  id: number
  name: string
  timestamp: number
  durationMs: number
  severity: TelemetrySeverity
  type: 'span' | 'step'
  meta?: Record<string, string | number | boolean | null | undefined>
}

export type TelemetrySpan = {
  name: string
  startTime: number
  type: 'span'
  meta?: TelemetryEvent['meta']
} | null

const MAX_EVENTS = 400
const WARN_MS = 30
const SLOW_MS = 80

let enabled = true
let paused = false
let nextId = 1
let events: TelemetryEvent[] = []
const listeners = new Set<(events: TelemetryEvent[]) => void>()

const emit = () => {
  const snapshot = [...events]
  listeners.forEach((listener) => listener(snapshot))
}

export const getTelemetrySeverity = (durationMs: number): TelemetrySeverity => {
  if (durationMs > SLOW_MS) return 'slow'
  if (durationMs > WARN_MS) return 'warn'
  return 'fast'
}

export const setTelemetryEnabled = (value: boolean) => {
  enabled = value
}

export const getTelemetryEnabled = () => enabled

export const setTelemetryPaused = (value: boolean) => {
  paused = value
}

export const getTelemetryPaused = () => paused

export const clearTelemetryEvents = () => {
  events = []
  emit()
}

export const getTelemetryEvents = () => [...events]

export const subscribeTelemetry = (listener: (events: TelemetryEvent[]) => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const pushEvent = (event: Omit<TelemetryEvent, 'id' | 'severity'>) => {
  if (!enabled || paused) return
  const nextEvent: TelemetryEvent = {
    ...event,
    id: nextId++,
    severity: getTelemetrySeverity(event.durationMs)
  }
  events = [nextEvent, ...events].slice(0, MAX_EVENTS)
  emit()
}

export const recordTelemetryStep = (
  name: string,
  durationMs: number,
  meta?: TelemetryEvent['meta']
) => {
  pushEvent({
    type: 'step',
    name,
    durationMs,
    timestamp: Date.now(),
    meta
  })
}

export const startSpan = (
  name: string,
  meta?: TelemetryEvent['meta']
): TelemetrySpan => {
  if (!enabled || paused) return null
  return {
    name,
    meta,
    type: 'span',
    startTime: performance.now()
  }
}

export const endSpan = (span: TelemetrySpan) => {
  if (!span) return 0
  const durationMs = performance.now() - span.startTime
  pushEvent({
    type: span.type,
    name: span.name,
    durationMs,
    timestamp: Date.now(),
    meta: span.meta
  })
  return durationMs
}

