export const addPiece = (position: number, turn: number, board: number[]) => {
  board[position] = turn
  return board
}
