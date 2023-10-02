import { TCell, TCoordinate, TPosition } from 'types/Cell'
import { getCoordinates, getSquare } from 'utils/getCoordinates'

export const getKnightAvailableMoves = ({
  piece,
  position
}: {
  piece: TCell
  position: TPosition
}) => {
  const { x, y } = getCoordinates(piece.square)
  const moves: TCoordinate[] = []
  ;[
    [-1, -1],
    [1, 1],
    [-1, 1],
    [1, -1]
  ].forEach(([xDirection, yDirection]) => {
    for (let deltaX = 1; deltaX <= 2; deltaX += 1) {
      for (let deltaY = 1; deltaY <= 2; deltaY += 1) {
        if (deltaX === deltaY) continue // Knights have different delta on x and y when they move, it's always 1 sqaure vs 2
        const newX = x + deltaX * xDirection
        const newY = y + deltaY * yDirection
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
        } else {
          // this else is important since in knights, there is no break statement
          moves.push(newCoordinate)
        }
      }
    }
  })

  return moves
}
