import { Branch } from 'types/TicTacToe'
import { getTree } from './getTree'
import { evaluate } from './evaluate'

export const minimax = ({
  branch,
  depth,
  alpha,
  beta,
  turn,
  size
}: {
  branch: Branch
  depth: number
  alpha: number
  beta: number
  turn: number
  size: number
}) => {
  const children = getTree(turn * -1, branch.board, 1)

  if (depth < 0 || !children.length) {
    const evaluation = evaluate(branch.board, size)
    return evaluation
  }

  let maxEval = -Infinity
  let minEval = Infinity
  for (const childBranch of children) {
    const nextEval = minimax({
      branch: childBranch,
      depth: depth - 1,
      alpha,
      beta,
      turn: turn * -1,
      size
    })
    if (turn > 1) {
      maxEval = Math.max(maxEval, nextEval)
      alpha = Math.max(alpha, nextEval)
    } else {
      minEval = Math.min(minEval, nextEval)
      beta = Math.min(beta, nextEval)
    }
    if (beta <= alpha) break
  }
  if (turn > 1) {
    return maxEval
  } else {
    return minEval
  }
}
