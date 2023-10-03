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
import { TPlayer } from 'utils/getPlayerEvaluation'
import { calculateBestMoveV2 } from 'utils/engines/v2'
import { fileLog } from 'utils/fileLog'

const DebugContext = createContext<{
  setTurnToWhite: () => void
  setTurnToBlack: () => void
  handleAIPlay: (turn?: TPlayer) => void
  runMatch: () => void
  setForceStop: Dispatch<SetStateAction<boolean>>
}>({
  setTurnToWhite: () => {},
  setTurnToBlack: () => {},
  handleAIPlay: () => {},
  runMatch: () => {},
  setForceStop: () => {}
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

  const handleAIPlay = useCallback(
    async (playerTurn?: TPlayer) => {
      const fn = calculateBestMoveV2

      const bestMove = fn({
        turn: playerTurn ?? turn,
        position
      })

      if (bestMove) {
        await movePieceToCoordinate({
          cell: bestMove.piece,
          coordinate: bestMove.move,
          skipAnimation: true,
          skipHistory: true
        })
      }
    },
    [movePieceToCoordinate, position, turn]
  )

  const runMatch = async () => {}

  useEffect(() => {
    if (moveRef.current === moveNumber) return
    if (isGameOver || forceStop) {
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
        setForceStop
      }}
    >
      {children}
    </DebugContext.Provider>
  )
}
