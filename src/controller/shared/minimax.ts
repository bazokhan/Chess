import { TPlayer } from 'types/Chess'
import { Tree } from 'types/Shared'

export const minimax = (
  turn: TPlayer,
  tree: Tree,
  index: number = 0
): { id: string; evaluation: number } => {
  if (!tree.next) return { id: tree.id, evaluation: tree.evaluation }
  if (turn === 'w') {
    const next = tree.next.map((t) => minimax('b', t, index + 1))
    const most = next.sort((a, b) => b.evaluation - a.evaluation)[0]
    const nextStepId = index >= 1 ? tree.id : most.id // ignore current step, we want best next step
    return {
      id: nextStepId,
      evaluation: most.evaluation
    }
  } else {
    const next = tree.next.map((t) => minimax('w', t, index + 1))
    const least = next.sort((a, b) => a.evaluation - b.evaluation)[0]
    const nextStepId = index >= 1 ? tree.id : least.id // ignore current step, we want best next step
    return {
      id: nextStepId,
      evaluation: least.evaluation
    }
  }
}
