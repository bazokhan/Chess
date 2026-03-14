import { calculateBestMoveV2 } from 'controller/chess/calculateBestMoveV2'
import { endSpan, recordTelemetryStep, startSpan } from 'controller/chess/telemetry'
import { TCell, TPlayer, TreeItem } from 'types/Chess'
import {
  createBitboardPositionFromCells,
  createFenMove,
  indexToSquare,
  inferMovedCell
} from './bitboard/position'
import { searchBestMove } from './bitboard/search'
import { EngineMode } from './bitboard/types'

export type EngineBestMoveInput = {
  turn: TPlayer
  position: TCell[]
  depth?: number
  timeMs?: number
  mode?: EngineMode
  telemetry?: {
    enabled?: boolean
    traceId?: string
    parentSpanId?: number
  }
}

export type EngineBestMoveResult = (TreeItem & { evaluation: number }) | null

const LEGACY_DEPTH = 3
const LEGACY_TIME_MS = 3000

const buildFallbackCell = (turn: TPlayer, fromSquare: string): TCell => ({
  piece: (turn === 'w' ? 'wp' : 'bp'),
  square: fromSquare as TCell['square']
})

export const getBestMoveEngine = ({
  turn,
  position,
  depth = 3,
  timeMs = 1500,
  mode = 'bitboard',
  telemetry
}: EngineBestMoveInput): EngineBestMoveResult => {
  if (mode === 'legacy') {
    const span = telemetry?.enabled
      ? startSpan(
          'engine.legacy.bestMove',
          { turn, depth: LEGACY_DEPTH },
          {
            traceId: telemetry.traceId,
            parentSpanId: telemetry.parentSpanId,
            depth: 2
          }
        )
      : null
    const result = calculateBestMoveV2({
      turn,
      position,
      depth: LEGACY_DEPTH,
      time: LEGACY_TIME_MS,
      minimaxVersion: 2
    }) as EngineBestMoveResult
    endSpan(span)
    return result
  }

  const searchSpan = telemetry?.enabled
    ? startSpan(
        'engine.bitboard.search',
        { turn, depth, timeMs },
        {
          traceId: telemetry.traceId,
          parentSpanId: telemetry.parentSpanId,
          depth: 2
        }
      )
    : null

  const bbPosition = createBitboardPositionFromCells(position, turn)
  const result = searchBestMove(bbPosition, {
    maxDepth: depth,
    timeMs
  })
  endSpan(searchSpan)

  recordTelemetryStep('engine.bitboard.metrics', result.metrics.elapsedMs, {
    traceId: telemetry?.traceId,
    parentSpanId: searchSpan?.spanId,
    depth: 2,
    mode: 'bitboard',
    nodes: result.metrics.nodes,
    ttHits: result.metrics.ttHits,
    ttMisses: result.metrics.ttMisses,
    ttHitRate:
      result.metrics.ttHits + result.metrics.ttMisses > 0
        ? Number(
            (
              (result.metrics.ttHits /
                (result.metrics.ttHits + result.metrics.ttMisses)) *
              100
            ).toFixed(2)
          )
        : 0,
    depthReached: result.depth,
    nps: result.metrics.nps
  })

  const move = result.bestMove
  if (!move) return null

  const fromSquare = indexToSquare(move.from)
  const toSquare = indexToSquare(move.to)
  const existingPiece = inferMovedCell(position, move.from)
  const piece = existingPiece ?? buildFallbackCell(turn, fromSquare)
  return {
    piece,
    move: toSquare,
    turn,
    evaluation: result.evaluation,
    next: [],
    position: [],
    fenMove: createFenMove(move)
  } as unknown as EngineBestMoveResult
}

