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
// import { fileLog } from 'controller/shared/fileLog'
import {
  evaluatePosition,
  generatePositionsTree
} from 'controller/chess/evaluation'
import { TreeItem } from 'types/Chess'
import { minimax } from 'controller/chess/minimax'
import {
  checked,
  minimaxSelfEvaluating
} from 'controller/shared/minimaxSelfEvaluating'

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

export const aiV2 = (
  turn: TPlayer,
  position: TCell[],
  playerTurn?: TPlayer
) => {
  const start = Date.now()
  console.log(
    'Calculating using v2 ' + (playerTurn === 'w' ? 'For White' : 'For Black')
  )
  const result = calculateBestMoveV2({
    turn: playerTurn ?? turn,
    position,
    minimaxVersion: 2
  })
  console.log(`took ${Date.now() - start} ms`)
  return result
}

export const aiV3 = (
  turn: TPlayer,
  position: TCell[],
  playerTurn?: TPlayer
) => {
  console.log(
    'Calculating using v3 ' + (playerTurn === 'w' ? 'For White' : 'For Black')
  )
  const tree = generatePositionsTree(playerTurn ?? turn, position, 3)
  const evaluation = evaluatePosition(position)
  const start = Date.now()
  const result = minimaxSelfEvaluating<Partial<TreeItem>, TCell[]>(
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
    Infinity,
    true
  )
  console.log(`Took ${Date.now() - start} ms. Checked ${checked}`)
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
      if (!aiPlayers.includes(turn)) return
      // let bestMove: TreeItem | null
      // if (playerTurn === 'b') {
      //   bestMove = aiV2(playerTurn)
      // } else {
      //   bestMove = aiV3(playerTurn) as TreeItem | null
      // }

      const bestMove = aiV3(turn, position, playerTurn) as TreeItem

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
