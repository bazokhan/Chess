import { Chess } from '../src/classes/Chess'
import { mateIn1Puzzles } from '../src/data/mateIn1Puzzles'
import { TPlayer } from '../src/types/Player'
import { Model } from './types'

mateIn1Puzzles.forEach((puzzle) => {
  const id = puzzle[Model.PuzzleId]
  const fenPosition = puzzle[Model.FEN]
  const turn = puzzle[Model.FEN].split(' ')[1] as TPlayer
  const game = new Chess(id, fenPosition, turn)
  const moves = puzzle[Model.Moves].split(' ')
  game.makeFenMove(moves[0]).then(() => {
    game.runMatch(false, async () => {
      if (game.moveNumber % 2 === 0 && moves[game.moveNumber]) {
        await game.makeFenMove(moves[game.moveNumber])
      }
    })
  })
})
