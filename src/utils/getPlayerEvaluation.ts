import { TCell, TCoordinate } from 'types/Cell'
import { getAvailableMoves } from './getAvailableMoves'
import { getSquare } from './getCoordinates'
import { getNewPosition } from './position'
import { flatten } from './flatten'
import { fileLog } from './fileLog'

export type TPlayer = 'w' | 'b'

const WEIGHTS = {
  r: 5,
  n: 3,
  b: 3,
  q: 9,
  k: 0,
  p: 1
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

type TreeItem = {
  piece: TCell
  move: TCoordinate
  turn: TPlayer
  next?: TreeItem[]
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
      return moves.map((move) => {
        const { newPosition } = getNewPosition(piece, move, position)
        return {
          piece,
          move,
          turn,
          next: generatePositionsTree(
            turn === 'b' ? 'w' : 'b',
            newPosition,
            depth - 1,
            false
          )
        }
      })
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

export const calculateBestMoveV1 = ({
  turn,
  position,
  depth = 3
}: {
  turn: TPlayer
  position: TCell[]
  depth?: number
}): TreeItem | null => {
  const before = Date.now()
  const lines = flatten(generatePositionsTree(turn, position, depth))

  const hashedDeltas: Record<
    string,
    { delta: number; move: TreeItem; line: TreeItem[] }
  > = {} as Record<string, { delta: number; move: TreeItem; line: TreeItem[] }>

  lines.forEach((line) => {
    let originalPosition = position

    line.forEach(({ piece, move }) => {
      originalPosition = getNewPosition(
        piece,
        move,
        originalPosition
      ).newPosition
      const id = line[0].piece.square + '-' + getSquare(move)
      const selfEvaluation = getPlayerEvaluation(turn, originalPosition)
      const opponentEvaluation = getPlayerEvaluation(
        turn === 'w' ? 'b' : 'w',
        originalPosition
      )
      const deltaEvaluation = selfEvaluation - opponentEvaluation

      const thisLine = deltaEvaluation > hashedDeltas[id]?.delta ?? 0

      hashedDeltas[id] = {
        delta: Math.min(deltaEvaluation, hashedDeltas[id]?.delta ?? 0),
        move: line[0],
        line: thisLine ? line : hashedDeltas[id]?.line
      }
    })
  })

  const after = Date.now()
  console.log(
    `calculated ${lines?.length ?? 0} lines at depth ${depth} in ${
      after - before
    }ms`
  )

  const valuesSorted = Object.values(hashedDeltas)
    .filter((l) => !!l.line)
    .sort((a, b) => b.delta - a.delta)
  return valuesSorted[0].move
}
