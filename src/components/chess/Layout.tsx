import { usePositionContext } from 'context/PositionContext'
import { useTurnContext } from 'context/TurnContext'
import {
  cloneElement,
  FC,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  useMemo,
  useState
} from 'react'
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  FlipVertical2,
  Repeat,
  Play,
  RotateCcw,
  ScrollText,
  Settings2,
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
import { Paragraph } from '../ui/Paragraph'
import { GameLayout } from 'components/layouts/GameLayout'
import { Column } from '../layouts/Column'
import { SimpleBoard } from './SimpleBoard'
import { TSquare, TPlayer, TreeItem } from 'types/Chess'
import { MinimalBoard } from './MinimalBoard'
import { getCoordinates } from 'controller/chess/coordinates'
import { Diagram } from './Diagram'
import { puzzles } from 'data/puzzles'

type Analysis = 'single_board' | 'board_tree' | 'tree_diagram' | 'none'
type ConfirmAction = 'current' | 'standard' | null

const filterAnalysis = false

type SideDockProps = {
  player: TPlayer
  score: number
  aiOn: boolean
  isTurn: boolean
  onToggleAi: () => void
}

const SideDock: FC<SideDockProps> = ({
  player,
  score,
  aiOn,
  isTurn,
  onToggleAi
}) => (
  <div
    className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
      isTurn ? 'border-[#b39d72] bg-[#4f4738]' : 'border-[#5f5a50] bg-[#36342f]'
    }`}
  >
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded-full ${
          player === 'w' ? 'bg-white ring-1 ring-black/20' : 'bg-black ring-1 ring-white/30'
        }`}
      />
      <span className="text-sm font-semibold text-[#ece3d2]">
        {player === 'w' ? 'White' : 'Black'} ({score})
      </span>
    </div>
    <button
      type="button"
      className={`chess-overlay-btn ${aiOn ? 'chess-overlay-btn-active' : ''}`}
      onClick={onToggleAi}
      title={`Toggle AI for ${player === 'w' ? 'white' : 'black'} side`}
    >
      <Bot className="h-4 w-4" />
    </button>
  </div>
)

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
    resetToCurrentSetup,
    resetToStandardGame,
    loadFenPosition,
    currentSetupFen
  } = usePositionContext()

  const { turn } = useTurnContext()
  const {
    setForceStop,
    aiStopped,
    aiPlayers,
    toggleAiPlayer,
    setTurnToWhite,
    setTurnToBlack,
    tree
  } =
    useDebugContext()

  const [analysisMode, setAnalysisMode] = useState<Analysis>('single_board')
  const [orientation, setOrientation] = useState<TPlayer>('w')
  const [isLogsOpen, setIsLogsOpen] = useState(true)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(true)
  const [isPuzzleModalOpen, setIsPuzzleModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

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

  const possibleMoves = useMemo(
    () => printMoves(generateAllNextMoves(turn, position)),
    [position, turn]
  )

  const gameNotifications = useMemo(
    () =>
      [
        isWhiteKingCheckMated ? `CHECKMATE - Black wins` : '',
        isBlackKingCheckMated ? `CHECKMATE - White wins` : '',
        isWhiteKingStaleMated || isBlackKingStaleMated ? `STALEMATE - Draw` : '',
        isWhiteKingInCheck ? `White king in check` : '',
        isBlackKingInCheck ? `Black king in check` : ''
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

  const topPuzzles = useMemo(
    () => [...puzzles].sort((a, b) => b.rating - a.rating).slice(0, 40),
    []
  )

  const selectedPuzzleId = useMemo(
    () => puzzles.find((p) => p.fen === currentSetupFen)?.id ?? '',
    [currentSetupFen]
  )

  const boardChild = isValidElement(children)
    ? cloneElement(children as ReactElement<{ orientation?: TPlayer }>, {
        orientation
      })
    : children

  const topPlayer = orientation === 'w' ? 'b' : 'w'
  const bottomPlayer = orientation === 'w' ? 'w' : 'b'

  const toggleAi = (player: TPlayer) => {
    const nextAiPlayers = aiPlayers.includes(player)
      ? aiPlayers.filter((p) => p !== player)
      : [...aiPlayers, player]
    toggleAiPlayer(player)
    setForceStop(nextAiPlayers.length === 0)
  }

  const runConfirmAction = () => {
    if (confirmAction === 'current') {
      setForceStop(true)
      resetToCurrentSetup()
    }
    if (confirmAction === 'standard') {
      setForceStop(true)
      resetToStandardGame()
    }
    setConfirmAction(null)
  }

  const passTurn = () => {
    if (turn === 'w') {
      setTurnToBlack()
    } else {
      setTurnToWhite()
    }
  }

  const renderAnalysis = () => {
    if (analysisMode === 'none') {
      return (
        <Paragraph className="text-[#b8b2a7]">
          Analysis hidden. Pick a tab to inspect candidate lines.
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
        <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-auto md:grid-cols-2">
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

  return (
    <GameLayout>
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#beb9b1]">Chess</p>
            <p className="text-xl font-black text-white md:text-2xl">Playground</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="chess-overlay-btn"
              onClick={() => setIsLogsOpen((v) => !v)}
              title="Toggle left logs drawer"
            >
              <ScrollText className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="chess-overlay-btn"
              onClick={() => setIsAnalysisOpen((v) => !v)}
              title="Toggle right analysis drawer"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="chess-overlay-btn"
              onClick={() => setIsPuzzleModalOpen(true)}
              title="Open puzzle chooser"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
          <div className={`${isLogsOpen ? 'block min-h-0' : 'hidden'} xl:block`}>
            <Column className="h-full min-h-0 overflow-hidden">
              <p className="title m-0">Logs</p>
              <p className="text-xs text-[#bfb8ab]">PGN</p>
              <div className="max-h-[120px] overflow-y-auto">
                <Paragraph className="text-xs">
                  {pgn.length ? pgn.map((item) => <p key={item}>{item}</p>) : 'No moves yet'}
                </Paragraph>
              </div>
              <p className="mt-2 text-xs text-[#bfb8ab]">Possible moves</p>
              <div className="max-h-[120px] overflow-y-auto rounded-lg border border-[#57534c] bg-[#302f2b] p-2">
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
              <p className="title">Notifications</p>
              <Paragraph className="text-sm text-[#ffcece]">
                {gameNotifications.length
                  ? gameNotifications.map((notification) => (
                      <span key={notification} className="mr-2 inline-block">
                        {notification}
                      </span>
                    ))
                  : 'No alerts'}
              </Paragraph>
            </Column>
          </div>

          <div className="min-h-0 w-full overflow-hidden">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span
                className={`chess-chip ${
                  turn === 'w' ? 'bg-[#f4efe3] text-black' : 'bg-[#111] text-white'
                }`}
              >
                Turn: {turn === 'w' ? 'White' : 'Black'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="chess-overlay-btn"
                  onClick={passTurn}
                  title="Pass turn to the other side"
                >
                  <Repeat className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="chess-overlay-btn"
                  onClick={() => setOrientation((o) => (o === 'w' ? 'b' : 'w'))}
                  title="Flip board orientation"
                >
                  <FlipVertical2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="chess-overlay-btn"
                  onClick={moveBackInHistory}
                  disabled={!history.length}
                  title="Back one move"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="chess-overlay-btn"
                  onClick={moveForwardInHistory}
                  disabled={!future.length}
                  title="Forward one move"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="chess-overlay-btn"
                  onClick={() => setConfirmAction('current')}
                  title="Reset current setup"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="chess-overlay-btn"
                  onClick={() => setConfirmAction('standard')}
                  title="Reset standard chess"
                >
                  <Swords className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={`chess-overlay-btn ${aiStopped ? '' : 'chess-overlay-btn-active'}`}
                  onClick={() => setForceStop(!aiStopped)}
                  title={aiStopped ? 'Start AI' : 'Stop AI'}
                >
                  {aiStopped ? <Play className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mb-2">
              <SideDock
                player={topPlayer}
                score={getPlayerEvaluation(topPlayer, position)}
                aiOn={aiPlayers.includes(topPlayer)}
                isTurn={turn === topPlayer}
                onToggleAi={() => toggleAi(topPlayer)}
              />
            </div>

            <div className="mx-auto w-full max-w-[min(96vw,76vh)]">{boardChild}</div>

            <div className="mt-2">
              <SideDock
                player={bottomPlayer}
                score={getPlayerEvaluation(bottomPlayer, position)}
                aiOn={aiPlayers.includes(bottomPlayer)}
                isTurn={turn === bottomPlayer}
                onToggleAi={() => toggleAi(bottomPlayer)}
              />
            </div>
          </div>

          <div className={`${isAnalysisOpen ? 'block min-h-0' : 'hidden'} xl:block`}>
            <Column className="h-full min-h-0 overflow-hidden">
              <p className="title m-0">Analysis</p>
              <div className="btn-group">
                <button
                  type="button"
                  className={`chess-tab ${analysisMode === 'none' ? 'chess-tab-active' : ''}`}
                  onClick={() => setAnalysisMode('none')}
                >
                  None
                </button>
                <button
                  type="button"
                  className={`chess-tab ${
                    analysisMode === 'single_board' ? 'chess-tab-active' : ''
                  }`}
                  onClick={() => setAnalysisMode('single_board')}
                >
                  Single
                </button>
                <button
                  type="button"
                  className={`chess-tab ${
                    analysisMode === 'board_tree' ? 'chess-tab-active' : ''
                  }`}
                  onClick={() => setAnalysisMode('board_tree')}
                >
                  Boards
                </button>
                <button
                  type="button"
                  className={`chess-tab ${
                    analysisMode === 'tree_diagram' ? 'chess-tab-active' : ''
                  }`}
                  onClick={() => setAnalysisMode('tree_diagram')}
                >
                  Diagram
                </button>
              </div>
              <div className="mt-2 overflow-y-auto xl:max-h-[calc(100vh-230px)]">
                {renderAnalysis()}
              </div>
            </Column>
          </div>
        </div>

        <div className="fixed inset-x-2 bottom-2 z-40 flex gap-1 rounded-lg border border-[#5f5a52] bg-[#2d2c28] p-1 sm:hidden">
          <button
            type="button"
            className="chess-overlay-btn flex-1"
            onClick={() => setIsLogsOpen((v) => !v)}
            title="Toggle logs"
          >
            <ScrollText className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="chess-overlay-btn flex-1"
            onClick={() => setIsAnalysisOpen((v) => !v)}
            title="Toggle analysis"
          >
            <Sparkles className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="chess-overlay-btn flex-1"
            onClick={() => setIsPuzzleModalOpen(true)}
            title="Open puzzles"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>

        {isPuzzleModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              onClick={() => setIsPuzzleModalOpen(false)}
              aria-label="Close puzzle modal backdrop"
            />
            <Column className="relative z-10 w-full max-w-[560px]">
              <div className="mb-2 flex items-center justify-between">
                <p className="m-0 text-lg font-black text-white">Choose Puzzle</p>
                <button
                  type="button"
                  className="chess-overlay-btn"
                  onClick={() => setIsPuzzleModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <select
                className="w-full rounded-lg border border-[#5f5a52] bg-[#2f2d29] p-2 text-sm text-[#f0e8d7]"
                value={selectedPuzzleId}
                onChange={(e) => {
                  const selected = topPuzzles.find((p) => p.id === e.target.value)
                  if (!selected) return
                  setForceStop(true)
                  loadFenPosition(selected.fen)
                }}
              >
                <option value="" disabled>
                  Select puzzle...
                </option>
                {topPuzzles.map((puzzle) => (
                  <option key={`${puzzle.source}-${puzzle.id}`} value={puzzle.id}>
                    {puzzle.source === 'mateIn1' ? 'Mate in 1' : 'Mate in 2'} #{puzzle.id} -
                    Rating {puzzle.rating}
                  </option>
                ))}
              </select>
            </Column>
          </div>
        ) : null}

        {confirmAction ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              onClick={() => setConfirmAction(null)}
              aria-label="Close confirmation backdrop"
            />
            <Column className="relative z-10 w-full max-w-[460px]">
              <p className="m-0 text-lg font-black text-white">Confirm Reset</p>
              <p className="mt-2 text-sm text-[#d6cfbf]">
                {confirmAction === 'current'
                  ? 'Reset board to current puzzle/setup and clear move history?'
                  : 'Reset board to standard chess initial position and clear move history?'}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="chess-overlay-btn w-full"
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="chess-overlay-btn chess-overlay-btn-active w-full"
                  onClick={runConfirmAction}
                >
                  Confirm
                </button>
              </div>
            </Column>
          </div>
        ) : null}
      </div>
    </GameLayout>
  )
}

