import { TPlayer } from 'types/Chess'
import { TreeSelfEvaluating } from 'types/Shared'

export let checked = 0
const checkMateIn1 = true

export const minimaxSelfEvaluating = <T, S>(
  turn: TPlayer,
  tree: TreeSelfEvaluating<T, S>,
  idProp: keyof T,
  index: number = 0,
  position: S,
  evaluationFn: (position: S) => number,
  alpha: number,
  beta: number,
  prune: boolean = true
): T & {
  evaluation: number
} => {
  checked += 1
  if (!tree.next?.length) {
    return { ...tree, evaluation: evaluationFn(position) }
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
        beta,
        prune
      )
      const v = nextMinMax.evaluation
      next.push({ ...branch, ...nextMinMax })
      if (checkMateIn1 && index === 0 && (v === -Infinity || v === Infinity)) {
        return {
          ...branch,
          evaluation: v
        }
      }
      if (prune && v > beta) {
        break
      }
      if (prune && v > alpha) {
        alpha = v
      }
    }
    const most = next.sort((a, b) => b.evaluation - a.evaluation)[0]
    const nextStep = index >= 1 ? tree : most // ignore current step, we want best next step
    return {
      ...nextStep,
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
      if (checkMateIn1 && index === 0 && (v === -Infinity || v === Infinity)) {
        return {
          ...branch,
          evaluation: v
        }
      }
      if (prune && v < alpha) {
        break
      }
      if (prune && v < beta) {
        beta = v
      }
    }
    const least = next.sort((a, b) => a.evaluation - b.evaluation)[0]
    const nextStep = index >= 1 ? tree : least // ignore current step, we want best next step
    return {
      ...nextStep,
      evaluation: least?.evaluation
    }
  }
}
