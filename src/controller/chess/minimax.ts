import { TCell, TreeItem } from 'types/Chess'
import { evaluatePosition } from './evaluation'
import { TPlayer } from 'types/Chess'

export const minimax = ({
  index,
  tree,
  depth,
  alpha,
  beta,
  player,
  version = 2
}: {
  index: number
  tree: TreeItem
  depth: number
  alpha: number
  beta: number
  player: TPlayer
  version: number
}) => {
  const children = tree.next ?? []
  if (depth <= 0 || !children.length) {
    const evaluation = evaluatePosition(tree?.position as TCell[])
    const res = player === 'w' ? evaluation : -evaluation
    return res
  }

  let maxEval = -99999
  let minEval = 99999
  for (const branch of children) {
    const nextEval = minimax({
      index,
      tree: branch,
      depth: depth - 1,
      alpha,
      beta,
      player: player === 'w' ? 'b' : 'w',
      version
    })
    if (player === 'w') {
      maxEval = Math.max(maxEval, nextEval)
      alpha = Math.max(alpha, nextEval)
    } else {
      minEval = Math.min(minEval, nextEval)
      beta = Math.min(beta, nextEval)
    }

    if (beta <= alpha) {
      break
    }
  }
  if (player === 'w') {
    return maxEval
  } else {
    return minEval
  }
}
