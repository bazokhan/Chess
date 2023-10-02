import { TCell, TCoordinate, TPosition, TreeItem } from 'types/Cell'
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

export const generateAllNextMoves = (
  player: TPlayer,
  hashedPosition: TPosition,
  position: TCell[]
) => {
  const start = Date.now()
  const ownPieces = position.filter((c) => c.piece.startsWith(player))
  const availableMoves = ownPieces
    .map((piece) => {
      const moves = getAvailableMoves(piece, hashedPosition, position)
      return { piece, moves }
    })
    .filter((m) => m.moves.length)
  const end = Date.now()
  fileLog('generateAllNextMoves', `generation took ${end - start} ms`)
  return availableMoves
}

export const generatePositionsTree = (
  turn: TPlayer,
  hashedPosition: TPosition,
  position: TCell[],
  depth: number,
  log = true
): TreeItem[] => {
  if (!depth) return []
  const start = Date.now()
  const nextMoves = generateAllNextMoves(turn, hashedPosition, position)
  const res = nextMoves
    .map(({ piece, moves }) => {
      return moves.map((move) => {
        const { newPosition, hashedPosition: newHashed } = getNewPosition(
          piece,
          move,
          hashedPosition
        )
        return {
          piece,
          move,
          turn,
          next: generatePositionsTree(
            turn === 'b' ? 'w' : 'b',
            newHashed,
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
    fileLog('generatePositionsTree', `generation took ${end - start} ms`)
  }
  return res
}

export const calculateBestMoveV1 = ({
  turn,
  hashedPosition,
  position,
  depth = 3,
  time = 2000
}: {
  turn: TPlayer
  hashedPosition: TPosition
  position: TCell[]
  depth?: number
  time?: number
}): TreeItem | null => {
  const before = Date.now()
  const lines = flatten(
    generatePositionsTree(turn, hashedPosition, position, depth)
  )
  let bestMove: TreeItem | null = null

  let start = Date.now()
  let initialDepth = 1
  let limit = Infinity
  while (start < limit && initialDepth <= depth) {
    const hashedDeltas: Record<
      string,
      { delta: number; move: TreeItem; line: TreeItem[] }
    > = {} as Record<
      string,
      { delta: number; move: TreeItem; line: TreeItem[] }
    >

    lines.forEach((line) => {
      if (Date.now() > limit) return bestMove
      let originalPosition = hashedPosition

      line.forEach(({ piece, move }) => {
        originalPosition = getNewPosition(
          piece,
          move,
          originalPosition
        ).hashedPosition
        const id = line[0].piece.square + '-' + getSquare(move)
        const selfEvaluation = getPlayerEvaluation(
          turn,
          Object.values(originalPosition)
        )
        const opponentEvaluation = getPlayerEvaluation(
          turn === 'w' ? 'b' : 'w',
          Object.values(originalPosition)
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

    const valuesSorted = Object.values(hashedDeltas)
      .filter((l) => !!l.line)
      .sort((a, b) => b.delta - a.delta)
    bestMove = valuesSorted[0].move

    const after = Date.now()

    console.log(
      `calculated ${lines?.length ?? 0} lines at depth ${initialDepth} in ${
        after - before
      }ms and the limit was ${limit}`
    )
    start += after
    initialDepth += 1
    limit = before + time
  }
  return bestMove
}
