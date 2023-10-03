import { Chess } from '../src/classes/Chess'
import { mateIn1Puzzles } from '../src/data/mateIn1Puzzles'
import { Model } from './readChessPuzzles'
import { TPlayer } from '../src/utils/getPlayerEvaluation'

mateIn1Puzzles.forEach((puzzle, index) => {
  if (index !== 0) return
  const id = puzzle[Model.PuzzleId]
  const fenPosition = puzzle[Model.FEN]
  const turn = puzzle[Model.FEN].split(' ')[1] as TPlayer
  const game = new Chess(id, fenPosition, turn)
  game.runMatch(true)
})
