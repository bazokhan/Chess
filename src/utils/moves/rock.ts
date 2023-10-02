import { TCell, TCoordinate, TPosition } from 'types/Cell'
import { getCoordinates, getSquare } from 'utils/getCoordinates'

export const getRockAvailableMoves = ({
  piece,
  position
}: {
  piece: TCell
  position: TPosition
}) => {
  const { x, y } = getCoordinates(piece.square)
  const moves: TCoordinate[] = []
  ;[
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0]
  ].forEach(([xDirection, yDirection]) => {
    for (let delta = 1; delta <= 8; delta += 1) {
      const newX = x + delta * xDirection
      const newY = y + delta * yDirection
      if (newX < 0 || newX > 7 || newY < 0 || newY > 7) continue
      const newCoordinate = {
        x: newX,
        y: newY
      }
      const square = getSquare(newCoordinate)
      const targetPiece = position[square]
      const isSamePlayer = targetPiece?.piece[0] === piece.piece[0]
      if (targetPiece) {
        if (!isSamePlayer) {
          moves.push(newCoordinate)
        }
        break
      }
      moves.push(newCoordinate)
    }
  })

  return moves
}
