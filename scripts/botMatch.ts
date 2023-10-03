import { Chess } from '../src/classes/Chess'

const GAMES_COUNT = 10

for (let i = 0; i < GAMES_COUNT; i += 1) {
  const game = new Chess(i)
  game.runMatch()
}
