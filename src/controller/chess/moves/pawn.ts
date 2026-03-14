import { TCell, TPosition, TSquare } from 'types/Chess'
import { getCoordinates } from '../coordinates'
import { isWhite } from '../isWhite'

export const getPawnAvailableMoves = ({
  piece,
  position
}: {
  piece: TCell
  position: Partial<TPosition>
}) => {
  const { x, y } = getCoordinates(piece.square)
  const isWhitePiece = isWhite(piece)
  const yDirection = isWhitePiece ? -1 : 1
  const firstPawnRank = isWhitePiece ? '2' : '7'
  const maxDelta = piece.square[1] === firstPawnRank ? 2 : 1

  const moves: TSquare[] = []

  // Forward moves
  for (let delta = 1; delta <= maxDelta; delta++) {
    const newY = y + delta * yDirection
    if (newY < 0 || newY > 7) break
    const square = (String.fromCharCode(piece.square.charCodeAt(0)) +
      (8 - newY)) as TSquare
    if (position[square]) break
    moves.push(square)
  }

  // Capture moves
  const possibleCaptureDeltaX = [-1, 1]
  for (const deltaX of possibleCaptureDeltaX) {
    const newX = x + deltaX
    const newY = y + yDirection
    if (newX < 0 || newX > 7 || newY < 0 || newY > 7) continue
    const square = (String.fromCharCode(piece.square.charCodeAt(0) + deltaX) +
      (8 - newY)) as TSquare
    const targetPiece = position[square]
    if (targetPiece && targetPiece.piece[0] !== piece.piece[0]) {
      moves.push(square)
    }
  }

  return moves
}
