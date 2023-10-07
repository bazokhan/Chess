import { evaluate } from './evaluate'

export const getAvailable = (board: number[]) => {
  const evaluationX = evaluate(board, Math.sqrt(board.length))
  const evaluationY = evaluate(board, Math.sqrt(board.length))
  if (evaluationX || evaluationY) return []
  return board
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p === 0)
    .map(({ i }) => i)
}
