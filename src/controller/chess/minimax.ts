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
  const move = `${tree.piece.square}${tree.move}`
  // console.log(
  //   `Calculating depth ${depth} for player ${player} on branch #${index}`
  // )
  if (depth <= 0 || !children.length) {
    const evaluation = evaluatePosition(tree?.position as TCell[])
    if (index === 18) {
      console.log(
        `>>>>>>>>>>>> [Player ${player} - Branch ${index}]: ${move} Evaluation ${evaluation} Alpha ${alpha} Beta ${beta}`
      )
    }
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

    if (index === 18) {
      console.log(
        `[Player ${player} - Branch ${index} - Depth ${depth}]: ${move} - NextEval ${nextEval} MaxEval ${maxEval} MinEval ${minEval} Alpha ${alpha} Beta ${beta}`
      )
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
