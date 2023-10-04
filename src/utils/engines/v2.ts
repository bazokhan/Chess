import { TCell, TreeItem } from 'types/Cell'
import { TPlayer } from 'types/Player'
import { generatePositionsTree } from 'utils/getPlayerEvaluation'
import { minmax } from 'utils/minmax'

export const calculateBestMoveV2 = ({
  turn,
  position,
  depth = 3,
  time = 3000,
  minmaxVersion = 2
}: {
  turn: TPlayer
  position: TCell[]
  depth?: number
  time?: number
  minmaxVersion: number
}): TreeItem | null => {
  const before = Date.now()
  const tree = generatePositionsTree(turn, position, depth)
  console.log(turn)
  let originalDepth = 1
  let best = tree
    .map((branch, index) => ({
      ...branch,
      evaluation: minmax({
        index,
        tree: branch,
        depth: 3,
        alpha: -99999,
        beta: 99999,
        player: turn,
        version: minmaxVersion
      })
    }))
    .sort((a, b) => b.evaluation - a.evaluation)

  originalDepth += 1

  while (Date.now() < before + time && originalDepth <= depth) {
    best = tree
      .map((branch, index) => ({
        ...branch,
        evaluation: minmax({
          index,
          tree: branch,
          depth: originalDepth,
          alpha: 0,
          beta: 0,
          player: branch.turn,
          version: minmaxVersion
        })
      }))
      .sort((a, b) => b.evaluation - a.evaluation)
    originalDepth += 1
  }

  return best[turn === 'w' ? 0 : best.length - 1]
}
