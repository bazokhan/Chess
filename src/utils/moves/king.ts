import { TSquare } from 'types/Board'
import { TCell, TPosition } from 'types/Cell'
import { getCoordinates } from 'utils/getCoordinates'
import { isWhite } from 'utils/pieces'
import { getRankSquaresBetween } from 'utils/position'

export const getKingAvailableMoves = ({
  piece,
  position
}: {
  piece: TCell
  position: TPosition
}) => {
  const { x, y } = getCoordinates(piece.square)
  const moves: TSquare[] = []
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
    const newX = x + 1 * xDirection
    const newY = y + 1 * yDirection
    const invalid = newX < 0 || newX > 7 || newY < 0 || newY > 7
    if (!invalid) {
      const square = (String.fromCharCode(
        piece.square.charCodeAt(0) + xDirection
      ) +
        (8 - newY)) as TSquare
      const targetPiece = position[square]
      const isSamePlayer = targetPiece?.piece[0] === piece.piece[0]
      if (targetPiece) {
        if (!isSamePlayer) {
          moves.push(square)
        }
        return moves
      }
      moves.push(square)
    }
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
      const newX = x + 2 * direction
      const invalid = newX < 0 || newX > 7
      if (!invalid) {
        const square = (String.fromCharCode(
          piece.square.charCodeAt(0) + 2 * direction
        ) +
          (8 - y)) as TSquare
        // TODO: restore castling
        moves.push(square)
      }
    })
  }

  return moves
}
