import { TPlayer } from 'types/Chess'
import { TreeGeneric } from 'types/Shared'

export let checked2 = 0
export const minimaxGeneric = <T>(
  turn: TPlayer,
  tree: TreeGeneric<T>,
  idProp: keyof T,
  index: number = 0
): { [x: string]: number | TreeGeneric<T>[keyof T]; evaluation: number } => {
  checked2 += 1
  if (!tree.next?.length) {
    return { [idProp]: tree[idProp], evaluation: tree.evaluation }
  }
  if (turn === 'w') {
    const next = tree.next.map((t) => ({
      ...t,
      ...minimaxGeneric('b', t, idProp, index + 1)
    }))
    const most = next.sort((a, b) => b.evaluation - a.evaluation)[0]
    const nextStepId = index >= 1 ? tree[idProp] : most[idProp] // ignore current step, we want best next step
    return {
      [idProp]: nextStepId,
      evaluation: most?.evaluation
    }
  } else {
    const next = tree.next.map((t) => ({
      ...t,
      ...minimaxGeneric('w', t, idProp, index + 1)
    }))
    const least = next.sort((a, b) => a.evaluation - b.evaluation)[0]
    const nextStepId = index >= 1 ? tree[idProp] : least[idProp] // ignore current step, we want best next step
    return {
      [idProp]: nextStepId,
      evaluation: least?.evaluation
    }
  }
}
