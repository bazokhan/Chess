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
import { TPlayer, calculateBestMoveV1 } from 'utils/getPlayerEvaluation'

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
  const { position, movePieceToCoordinate, isGameOver } = usePositionContext()
  const [forceStop, setForceStop] = useState(true)
  const [moveNumber, setMoveNumber] = useState(0)
  const moveRef = useRef(-1)
  const setTurnToWhite = () => setTurn('w')
  const setTurnToBlack = () => setTurn('b')

  const handleAIPlay = useCallback(
    async (playerTurn?: TPlayer) => {
      const bestMove = calculateBestMoveV1({
        turn: playerTurn ?? turn,
        position
      })
      if (bestMove) {
        await movePieceToCoordinate(bestMove.piece, bestMove.move)
      }
    },
    [movePieceToCoordinate, position, turn]
  )

  const runMatch = async () => {}

  useEffect(() => {
    if (moveRef.current === moveNumber) return
    if (isGameOver || forceStop) return
    moveRef.current = moveNumber
    const play = async () => {
      await handleAIPlay()
      await new Promise((resolve) => {
        setTimeout(() => {
          setMoveNumber(moveNumber + 1)
          resolve(true)
        }, 100)
      })
    }
    play()
  }, [forceStop, handleAIPlay, isGameOver, moveNumber])

  console.log(moveNumber)

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
