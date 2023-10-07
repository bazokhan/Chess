import { HistoryItem } from 'types/Chess'
import { isWhite } from './isWhite'

// type TPieceNotation = '' | 'R' | 'N' | 'B' | 'Q' | 'K'

export const encodePgn = (pgn: string[], move: HistoryItem): string[] => {
  let pieceName = move.oldCell.piece?.split('')?.[1]?.toUpperCase()
  if (pieceName === 'P') pieceName = ''
  const isWhitePiece = isWhite(move.oldCell)
  const captureHappened = move.capturedCell
  if (captureHappened && !pieceName) pieceName = move.oldCell.square[0] // When a pawn makes a capture, the file from which the pawn departed is used to identify the pawn
  const captureText = captureHappened ? 'x' : ''
  const moveText = pieceName + captureText + move.newCell.square
  if (!pgn.length) {
    if (isWhitePiece) {
      pgn.push('1. ' + moveText)
    } else {
      pgn.push(`1... ` + moveText)
    }
  } else if (isWhitePiece) {
    pgn.push(`${pgn.length + 1}. ` + moveText)
  } else if ((pgn.at(-1)?.split(' ')?.length ?? 0) > 2) {
    // double turn for black .. Invalid but accounted for
    pgn.push(`${pgn.length + 1}... ` + moveText)
  } else {
    let lastMove = pgn.at(-1) ?? ''
    lastMove += ' '
    lastMove += moveText
    pgn.pop()
    pgn.push(lastMove)
  }
  return pgn
}
