import {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { useTurnContext } from './TurnContext'
import { usePositionContext } from './PositionContext'
import { TCell, TPlayer } from 'types/Chess'
import { calculateBestMoveV2 } from 'controller/chess/calculateBestMoveV2'
import { getBestMoveEngine } from 'controller/chess/engine/getBestMoveEngine'
import { EngineMode } from 'controller/chess/engine/bitboard/types'
// import { fileLog } from 'controller/shared/fileLog'
import {
  evaluatePosition,
  generatePositionsTree
} from 'controller/chess/evaluation'
import { TreeItem } from 'types/Chess'
import { minimax } from 'controller/chess/minimax'
import {
  TelemetryEvent,
  clearTelemetryEvents,
  createTraceId,
  endSpan,
  getTelemetryEvents,
  getTelemetryPaused,
  recordTelemetryStep,
  setTelemetryPaused,
  startSpan,
  subscribeTelemetry
} from 'controller/chess/telemetry'

const DebugContext = createContext<{
  setTurnToWhite: () => void
  setTurnToBlack: () => void
  handleAIPlay: (turn?: TPlayer, recordHistory?: boolean) => void
  runMatch: () => void
  setForceStop: Dispatch<SetStateAction<boolean>>
  aiStopped: boolean
  aiPlayers: TPlayer[]
  aiPlayBlack: () => void
  aiPlayWhite: () => void
  aiPlayBoth: () => void
  toggleAiPlayer: (player: TPlayer) => void
  telemetryEvents: TelemetryEvent[]
  clearTelemetry: () => void
  telemetryPaused: boolean
  toggleTelemetryPaused: () => void
  engineMode: EngineMode
  setEngineMode: Dispatch<SetStateAction<EngineMode>>
  tree: (TreeItem & { evaluation?: number })[]
}>({
  setTurnToWhite: () => {},
  setTurnToBlack: () => {},
  handleAIPlay: () => {},
  runMatch: () => {},
  setForceStop: () => {},
  aiStopped: true,
  aiPlayers: [],
  aiPlayBlack: () => {},
  aiPlayWhite: () => {},
  aiPlayBoth: () => {},
  toggleAiPlayer: () => {},
  telemetryEvents: [],
  clearTelemetry: () => {},
  telemetryPaused: false,
  toggleTelemetryPaused: () => {},
  engineMode: 'bitboard',
  setEngineMode: () => {},
  tree: []
})

export const useDebugContext = () => useContext(DebugContext)

export const aiV2 = (
  turn: TPlayer,
  position: TCell[],
  playerTurn?: TPlayer
) => {
  const span = startSpan('ai.v2.total', {
    playerTurn: playerTurn ?? turn
  })
  const result = calculateBestMoveV2({
    turn: playerTurn ?? turn,
    position,
    minimaxVersion: 2
  })
  endSpan(span)
  return result
}

export const aiV3 = (
  turn: TPlayer,
  position: TCell[],
  playerTurn?: TPlayer,
  mode: EngineMode = 'bitboard'
) => {
  const turnToPlay = playerTurn ?? turn
  const traceId = createTraceId('ai-turn')
  const totalSpan = startSpan(
    'ai.v3.total',
    { playerTurn: turnToPlay },
    { traceId, depth: 0 }
  )
  const decisionSpan = startSpan(
    'ai.v3.getBestMoveEngine',
    { playerTurn: turnToPlay, mode },
    { traceId, parentSpanId: totalSpan?.spanId, depth: 1 }
  )
  const result = getBestMoveEngine({
    turn: playerTurn ?? turn,
    position,
    depth: 4,
    timeMs: 1600,
    mode,
    telemetry: {
      enabled: true,
      traceId,
      parentSpanId: decisionSpan?.spanId
    }
  })
  const durationMs = endSpan(decisionSpan)
  recordTelemetryStep('ai.turn.decision', durationMs, {
    traceId,
    parentSpanId: totalSpan?.spanId,
    depth: 1,
    mode,
    playerTurn: turnToPlay,
    bestMove: `${result?.piece?.square ?? ''}${result?.move ?? ''}`
  })
  recordTelemetryStep('ai.v3.summary', durationMs, {
    traceId,
    parentSpanId: totalSpan?.spanId,
    depth: 1,
    mode,
    playerTurn: turnToPlay
  })
  endSpan(totalSpan)
  return result
}

export const DebugProvider: FC<PropsWithChildren> = ({ children }) => {
  const { setTurn, turn } = useTurnContext()
  const {
    position,
    movePieceToCoordinate,
    isGameOver,
    isBlackKingCheckMated,
    isWhiteKingCheckMated,
    isBlackKingStaleMated,
    isWhiteKingStaleMated
  } = usePositionContext()
  const [forceStop, setForceStop] = useState(true)
  const [moveNumber, setMoveNumber] = useState(0)
  const moveRef = useRef(-1)
  const setTurnToWhite = () => setTurn('w')
  const setTurnToBlack = () => setTurn('b')

  const [aiPlayers, setAiPlayers] = useState<TPlayer[]>(['b'])
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>(
    getTelemetryEvents()
  )
  const [telemetryPaused, setTelemetryPausedState] = useState<boolean>(
    getTelemetryPaused()
  )
  const [engineMode, setEngineMode] = useState<EngineMode>('bitboard')
  const aiPlayBlack = () => setAiPlayers(['b'])
  const aiPlayWhite = () => setAiPlayers(['w'])
  const aiPlayBoth = () => setAiPlayers(['w', 'b'])
  const toggleAiPlayer = (player: TPlayer) =>
    setAiPlayers((prev) =>
      prev.includes(player) ? prev.filter((p) => p !== player) : [...prev, player]
    )

  const tree = generatePositionsTree(turn, position, 1).map(
    (branch, index) => ({
      ...branch,
      evaluation: minimax({
        index,
        tree: branch,
        depth: 1,
        alpha: -99999,
        beta: 99999,
        player: turn,
        version: 2,
        withTelemetry: false
      })
    })
  )

  const handleAIPlay = useCallback(
    async (playerTurn?: TPlayer, recordHistory?: boolean) => {
      if (forceStop && !playerTurn) return
      if (!aiPlayers.includes(turn)) return
      // let bestMove: TreeItem | null
      // if (playerTurn === 'b') {
      //   bestMove = aiV2(playerTurn)
      // } else {
      //   bestMove = aiV3(playerTurn) as TreeItem | null
      // }

      const bestMove = aiV3(turn, position, playerTurn, engineMode) as
        | TreeItem
        | null

      if (bestMove) {
        await movePieceToCoordinate({
          cell: bestMove.piece,
          coordinate: bestMove.move,
          skipAnimation: true,
          skipHistory: !recordHistory
        })
      }

      return true
    },
    [
      aiPlayers,
      engineMode,
      forceStop,
      moveNumber,
      movePieceToCoordinate,
      position,
      turn
    ]
  )

  const runMatch = async () => {}

  useEffect(() => {
    const unsubscribe = subscribeTelemetry((nextEvents) => {
      setTelemetryEvents(nextEvents)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (moveRef.current === moveNumber) return
    if (isGameOver || forceStop || !aiPlayers.includes(turn)) {
      // const logText = isBlackKingCheckMated
      //   ? 'White won by checkmate'
      //   : isWhiteKingCheckMated
      //   ? 'Black won by checkmate'
      //   : isBlackKingStaleMated || isWhiteKingStaleMated
      //   ? 'Game drawn by stalemate'
      //   : 'Unknown status'
      // fileLog('Games', `Game over in ${moveNumber} moves. ${logText}.`)
      return
    }
    moveRef.current = moveNumber
    const play = async () => {
      await handleAIPlay(turn, true)
      const newMoveNumber = moveNumber + 1
      await new Promise((resolve) => {
        setTimeout(() => {
          setMoveNumber(newMoveNumber)
          resolve(true)
        }, 0)
      })
      // fileLog('Games', `Move: ${newMoveNumber}`)
    }
    play()
  }, [
    aiPlayers,
    forceStop,
    handleAIPlay,
    isBlackKingCheckMated,
    isBlackKingStaleMated,
    isGameOver,
    isWhiteKingCheckMated,
    isWhiteKingStaleMated,
    moveNumber,
    turn
  ])

  const clearTelemetry = () => {
    clearTelemetryEvents()
  }

  const toggleTelemetryPaused = () => {
    const nextValue = !telemetryPaused
    setTelemetryPaused(nextValue)
    setTelemetryPausedState(nextValue)
  }

  return (
    <DebugContext.Provider
      value={{
        setTurnToWhite,
        setTurnToBlack,
        handleAIPlay,
        runMatch,
        setForceStop,
        aiStopped: forceStop,
        aiPlayers,
        aiPlayBlack,
        aiPlayWhite,
        aiPlayBoth,
        toggleAiPlayer,
        telemetryEvents,
        clearTelemetry,
        telemetryPaused,
        toggleTelemetryPaused,
        engineMode,
        setEngineMode,
        tree
      }}
    >
      {children}
    </DebugContext.Provider>
  )
}
