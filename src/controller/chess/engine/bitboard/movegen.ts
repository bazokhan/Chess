import {
  BitboardMove,
  BitboardPosition,
  CastlingRights,
  MoveFlags,
  PieceIndex
} from './types'
import { getPieceAt, makeMove, squareToIndex, unmakeMove } from './position'
import { bitScanForward, iterateBits, sqBit } from './bitops'

const BOARD_SIZE = 64

const KNIGHT_DELTAS = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1]
]
const KING_DELTAS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
]
const BISHOP_DIRS = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1]
]
const ROOK_DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
]

const isValid = (x: number, y: number) => x >= 0 && x < 8 && y >= 0 && y < 8
const indexToXY = (index: number) => ({ x: index % 8, y: Math.floor(index / 8) })
const xyToIndex = (x: number, y: number) => y * 8 + x

const KNIGHT_ATTACKS: bigint[] = Array(BOARD_SIZE).fill(0n)
const KING_ATTACKS: bigint[] = Array(BOARD_SIZE).fill(0n)
const PAWN_ATTACKS_WHITE: bigint[] = Array(BOARD_SIZE).fill(0n)
const PAWN_ATTACKS_BLACK: bigint[] = Array(BOARD_SIZE).fill(0n)

for (let sq = 0; sq < BOARD_SIZE; sq += 1) {
  const { x, y } = indexToXY(sq)
  let knightMask = 0n
  for (const [dx, dy] of KNIGHT_DELTAS) {
    const nx = x + dx
    const ny = y + dy
    if (isValid(nx, ny)) knightMask |= sqBit(xyToIndex(nx, ny))
  }
  KNIGHT_ATTACKS[sq] = knightMask

  let kingMask = 0n
  for (const [dx, dy] of KING_DELTAS) {
    const nx = x + dx
    const ny = y + dy
    if (isValid(nx, ny)) kingMask |= sqBit(xyToIndex(nx, ny))
  }
  KING_ATTACKS[sq] = kingMask

  let whitePawnMask = 0n
  if (isValid(x - 1, y - 1)) whitePawnMask |= sqBit(xyToIndex(x - 1, y - 1))
  if (isValid(x + 1, y - 1)) whitePawnMask |= sqBit(xyToIndex(x + 1, y - 1))
  PAWN_ATTACKS_WHITE[sq] = whitePawnMask

  let blackPawnMask = 0n
  if (isValid(x - 1, y + 1)) blackPawnMask |= sqBit(xyToIndex(x - 1, y + 1))
  if (isValid(x + 1, y + 1)) blackPawnMask |= sqBit(xyToIndex(x + 1, y + 1))
  PAWN_ATTACKS_BLACK[sq] = blackPawnMask
}

const getColorOccupancy = (position: BitboardPosition, side: 'w' | 'b') =>
  side === 'w' ? position.occupancyWhite : position.occupancyBlack

const isSameSide = (piece: PieceIndex | null, side: 'w' | 'b') => {
  if (piece === null) return false
  return side === 'w' ? piece <= PieceIndex.WK : piece >= PieceIndex.BP
}

const isEnemy = (piece: PieceIndex | null, side: 'w' | 'b') => {
  if (piece === null) return false
  return !isSameSide(piece, side)
}

const pushMove = (
  moves: BitboardMove[],
  move: Omit<BitboardMove, 'flags'> & { flags?: MoveFlags }
) => {
  moves.push({
    ...move,
    flags: move.flags ?? MoveFlags.None
  })
}

const slidingAttacks = (
  position: BitboardPosition,
  from: number,
  dirs: number[][]
): bigint => {
  const { x, y } = indexToXY(from)
  let attacks = 0n
  for (const [dx, dy] of dirs) {
    let nx = x + dx
    let ny = y + dy
    while (isValid(nx, ny)) {
      const sq = xyToIndex(nx, ny)
      attacks |= sqBit(sq)
      if ((position.occupancyAll & sqBit(sq)) !== 0n) break
      nx += dx
      ny += dy
    }
  }
  return attacks
}

const getKingSquare = (position: BitboardPosition, side: 'w' | 'b') => {
  const kingBoard =
    side === 'w' ? position.pieces[PieceIndex.WK] : position.pieces[PieceIndex.BK]
  if (!kingBoard) return -1
  return bitScanForward(kingBoard & -kingBoard)
}

export const isSquareAttacked = (
  position: BitboardPosition,
  square: number,
  bySide: 'w' | 'b'
) => {
  const target = sqBit(square)
  const [pawnBoard, knightBoard, bishopBoard, rookBoard, queenBoard, kingBoard] =
    bySide === 'w'
      ? [
          position.pieces[PieceIndex.WP],
          position.pieces[PieceIndex.WN],
          position.pieces[PieceIndex.WB],
          position.pieces[PieceIndex.WR],
          position.pieces[PieceIndex.WQ],
          position.pieces[PieceIndex.WK]
        ]
      : [
          position.pieces[PieceIndex.BP],
          position.pieces[PieceIndex.BN],
          position.pieces[PieceIndex.BB],
          position.pieces[PieceIndex.BR],
          position.pieces[PieceIndex.BQ],
          position.pieces[PieceIndex.BK]
        ]

  let attacked = false
  iterateBits(pawnBoard, (sq) => {
    if (attacked) return
    const mask = bySide === 'w' ? PAWN_ATTACKS_WHITE[sq] : PAWN_ATTACKS_BLACK[sq]
    if ((mask & target) !== 0n) attacked = true
  })
  if (attacked) return true

  iterateBits(knightBoard, (sq) => {
    if (attacked) return
    if ((KNIGHT_ATTACKS[sq] & target) !== 0n) attacked = true
  })
  if (attacked) return true

  iterateBits(bishopBoard | queenBoard, (sq) => {
    if (attacked) return
    if ((slidingAttacks(position, sq, BISHOP_DIRS) & target) !== 0n) attacked = true
  })
  if (attacked) return true

  iterateBits(rookBoard | queenBoard, (sq) => {
    if (attacked) return
    if ((slidingAttacks(position, sq, ROOK_DIRS) & target) !== 0n) attacked = true
  })
  if (attacked) return true

  iterateBits(kingBoard, (sq) => {
    if (attacked) return
    if ((KING_ATTACKS[sq] & target) !== 0n) attacked = true
  })

  return attacked
}

export const isInCheck = (position: BitboardPosition, side: 'w' | 'b') => {
  const kingSquare = getKingSquare(position, side)
  if (kingSquare < 0) return false
  const enemy = side === 'w' ? 'b' : 'w'
  return isSquareAttacked(position, kingSquare, enemy)
}

export const generatePseudoLegalMoves = (position: BitboardPosition): BitboardMove[] => {
  const side = position.sideToMove
  const moves: BitboardMove[] = []

  const pawn = side === 'w' ? PieceIndex.WP : PieceIndex.BP
  const knight = side === 'w' ? PieceIndex.WN : PieceIndex.BN
  const bishop = side === 'w' ? PieceIndex.WB : PieceIndex.BB
  const rook = side === 'w' ? PieceIndex.WR : PieceIndex.BR
  const queen = side === 'w' ? PieceIndex.WQ : PieceIndex.BQ
  const king = side === 'w' ? PieceIndex.WK : PieceIndex.BK
  const ownOcc = getColorOccupancy(position, side)
  iterateBits(position.pieces[pawn], (from) => {
    const { x, y } = indexToXY(from)
    const direction = side === 'w' ? -1 : 1
    const startRank = side === 'w' ? 6 : 1
    const promotionRank = side === 'w' ? 0 : 7
    const oneY = y + direction

    if (isValid(x, oneY)) {
      const to = xyToIndex(x, oneY)
      if ((position.occupancyAll & sqBit(to)) === 0n) {
        if (oneY === promotionRank) {
          const promotions =
            side === 'w'
              ? [PieceIndex.WQ, PieceIndex.WR, PieceIndex.WB, PieceIndex.WN]
              : [PieceIndex.BQ, PieceIndex.BR, PieceIndex.BB, PieceIndex.BN]
          promotions.forEach((promotionPiece) =>
            pushMove(moves, {
              from,
              to,
              piece: pawn,
              promotionPiece,
              flags: MoveFlags.Promotion
            })
          )
        } else {
          pushMove(moves, { from, to, piece: pawn })
          if (y === startRank) {
            const twoY = y + direction * 2
            const mid = xyToIndex(x, oneY)
            const to2 = xyToIndex(x, twoY)
            if (
              isValid(x, twoY) &&
              (position.occupancyAll & sqBit(mid)) === 0n &&
              (position.occupancyAll & sqBit(to2)) === 0n
            ) {
              pushMove(moves, {
                from,
                to: to2,
                piece: pawn,
                flags: MoveFlags.DoublePawnPush
              })
            }
          }
        }
      }
    }

    const captures = side === 'w' ? PAWN_ATTACKS_WHITE[from] : PAWN_ATTACKS_BLACK[from]
    iterateBits(captures, (to) => {
      const target = getPieceAt(position, to)
      const toRank = Math.floor(to / 8)
      if (isEnemy(target, side)) {
        if (toRank === promotionRank) {
          const promotions =
            side === 'w'
              ? [PieceIndex.WQ, PieceIndex.WR, PieceIndex.WB, PieceIndex.WN]
              : [PieceIndex.BQ, PieceIndex.BR, PieceIndex.BB, PieceIndex.BN]
          promotions.forEach((promotionPiece) =>
            pushMove(moves, {
              from,
              to,
              piece: pawn,
              capturedPiece: target ?? undefined,
              promotionPiece,
              flags: MoveFlags.Promotion | MoveFlags.Capture
            })
          )
        } else {
          pushMove(moves, {
            from,
            to,
            piece: pawn,
            capturedPiece: target ?? undefined,
            flags: MoveFlags.Capture
          })
        }
      } else if (to === position.enPassantSquare) {
        pushMove(moves, {
          from,
          to,
          piece: pawn,
          flags: MoveFlags.EnPassant | MoveFlags.Capture
        })
      }
    })
  })

  iterateBits(position.pieces[knight], (from) => {
    iterateBits(KNIGHT_ATTACKS[from], (to) => {
      if ((ownOcc & sqBit(to)) !== 0n) return
      const target = getPieceAt(position, to)
      pushMove(moves, {
        from,
        to,
        piece: knight,
        capturedPiece: isEnemy(target, side) ? target ?? undefined : undefined,
        flags: isEnemy(target, side) ? MoveFlags.Capture : MoveFlags.None
      })
    })
  })

  iterateBits(position.pieces[bishop], (from) => {
    iterateBits(slidingAttacks(position, from, BISHOP_DIRS), (to) => {
      if ((ownOcc & sqBit(to)) !== 0n) return
      const target = getPieceAt(position, to)
      pushMove(moves, {
        from,
        to,
        piece: bishop,
        capturedPiece: isEnemy(target, side) ? target ?? undefined : undefined,
        flags: isEnemy(target, side) ? MoveFlags.Capture : MoveFlags.None
      })
    })
  })

  iterateBits(position.pieces[rook], (from) => {
    iterateBits(slidingAttacks(position, from, ROOK_DIRS), (to) => {
      if ((ownOcc & sqBit(to)) !== 0n) return
      const target = getPieceAt(position, to)
      pushMove(moves, {
        from,
        to,
        piece: rook,
        capturedPiece: isEnemy(target, side) ? target ?? undefined : undefined,
        flags: isEnemy(target, side) ? MoveFlags.Capture : MoveFlags.None
      })
    })
  })

  iterateBits(position.pieces[queen], (from) => {
    const attacks = slidingAttacks(position, from, BISHOP_DIRS) |
      slidingAttacks(position, from, ROOK_DIRS)
    iterateBits(attacks, (to) => {
      if ((ownOcc & sqBit(to)) !== 0n) return
      const target = getPieceAt(position, to)
      pushMove(moves, {
        from,
        to,
        piece: queen,
        capturedPiece: isEnemy(target, side) ? target ?? undefined : undefined,
        flags: isEnemy(target, side) ? MoveFlags.Capture : MoveFlags.None
      })
    })
  })

  iterateBits(position.pieces[king], (from) => {
    iterateBits(KING_ATTACKS[from], (to) => {
      if ((ownOcc & sqBit(to)) !== 0n) return
      const target = getPieceAt(position, to)
      pushMove(moves, {
        from,
        to,
        piece: king,
        capturedPiece: isEnemy(target, side) ? target ?? undefined : undefined,
        flags: isEnemy(target, side) ? MoveFlags.Capture : MoveFlags.None
      })
    })

    const kingStart = side === 'w' ? squareToIndex('e1') : squareToIndex('e8')
    if (from !== kingStart || isInCheck(position, side)) return
    if (side === 'w') {
      const canCastleKing = Boolean(position.castlingRights & CastlingRights.WhiteKing)
      const canCastleQueen = Boolean(position.castlingRights & CastlingRights.WhiteQueen)
      if (
        canCastleKing &&
        getPieceAt(position, squareToIndex('f1')) === null &&
        getPieceAt(position, squareToIndex('g1')) === null &&
        !isSquareAttacked(position, squareToIndex('f1'), 'b') &&
        !isSquareAttacked(position, squareToIndex('g1'), 'b')
      ) {
        pushMove(moves, {
          from,
          to: squareToIndex('g1'),
          piece: king,
          flags: MoveFlags.CastleKing
        })
      }
      if (
        canCastleQueen &&
        getPieceAt(position, squareToIndex('d1')) === null &&
        getPieceAt(position, squareToIndex('c1')) === null &&
        getPieceAt(position, squareToIndex('b1')) === null &&
        !isSquareAttacked(position, squareToIndex('d1'), 'b') &&
        !isSquareAttacked(position, squareToIndex('c1'), 'b')
      ) {
        pushMove(moves, {
          from,
          to: squareToIndex('c1'),
          piece: king,
          flags: MoveFlags.CastleQueen
        })
      }
    } else {
      const canCastleKing = Boolean(position.castlingRights & CastlingRights.BlackKing)
      const canCastleQueen = Boolean(position.castlingRights & CastlingRights.BlackQueen)
      if (
        canCastleKing &&
        getPieceAt(position, squareToIndex('f8')) === null &&
        getPieceAt(position, squareToIndex('g8')) === null &&
        !isSquareAttacked(position, squareToIndex('f8'), 'w') &&
        !isSquareAttacked(position, squareToIndex('g8'), 'w')
      ) {
        pushMove(moves, {
          from,
          to: squareToIndex('g8'),
          piece: king,
          flags: MoveFlags.CastleKing
        })
      }
      if (
        canCastleQueen &&
        getPieceAt(position, squareToIndex('d8')) === null &&
        getPieceAt(position, squareToIndex('c8')) === null &&
        getPieceAt(position, squareToIndex('b8')) === null &&
        !isSquareAttacked(position, squareToIndex('d8'), 'w') &&
        !isSquareAttacked(position, squareToIndex('c8'), 'w')
      ) {
        pushMove(moves, {
          from,
          to: squareToIndex('c8'),
          piece: king,
          flags: MoveFlags.CastleQueen
        })
      }
    }
  })

  return moves
}

export const generateLegalMoves = (position: BitboardPosition): BitboardMove[] => {
  const side = position.sideToMove
  const candidates = generatePseudoLegalMoves(position)
  const legal: BitboardMove[] = []
  for (const move of candidates) {
    const undo = makeMove(position, move)
    const stillInCheck = isInCheck(position, side)
    unmakeMove(position, move, undo)
    if (!stillInCheck) legal.push(move)
  }
  return legal
}

