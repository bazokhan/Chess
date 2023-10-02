import { TCell, TCoordinate, TPosition } from 'types/Cell'
import { getCoordinates, getSquare } from 'utils/getCoordinates'
import { isWhite } from 'utils/pieces'

export const getPawnAvailableMoves = ({
  piece,
  position = {} as TPosition
}: {
  piece: TCell
  position?: TPosition
}) => {
  const { x, y } = getCoordinates(piece.square)
  const moves: TCoordinate[] = []
  const isWhitePiece = isWhite(piece)
  const yDirection = isWhitePiece ? -1 : 1
  const firstPawnRank = isWhitePiece ? '2' : '7'
  const maxDelta = piece.square[1] === firstPawnRank ? 2 : 1

  for (let delta = 1; delta <= maxDelta; delta += 1) {
    const newCoordinate = {
      x,
      y: y + delta * yDirection
    }
    const square = getSquare(newCoordinate)
    const targetPiece = position[square]
    if (targetPiece) {
      break
    }
    moves.push(newCoordinate)
  }

  for (
    let possibleCaptureDeltaX = -1;
    possibleCaptureDeltaX <= 1;
    possibleCaptureDeltaX += 1
  ) {
    if (possibleCaptureDeltaX === 0) continue // pawns can't capture in front of them
    const newCoordinate = {
      x: x + possibleCaptureDeltaX,
      y: y + yDirection
    }
    const square = getSquare(newCoordinate)
    const targetPiece = position[square]
    const isSamePlayer = targetPiece?.piece[0] === piece.piece[0]
    if (targetPiece && !isSamePlayer) {
      moves.push(newCoordinate)
    }
  }

  return moves
}
