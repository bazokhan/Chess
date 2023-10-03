import { TSquare } from 'types/Board'
import { TCell, TPosition } from 'types/Cell'
import { getCoordinates } from 'utils/getCoordinates'
import { isWhite } from 'utils/pieces'

export const getPawnAvailableMoves = ({
  piece,
  position
}: {
  piece: TCell
  position: TPosition
}) => {
  const { x, y } = getCoordinates(piece.square)
  const moves: TSquare[] = []
  const isWhitePiece = isWhite(piece)
  const yDirection = isWhitePiece ? -1 : 1
  const firstPawnRank = isWhitePiece ? '2' : '7'
  const maxDelta = piece.square[1] === firstPawnRank ? 2 : 1

  for (let delta = 1; delta <= maxDelta; delta += 1) {
    const newY = y + delta * yDirection
    if (newY < 0 || newY > 7) continue
    const square = (piece.square[0] + (8 - newY)) as TSquare
    const targetPiece = position[square]
    if (targetPiece) {
      break
    }
    moves.push(square)
  }

  for (
    let possibleCaptureDeltaX = -1;
    possibleCaptureDeltaX <= 1;
    possibleCaptureDeltaX += 1
  ) {
    if (possibleCaptureDeltaX === 0) continue // pawns can't capture in front of them
    const newX = x + possibleCaptureDeltaX
    const newY = y + yDirection
    if (newX < 0 || newX > 7 || newY < 0 || newY > 7) continue
    const square = (String.fromCharCode(
      piece.square.charCodeAt(0) + possibleCaptureDeltaX
    ) +
      (8 - newY)) as TSquare
    const targetPiece = position[square]
    if (
      targetPiece &&
      targetPiece?.piece[0] !== piece.piece[0] /** not same player */
    ) {
      moves.push(square)
    }
  }

  return moves
}
