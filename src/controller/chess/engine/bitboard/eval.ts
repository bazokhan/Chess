import { BitboardPosition, PieceIndex } from './types'
import { iterateBits } from './bitops'

const MATERIAL: Record<PieceIndex, number> = {
  [PieceIndex.WP]: 100,
  [PieceIndex.WN]: 320,
  [PieceIndex.WB]: 330,
  [PieceIndex.WR]: 500,
  [PieceIndex.WQ]: 900,
  [PieceIndex.WK]: 0,
  [PieceIndex.BP]: -100,
  [PieceIndex.BN]: -320,
  [PieceIndex.BB]: -330,
  [PieceIndex.BR]: -500,
  [PieceIndex.BQ]: -900,
  [PieceIndex.BK]: 0
}

const PAWN_PST = [
  0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 35, 35, 30, 30, 30, 10, 10, 15, 25, 25,
  15, 10, 10, 5, 5, 10, 20, 20, 10, 5, 5, 0, 0, 0, 15, 15, 0, 0, 0, 5, -5, -10,
  0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0
]
const KNIGHT_PST = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 5, 5, 0, -20, -40, -30,
  5, 10, 15, 15, 10, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 15, 20, 20,
  15, 5, -30, -30, 0, 10, 15, 15, 10, 0, -30, -40, -20, 0, 0, 0, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50
]
const BISHOP_PST = [
  -20, -10, -10, -10, -10, -10, -10, -20, -10, 5, 0, 0, 0, 0, 5, -10, -10, 10,
  10, 10, 10, 10, 10, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 5, 5, 10, 10, 5,
  5, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -20, -10,
  -10, -10, -10, -10, -10, -20
]
const ROOK_PST = [
  0, 0, 0, 10, 10, 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5,
  5, 10, 10, 10, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0
]
const QUEEN_PST = [
  -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5,
  5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5,
  5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10,
  -20
]

const PST: Record<number, number[]> = {
  [PieceIndex.WP]: PAWN_PST,
  [PieceIndex.WN]: KNIGHT_PST,
  [PieceIndex.WB]: BISHOP_PST,
  [PieceIndex.WR]: ROOK_PST,
  [PieceIndex.WQ]: QUEEN_PST,
  [PieceIndex.BP]: PAWN_PST,
  [PieceIndex.BN]: KNIGHT_PST,
  [PieceIndex.BB]: BISHOP_PST,
  [PieceIndex.BR]: ROOK_PST,
  [PieceIndex.BQ]: QUEEN_PST
}

const mirrorSquare = (square: number) => {
  const x = square % 8
  const y = Math.floor(square / 8)
  return (7 - y) * 8 + x
}

export const evaluate = (position: BitboardPosition) => {
  let score = 0
  for (let piece = PieceIndex.WP; piece <= PieceIndex.BK; piece += 1) {
    iterateBits(position.pieces[piece], (square) => {
      score += MATERIAL[piece]
      const pstTable = PST[piece]
      if (!pstTable) return
      if (piece <= PieceIndex.WK) {
        score += pstTable[mirrorSquare(square)] ?? 0
      } else {
        score -= pstTable[square] ?? 0
      }
    })
  }
  return score
}

