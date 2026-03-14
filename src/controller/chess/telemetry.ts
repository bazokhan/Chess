export type TelemetrySeverity = 'fast' | 'warn' | 'slow'

export type TelemetryEvent = {
  id: number
  spanId: number | null
  name: string
  timestamp: number
  durationMs: number
  severity: TelemetrySeverity
  type: 'span' | 'step'
  meta?: Record<string, string | number | boolean | null | undefined>
}

export type TelemetrySpan = {
  spanId: number
  traceId: string | null
  parentSpanId: number | null
  depth: number | null
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
let nextSpanId = 1
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
  meta?: TelemetryEvent['meta'] & {
    traceId?: string
    parentSpanId?: number
    depth?: number
  }
) => {
  pushEvent({
    spanId: null,
    type: 'step',
    name,
    durationMs,
    timestamp: Date.now(),
    meta
  })
}

export const startSpan = (
  name: string,
  meta?: TelemetryEvent['meta'],
  options?: {
    traceId?: string
    parentSpanId?: number
    depth?: number
  }
): TelemetrySpan => {
  if (!enabled || paused) return null
  const spanId = nextSpanId++
  return {
    spanId,
    traceId: options?.traceId ?? null,
    parentSpanId: options?.parentSpanId ?? null,
    depth: options?.depth ?? null,
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
    spanId: span.spanId,
    type: span.type,
    name: span.name,
    durationMs,
    timestamp: Date.now(),
    meta: {
      ...span.meta,
      traceId: span.traceId ?? undefined,
      parentSpanId: span.parentSpanId ?? undefined,
      depth: span.depth ?? undefined
    }
  })
  return durationMs
}

export const createTraceId = (prefix = 'trace') => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

export const formatTelemetryEventsText = (inputEvents: TelemetryEvent[]) => {
  const ordered = [...inputEvents].sort((a, b) => a.timestamp - b.timestamp)
  return ordered
    .map((event) => {
      const traceId = event.meta?.traceId
      const depth = event.meta?.depth
      const parentSpanId = event.meta?.parentSpanId
      const metaWithoutHierarchy: Record<string, unknown> = { ...(event.meta ?? {}) }
      delete metaWithoutHierarchy.traceId
      delete metaWithoutHierarchy.depth
      delete metaWithoutHierarchy.parentSpanId
      return [
        `[${new Date(event.timestamp).toLocaleTimeString()}]`,
        `type=${event.type}`,
        `name=${event.name}`,
        `duration=${event.durationMs.toFixed(3)}ms`,
        `severity=${event.severity}`,
        traceId ? `trace=${traceId}` : '',
        event.spanId ? `span=${event.spanId}` : '',
        parentSpanId ? `parent=${parentSpanId}` : '',
        typeof depth === 'number' ? `depth=${depth}` : '',
        Object.keys(metaWithoutHierarchy).length
          ? `meta=${JSON.stringify(metaWithoutHierarchy)}`
          : ''
      ]
        .filter(Boolean)
        .join(' ')
    })
    .join('\n')
}

