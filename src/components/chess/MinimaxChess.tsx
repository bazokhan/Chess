import { Column } from 'components/layouts/Column'
import { GameLayout } from 'components/layouts/GameLayout'
import { Switch } from 'components/ui/Switch'
import { usePositionContext } from 'context/PositionContext'
import { useTurnContext } from 'context/TurnContext'
import { checked2, minimaxGeneric } from 'controller/shared/minimaxGeneric'
import {
  checked,
  minimaxSelfEvaluating
} from 'controller/shared/minimaxSelfEvaluating'
import { FC, PropsWithChildren, useState } from 'react'
import { Analysis, TCell, TreeItem } from 'types/Chess'
import {
  evaluatePosition,
  generatePositionsTree
} from 'controller/chess/evaluation'
import { SimpleBoard } from './SimpleBoard'
import { MinimalBoard } from './MinimalBoard'
import { getCoordinates } from 'controller/chess/coordinates'
import { MinimaxDiagram } from './MinimaxDiagram'

export const compare = false

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
