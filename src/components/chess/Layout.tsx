import { usePositionContext } from 'context/PositionContext'
import { useTurnContext } from 'context/TurnContext'
import { FC, PropsWithChildren, useState } from 'react'
import {
  BarChart3,
  Bot,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  History as HistoryIcon,
  PanelRightClose,
  PanelRightOpen,
  Play,
  RotateCcw,
  ScrollText,
  Square,
  Swords,
  X
} from 'lucide-react'
import {
  evaluatePosition,
  generateAllNextMoves,
  getPlayerEvaluation,
  printMoves
} from 'controller/chess/evaluation'
import { useDebugContext } from 'context/DebugContext'
import EvalBar from './EvalBar'
import { useDisclosure } from 'hooks/useDisclosure'
import { Switch } from '../ui/Switch'
import { Paragraph } from '../ui/Paragraph'
import { GameLayout } from 'components/layouts/GameLayout'
import { Column } from '../layouts/Column'
import { SimpleBoard } from './SimpleBoard'
import { TSquare } from 'types/Chess'
import { TreeItem } from 'types/Chess'
import { MinimalBoard } from './MinimalBoard'
import { getCoordinates } from 'controller/chess/coordinates'
import { Diagram } from './Diagram'

type Analysis = 'single_board' | 'board_tree' | 'tree_diagram' | 'none'
type MobileTab = 'controls' | 'analysis' | 'logs'
type MobileDrawer = 'none' | 'pgn' | 'moves'

const filterAnalysis = false
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
  const filteredNext = !filterAnalysis
    ? next
    : Object.values(
        next?.reduce(
          (acc, current) => {
            const prevEval =
              acc[current.move]?.evaluation ??
              (turn === 'w' ? -Infinity : Infinity)
            const currentEval = current.evaluation
            const higherEval =
              prevEval > currentEval ? acc[current.move] : current
            const lowerEval =
              prevEval < currentEval ? acc[current.move] : current
            acc[current.move] = turn === 'w' ? higherEval : lowerEval
            return acc
          },
          {} as Record<TSquare, TreeItem & { evaluation?: number }>
        )
      )
  const [analysisMode, setAnalysisMode] = useState<Analysis>('single_board')
  const [mobileTab, setMobileTab] = useState<MobileTab>('controls')
  const [mobileDrawer, setMobileDrawer] = useState<MobileDrawer>('none')

  const { isOpen, onToggle } = useDisclosure(true)
  const gameNotifications = [
    isWhiteKingCheckMated ? `CHECKMATE - Black Wins!` : '',
    isBlackKingCheckMated ? `CHECKMATE - White Wins!` : '',
    isWhiteKingStaleMated || isBlackKingStaleMated ? `STALEMATE - Draw!` : '',
    isWhiteKingInCheck ? `White King Is In Check!` : '',
    isBlackKingInCheck ? `Black King Is In Check!` : ''
  ].filter(Boolean)

  const toggleDetails = () => {
    setMobileDrawer('none')
    onToggle()
  }

  return (
    <GameLayout>
      <div className="w-full">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#beb9b1]">
              Playground
            </p>
            <p className="text-xl font-black text-white md:text-2xl">Chess</p>
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <Switch
              className="w-full md:w-auto"
              onClick={toggleDetails}
              active={isOpen}
              hideCheck
              title="toggle details panel"
            >
              {isOpen ? (
                <PanelRightClose className="mr-2 h-4 w-4" />
              ) : (
                <PanelRightOpen className="mr-2 h-4 w-4" />
              )}
              <span>{isOpen ? 'Hide details' : 'Show details'}</span>
            </Switch>
          </div>
        </div>
        <div className="flex w-full flex-col gap-4 xl:flex-row xl:items-start">
          {isSnackbarOpen ? (
            <div className="hidden xl:flex">
              <EvalBar fen={fen} />
            </div>
          ) : null}

          <div className="w-full xl:flex-1">
            <Column className="p-3 sm:p-4">{children}</Column>
          </div>

          {isOpen ? (
            <div className="hidden xl:grid xl:flex-1 xl:grid-cols-[minmax(420px,1.45fr)_minmax(300px,1fr)] xl:gap-4">
              <Column>
                <p className="title">Analysis</p>
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
                  <Diagram
                    position={position}
                    turn={turn}
                    depth={3}
                    calculateFor="w"
                    bestScore={-Infinity}
                  />
                ) : null}
                <p className="title">Evaluation bar</p>
                <Switch active={isSnackbarOpen} onClick={onSnackbarToggle}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {isSnackbarOpen ? 'Disable' : 'Enable'} Eval Bar
                </Switch>
                <p className="title">Turn</p>
                <div className="btn-group">
                  <Switch
                    className="w-full"
                    onClick={setTurnToBlack}
                    disabled={turn === 'b'}
                    active={turn === 'b'}
                  >
                    <Square className="mr-2 h-4 w-4" />
                    <span>{turn === 'b' ? 'Black to play' : 'Switch to Black'}</span>
                  </Switch>
                  <Switch
                    className="w-full"
                    onClick={setTurnToWhite}
                    disabled={turn === 'w'}
                    active={turn === 'w'}
                  >
                    <Square className="mr-2 h-4 w-4" />
                    <span>{turn === 'w' ? 'White to play' : 'Switch to White'}</span>
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
                    <Bot className="mr-2 h-4 w-4" />
                    <span>Black</span>
                  </Switch>
                  <Switch
                    className="w-full"
                    onClick={aiPlayWhite}
                    disabled={aiPlayers.includes('w') && aiPlayers.length === 1}
                    active={aiPlayers.includes('w') && aiPlayers.length === 1}
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    <span>White</span>
                  </Switch>
                  <Switch
                    className="w-full"
                    onClick={aiPlayBoth}
                    disabled={aiPlayers.length === 2}
                    active={aiPlayers.length === 2}
                  >
                    <Swords className="mr-2 h-4 w-4" />
                    <span>Both</span>
                  </Switch>
                </div>
                <p className="title">Game</p>
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
                    title="reset"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Switch>
                  <Switch
                    className="w-full justify-center"
                    onClick={() => setForceStop(true)}
                    active={aiStopped}
                    disabled={aiStopped}
                    hideCheck
                    title="stop ai"
                  >
                    <Square className="h-4 w-4" />
                  </Switch>
                  <Switch
                    className="w-full justify-center"
                    onClick={() => {
                      setAnalysisMode('none')
                      setForceStop(false)
                    }}
                    active={!aiStopped}
                    disabled={!aiStopped}
                    hideCheck
                    title="start ai"
                  >
                    <Play className="h-4 w-4" />
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
                    <ChevronFirst className="h-4 w-4" />
                  </Switch>
                  <Switch
                    hideCheck
                    className="w-full justify-center"
                    onClick={moveBackInHistory}
                    disabled={!history.length}
                    active={!!future.length}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Switch>
                  <Switch
                    hideCheck
                    className="w-full justify-center"
                    onClick={moveForwardInHistory}
                    disabled={!future.length}
                    active={!!history.length}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Switch>
                  <Switch
                    hideCheck
                    className="w-full justify-center"
                    active={false}
                    disabled
                  >
                    <ChevronLast className="h-4 w-4" />
                  </Switch>
                </div>
              </Column>
              <Column>
                <p className="title">PGN</p>
                <div className="h-[150px] overflow-y-auto">
                  <Paragraph className="h-full text-sm font-light text-white">
                    {pgn?.map((item) => <p key={item}>{item}</p>)}
                  </Paragraph>
                </div>
                <p className="title">Game notifications</p>
                <Paragraph className="min-h-[60px] w-full p-2 text-center font-black text-red-200">
                  {gameNotifications.length
                    ? gameNotifications.map((notification) => (
                        <p key={notification}>{notification}</p>
                      ))
                    : 'No alerts'}
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
            </div>
          ) : null}
        </div>

        {isOpen ? (
          <div className="mt-4 xl:hidden">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className={`chess-tab ${mobileTab === 'controls' ? 'chess-tab-active' : ''}`}
                onClick={() => setMobileTab('controls')}
              >
                <Swords className="mr-1 h-4 w-4" />
                Controls
              </button>
              <button
                type="button"
                className={`chess-tab ${mobileTab === 'analysis' ? 'chess-tab-active' : ''}`}
                onClick={() => setMobileTab('analysis')}
              >
                <BarChart3 className="mr-1 h-4 w-4" />
                Analysis
              </button>
              <button
                type="button"
                className={`chess-tab ${mobileTab === 'logs' ? 'chess-tab-active' : ''}`}
                onClick={() => setMobileTab('logs')}
              >
                <ScrollText className="mr-1 h-4 w-4" />
                Logs
              </button>
            </div>

            <Column className="mt-3">
              {mobileTab === 'analysis' ? (
                <>
                  <p className="title">Analysis Mode</p>
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
                    <SimpleBoard
                      position={position}
                      key={turn}
                      evaluation={evaluatePosition(position)}
                      next={filteredNext}
                    />
                  ) : null}
                  {analysisMode === 'board_tree' ? (
                    <div className="grid max-h-[400px] grid-cols-1 gap-2 overflow-auto sm:grid-cols-2">
                      {tree.map((branch) => (
                        <div className="flex flex-col gap-1" key={branch.move}>
                          <MinimalBoard
                            position={branch.position}
                            from={getCoordinates(branch.piece.square)}
                            to={getCoordinates(branch.move)}
                          />
                          <p className="text-xs">
                            {branch.piece.piece}
                            {branch.move}, evaluation:{' '}
                            {evaluatePosition(branch.position ?? [])}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {analysisMode === 'tree_diagram' ? (
                    <Diagram
                      position={position}
                      turn={turn}
                      depth={3}
                      calculateFor="w"
                      bestScore={-Infinity}
                    />
                  ) : null}
                </>
              ) : null}

              {mobileTab === 'controls' ? (
                <>
                  <p className="title">Turn</p>
                  <div className="btn-group">
                    <Switch
                      className="w-full"
                      onClick={setTurnToBlack}
                      disabled={turn === 'b'}
                      active={turn === 'b'}
                    >
                      <Square className="mr-2 h-4 w-4" />
                      <span>{turn === 'b' ? 'Black to play' : 'Switch to Black'}</span>
                    </Switch>
                    <Switch
                      className="w-full"
                      onClick={setTurnToWhite}
                      disabled={turn === 'w'}
                      active={turn === 'w'}
                    >
                      <Square className="mr-2 h-4 w-4" />
                      <span>{turn === 'w' ? 'White to play' : 'Switch to White'}</span>
                    </Switch>
                  </div>

                  <p className="title">Computer</p>
                  <div className="btn-group">
                    <Switch
                      className="w-full"
                      onClick={aiPlayBlack}
                      disabled={aiPlayers.includes('b') && aiPlayers.length === 1}
                      active={aiPlayers.includes('b') && aiPlayers.length === 1}
                    >
                      <Bot className="mr-2 h-4 w-4" />
                      <span>Black</span>
                    </Switch>
                    <Switch
                      className="w-full"
                      onClick={aiPlayWhite}
                      disabled={aiPlayers.includes('w') && aiPlayers.length === 1}
                      active={aiPlayers.includes('w') && aiPlayers.length === 1}
                    >
                      <Bot className="mr-2 h-4 w-4" />
                      <span>White</span>
                    </Switch>
                    <Switch
                      className="w-full"
                      onClick={aiPlayBoth}
                      disabled={aiPlayers.length === 2}
                      active={aiPlayers.length === 2}
                    >
                      <Swords className="mr-2 h-4 w-4" />
                      <span>Both</span>
                    </Switch>
                  </div>

                  <p className="title">Game</p>
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
                      title="reset"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Switch>
                    <Switch
                      className="w-full justify-center"
                      onClick={() => setForceStop(true)}
                      active={aiStopped}
                      disabled={aiStopped}
                      hideCheck
                      title="stop ai"
                    >
                      <Square className="h-4 w-4" />
                    </Switch>
                    <Switch
                      className="w-full justify-center"
                      onClick={() => {
                        setAnalysisMode('none')
                        setForceStop(false)
                      }}
                      active={!aiStopped}
                      disabled={!aiStopped}
                      hideCheck
                      title="start ai"
                    >
                      <Play className="h-4 w-4" />
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
                      <ChevronFirst className="h-4 w-4" />
                    </Switch>
                    <Switch
                      hideCheck
                      className="w-full justify-center"
                      onClick={moveBackInHistory}
                      disabled={!history.length}
                      active={!!future.length}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Switch>
                    <Switch
                      hideCheck
                      className="w-full justify-center"
                      onClick={moveForwardInHistory}
                      disabled={!future.length}
                      active={!!history.length}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Switch>
                    <Switch
                      hideCheck
                      className="w-full justify-center"
                      active={false}
                      disabled
                    >
                      <ChevronLast className="h-4 w-4" />
                    </Switch>
                  </div>

                  <p className="title">Eval Bar</p>
                  <Switch active={isSnackbarOpen} onClick={onSnackbarToggle}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {isSnackbarOpen ? 'Disable' : 'Enable'} Eval Bar
                  </Switch>
                </>
              ) : null}

              {mobileTab === 'logs' ? (
                <>
                  <p className="title">Game notifications</p>
                  <Paragraph className="min-h-[60px] w-full p-2 text-center font-black text-red-200">
                    {gameNotifications.length
                      ? gameNotifications.map((notification) => (
                          <p key={notification}>{notification}</p>
                        ))
                      : 'No alerts'}
                  </Paragraph>
                  <p className="title">Piece Evaluation</p>
                  <div className="btn-group">
                    <Paragraph className="w-full text-center text-white">
                      {getPlayerEvaluation('w', position)}
                    </Paragraph>
                    <Paragraph className="w-full text-center text-black">
                      {getPlayerEvaluation('b', position)}
                    </Paragraph>
                  </div>
                  <div className="btn-group mt-1">
                    <Switch
                      className="w-full"
                      active={mobileDrawer === 'pgn'}
                      hideCheck
                      title="Show PGN log"
                      onClick={() =>
                        setMobileDrawer((prev) => (prev === 'pgn' ? 'none' : 'pgn'))
                      }
                    >
                      <ScrollText className="mr-2 h-4 w-4" />
                      PGN drawer
                    </Switch>
                    <Switch
                      className="w-full"
                      active={mobileDrawer === 'moves'}
                      hideCheck
                      title="Show possible moves"
                      onClick={() =>
                        setMobileDrawer((prev) => (prev === 'moves' ? 'none' : 'moves'))
                      }
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Moves drawer
                    </Switch>
                  </div>
                  <Paragraph>
                    <HistoryIcon className="mr-2 inline h-4 w-4" />
                    Move {history.length ?? 0} /{' '}
                    {(future.length ?? 0) + (history.length ?? 0)}
                  </Paragraph>
                </>
              ) : null}
            </Column>
          </div>
        ) : null}

        {mobileDrawer !== 'none' ? (
          <div className="fixed inset-x-2 bottom-2 z-40 xl:hidden">
            <Column className="max-h-[55vh] border border-[#5e5b54] shadow-2xl">
              <div className="mb-2 flex items-center justify-between">
                <p className="title m-0 flex items-center gap-2">
                  {mobileDrawer === 'pgn' ? (
                    <>
                      <ScrollText className="h-4 w-4" /> PGN
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4" /> Possible moves
                    </>
                  )}
                </p>
                <button
                  type="button"
                  className="rounded border border-[#6b675f] bg-[#3f3e39] p-1 text-[#d9d5cf] transition-colors hover:bg-[#4a4944]"
                  onClick={() => setMobileDrawer('none')}
                  title="Close drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {mobileDrawer === 'pgn' ? (
                <div className="max-h-[40vh] overflow-y-auto">
                  <Paragraph className="h-full text-sm font-light text-white">
                    {pgn?.map((item) => <p key={item}>{item}</p>)}
                  </Paragraph>
                </div>
              ) : (
                <div className="max-h-[40vh] overflow-y-auto">
                  {printMoves(generateAllNextMoves(turn, position)).map((text) => (
                    <p key={text} className="m-0 w-full px-2 py-0 text-xs">
                      {text}
                    </p>
                  ))}
                </div>
              )}
            </Column>
          </div>
        ) : null}
      </div>
    </GameLayout>
  )
}
