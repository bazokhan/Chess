import { computeZobristHash } from './hash'
import { evaluate } from './eval'
import { generateLegalMoves, isInCheck } from './movegen'
import { makeMove, unmakeMove } from './position'
import { BitboardMove, BitboardPosition, MoveFlags, SearchResult } from './types'

type TTFlag = 'exact' | 'lower' | 'upper'

type TTEntry = {
  depth: number
  score: number
  flag: TTFlag
  bestMove: BitboardMove | null
}

type SearchOptions = {
  maxDepth: number
  timeMs: number
}

type SearchState = {
  startedAt: number
  stopAt: number
  timedOut: boolean
  nodes: number
  ttHits: number
  ttMisses: number
  maxDepthReached: number
  tt: Map<bigint, TTEntry>
}

const MATE_SCORE = 30000

const scoreMoveOrdering = (move: BitboardMove, ttMove: BitboardMove | null) => {
  if (ttMove && ttMove.from === move.from && ttMove.to === move.to) return 1000000
  let score = 0
  if (move.flags & MoveFlags.Capture) score += 10000
  if (move.flags & MoveFlags.Promotion) score += 9000
  if (move.flags & (MoveFlags.CastleKing | MoveFlags.CastleQueen)) score += 100
  return score + (move.score ?? 0)
}

const orderMoves = (moves: BitboardMove[], ttMove: BitboardMove | null) => {
  return moves
    .map((move) => ({ ...move, score: scoreMoveOrdering(move, ttMove) }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

const negamax = (
  position: BitboardPosition,
  depth: number,
  alpha: number,
  beta: number,
  ply: number,
  state: SearchState
): { score: number; bestMove: BitboardMove | null } => {
  if (state.timedOut) return { score: 0, bestMove: null }
  if (performance.now() >= state.stopAt) {
    state.timedOut = true
    return { score: 0, bestMove: null }
  }

  state.nodes += 1
  state.maxDepthReached = Math.max(state.maxDepthReached, ply)
  const alphaOrig = alpha
  const hash = computeZobristHash(position)
  const ttEntry = state.tt.get(hash)
  if (ttEntry && ttEntry.depth >= depth) {
    state.ttHits += 1
    if (ttEntry.flag === 'exact') return { score: ttEntry.score, bestMove: ttEntry.bestMove }
    if (ttEntry.flag === 'lower') alpha = Math.max(alpha, ttEntry.score)
    if (ttEntry.flag === 'upper') beta = Math.min(beta, ttEntry.score)
    if (alpha >= beta) return { score: ttEntry.score, bestMove: ttEntry.bestMove }
  } else {
    state.ttMisses += 1
  }

  if (depth === 0) {
    const evalScore = evaluate(position)
    const signed = position.sideToMove === 'w' ? evalScore : -evalScore
    return { score: signed, bestMove: null }
  }

  const moves = generateLegalMoves(position)
  if (!moves.length) {
    if (isInCheck(position, position.sideToMove)) {
      return { score: -MATE_SCORE + ply, bestMove: null }
    }
    return { score: 0, bestMove: null }
  }

  const ordered = orderMoves(moves, ttEntry?.bestMove ?? null)
  let bestMove: BitboardMove | null = null
  let bestScore = -Infinity
  for (const move of ordered) {
    const undo = makeMove(position, move)
    const child = negamax(position, depth - 1, -beta, -alpha, ply + 1, state)
    const score = -child.score
    unmakeMove(position, move, undo)

    if (state.timedOut) return { score: bestScore, bestMove }
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
    if (score > alpha) alpha = score
    if (alpha >= beta) break
  }

  let flag: TTFlag = 'exact'
  if (bestScore <= alphaOrig) flag = 'upper'
  else if (bestScore >= beta) flag = 'lower'
  state.tt.set(hash, {
    depth,
    score: bestScore,
    flag,
    bestMove
  })

  return { score: bestScore, bestMove }
}

export const searchBestMove = (
  position: BitboardPosition,
  options: SearchOptions
): SearchResult => {
  const startedAt = performance.now()
  const state: SearchState = {
    startedAt,
    stopAt: startedAt + Math.max(1, options.timeMs),
    timedOut: false,
    nodes: 0,
    ttHits: 0,
    ttMisses: 0,
    maxDepthReached: 0,
    tt: new Map<bigint, TTEntry>()
  }

  let bestMove: BitboardMove | null = null
  let bestScore = 0
  let reachedDepth = 0
  for (let depth = 1; depth <= options.maxDepth; depth += 1) {
    const search = negamax(position, depth, -Infinity, Infinity, 0, state)
    if (state.timedOut) break
    bestMove = search.bestMove
    bestScore = search.score
    reachedDepth = depth
  }

  const elapsedMs = Math.max(1, performance.now() - startedAt)
  return {
    bestMove,
    evaluation: bestScore,
    depth: reachedDepth,
    metrics: {
      nodes: state.nodes,
      ttHits: state.ttHits,
      ttMisses: state.ttMisses,
      maxDepthReached: state.maxDepthReached,
      elapsedMs,
      nps: Math.round((state.nodes * 1000) / elapsedMs)
    }
  }
}

