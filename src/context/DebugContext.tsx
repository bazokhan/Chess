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
import { calculateBestMoveV1 } from 'utils/engines/v1'
import { calculateBestMoveV2 } from 'utils/engines/v2'

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
      const fn = playerTurn === 'b' ? calculateBestMoveV1 : calculateBestMoveV2
      console.log(
        `${playerTurn?.toUpperCase()}'s turn: using V${fn.name.at(-1)}`
      )
      const bestMove = fn({
        turn: playerTurn ?? turn,
        position
      })

      console.log(
        `Best move for ${playerTurn?.toUpperCase()} was evaluated at ${
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (bestMove as any)?.evaluation ?? (bestMove as any)?.delta
        }`
      )

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
      await handleAIPlay(turn)
      await new Promise((resolve) => {
        setTimeout(() => {
          setMoveNumber(moveNumber + 1)
          resolve(true)
        }, 100)
      })
    }
    play()
  }, [forceStop, handleAIPlay, isGameOver, moveNumber, turn])

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
