import { TPlayer } from 'types/Chess'
import { TreeSelfEvaluating } from 'types/Shared'

export let checked = 0

export const minimaxSelfEvaluating = <T, S>(
  turn: TPlayer,
  tree: TreeSelfEvaluating<T, S>,
  idProp: keyof T,
  index: number = 0,
  position: S,
  evaluationFn: (position: S) => number,
  alpha: number,
  beta: number
): {
  [x: string]: number | TreeSelfEvaluating<T, S>[keyof T]
  evaluation: number
} => {
  checked += 1
  if (!tree.next?.length) {
    return { [idProp]: tree[idProp], evaluation: evaluationFn(position) }
  }
  if (turn === 'w') {
    const next = []
    for (const branch of tree.next) {
      if (!branch.position) continue
      const nextMinMax = minimaxSelfEvaluating(
        'b',
        branch,
        idProp,
        index + 1,
        branch.position,
        evaluationFn,
        alpha,
        beta
      )
      const v = nextMinMax.evaluation
      next.push({ ...branch, ...nextMinMax })
      if (v > beta) {
        break
      } else {
        beta = v
      }
    }
    const most = next.sort((a, b) => b.evaluation - a.evaluation)[0]
    const nextStepId = index >= 1 ? tree[idProp] : most[idProp] // ignore current step, we want best next step
    return {
      [idProp]: nextStepId,
      evaluation: most?.evaluation
    }
  } else {
    const next = []
    for (const branch of tree.next) {
      if (!branch.position) continue
      const nextMinMax = minimaxSelfEvaluating(
        'w',
        branch,
        idProp,
        index + 1,
        branch.position,
        evaluationFn,
        alpha,
        beta
      )
      const v = nextMinMax.evaluation
      next.push({ ...branch, ...nextMinMax })
      if (v < alpha) {
        break
      } else {
        alpha = v
      }
    }
    const least = next.sort((a, b) => a.evaluation - b.evaluation)[0]
    const nextStepId = index >= 1 ? tree[idProp] : least[idProp] // ignore current step, we want best next step
    return {
      [idProp]: nextStepId,
      evaluation: least?.evaluation
    }
  }
}
