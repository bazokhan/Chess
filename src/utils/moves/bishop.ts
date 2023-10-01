import { TCell, TCoordinate } from 'types/Cell'
import { getCoordinates, getSquare } from 'utils/getCoordinates'

export const getBishopAvailableMoves = ({
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
    [1, -1]
  ].forEach(([xDirection, yDirection]) => {
    for (let delta = 1; delta <= 8; delta += 1) {
      const newCoordinate = {
        x: x + delta * xDirection,
        y: y + delta * yDirection
      }
      const square = getSquare(newCoordinate)
      const targetPiece = position.find((cell) => cell.square === square)
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
