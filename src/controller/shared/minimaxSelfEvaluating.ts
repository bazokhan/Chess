import { TPlayer } from 'types/Chess'
import { TreeSelfEvaluating } from 'types/Shared'
import { endSpan, startSpan } from 'controller/chess/telemetry'

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
  prune: boolean = true,
  telemetry?: {
    enabled?: boolean
    traceId?: string
    parentSpanId?: number
  }
): T & {
  evaluation: number
} => {
  const span =
    telemetry?.enabled && telemetry.traceId
      ? startSpan(
          'ai.v3.minimaxSelfEvaluating',
          {
            turn,
            index,
            hasChildren: !!tree.next?.length
          },
          {
            traceId: telemetry.traceId,
            parentSpanId: telemetry.parentSpanId,
            depth: index
          }
        )
      : null

  checked += 1
  if (!tree.next?.length) {
    const result = { ...tree, evaluation: evaluationFn(position) }
    endSpan(span)
    return result
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
        prune,
        {
          enabled: telemetry?.enabled,
          traceId: telemetry?.traceId,
          parentSpanId: span?.spanId
        }
      )
      const v = nextMinMax.evaluation
      next.push({ ...branch, ...nextMinMax })
      if (checkMateIn1 && index === 0 && (v === -Infinity || v === Infinity)) {
        endSpan(span)
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
    endSpan(span)
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
        beta,
        prune,
        {
          enabled: telemetry?.enabled,
          traceId: telemetry?.traceId,
          parentSpanId: span?.spanId
        }
      )
      const v = nextMinMax.evaluation
      next.push({ ...branch, ...nextMinMax })
      if (checkMateIn1 && index === 0 && (v === -Infinity || v === Infinity)) {
        endSpan(span)
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
    endSpan(span)
    return {
      ...nextStep,
      evaluation: least?.evaluation
    }
  }
}
