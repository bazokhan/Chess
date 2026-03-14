import { TPiece, TPlayer } from 'types/Chess'

export type EngineMode = 'legacy' | 'bitboard'

export const enum PieceIndex {
  WP = 0,
  WN = 1,
  WB = 2,
  WR = 3,
  WQ = 4,
  WK = 5,
  BP = 6,
  BN = 7,
  BB = 8,
  BR = 9,
  BQ = 10,
  BK = 11
}

export const PIECE_ORDER: TPiece[] = [
  'wp',
  'wn',
  'wb',
  'wr',
  'wq',
  'wk',
  'bp',
  'bn',
  'bb',
  'br',
  'bq',
  'bk'
]

export const PIECE_TO_INDEX: Record<TPiece, PieceIndex> = {
  wp: PieceIndex.WP,
  wn: PieceIndex.WN,
  wb: PieceIndex.WB,
  wr: PieceIndex.WR,
  wq: PieceIndex.WQ,
  wk: PieceIndex.WK,
  bp: PieceIndex.BP,
  bn: PieceIndex.BN,
  bb: PieceIndex.BB,
  br: PieceIndex.BR,
  bq: PieceIndex.BQ,
  bk: PieceIndex.BK
}

export const INDEX_TO_PIECE: Record<number, TPiece> = PIECE_ORDER.reduce(
  (acc, piece, index) => {
    acc[index] = piece
    return acc
  },
  {} as Record<number, TPiece>
)

export const enum MoveFlags {
  None = 0,
  Capture = 1 << 0,
  Promotion = 1 << 1,
  EnPassant = 1 << 2,
  CastleKing = 1 << 3,
  CastleQueen = 1 << 4,
  DoublePawnPush = 1 << 5
}

export const enum CastlingRights {
  WhiteKing = 1 << 0,
  WhiteQueen = 1 << 1,
  BlackKing = 1 << 2,
  BlackQueen = 1 << 3
}

export type BitboardMove = {
  from: number
  to: number
  piece: PieceIndex
  capturedPiece?: PieceIndex
  promotionPiece?: PieceIndex
  flags: MoveFlags
  score?: number
}

export type UndoState = {
  capturedPiece?: PieceIndex
  castlingRights: number
  enPassantSquare: number
  halfmoveClock: number
  fullmoveNumber: number
}

export type BitboardPosition = {
  pieces: bigint[]
  board: number[]
  occupancyWhite: bigint
  occupancyBlack: bigint
  occupancyAll: bigint
  sideToMove: TPlayer
  castlingRights: number
  enPassantSquare: number
  halfmoveClock: number
  fullmoveNumber: number
}

export type SearchMetrics = {
  nodes: number
  ttHits: number
  ttMisses: number
  maxDepthReached: number
  elapsedMs: number
  nps: number
}

export type SearchResult = {
  bestMove: BitboardMove | null
  evaluation: number
  depth: number
  metrics: SearchMetrics
}

