import { usePositionContext } from 'context/PositionContext'
import { useTurnContext } from 'context/TurnContext'
import { FC, PropsWithChildren, useMemo, useState } from 'react'
import {
  Bot,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Play,
  RotateCcw,
  ScrollText,
  Sparkles,
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
import { useDisclosure } from 'hooks/useDisclosure'
import { Switch } from '../ui/Switch'
import { Paragraph } from '../ui/Paragraph'
import { GameLayout } from 'components/layouts/GameLayout'
import { Column } from '../layouts/Column'
import { SimpleBoard } from './SimpleBoard'
import { TSquare, TreeItem } from 'types/Chess'
import { MinimalBoard } from './MinimalBoard'
import { getCoordinates } from 'controller/chess/coordinates'
import { Diagram } from './Diagram'

type Analysis = 'single_board' | 'board_tree' | 'tree_diagram' | 'none'
type MobileTab = 'controls' | 'analysis'

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
    resetPosition
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

  const next = tree.map((p) => ({
    ...p,
    evaluation: evaluatePosition(p.position ?? [])
  }))

  const filteredNext = !filterAnalysis
    ? next
    : Object.values(
        next.reduce(
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
  const [isMoreToolsOpen, setIsMoreToolsOpen] = useState(false)
  const { isOpen, onToggle } = useDisclosure(true)

  const possibleMoves = useMemo(
    () => printMoves(generateAllNextMoves(turn, position)),
    [position, turn]
  )

  const gameNotifications = useMemo(
    () =>
      [
        isWhiteKingCheckMated ? `CHECKMATE - Black Wins!` : '',
        isBlackKingCheckMated ? `CHECKMATE - White Wins!` : '',
        isWhiteKingStaleMated || isBlackKingStaleMated
          ? `STALEMATE - Draw!`
          : '',
        isWhiteKingInCheck ? `White king is in check` : '',
        isBlackKingInCheck ? `Black king is in check` : ''
      ].filter(Boolean),
    [
      isBlackKingCheckMated,
      isBlackKingInCheck,
      isBlackKingStaleMated,
      isWhiteKingCheckMated,
      isWhiteKingInCheck,
      isWhiteKingStaleMated
    ]
  )

  const renderAnalysis = () => {
    if (analysisMode === 'none') {
      return (
        <Paragraph className="text-[#b8b2a7]">
          Analysis hidden. Pick a tab to explore candidate lines.
        </Paragraph>
      )
    }
    if (analysisMode === 'single_board') {
      return (
        <SimpleBoard
          position={position}
          key={turn}
          evaluation={evaluatePosition(position)}
          next={filteredNext}
        />
      )
    }
    if (analysisMode === 'board_tree') {
      return (
        <div className="grid max-h-[400px] grid-cols-1 gap-2 overflow-auto md:grid-cols-2">
          {tree.map((branch) => (
            <div className="flex flex-col gap-1" key={branch.move}>
              <MinimalBoard
                position={branch.position}
                from={getCoordinates(branch.piece.square)}
                to={getCoordinates(branch.move)}
              />
              <p className="text-xs text-[#d8d2c7]">
                {branch.piece.piece}
                {branch.move}, evaluation: {evaluatePosition(branch.position ?? [])}
              </p>
            </div>
          ))}
        </div>
      )
    }

    return (
      <Diagram
        position={position}
        turn={turn}
        depth={3}
        calculateFor="w"
        bestScore={-Infinity}
      />
    )
  }

  const renderPrimaryControls = () => (
    <div className="space-y-3">
      <div>
        <p className="title">Turn</p>
        <div className="btn-group">
          <Switch
            className="w-full md:w-auto md:min-w-[180px]"
            onClick={setTurnToBlack}
            disabled={turn === 'b'}
            active={turn === 'b'}
            title="Set side to move: black"
          >
            <span className="mr-2 inline-block h-3 w-3 rounded-full bg-black ring-1 ring-white/30" />
            <span>{turn === 'b' ? 'Black to move' : 'Switch to Black'}</span>
          </Switch>
          <Switch
            className="w-full md:w-auto md:min-w-[180px]"
            onClick={setTurnToWhite}
            disabled={turn === 'w'}
            active={turn === 'w'}
            title="Set side to move: white"
          >
            <span className="mr-2 inline-block h-3 w-3 rounded-full bg-white ring-1 ring-black/25" />
            <span>{turn === 'w' ? 'White to move' : 'Switch to White'}</span>
          </Switch>
        </div>
      </div>

      <div>
        <p className="title">Computer side</p>
        <div className="btn-group">
          <Switch
            className="w-full md:w-auto md:min-w-[120px]"
            onClick={aiPlayBlack}
            disabled={aiPlayers.includes('b') && aiPlayers.length === 1}
            active={aiPlayers.includes('b') && aiPlayers.length === 1}
            title="AI plays only black pieces"
          >
            <Bot className="mr-2 h-4 w-4" />
            Black
          </Switch>
          <Switch
            className="w-full md:w-auto md:min-w-[120px]"
            onClick={aiPlayWhite}
            disabled={aiPlayers.includes('w') && aiPlayers.length === 1}
            active={aiPlayers.includes('w') && aiPlayers.length === 1}
            title="AI plays only white pieces"
          >
            <Bot className="mr-2 h-4 w-4" />
            White
          </Switch>
          <Switch
            className="w-full md:w-auto md:min-w-[120px]"
            onClick={aiPlayBoth}
            disabled={aiPlayers.length === 2}
            active={aiPlayers.length === 2}
            title="AI controls both sides"
          >
            <Swords className="mr-2 h-4 w-4" />
            Both
          </Switch>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="title">Game actions</p>
          <div className="btn-group">
            <Switch
              className="w-full justify-center md:w-auto md:min-w-[90px]"
              onClick={() => {
                setForceStop(true)
                resetPosition()
              }}
              active={aiStopped && position.every((m) => !m.moved)}
              disabled={aiStopped && position.every((m) => !m.moved)}
              hideCheck
              title="Reset board to initial position"
            >
              <RotateCcw className="h-4 w-4" />
            </Switch>
            <Switch
              className="w-full justify-center md:w-auto md:min-w-[90px]"
              onClick={() => setForceStop(true)}
              active={aiStopped}
              disabled={aiStopped}
              hideCheck
              title="Stop computer play"
            >
              <Square className="h-4 w-4" />
            </Switch>
            <Switch
              className="w-full justify-center md:w-auto md:min-w-[90px]"
              onClick={() => {
                setAnalysisMode('none')
                setForceStop(false)
              }}
              active={!aiStopped}
              disabled={!aiStopped}
              hideCheck
              title="Start/resume computer play"
            >
              <Play className="h-4 w-4" />
            </Switch>
          </div>
        </div>

        <div>
          <p className="title">History</p>
          <div className="btn-group">
            <Switch
              hideCheck
              className="w-full justify-center md:w-auto md:min-w-[70px]"
              active={false}
              disabled
              title="Jump to beginning (coming soon)"
            >
              <ChevronFirst className="h-4 w-4" />
            </Switch>
            <Switch
              hideCheck
              className="w-full justify-center md:w-auto md:min-w-[70px]"
              onClick={moveBackInHistory}
              disabled={!history.length}
              active={!!future.length}
              title="Step one move backward"
            >
              <ChevronLeft className="h-4 w-4" />
            </Switch>
            <Switch
              hideCheck
              className="w-full justify-center md:w-auto md:min-w-[70px]"
              onClick={moveForwardInHistory}
              disabled={!future.length}
              active={!!history.length}
              title="Step one move forward"
            >
              <ChevronRight className="h-4 w-4" />
            </Switch>
            <Switch
              hideCheck
              className="w-full justify-center md:w-auto md:min-w-[70px]"
              active={false}
              disabled
              title="Jump to latest (coming soon)"
            >
              <ChevronLast className="h-4 w-4" />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMoreTools = () => (
    <div className="space-y-3">
      <p className="title">Game notifications</p>
      <Paragraph className="min-h-[60px] text-sm text-[#ffd4d4]">
        {gameNotifications.length
          ? gameNotifications.map((notification) => (
              <span key={notification} className="mr-2 inline-block">
                {notification}
              </span>
            ))
          : 'No alerts'}
      </Paragraph>

      <p className="title">PGN log</p>
      <div className="max-h-[150px] overflow-y-auto">
        <Paragraph className="h-full text-xs font-medium text-white">
          {pgn.length ? pgn.map((item) => <p key={item}>{item}</p>) : 'No moves yet'}
        </Paragraph>
      </div>

      <p className="title">Possible moves</p>
      <div className="max-h-[150px] overflow-y-auto rounded-lg border border-[#57534c] bg-[#302f2b] p-2">
        {possibleMoves.length ? (
          possibleMoves.map((text) => (
            <p key={text} className="m-0 w-full px-1 py-0 text-xs text-[#d9d3c7]">
              {text}
            </p>
          ))
        ) : (
          <p className="text-xs text-[#a39d91]">No generated move list.</p>
        )}
      </div>
    </div>
  )

  return (
    <GameLayout>
      <div className="w-full">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#beb9b1]">
              Chess playground
            </p>
            <p className="text-xl font-black text-white md:text-2xl">Board + Analysis</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span
              className={`rounded-full border px-3 py-1 ${
                turn === 'w'
                  ? 'border-white/70 bg-white text-black'
                  : 'border-black/70 bg-black text-white'
              }`}
              title="Current side to move"
            >
              {turn === 'w' ? 'White to move' : 'Black to move'}
            </span>
            <span
              className="rounded-full border border-[#7a756b] bg-[#45423a] px-3 py-1 text-[#e8e1d2]"
              title="Current AI side assignment"
            >
              AI:{' '}
              {aiPlayers.length === 2
                ? 'Both'
                : aiPlayers.length === 0
                  ? 'Off'
                  : aiPlayers[0] === 'w'
                    ? 'White'
                    : 'Black'}
            </span>
            <Switch
              className="w-auto"
              onClick={onToggle}
              active={isOpen}
              hideCheck
              title="Show or hide details side panels"
            >
              {isOpen ? (
                <>
                  <X className="mr-2 h-4 w-4" /> Hide details
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Show details
                </>
              )}
            </Switch>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 xl:flex-row xl:items-start">
          <div className="w-full xl:flex-1">
            <Column className="p-3 sm:p-4">{children}</Column>

            <Column className="mt-3 hidden xl:block">
              <div className="mb-2 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#e4dccd]" />
                <p className="m-0 text-sm font-bold text-white">Quick controls</p>
                <span title="Most common game actions live here for faster play">
                  <CircleHelp className="h-4 w-4 text-[#bcb5a8]" />
                </span>
              </div>
              {renderPrimaryControls()}
            </Column>

            {isOpen ? (
              <Column className="mt-3 xl:hidden">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`chess-tab ${
                      mobileTab === 'controls' ? 'chess-tab-active' : ''
                    }`}
                    title="Turn, AI, game, and history controls"
                    onClick={() => setMobileTab('controls')}
                  >
                    <Swords className="mr-1 h-4 w-4" />
                    Controls
                  </button>
                  <button
                    type="button"
                    className={`chess-tab ${
                      mobileTab === 'analysis' ? 'chess-tab-active' : ''
                    }`}
                    title="Board analysis modes and results"
                    onClick={() => setMobileTab('analysis')}
                  >
                    <Sparkles className="mr-1 h-4 w-4" />
                    Analysis
                  </button>
                </div>

                <div className="mt-3">
                  {mobileTab === 'controls' ? renderPrimaryControls() : null}
                  {mobileTab === 'analysis' ? (
                    <>
                      <p className="title">Analysis</p>
                      <div className="btn-group">
                        <button
                          type="button"
                          className={`chess-tab ${
                            analysisMode === 'none' ? 'chess-tab-active' : ''
                          }`}
                          onClick={() => setAnalysisMode('none')}
                          title="Hide analysis views"
                        >
                          None
                        </button>
                        <button
                          type="button"
                          className={`chess-tab ${
                            analysisMode === 'single_board' ? 'chess-tab-active' : ''
                          }`}
                          onClick={() => setAnalysisMode('single_board')}
                          title="Single position with move candidates"
                        >
                          Single
                        </button>
                        <button
                          type="button"
                          className={`chess-tab ${
                            analysisMode === 'board_tree' ? 'chess-tab-active' : ''
                          }`}
                          onClick={() => setAnalysisMode('board_tree')}
                          title="Branching board previews"
                        >
                          Boards
                        </button>
                        <button
                          type="button"
                          className={`chess-tab ${
                            analysisMode === 'tree_diagram' ? 'chess-tab-active' : ''
                          }`}
                          onClick={() => setAnalysisMode('tree_diagram')}
                          title="Tree diagram of explored lines"
                        >
                          Diagram
                        </button>
                      </div>
                      <div className="mt-2">{renderAnalysis()}</div>
                    </>
                  ) : null}
                </div>

                <div className="mt-3">
                  <Switch
                    className="w-full"
                    active={isMoreToolsOpen}
                    hideCheck
                    title="Open PGN, notifications, and possible moves"
                    onClick={() => setIsMoreToolsOpen((prev) => !prev)}
                  >
                    <ScrollText className="mr-2 h-4 w-4" />
                    {isMoreToolsOpen ? 'Hide More tools' : 'Open More tools'}
                  </Switch>
                </div>
                {isMoreToolsOpen ? <div className="mt-3">{renderMoreTools()}</div> : null}
              </Column>
            ) : null}
          </div>

          {isOpen ? (
            <div className="hidden xl:grid xl:flex-1 xl:grid-cols-[minmax(420px,1.45fr)_minmax(300px,1fr)] xl:gap-4">
              <Column>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="m-0 text-sm font-bold text-white">Analysis</p>
                  <span title="Switch analysis perspective without changing the game state">
                    <CircleHelp className="h-4 w-4 text-[#bcb5a8]" />
                  </span>
                </div>
                <div className="btn-group">
                  <button
                    type="button"
                    className={`chess-tab ${analysisMode === 'none' ? 'chess-tab-active' : ''}`}
                    onClick={() => setAnalysisMode('none')}
                    title="Hide analysis views"
                  >
                    None
                  </button>
                  <button
                    type="button"
                    className={`chess-tab ${
                      analysisMode === 'single_board' ? 'chess-tab-active' : ''
                    }`}
                    onClick={() => setAnalysisMode('single_board')}
                    title="Single position with move candidates"
                  >
                    Single
                  </button>
                  <button
                    type="button"
                    className={`chess-tab ${
                      analysisMode === 'board_tree' ? 'chess-tab-active' : ''
                    }`}
                    onClick={() => setAnalysisMode('board_tree')}
                    title="Branching board previews"
                  >
                    Boards
                  </button>
                  <button
                    type="button"
                    className={`chess-tab ${
                      analysisMode === 'tree_diagram' ? 'chess-tab-active' : ''
                    }`}
                    onClick={() => setAnalysisMode('tree_diagram')}
                    title="Tree diagram of explored lines"
                  >
                    Diagram
                  </button>
                </div>
                <div className="mt-3">{renderAnalysis()}</div>
              </Column>

              <Column>
                <p className="m-0 text-sm font-bold text-white">Quick status</p>
                <p className="title">Material</p>
                <div className="btn-group">
                  <Paragraph className="w-full text-center text-white" title="White material score">
                    White: {getPlayerEvaluation('w', position)}
                  </Paragraph>
                  <Paragraph className="w-full text-center text-black" title="Black material score">
                    Black: {getPlayerEvaluation('b', position)}
                  </Paragraph>
                </div>

                <p className="title">History pointer</p>
                <Paragraph title="Current move index in full timeline">
                  Move {history.length ?? 0} /{' '}
                  {(future.length ?? 0) + (history.length ?? 0)}
                </Paragraph>

                <div className="mt-3">
                  <Switch
                    className="w-full"
                    active={isMoreToolsOpen}
                    hideCheck
                    title="Open PGN, notifications, and possible moves"
                    onClick={() => setIsMoreToolsOpen((prev) => !prev)}
                  >
                    <ScrollText className="mr-2 h-4 w-4" />
                    {isMoreToolsOpen ? 'Hide More tools' : 'Open More tools'}
                  </Switch>
                </div>

                {isMoreToolsOpen ? <div className="mt-3">{renderMoreTools()}</div> : null}
              </Column>
            </div>
          ) : null}
        </div>
      </div>
    </GameLayout>
  )
}
