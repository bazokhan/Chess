import { TCell, TreeItem } from 'types/Cell'
import { TPlayer, getPlayerEvaluation } from './getPlayerEvaluation'

export const minmax = ({
  tree,
  depth,
  alpha,
  beta,
  player
}: {
  tree: TreeItem
  depth: number
  alpha: number
  beta: number
  player: TPlayer
}) => {
  const children = tree.next ?? []
  if (depth <= 0 || !children.length) {
    const evaluation =
      getPlayerEvaluation(player, tree?.position as TCell[]) -
      getPlayerEvaluation(player === 'w' ? 'b' : 'w', tree?.position as TCell[])
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
        player: 'b'
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
        player: 'w'
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
