import { TPlayer } from 'types/Chess'
import { TreeSelfEvaluating } from 'types/Shared'
import { endSpan, startSpan } from 'controller/chess/telemetry'

export let checked = 0
const checkMateIn1 = true

type MinimaxRuntime<S> = {
  cache?: Map<string, number>
  positionKeyFn?: (position: S) => string
  orderMoves?: boolean
}

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
  },
  runtime?: MinimaxRuntime<S>
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
  const children = tree.next
  if (!children?.length) {
    const leafEvaluation = evaluationFn(position)
    if (runtime?.cache && runtime.positionKeyFn) {
      const positionKey = runtime.positionKeyFn(position)
      const leafKey = `${turn}|${index}|leaf|${positionKey}`
      runtime.cache.set(leafKey, leafEvaluation)
    }
    const result = { ...tree, evaluation: leafEvaluation }
    endSpan(span)
    return result
  }

  const runtimeOrderMoves = runtime?.orderMoves ?? true
  const orderedChildren = !runtimeOrderMoves
    ? children
    : [...children].sort((a, b) => {
        const aEval = typeof a.evaluation === 'number' ? a.evaluation : 0
        const bEval = typeof b.evaluation === 'number' ? b.evaluation : 0
        return turn === 'w' ? bEval - aEval : aEval - bEval
      })

  const getNodeCacheKey = (
    targetTurn: TPlayer,
    targetIndex: number,
    alphaValue: number,
    betaValue: number,
    targetPosition: S
  ) => {
    if (!runtime?.cache || !runtime.positionKeyFn) return null
    const positionKey = runtime.positionKeyFn(targetPosition)
    return `${targetTurn}|${targetIndex}|${Math.round(alphaValue)}|${Math.round(betaValue)}|${positionKey}`
  }

  const nodeCacheKey = getNodeCacheKey(turn, index, alpha, beta, position)
  if (nodeCacheKey && runtime?.cache?.has(nodeCacheKey)) {
    const cachedEvaluation = runtime.cache.get(nodeCacheKey) as number
    endSpan(span)
    return { ...tree, evaluation: cachedEvaluation }
  }

  if (turn === 'w') {
    let bestEval = -Infinity
    let bestNode: TreeSelfEvaluating<T, S> | null = null
    let pruned = false

    for (const branch of orderedChildren) {
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
        },
        runtime
      )
      const v = nextMinMax.evaluation

      if (v > bestEval || !bestNode) {
        bestEval = v
        bestNode = nextMinMax as unknown as TreeSelfEvaluating<T, S>
      }

      if (checkMateIn1 && index === 0 && (v === -Infinity || v === Infinity)) {
        endSpan(span)
        return {
          ...branch,
          evaluation: v
        }
      }
      if (prune && v > beta) {
        pruned = true
        break
      }
      if (prune && v > alpha) {
        alpha = v
      }
    }

    const fallbackNode = bestNode ?? tree
    const nextStep = index >= 1 ? tree : fallbackNode // ignore current step, we want best next step
    const evaluation = Number.isFinite(bestEval)
      ? bestEval
      : (fallbackNode.evaluation as number)

    if (!pruned && nodeCacheKey && runtime?.cache) {
      runtime.cache.set(nodeCacheKey, evaluation)
    }
    endSpan(span)
    return {
      ...nextStep,
      evaluation
    }
  } else {
    let bestEval = Infinity
    let bestNode: TreeSelfEvaluating<T, S> | null = null
    let pruned = false

    for (const branch of orderedChildren) {
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
        },
        runtime
      )
      const v = nextMinMax.evaluation

      if (v < bestEval || !bestNode) {
        bestEval = v
        bestNode = nextMinMax as unknown as TreeSelfEvaluating<T, S>
      }

      if (checkMateIn1 && index === 0 && (v === -Infinity || v === Infinity)) {
        endSpan(span)
        return {
          ...branch,
          evaluation: v
        }
      }
      if (prune && v < alpha) {
        pruned = true
        break
      }
      if (prune && v < beta) {
        beta = v
      }
    }

    const fallbackNode = bestNode ?? tree
    const nextStep = index >= 1 ? tree : fallbackNode // ignore current step, we want best next step
    const evaluation = Number.isFinite(bestEval)
      ? bestEval
      : (fallbackNode.evaluation as number)

    if (!pruned && nodeCacheKey && runtime?.cache) {
      runtime.cache.set(nodeCacheKey, evaluation)
    }
    endSpan(span)
    return {
      ...nextStep,
      evaluation
    }
  }
}
