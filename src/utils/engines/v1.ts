import { TCell, TreeItem } from 'types/Cell'
import { flatten } from 'utils/flatten'
import { getSquare } from 'utils/getCoordinates'
import {
  TPlayer,
  generatePositionsTree,
  getPlayerEvaluation
} from 'utils/getPlayerEvaluation'
import { getNewPosition } from 'utils/position'

export const calculateBestMoveV1 = ({
  turn,
  position,
  depth = 3,
  time = 1000
}: {
  turn: TPlayer
  position: TCell[]
  depth?: number
  time?: number
}): TreeItem | null => {
  const before = Date.now()
  let bestMove: TreeItem | null = null
  const tree = generatePositionsTree(turn, position, depth)
  const lines = flatten(tree)

  const hashedDeltas: Record<
    string,
    { delta: number; move: TreeItem; line: TreeItem[] }
  > = {} as Record<string, { delta: number; move: TreeItem; line: TreeItem[] }>

  lines.forEach((line) => {
    let originalPosition = position
    if (Date.now() > before + time && !!bestMove) return bestMove
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

  const valuesSorted = Object.values(hashedDeltas)
    .filter((l) => !!l.line)
    .sort((a, b) => b.delta - a.delta)

  bestMove = valuesSorted[0].move

  const after = Date.now()
  console.log(
    `calculated ${lines?.length ?? 0} lines at depth ${depth} in ${
      after - before
    }ms`
  )

  return bestMove
}
