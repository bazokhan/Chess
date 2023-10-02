import { TSquare } from 'types/Board'
import { TCell, TCoordinate, TPosition } from 'types/Cell'
import { fileLog } from 'utils/fileLog'
import { getCoordinates, getSquare } from 'utils/getCoordinates'
import { isWhite } from 'utils/pieces'
import { getRankSquaresBetween } from 'utils/position'

export const getKingAvailableMoves = ({
  piece,
  position = {} as TPosition
}: {
  piece: TCell
  position?: TPosition
}) => {
  const { x, y } = getCoordinates(piece.square)
  const moves: TCoordinate[] = []
  ;[
    [-1, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0]
  ].forEach(([xDirection, yDirection]) => {
    const newCoordinate = {
      x: x + 1 * xDirection,
      y: y + 1 * yDirection
    }
    const square = getSquare(newCoordinate)
    const targetPiece = position[square]
    const isSamePlayer = targetPiece?.piece[0] === piece.piece[0]
    if (targetPiece) {
      if (!isSamePlayer) {
        moves.push(newCoordinate)
      }
      return moves
    }
    moves.push(newCoordinate)
  })

  // Castling moves
  const isWhitePiece = isWhite(piece)
  const rooks = isWhitePiece
    ? [
        { square: 'a1', piece: 'wr' },
        { square: 'h1', piece: 'wr' }
      ]
    : [
        { square: 'a8', piece: 'br' },
        { square: 'h8', piece: 'br' }
      ]
  const rooksInPosition = rooks
    .map((r) => position[r.square as TSquare])
    .filter(Boolean)
    .filter((r) => r.piece[1] === 'r' && !r.moved)
  const validRooks = rooksInPosition.filter((r) =>
    getRankSquaresBetween(r.square, piece.square).every(
      (square) => !position[square]
    )
  )
  if (!piece.moved && validRooks?.length) {
    validRooks.forEach((r) => {
      const direction =
        getCoordinates(r.square).x < getCoordinates(piece.square).x ? -1 : 1
      moves.push({
        x: x + 2 * direction,
        y,
        type: 'castle',
        relatedPiece: r,
        relatedCoordinates: { x: x + 1 * direction, y }
      })
    })
  }
  fileLog('moves', `King moves: ${moves.length}`)
  return moves
}
