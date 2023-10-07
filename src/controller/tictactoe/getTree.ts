import { Branch } from 'types/TicTacToe'
import { addPiece } from './addPiece'
import { getAvailable } from './getAvailable'

export const getTree = (turn: number, board: number[], depth: number) => {
  const available = getAvailable(board)
  if (!available.length || depth < 0) return []
  return available.map((p) => {
    const newBoard = addPiece(p, turn, [...board])
    const next: Branch[] = getTree(turn * -1, newBoard, depth - 1)
    return { position: p, board: newBoard, next }
  })
}
