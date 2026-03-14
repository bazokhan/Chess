import { TSquare } from 'types/Chess'
import { TCell, TPosition } from 'types/Chess'
import { getCoordinates } from 'controller/chess/coordinates'

export const getBishopAvailableMoves = ({
  piece,
  position
}: {
  piece: TCell
  position: Partial<TPosition>
}) => {
  const { x, y } = getCoordinates(piece.square)
  const moves: TSquare[] = []
  const directions = [
    [-1, -1],
    [1, 1],
    [-1, 1],
    [1, -1]
  ]

  directions.forEach(([xDirection, yDirection]) => {
    for (let delta = 1; delta < 8; delta++) {
      const newX = x + delta * xDirection
      const newY = y + delta * yDirection
      if (newX < 0 || newX > 7 || newY < 0 || newY > 7) break
      const square = (String.fromCharCode(
        piece.square.charCodeAt(0) + delta * xDirection
      ) +
        (8 - newY)) as TSquare
      const targetPiece = position[square]
      if (targetPiece) {
        if (targetPiece.piece[0] !== piece.piece[0]) {
          moves.push(square)
        }
        break
      }
      moves.push(square)
    }
  })

  return moves
}
