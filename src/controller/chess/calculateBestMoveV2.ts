import { TCell, TreeItem } from 'types/Chess'
import { TPlayer } from 'types/Chess'
import { generatePositionsTree } from 'controller/chess/evaluation'
import { minimax } from 'controller/chess/minimax'
import { endSpan, recordTelemetryStep, startSpan } from './telemetry'

export const calculateBestMoveV2 = ({
  turn,
  position,
  depth = 3,
  time = 3000,
  minimaxVersion = 2
}: {
  turn: TPlayer
  position: TCell[]
  depth?: number
  time?: number
  minimaxVersion: number
}): TreeItem | null => {
  const before = Date.now()
  const treeSpan = startSpan('calculateBestMoveV2.generateTree', {
    depth,
    turn
  })
  const tree = generatePositionsTree(turn, position, depth, false, false, true)
  endSpan(treeSpan)

  let originalDepth = 1
  const rootEvalSpan = startSpan('calculateBestMoveV2.rootEvaluation', {
    depth: 3,
    turn
  })
  let best = tree
    .map((branch, index) => ({
      ...branch,
      evaluation: minimax({
        index,
        tree: branch,
        depth: 3,
        alpha: -99999,
        beta: 99999,
        player: turn,
        version: minimaxVersion,
        withTelemetry: true
      })
    }))
    .sort((a, b) => b.evaluation - a.evaluation)
  endSpan(rootEvalSpan)

  originalDepth += 1

  while (Date.now() < before + time && originalDepth <= depth) {
    const iterationSpan = startSpan('calculateBestMoveV2.iteration', {
      depth: originalDepth,
      turn
    })
    best = tree
      .map((branch, index) => ({
        ...branch,
        evaluation: minimax({
          index,
          tree: branch,
          depth: originalDepth,
          alpha: 0,
          beta: 0,
          player: branch.turn,
          version: minimaxVersion,
          withTelemetry: true
        })
      }))
      .sort((a, b) => b.evaluation - a.evaluation)
    const iterationDuration = endSpan(iterationSpan)
    recordTelemetryStep('calculateBestMoveV2.iterationSummary', iterationDuration, {
      depth: originalDepth,
      candidates: best.length
    })
    originalDepth += 1
  }

  return best[turn === 'w' ? 0 : best.length - 1]
}
