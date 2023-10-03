import { TCell, TreeItem } from 'types/Cell'
import { evaluatePosition, getPlayerEvaluation } from './getPlayerEvaluation'
import { TPlayer } from 'types/Player'

export const minmax = ({
  tree,
  depth,
  alpha,
  beta,
  player,
  version = 2
}: {
  tree: TreeItem
  depth: number
  alpha: number
  beta: number
  player: TPlayer
  version: number
}) => {
  const children = tree.next ?? []
  if (depth <= 0 || !children.length) {
    const evaluation =
      version === 1
        ? getPlayerEvaluation(player, tree?.position as TCell[]) -
          getPlayerEvaluation(
            player === 'w' ? 'b' : 'w',
            tree?.position as TCell[]
          )
        : evaluatePosition(player, tree?.position as TCell[])
    const res = player === 'w' ? evaluation : -evaluation
    return res
  }

  if (player === 'w') {
    let maxEval = -Infinity
    for (const branch of children) {
      const nextEval = minmax({
        tree: branch,
        depth: depth - 1,
        alpha,
        beta,
        player: 'b',
        version
      })
      maxEval = Math.max(maxEval, nextEval)
      alpha = Math.max(alpha, nextEval)
      if (beta <= alpha) {
        break
      }
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const branch of children) {
      const nextEval = minmax({
        tree: branch,
        depth: depth - 1,
        alpha,
        beta,
        player: 'w',
        version
      })
      minEval = Math.min(minEval, nextEval)
      beta = Math.min(beta, nextEval)
      if (beta <= alpha) {
        break
      }
    }
    return minEval
  }
}
