import { TCell, TreeItem } from 'types/Chess'
import { evaluatePosition } from './evaluation'
import { TPlayer } from 'types/Chess'
import { endSpan, startSpan } from './telemetry'

export const minimax = ({
  index,
  tree,
  depth,
  alpha,
  beta,
  player,
  version = 2,
  withTelemetry = false
}: {
  index: number
  tree: TreeItem
  depth: number
  alpha: number
  beta: number
  player: TPlayer
  version: number
  withTelemetry?: boolean
}) => {
  const span = withTelemetry && index === 0 && depth >= 2
    ? startSpan('minimax.branchEvaluation', {
        depth,
        player,
        version
      })
    : null
  const children = tree.next ?? []
  if (depth <= 0 || !children.length) {
    const evaluation = evaluatePosition(tree?.position as TCell[])
    const res = player === 'w' ? evaluation : -evaluation
    endSpan(span)
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
      version,
      withTelemetry
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
    endSpan(span)
    return maxEval
  } else {
    endSpan(span)
    return minEval
  }
}
