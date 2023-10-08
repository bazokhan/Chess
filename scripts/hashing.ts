import { getCoordinates } from '../src/controller/chess/coordinates'
import { sortByProximity } from '../src/controller/chess/evaluation'
import { TSquare } from '../src/types/Chess'
import fs from 'fs'

const board = 'abcdefgh'
  .split('')
  .flatMap((file) => [1, 2, 3, 4, 5, 6, 7, 8].map((rank) => file + rank))

const proximityTable = {}
board.forEach((square) => {
  board.forEach((square1) => {
    board.forEach((square2) => {
      proximityTable[`${square}${square1}${square2}`] = sortByProximity(
        square1,
        square2,
        square
      )
    })
  })
})

const queenMoves = {}
board.forEach((square) => {
  const { x, y } = getCoordinates(square)
  const moves: TSquare[] = []
  ;[
    [-1, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0]
  ].forEach(([xDirection, yDirection]) => {
    for (let delta = 1; delta <= 8; delta += 1) {
      const newX = x + delta * xDirection
      const newY = y + delta * yDirection
      if (newX < 0 || newX > 7 || newY < 0 || newY > 7) continue
      const queenSquare = (String.fromCharCode(
        square.charCodeAt(0) + delta * xDirection
      ) +
        (8 - newY)) as TSquare
      moves.push(queenSquare)
    }
  })
  queenMoves[square] = moves.sort((a, b) => sortByProximity(a, b, square))
})

fs.writeFileSync(
  'data_sets/proximityTable.json',
  JSON.stringify(proximityTable, null, 2)
)

fs.writeFileSync(
  'data_sets/queenMoves.json',
  JSON.stringify(queenMoves, null, 2)
)
