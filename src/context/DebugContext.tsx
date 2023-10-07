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
import { TPlayer } from 'types/Chess'
import { calculateBestMoveV2 } from 'controller/chess/calculateBestMoveV2'
import { fileLog } from 'controller/shared/fileLog'
import { generatePositionsTree } from 'controller/chess/evaluation'
import { TreeItem } from 'types/Chess'
import { minimax } from 'controller/chess/minimax'

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
  tree: []
})

export const useDebugContext = () => useContext(DebugContext)

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
  const aiPlayBlack = () => setAiPlayers(['b'])
  const aiPlayWhite = () => setAiPlayers(['w'])
  const aiPlayBoth = () => setAiPlayers(['w', 'b'])

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
        version: 2
      })
    })
  )

  const handleAIPlay = useCallback(
    async (playerTurn?: TPlayer, recordHistory?: boolean) => {
      if (forceStop && !playerTurn) return
      console.log(turn, aiPlayers)
      if (!aiPlayers.includes(turn)) return
      const bestMove = calculateBestMoveV2({
        turn: playerTurn ?? turn,
        position,
        minimaxVersion: 2
      })

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
    [aiPlayers, forceStop, movePieceToCoordinate, position, turn]
  )

  const runMatch = async () => {}

  useEffect(() => {
    if (moveRef.current === moveNumber) return
    if (isGameOver || forceStop || !aiPlayers.includes(turn)) {
      const logText = isBlackKingCheckMated
        ? 'White won by checkmate'
        : isWhiteKingCheckMated
        ? 'Black won by checkmate'
        : isBlackKingStaleMated || isWhiteKingStaleMated
        ? 'Game drawn by stalemate'
        : 'Unknown status'
      fileLog('Games', `Game over in ${moveNumber} moves. ${logText}.`)
      return
    }
    moveRef.current = moveNumber
    const play = async () => {
      await handleAIPlay(turn)
      const newMoveNumber = moveNumber + 1
      await new Promise((resolve) => {
        setTimeout(() => {
          setMoveNumber(newMoveNumber)
          resolve(true)
        }, 0)
      })
      fileLog('Games', `Move: ${newMoveNumber}`)
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
        tree
      }}
    >
      {children}
    </DebugContext.Provider>
  )
}
