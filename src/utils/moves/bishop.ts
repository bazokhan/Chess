import { TSquare } from 'types/Board'
import { TCell, TPosition } from 'types/Cell'
import { getCoordinates } from 'utils/getCoordinates'

export const getBishopAvailableMoves = ({
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
    [1, -1]
  ].forEach(([xDirection, yDirection]) => {
    for (let delta = 1; delta <= 8; delta += 1) {
      const newX = x + delta * xDirection
      const newY = y + delta * yDirection
      if (newX < 0 || newX > 7 || newY < 0 || newY > 7) continue
      const square = (String.fromCharCode(
        piece.square.charCodeAt(0) + delta * xDirection
      ) +
        (8 - newY)) as TSquare
      const targetPiece = position[square]
      const isSamePlayer = targetPiece?.piece[0] === piece.piece[0]
      if (targetPiece) {
        if (!isSamePlayer) {
          moves.push(square)
        }
        break
      }
      moves.push(square)
    }
  })

  return moves
}
