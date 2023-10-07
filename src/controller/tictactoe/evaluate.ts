import { DIAGONALS } from './constants'

export const evaluate = (board: number[], size: number): number => {
  const ranks = []
  for (let i = 0; i < size; i += 1) {
    ranks.push(board.slice(i * size, i * size + size))
  }

  const files = []
  for (let i = 0; i < size; i += 1) {
    files.push(board.filter((_, index) => index % size === i))
  }

  const id = size
  const diagonals = DIAGONALS[id as keyof typeof DIAGONALS].map((d) =>
    board.filter((_, index) => d.includes(index))
  )

  const lines = [...files, ...ranks, ...diagonals]

  for (const line of lines) {
    if (line.every((piece) => piece === 1)) return 1
    if (line.every((piece) => piece === -1)) return -1
  }
  return 0
}
