import { MinimaxDiagram } from 'components/chess/MinimaxDiagram'
import { MinimalBoard } from 'components/chess/MinimalBoard'
import { SimpleBoard } from 'components/chess/SimpleBoard'
import { Column } from 'components/layouts/Column'
import { GameLayout } from 'components/layouts/GameLayout'
import { Switch } from 'components/ui/Switch'
import { BoardProvider } from 'context/BoardContext'
import { DebugProvider } from 'context/DebugContext'
import { PositionProvider, usePositionContext } from 'context/PositionContext'
import { TurnProvider, useTurnContext } from 'context/TurnContext'
import { FC, PropsWithChildren, useState } from 'react'
import { TPlayer } from 'types/Player'
import { getCoordinates } from 'utils/getCoordinates'
import {
  evaluatePosition,
  generatePositionsTree
} from 'utils/getPlayerEvaluation'
import { TCell, TreeItem } from 'types/Cell'

export type Tree = {
  id: string
  evaluation: number
  next?: Tree[]
}
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

export type TreeGeneric<T> = T & {
  evaluation: number
  next?: TreeGeneric<T>[]
}

let checked2 = 0
export const minimaxGeneric = <T,>(
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

export type TreeSelfEvaluating<T, S> = T & {
  position?: S
  evaluation: number
  next?: TreeSelfEvaluating<T, S>[]
}

let checked = 0

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

type Analysis = 'single_board' | 'board_tree' | 'tree_diagram' | 'none'

const compare = false

export const MinimaxChess: FC<PropsWithChildren> = ({ children }) => {
  const { position } = usePositionContext()

  const { turn } = useTurnContext()
  const tree = generatePositionsTree(turn, position, 2)
  const evaluation = evaluatePosition(position)
  const start = Date.now()
  const best = minimaxSelfEvaluating<Partial<TreeItem>, TCell[]>(
    turn,
    {
      next: tree,
      evaluation
    },
    'move',
    0,
    position,
    evaluatePosition,
    -Infinity,
    Infinity
  )
  console.log(Date.now() - start)
  console.log({ checked })

  const tree2 = compare
    ? generatePositionsTree(turn, position, 2, false, true)
    : null
  const best2 =
    compare && tree2
      ? minimaxGeneric<Partial<TreeItem>>(
          turn,
          {
            next: tree2,
            evaluation
          },
          'move',
          0
        )
      : null

  console.log({ checked2 })

  const [analysisMode, setAnalysisMode] = useState<Analysis>('tree_diagram')

  return (
    <GameLayout>
      {children ? <Column>{children}</Column> : null}
      <Column>
        <p className="title">Analysis ({turn.toUpperCase()} to move)</p>
        <div className="btn-group">
          <Switch
            className="w-full"
            onClick={() => setAnalysisMode('none')}
            disabled={analysisMode === 'none'}
            active={analysisMode === 'none'}
          >
            None
          </Switch>
          <Switch
            className="w-full"
            onClick={() => setAnalysisMode('single_board')}
            disabled={analysisMode === 'single_board'}
            active={analysisMode === 'single_board'}
          >
            Single
          </Switch>
          <Switch
            className="w-full"
            onClick={() => setAnalysisMode('board_tree')}
            disabled={analysisMode === 'board_tree'}
            active={analysisMode === 'board_tree'}
          >
            Boards
          </Switch>
          <Switch
            className="w-full"
            onClick={() => setAnalysisMode('tree_diagram')}
            disabled={analysisMode === 'tree_diagram'}
            active={analysisMode === 'tree_diagram'}
          >
            Diagram
          </Switch>
        </div>
        {analysisMode === 'single_board' ? (
          <Column width={500}>
            <SimpleBoard
              position={position}
              key={turn}
              evaluation={evaluation}
              next={tree}
            />
          </Column>
        ) : null}
        {analysisMode === 'board_tree' ? (
          <div className="grid max-h-[400px] grid-cols-6 gap-2 overflow-auto">
            {tree.map((branch) => (
              <div className="flex flex-col gap-1" key={branch.move}>
                <MinimalBoard
                  position={branch.position}
                  from={getCoordinates(branch.piece.square)}
                  to={getCoordinates(branch.move)}
                />
                <p>
                  {branch.piece.piece}
                  {branch.move}, evaluation:{' '}
                  {evaluatePosition(branch.position ?? [])}
                </p>
              </div>
            ))}
          </div>
        ) : null}
        {analysisMode === 'tree_diagram' ? (
          <>
            <MinimaxDiagram
              turn={turn}
              tree={tree}
              evaluation={evaluation}
              best={best}
            />
            {compare && tree2 && best2 ? (
              <MinimaxDiagram
                turn={turn}
                tree={tree2}
                evaluation={evaluation}
                best={best2}
              />
            ) : null}
          </>
        ) : null}
      </Column>
    </GameLayout>
  )
}

export const MiniMaxPage: FC = () => {
  return (
    <TurnProvider>
      <PositionProvider>
        <BoardProvider>
          <DebugProvider>
            <MinimaxChess />
          </DebugProvider>
        </BoardProvider>
      </PositionProvider>
    </TurnProvider>
  )
}
