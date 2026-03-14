import { initialPosition } from 'data/normalInitialPosition'
import { parseFenPosition } from 'controller/chess/fen'
import { getMoves } from 'controller/chess/moves'
import { calculateBestMoveV2 } from 'controller/chess/calculateBestMoveV2'
import { hash } from 'controller/chess/position'
import { createBitboardPositionFromCells } from './position'
import { generateLegalMoves } from './movegen'
import { getBestMoveEngine } from '../getBestMoveEngine'
import { TCell, TPlayer } from 'types/Chess'

const toUciLike = (legacyMove: string) => legacyMove.slice(2, 6)
const toSet = (values: string[]) => new Set(values)

const compareMoveSets = (fen: string, turn: TPlayer) => {
  const cells = parseFenPosition(fen) as TCell[]
  const legacyMoves = getMoves(turn, hash(cells), true)
  const bitboardMoves = generateLegalMoves(createBitboardPositionFromCells(cells, turn, fen)).map(
    (m) => `${String.fromCharCode(97 + (m.from % 8))}${8 - Math.floor(m.from / 8)}${String.fromCharCode(97 + (m.to % 8))}${8 - Math.floor(m.to / 8)}`
  )
  return {
    legacy: toSet(legacyMoves.map(toUciLike)),
    bitboard: toSet(bitboardMoves)
  }
}

describe('bitboard movegen parity', () => {
  it('matches opening legal move count', () => {
    const pos = createBitboardPositionFromCells(initialPosition, 'w')
    expect(generateLegalMoves(pos).length).toBe(20)
  })

  it('matches legal move sets on deterministic positions', () => {
    const positions: Array<{ fen: string; turn: TPlayer }> = [
      { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1', turn: 'w' },
      { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/1P6/5NP1/P1PPPP1P/RNBQKB1R b KQkq - 0 3', turn: 'b' },
      { fen: '2rq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2N1PN2/PPQ2PPP/2KR1B1R w - - 0 11', turn: 'w' }
    ]

    for (const { fen, turn } of positions) {
      const { legacy, bitboard } = compareMoveSets(fen, turn)
      expect(bitboard.size).toBe(legacy.size)
      legacy.forEach((move) => expect(bitboard.has(move)).toBe(true))
    }
  })
})

describe('bitboard search parity sanity', () => {
  it('returns a legal move for selected positions', () => {
    const fen = 'r1bqkbnr/pppp1ppp/2n5/4p3/1P6/5NP1/P1PPPP1P/RNBQKB1R b KQkq - 0 3'
    const cells = parseFenPosition(fen) as TCell[]
    const bestMove = getBestMoveEngine({
      turn: 'b',
      position: cells,
      depth: 3,
      timeMs: 500,
      mode: 'bitboard'
    })
    expect(bestMove).not.toBeNull()
    const legal = getMoves('b', hash(cells), true).map(toUciLike)
    const best = `${bestMove?.piece.square ?? ''}${bestMove?.move ?? ''}`
    expect(legal.includes(best)).toBe(true)
  })

  it('keeps legacy path available in facade', () => {
    const legacy = calculateBestMoveV2({
      turn: 'w',
      position: initialPosition,
      depth: 2,
      time: 200,
      minimaxVersion: 2
    })
    const facade = getBestMoveEngine({
      turn: 'w',
      position: initialPosition,
      mode: 'legacy'
    })
    expect(Boolean(legacy)).toBe(true)
    expect(Boolean(facade)).toBe(true)
  })
})

