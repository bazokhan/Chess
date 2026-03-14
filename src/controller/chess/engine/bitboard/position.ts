import { getCoordinates, getSquare } from 'controller/chess/coordinates'
import { parseFenPosition } from 'controller/chess/fen'
import { TCell, TPiece, TPlayer, TSquare } from 'types/Chess'
import {
  BitboardMove,
  BitboardPosition,
  CastlingRights,
  INDEX_TO_PIECE,
  MoveFlags,
  PIECE_TO_INDEX,
  PieceIndex,
  UndoState
} from './types'
import { bitScanForward, sqBit } from './bitops'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const

const clonePieces = (pieces: bigint[]) => pieces.slice(0, 12)
const cloneBoard = (board: number[]) => board.slice(0, 64)

export const squareToIndex = (square: TSquare) => {
  const { x, y } = getCoordinates(square)
  return y * 8 + x
}

export const indexToSquare = (index: number) => {
  const x = index % 8
  const y = Math.floor(index / 8)
  return getSquare({ x, y })
}

const pieceIndexToColor = (piece: PieceIndex): TPlayer =>
  piece <= PieceIndex.WK ? 'w' : 'b'

const createEmptyPosition = (): BitboardPosition => ({
  pieces: Array(12).fill(0n),
  board: Array(64).fill(-1),
  occupancyWhite: 0n,
  occupancyBlack: 0n,
  occupancyAll: 0n,
  sideToMove: 'w',
  castlingRights: 0,
  enPassantSquare: -1,
  halfmoveClock: 0,
  fullmoveNumber: 1
})

const recomputeOccupancy = (position: BitboardPosition) => {
  position.occupancyWhite =
    position.pieces[PieceIndex.WP] |
    position.pieces[PieceIndex.WN] |
    position.pieces[PieceIndex.WB] |
    position.pieces[PieceIndex.WR] |
    position.pieces[PieceIndex.WQ] |
    position.pieces[PieceIndex.WK]
  position.occupancyBlack =
    position.pieces[PieceIndex.BP] |
    position.pieces[PieceIndex.BN] |
    position.pieces[PieceIndex.BB] |
    position.pieces[PieceIndex.BR] |
    position.pieces[PieceIndex.BQ] |
    position.pieces[PieceIndex.BK]
  position.occupancyAll = position.occupancyWhite | position.occupancyBlack
}

const inferCastlingRights = (cells: TCell[]) => {
  let rights = 0
  const map: Partial<Record<TSquare, TCell>> = {}
  for (const cell of cells) {
    map[cell.square] = cell
  }
  if (map.e1?.piece === 'wk' && !map.e1.moved) {
    if (map.h1?.piece === 'wr' && !map.h1.moved) rights |= CastlingRights.WhiteKing
    if (map.a1?.piece === 'wr' && !map.a1.moved) rights |= CastlingRights.WhiteQueen
  }
  if (map.e8?.piece === 'bk' && !map.e8.moved) {
    if (map.h8?.piece === 'br' && !map.h8.moved) rights |= CastlingRights.BlackKing
    if (map.a8?.piece === 'br' && !map.a8.moved) rights |= CastlingRights.BlackQueen
  }
  return rights
}

const parseFenMeta = (fen?: string) => {
  if (!fen) {
    return {
      sideToMove: 'w' as TPlayer,
      castlingRights: 0,
      enPassantSquare: -1,
      halfmoveClock: 0,
      fullmoveNumber: 1
    }
  }
  const parts = fen.trim().split(/\s+/)
  const sideToMove = (parts[1] === 'b' ? 'b' : 'w') as TPlayer
  const castling = parts[2] ?? '-'
  let castlingRights = 0
  if (castling.includes('K')) castlingRights |= CastlingRights.WhiteKing
  if (castling.includes('Q')) castlingRights |= CastlingRights.WhiteQueen
  if (castling.includes('k')) castlingRights |= CastlingRights.BlackKing
  if (castling.includes('q')) castlingRights |= CastlingRights.BlackQueen
  const enPassantSquare =
    parts[3] && parts[3] !== '-' ? squareToIndex(parts[3] as TSquare) : -1
  const halfmoveClock = Number(parts[4] ?? 0)
  const fullmoveNumber = Number(parts[5] ?? 1)
  return {
    sideToMove,
    castlingRights,
    enPassantSquare,
    halfmoveClock,
    fullmoveNumber
  }
}

export const createBitboardPositionFromCells = (
  cells: TCell[],
  turn: TPlayer,
  fen?: string
) => {
  const position = createEmptyPosition()
  const fenMeta = parseFenMeta(fen)
  position.sideToMove = fen ? fenMeta.sideToMove : turn
  position.castlingRights =
    fenMeta.castlingRights || inferCastlingRights(cells)
  position.enPassantSquare = fenMeta.enPassantSquare
  position.halfmoveClock = fenMeta.halfmoveClock
  position.fullmoveNumber = fenMeta.fullmoveNumber

  for (const cell of cells) {
    const pieceIndex = PIECE_TO_INDEX[cell.piece]
    const idx = squareToIndex(cell.square)
    position.pieces[pieceIndex] |= sqBit(idx)
    position.board[idx] = pieceIndex
  }
  recomputeOccupancy(position)
  return position
}

export const createBitboardPositionFromFen = (fen: string) => {
  const cells = parseFenPosition(fen) as TCell[]
  const turn = (fen.split(' ')[1] === 'b' ? 'b' : 'w') as TPlayer
  return createBitboardPositionFromCells(cells, turn, fen)
}

export const bitboardToCells = (position: BitboardPosition): TCell[] => {
  const result: TCell[] = []
  for (let pieceIndex = 0; pieceIndex < 12; pieceIndex += 1) {
    let board = position.pieces[pieceIndex]
    while (board) {
      const lsb = board & -board
      const bitIndex = bitScanForward(lsb)
      result.push({
        piece: INDEX_TO_PIECE[pieceIndex],
        square: indexToSquare(bitIndex)
      })
      board ^= lsb
    }
  }
  return result
}

const clearPieceAt = (position: BitboardPosition, piece: PieceIndex, square: number) => {
  position.pieces[piece] &= ~sqBit(square)
  position.board[square] = -1
}

const setPieceAt = (position: BitboardPosition, piece: PieceIndex, square: number) => {
  position.pieces[piece] |= sqBit(square)
  position.board[square] = piece
}

export const getPieceAt = (position: BitboardPosition, square: number) => {
  const piece = position.board[square]
  return piece >= 0 ? (piece as PieceIndex) : null
}

const updateCastlingRightsOnMove = (
  currentRights: number,
  piece: PieceIndex,
  from: number,
  to: number,
  capturedPiece?: PieceIndex
) => {
  let rights = currentRights
  if (piece === PieceIndex.WK) {
    rights &= ~(CastlingRights.WhiteKing | CastlingRights.WhiteQueen)
  } else if (piece === PieceIndex.BK) {
    rights &= ~(CastlingRights.BlackKing | CastlingRights.BlackQueen)
  } else if (piece === PieceIndex.WR) {
    if (from === squareToIndex('h1')) rights &= ~CastlingRights.WhiteKing
    if (from === squareToIndex('a1')) rights &= ~CastlingRights.WhiteQueen
  } else if (piece === PieceIndex.BR) {
    if (from === squareToIndex('h8')) rights &= ~CastlingRights.BlackKing
    if (from === squareToIndex('a8')) rights &= ~CastlingRights.BlackQueen
  }

  if (capturedPiece === PieceIndex.WR) {
    if (to === squareToIndex('h1')) rights &= ~CastlingRights.WhiteKing
    if (to === squareToIndex('a1')) rights &= ~CastlingRights.WhiteQueen
  } else if (capturedPiece === PieceIndex.BR) {
    if (to === squareToIndex('h8')) rights &= ~CastlingRights.BlackKing
    if (to === squareToIndex('a8')) rights &= ~CastlingRights.BlackQueen
  }
  return rights
}

export const makeMove = (position: BitboardPosition, move: BitboardMove): UndoState => {
  const undo: UndoState = {
    capturedPiece:
      move.flags & MoveFlags.EnPassant
        ? undefined
        : (move.capturedPiece ?? undefined),
    castlingRights: position.castlingRights,
    enPassantSquare: position.enPassantSquare,
    halfmoveClock: position.halfmoveClock,
    fullmoveNumber: position.fullmoveNumber
  }

  const movingSide = pieceIndexToColor(move.piece)
  clearPieceAt(position, move.piece, move.from)

  if (move.flags & MoveFlags.EnPassant) {
    const captureSquare = movingSide === 'w' ? move.to + 8 : move.to - 8
    const captured = getPieceAt(position, captureSquare)
    if (captured !== null) {
      undo.capturedPiece = captured
      clearPieceAt(position, captured, captureSquare)
    }
  } else if (typeof move.capturedPiece === 'number') {
    clearPieceAt(position, move.capturedPiece, move.to)
  }

  if (move.flags & MoveFlags.CastleKing) {
    if (movingSide === 'w') {
      clearPieceAt(position, PieceIndex.WR, squareToIndex('h1'))
      setPieceAt(position, PieceIndex.WR, squareToIndex('f1'))
    } else {
      clearPieceAt(position, PieceIndex.BR, squareToIndex('h8'))
      setPieceAt(position, PieceIndex.BR, squareToIndex('f8'))
    }
  }
  if (move.flags & MoveFlags.CastleQueen) {
    if (movingSide === 'w') {
      clearPieceAt(position, PieceIndex.WR, squareToIndex('a1'))
      setPieceAt(position, PieceIndex.WR, squareToIndex('d1'))
    } else {
      clearPieceAt(position, PieceIndex.BR, squareToIndex('a8'))
      setPieceAt(position, PieceIndex.BR, squareToIndex('d8'))
    }
  }

  const finalPiece = move.promotionPiece ?? move.piece
  setPieceAt(position, finalPiece, move.to)

  position.castlingRights = updateCastlingRightsOnMove(
    position.castlingRights,
    move.piece,
    move.from,
    move.to,
    undo.capturedPiece
  )
  position.enPassantSquare =
    move.flags & MoveFlags.DoublePawnPush
      ? movingSide === 'w'
        ? move.to + 8
        : move.to - 8
      : -1

  const isPawnMove = move.piece === PieceIndex.WP || move.piece === PieceIndex.BP
  const isCapture = Boolean(move.flags & (MoveFlags.Capture | MoveFlags.EnPassant))
  position.halfmoveClock = isPawnMove || isCapture ? 0 : position.halfmoveClock + 1
  if (movingSide === 'b') {
    position.fullmoveNumber += 1
  }
  position.sideToMove = movingSide === 'w' ? 'b' : 'w'
  recomputeOccupancy(position)
  return undo
}

export const unmakeMove = (
  position: BitboardPosition,
  move: BitboardMove,
  undo: UndoState
) => {
  const movedSide = move.piece <= PieceIndex.WK ? 'w' : 'b'
  const restoredSide = movedSide
  position.sideToMove = restoredSide
  position.castlingRights = undo.castlingRights
  position.enPassantSquare = undo.enPassantSquare
  position.halfmoveClock = undo.halfmoveClock
  position.fullmoveNumber = undo.fullmoveNumber

  const placedPiece = move.promotionPiece ?? move.piece
  clearPieceAt(position, placedPiece, move.to)
  setPieceAt(position, move.piece, move.from)

  if (move.flags & MoveFlags.CastleKing) {
    if (restoredSide === 'w') {
      clearPieceAt(position, PieceIndex.WR, squareToIndex('f1'))
      setPieceAt(position, PieceIndex.WR, squareToIndex('h1'))
    } else {
      clearPieceAt(position, PieceIndex.BR, squareToIndex('f8'))
      setPieceAt(position, PieceIndex.BR, squareToIndex('h8'))
    }
  }
  if (move.flags & MoveFlags.CastleQueen) {
    if (restoredSide === 'w') {
      clearPieceAt(position, PieceIndex.WR, squareToIndex('d1'))
      setPieceAt(position, PieceIndex.WR, squareToIndex('a1'))
    } else {
      clearPieceAt(position, PieceIndex.BR, squareToIndex('d8'))
      setPieceAt(position, PieceIndex.BR, squareToIndex('a8'))
    }
  }

  if (typeof undo.capturedPiece === 'number') {
    if (move.flags & MoveFlags.EnPassant) {
      const captureSquare = restoredSide === 'w' ? move.to + 8 : move.to - 8
      setPieceAt(position, undo.capturedPiece, captureSquare)
    } else {
      setPieceAt(position, undo.capturedPiece, move.to)
    }
  }
  recomputeOccupancy(position)
}

export const clonePosition = (position: BitboardPosition): BitboardPosition => ({
  ...position,
  pieces: clonePieces(position.pieces),
  board: cloneBoard(position.board)
})

export const createFenMove = (move: BitboardMove) => {
  const from = indexToSquare(move.from)
  const to = indexToSquare(move.to)
  const promotion = move.promotionPiece
    ? INDEX_TO_PIECE[move.promotionPiece][1]
    : ''
  return `${from}${to}${promotion}`
}

export const inferMovedCell = (cells: TCell[], squareIndex: number): TCell | null => {
  const square = indexToSquare(squareIndex)
  const found = cells.find((cell) => cell.square === square)
  return found ?? null
}

export const boardLabel = (index: number) => {
  const file = FILES[index % 8]
  const rank = 8 - Math.floor(index / 8)
  return `${file}${rank}`
}

