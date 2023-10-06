import { usePositionContext } from 'context/PositionContext'
import { useTurnContext } from 'context/TurnContext'
import { FC, PropsWithChildren, useState } from 'react'
import {
  LuChevronLast,
  LuChevronFirst,
  LuChevronRight,
  LuChevronLeft,
  LuStopCircle,
  LuRedo
} from 'react-icons/lu'
import { FaChessPawn } from 'react-icons/fa'
import {
  evaluatePosition,
  generateAllNextMoves,
  getPlayerEvaluation,
  printMoves
} from 'utils/getPlayerEvaluation'
import { useDebugContext } from 'context/DebugContext'
import EvalBar from './EvalBar'
import { useDisclosure } from 'hooks/useDisclosure'
import { Switch } from '../ui/Switch'
import { Paragraph } from '../ui/Paragraph'
import { GameLayout } from 'components/layouts/GameLayout'
import { Column } from '../layouts/Column'
import { SimpleBoard } from './SimpleBoard'
import { TSquare } from 'types/Board'
import { TreeItem } from 'types/Cell'
import { MinimalBoard } from './MinimalBoard'
import { getCoordinates } from 'utils/getCoordinates'

type Analysis = 'single_board' | 'board_tree' | 'tree_diagram'

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const {
    moveBackInHistory,
    moveForwardInHistory,
    future,
    history,
    pgn,
    position,
    isWhiteKingInCheck,
    isBlackKingInCheck,
    isWhiteKingCheckMated,
    isBlackKingCheckMated,
    isWhiteKingStaleMated,
    isBlackKingStaleMated,
    resetPosition,
    fen
  } = usePositionContext()

  const { turn } = useTurnContext()

  const {
    setTurnToBlack,
    setTurnToWhite,
    setForceStop,
    aiStopped,
    aiPlayers,
    aiPlayBlack,
    aiPlayWhite,
    aiPlayBoth,
    tree
  } = useDebugContext()

  const { isOpen: isSnackbarOpen, onToggle: onSnackbarToggle } = useDisclosure()
  const next = tree.map((p) => ({
    ...p,
    evaluation: evaluatePosition(p.position ?? [])
  }))
  const filtered = next?.reduce(
    (acc, current) => {
      const prevEval =
        acc[current.move]?.evaluation ?? (turn === 'w' ? -Infinity : Infinity)
      const currentEval = current.evaluation
      const higherEval = prevEval > currentEval ? acc[current.move] : current
      const lowerEval = prevEval < currentEval ? acc[current.move] : current
      acc[current.move] = turn === 'w' ? higherEval : lowerEval
      return acc
    },
    {} as Record<TSquare, TreeItem & { evaluation?: number }>
  )
  const filteredNext = Object.values(filtered)
  const [analysisMode, setAnalysisMode] = useState<Analysis>('single_board')
  return (
    <GameLayout>
      {isSnackbarOpen ? (
        <Column>
          <EvalBar fen={fen} />
        </Column>
      ) : null}
      <Column>{children}</Column>
      <Column width={500}>
        <p className="title">Analysis</p>
        <div className="btn-group">
          <Switch
            className="w-full"
            onClick={() => setAnalysisMode('single_board')}
            disabled={analysisMode === 'single_board'}
            active={analysisMode === 'single_board'}
          >
            Single Board
          </Switch>
          <Switch
            className="w-full"
            onClick={() => setAnalysisMode('board_tree')}
            disabled={analysisMode === 'board_tree'}
            active={analysisMode === 'board_tree'}
          >
            Board Tree
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
          <SimpleBoard
            position={position}
            key={turn}
            evaluation={evaluatePosition(position)}
            next={filteredNext}
          />
        ) : null}
        {analysisMode === 'board_tree' ? (
          <div className="grid max-h-[400px] grid-cols-2 gap-2 overflow-auto">
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
          <div className="flex w-full max-w-full flex-col items-center justify-start overflow-auto">
            <p
              className={`flex h-[48px] w-[48px] items-center justify-center rounded-full border-2 ${
                turn === 'w' ? 'border-white' : 'border-black'
              } p-2 font-black text-red-500`}
            >
              {evaluatePosition(position)}
            </p>
            <div className="flex flex-wrap items-start justify-center">
              {tree.map((branch) =>
                branch.position ? (
                  <div
                    key={branch.move}
                    className={`flex h-[48px] w-[48px] flex-col items-center justify-center rounded-full border-2 ${
                      turn === 'b' ? 'border-white' : 'border-black'
                    } p-2 font-black text-red-500`}
                  >
                    <p className="text-xs font-normal">
                      {branch.piece.piece}
                      {branch.move}
                    </p>
                    <p>{evaluatePosition(branch.position)}</p>
                  </div>
                ) : null
              )}
            </div>
          </div>
        ) : null}
        <p className="title">Evaluation bar</p>
        <Switch active={isSnackbarOpen} onClick={onSnackbarToggle}>
          {isSnackbarOpen ? 'Disable' : 'Enable'} Eval Bar{' '}
          <span className="ml-4 text-xs font-normal">
            It&apos;s currently {isSnackbarOpen ? 'enabled' : 'disabled'}
          </span>
        </Switch>
        <p className="title">Turn</p>
        <div className="btn-group">
          <Switch
            className="w-full"
            onClick={setTurnToBlack}
            disabled={turn === 'b'}
            active={turn === 'b'}
          >
            <FaChessPawn className="text-black" />
            <span className="ml-4 text-black">
              {turn === 'b' ? 'Black to play' : 'Switch turn to Black'}
            </span>
          </Switch>
          <Switch
            className="w-full"
            onClick={setTurnToWhite}
            disabled={turn === 'w'}
            active={turn === 'w'}
          >
            <FaChessPawn className="text-white" />
            <span className="ml-4 text-white">
              {turn === 'w' ? 'White to play' : 'Switch turn to White'}
            </span>
          </Switch>
        </div>
        <p className="title">Computer play as</p>
        <div className="btn-group">
          <Switch
            className="w-full"
            onClick={aiPlayBlack}
            disabled={aiPlayers.includes('b') && aiPlayers.length === 1}
            active={aiPlayers.includes('b') && aiPlayers.length === 1}
          >
            <FaChessPawn className="text-black" />
            <span className="ml-4 text-black">Black</span>
          </Switch>
          <Switch
            className="w-full"
            onClick={aiPlayWhite}
            disabled={aiPlayers.includes('w') && aiPlayers.length === 1}
            active={aiPlayers.includes('w') && aiPlayers.length === 1}
          >
            <FaChessPawn className="text-white" />
            <span className="ml-4 text-white">White</span>
          </Switch>
          <Switch
            className="w-full"
            onClick={aiPlayBoth}
            disabled={aiPlayers.length === 2}
            active={aiPlayers.length === 2}
          >
            <FaChessPawn className="text-gray-500" />
            <span className="ml-4 text-gray-500">Both</span>
          </Switch>
        </div>
        <div className="btn-group">
          <Switch
            className="w-full justify-center"
            onClick={() => {
              setForceStop(true)
              resetPosition()
            }}
            active={aiStopped && position.every((m) => !m.moved)}
            disabled={aiStopped && position.every((m) => !m.moved)}
            hideCheck
          >
            <LuRedo />
          </Switch>
          <Switch
            className="w-full justify-center"
            onClick={() => setForceStop(true)}
            active={aiStopped}
            disabled={aiStopped}
            hideCheck
          >
            <LuStopCircle />
          </Switch>
          <Switch
            className="w-full justify-center"
            onClick={() => {
              setForceStop(false)
            }}
            active={!aiStopped}
            disabled={!aiStopped}
            hideCheck
          >
            <LuChevronRight />
          </Switch>
        </div>
        <p className="title">History</p>
        <div className="btn-group">
          <Switch
            hideCheck
            className="w-full justify-center"
            active={false}
            disabled
          >
            <LuChevronFirst />
          </Switch>
          <Switch
            hideCheck
            className="w-full justify-center"
            onClick={moveBackInHistory}
            disabled={!history.length}
            active={!!future.length}
          >
            <LuChevronLeft />
          </Switch>
          <Switch
            hideCheck
            className="w-full justify-center"
            onClick={moveForwardInHistory}
            disabled={!future.length}
            active={!!history.length}
          >
            <LuChevronRight />
          </Switch>
          <Switch
            hideCheck
            className="w-full justify-center"
            active={false}
            disabled
          >
            <LuChevronLast />
          </Switch>
        </div>
      </Column>
      <Column width={300}>
        <p className="title">PGN</p>
        <div className="h-[150px] overflow-y-auto">
          <Paragraph className="h-full text-sm font-light text-white">
            {pgn?.map((item) => <p key={item}>{item}</p>)}
          </Paragraph>
        </div>
        <p className="title">Game notifications</p>
        <Paragraph className="min-h-[60px] w-full p-2 text-center font-black text-red-200">
          {isWhiteKingCheckMated ? `CHECKMATE - Black Wins!` : null}
          {isBlackKingCheckMated ? `CHECKMATE - White Wins!` : null}
          {isWhiteKingStaleMated || isBlackKingStaleMated
            ? `STALEMATE - Draw!`
            : null}
          {isWhiteKingInCheck ? `White King Is In Check!` : null}
          {isBlackKingInCheck ? `Black King Is In Check!` : null}
        </Paragraph>

        <p className="title">Possible moves</p>
        <div className="h-[150px] overflow-y-auto">
          {printMoves(generateAllNextMoves(turn, position)).map((text) => (
            <p key={text} className="m-0 w-full px-2 py-0 text-xs">
              {text}
            </p>
          ))}
        </div>
        <p className="title">Piece Evaluation</p>
        <div className="btn-group">
          <Paragraph className="w-full text-center text-white">
            {getPlayerEvaluation('w', position)}
          </Paragraph>
          <Paragraph className="w-full text-center text-black">
            {getPlayerEvaluation('b', position)}
          </Paragraph>
        </div>
        <p className="title">History</p>
        <Paragraph>
          Move {history.length ?? 0} /{' '}
          {(future.length ?? 0) + (history.length ?? 0)}
        </Paragraph>
      </Column>
    </GameLayout>
  )
}
