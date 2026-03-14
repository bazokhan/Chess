import { Model } from './initPosition'
import { mateIn1Puzzles } from './mateIn1Puzzles'
import { mateIn2Puzzles } from './mateIn2Puzzles'

export type PuzzleItem = {
  id: string
  fen: string
  rating: number
  themes: string
  moves: string
  source: 'mateIn1' | 'mateIn2'
}

const toPuzzle = (
  puzzle: (string | number)[],
  source: PuzzleItem['source']
): PuzzleItem => ({
  id: String(puzzle[Model.PuzzleId] ?? puzzle[Model.ID] ?? ''),
  fen: String(puzzle[Model.FEN] ?? ''),
  rating: Number(puzzle[Model.Rating] ?? 0),
  themes: String(puzzle[Model.Themes] ?? ''),
  moves: String(puzzle[Model.Moves] ?? ''),
  source
})

export const puzzles: PuzzleItem[] = [
  ...mateIn1Puzzles.map((p) => toPuzzle(p, 'mateIn1')),
  ...mateIn2Puzzles.map((p) => toPuzzle(p, 'mateIn2'))
]

