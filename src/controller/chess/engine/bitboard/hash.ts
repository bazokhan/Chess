import { BitboardPosition } from './types'
import { iterateBits } from './bitops'

const PIECE_KEYS: bigint[][] = Array.from({ length: 12 }, () =>
  Array(64).fill(0n)
)
const CASTLING_KEYS: bigint[] = Array(16).fill(0n)
const EN_PASSANT_FILE_KEYS: bigint[] = Array(8).fill(0n)
let SIDE_TO_MOVE_KEY = 0n

let seed = 0x9e3779b97f4a7c15n
const MASK_64 = (1n << 64n) - 1n

const nextRand64 = () => {
  seed ^= (seed << 13n) & MASK_64
  seed ^= seed >> 7n
  seed ^= (seed << 17n) & MASK_64
  return seed & MASK_64
}

for (let p = 0; p < 12; p += 1) {
  for (let sq = 0; sq < 64; sq += 1) {
    PIECE_KEYS[p][sq] = nextRand64()
  }
}
for (let i = 0; i < CASTLING_KEYS.length; i += 1) {
  CASTLING_KEYS[i] = nextRand64()
}
for (let i = 0; i < EN_PASSANT_FILE_KEYS.length; i += 1) {
  EN_PASSANT_FILE_KEYS[i] = nextRand64()
}
SIDE_TO_MOVE_KEY = nextRand64()

export const computeZobristHash = (position: BitboardPosition) => {
  let hash = 0n
  for (let pieceIndex = 0; pieceIndex < 12; pieceIndex += 1) {
    iterateBits(position.pieces[pieceIndex], (square) => {
      hash ^= PIECE_KEYS[pieceIndex][square]
    })
  }
  hash ^= CASTLING_KEYS[position.castlingRights & 0b1111]
  if (position.enPassantSquare >= 0) {
    hash ^= EN_PASSANT_FILE_KEYS[position.enPassantSquare % 8]
  }
  if (position.sideToMove === 'b') {
    hash ^= SIDE_TO_MOVE_KEY
  }
  return hash
}

