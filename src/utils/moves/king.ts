import { TCell, TCoordinate } from 'types/Cell'
import { getCoordinates, getSquare } from 'utils/getCoordinates'
import { isWhite } from 'utils/pieces'

export const getKingAvailableMoves = ({
  piece,
  position = []
}: {
  piece: TCell
  position?: TCell[]
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
    const targetPiece = position.find((cell) => cell.square === square)
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
  const rooksInPosition = position.filter(
    (c) =>
      !!rooks.find(
        (r) => r.square === c.square && r.piece === c.piece && !c.moved
      )
  )
  if (!piece.moved && rooksInPosition?.length) {
    rooksInPosition.forEach((r) => {
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

  return moves
}
