import { TCell, TCoordinate, TreeItem } from 'types/Cell'
import { getAvailableMoves } from './getAvailableMoves'
import { getSquare } from './getCoordinates'
import { getNewPosition } from './position'
import { fileLog } from './fileLog'

export type TPlayer = 'w' | 'b'

const WEIGHTS = {
  r: 500,
  n: 300,
  b: 320,
  q: 900,
  k: 0,
  p: 100
}

export const getPlayerEvaluation = (player: TPlayer, position: TCell[]) => {
  const ownPieces = position.filter((c) => c.piece.startsWith(player))
  return ownPieces.reduce(
    (acc, c) => (acc += WEIGHTS[c.piece[1] as keyof typeof WEIGHTS]),
    0
  )
}

export const printMoves = (
  nextMoves: {
    piece: TCell
    moves: TCoordinate[]
  }[]
) => {
  return nextMoves.map(
    ({ piece, moves }) =>
      `* ${piece.piece.replace(/^w/g, 'White ').replace(/^b/g, 'Black ')} at ${
        piece.square
      } ${
        !moves?.length
          ? `Can't move.`
          : `Can move to ${moves.map((m) => `${getSquare(m)}`).join(' or ')}`
      }`
  )
}

export const generateAllNextMoves = (player: TPlayer, position: TCell[]) => {
  const ownPieces = position.filter((c) => c.piece.startsWith(player))
  const availableMoves = ownPieces
    .map((piece) => {
      const moves = getAvailableMoves(piece, position)
      return { piece, moves }
    })
    .filter((m) => m.moves.length)
  return availableMoves
}

export const generatePositionsTree = (
  turn: TPlayer,
  position: TCell[],
  depth: number,
  log = true
): TreeItem[] => {
  if (!depth) return []
  const start = Date.now()
  const nextMoves = generateAllNextMoves(turn, position)
  const result = nextMoves
    .map(({ piece, moves }) => {
      const result = moves.map((move) => {
        const { newPosition } = getNewPosition(piece, move, position)
        const res = {
          piece,
          move,
          turn,
          position: newPosition,
          next: generatePositionsTree(
            turn === 'b' ? 'w' : 'b',
            newPosition,
            depth - 1,
            false
          )
        }

        return res
      })

      return result
    })
    .flat()
  const end = Date.now()

  if (log) {
    fileLog(
      'generatePositionsTree',
      `generation took ${end - start} ms and yielded ${result.length} positions`
    )
  }
  return result
}
