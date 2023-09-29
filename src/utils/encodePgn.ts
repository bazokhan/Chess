import { HistoryItem } from 'types/History'

// type TPieceNotation = '' | 'R' | 'N' | 'B' | 'Q' | 'K'

export const encodePgn = (pgn: string[], move: HistoryItem): string[] => {
  let pieceName = move.oldCell.piece?.split('')?.[1]?.toUpperCase()
  if (pieceName === 'P') pieceName = ''
  const isWhite = move.oldCell.piece?.startsWith('w')
  if (!pgn.length) {
    if (isWhite) {
      pgn.push('1. ' + pieceName + move.newCell.square)
    } else {
      pgn.push(`1... ` + pieceName + move.newCell.square)
    }
  } else if (isWhite) {
    pgn.push(`${pgn.length + 1}. ` + pieceName + move.newCell.square)
  } else if ((pgn.at(-1)?.split(' ')?.length ?? 0) > 2) {
    // double turn for black .. Invalid but accounted for
    pgn.push(`${pgn.length + 1}... ` + pieceName + move.newCell.square)
  } else {
    let lastMove = pgn.at(-1) ?? ''
    lastMove += ' '
    lastMove += pieceName
    lastMove += move.newCell.square
    pgn.pop()
    pgn.push(lastMove)
  }
  return pgn
}
