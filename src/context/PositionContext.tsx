import { ANIMATION_DURATION } from 'constants/pieces'
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState
} from 'react'
import { TCell, TCoordinate } from 'types/Cell'
import { AnimationRecord, HistoryItem } from 'types/History'
import { encodePgn } from 'utils/encodePgn'
import { useTurnContext } from './TurnContext'
import { getNewPosition } from 'utils/position'
import {
  getIsBlackKingCheckMated,
  getIsBlackKingChecked,
  getIsWhiteKingCheckMated,
  getIsWhiteKingChecked
} from 'utils/getChecks'
import { parseFenPosition } from 'utils/parseFenPosition'
import { initialPosition } from 'data/normalInitialPosition'

const positions = {
  random: '8/3Pk3/2KN2r1/8/5n2/8/8/3R4 b - - 0 76',
  stalemate: '3k4/3P4/3K4/8/8/8/8/7R'
}
const initPosition = parseFenPosition(positions.stalemate)

const PositionContext = createContext<{
  position: TCell[]
  movePieceToCoordinate: (cell: TCell, coordinate: TCoordinate) => void
  history: HistoryItem[]
  animate: AnimationRecord
  moveBackInHistory: () => void
  future: HistoryItem[]
  moveForwardInHistory: () => void
  pgn: string[]
  isWhiteKingInCheck: boolean
  isBlackKingInCheck: boolean
  isWhiteKingCheckMated: boolean
  isBlackKingCheckMated: boolean
  isWhiteKingStaleMated: boolean
  isBlackKingStaleMated: boolean
}>({
  position: initialPosition,
  movePieceToCoordinate: () => {},
  history: [],
  animate: {},
  moveBackInHistory: () => {},
  future: [],
  moveForwardInHistory: () => {},
  pgn: [],
  isWhiteKingInCheck: false,
  isBlackKingInCheck: false,
  isWhiteKingCheckMated: false,
  isBlackKingCheckMated: false,
  isWhiteKingStaleMated: false,
  isBlackKingStaleMated: false
})

export const usePositionContext = () => useContext(PositionContext)
export const PositionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [position, setPosition] = useState<TCell[]>(initPosition)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [future, setFuture] = useState<HistoryItem[]>([])
  const [pgn, setPgn] = useState<string[]>([])
  const [animate, setAnimate] = useState<AnimationRecord>({})

  const { turn, toggleTurn } = useTurnContext()

  const tween = async (
    cellsAndMoves: [TCell, [TCoordinate, TCoordinate]][]
  ) => {
    const newTweens = cellsAndMoves.reduce((acc, [cell, move]) => {
      acc[cell.square] = { cell, move }
      return acc
    }, {} as AnimationRecord)
    setAnimate({ ...animate, ...newTweens })
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTweens = cellsAndMoves.reduce((acc, [cell]) => {
          acc[cell.square] = null
          return acc
        }, {} as AnimationRecord)
        setAnimate({ ...animate, ...newTweens })
        resolve(true)
      }, ANIMATION_DURATION)
    })
  }

  const movePieces = (cellsAndCoordinates: [TCell, TCoordinate][]) => {
    let initial = position
    const moves: HistoryItem[] = []
    cellsAndCoordinates.forEach(([cell, coordinate]) => {
      const { move, newPosition } = getNewPosition(cell, coordinate, initial)
      initial = newPosition
      moves.push(move)
    })
    return { moves, newPosition: initial }
  }

  const movePieceToCoordinate = async (
    cell: TCell,
    coordinate: TCoordinate,
    skipHistory: boolean = false
  ) => {
    // Not their turn
    if (cell.piece[0] !== turn) return position

    if (!skipHistory) {
      toggleTurn()
    }

    // Castle
    if (
      coordinate.type === 'castle' &&
      coordinate.relatedPiece &&
      coordinate.relatedCoordinates
    ) {
      const { moves, newPosition } = movePieces([
        [cell, coordinate],
        [coordinate.relatedPiece, coordinate.relatedCoordinates]
      ])
      await tween(moves.map((m) => [m.oldCell, m.coordinates]))
      setPosition(newPosition)
      return newPosition
    } else {
      const { move, newPosition } = getNewPosition(cell, coordinate, position)
      if (!skipHistory) {
        setHistory([...history, move])
        setPgn(encodePgn(pgn, move))
      }
      await tween([[cell, move.coordinates]])
      setPosition(newPosition)
      return newPosition
    }
  }

  const moveBackInHistory = async () => {
    if (animate) return
    if (!history.length) return
    const lastMove = history.at(-1)
    if (!lastMove?.newCell) return
    await movePieceToCoordinate(
      lastMove?.newCell,
      lastMove?.coordinates?.[0],
      true
    )
    setHistory(history.filter((i) => i !== lastMove))
    setFuture([...future, lastMove])
  }

  const moveForwardInHistory = async () => {
    if (animate) return
    if (!future.length) return
    const lastMove = future.at(-1)
    if (!lastMove?.oldCell) return
    await movePieceToCoordinate(
      lastMove?.oldCell,
      lastMove?.coordinates?.[1],
      true
    )
    setFuture(future.filter((i) => i !== lastMove))
    setHistory([...history, lastMove])
  }

  const isWhiteKingInCheck = useMemo(() => {
    return getIsWhiteKingChecked({ position })
  }, [position])

  const isBlackKingInCheck = useMemo(() => {
    return getIsBlackKingChecked({ position })
  }, [position])

  const isWhiteKingCheckMated = useMemo(() => {
    return getIsWhiteKingCheckMated({ position, turn })
  }, [position, turn])

  const isBlackKingCheckMated = useMemo(() => {
    return getIsBlackKingCheckMated({ position, turn })
  }, [position, turn])

  const isWhiteKingStaleMated = useMemo(() => {
    return getIsWhiteKingCheckMated({ position, type: 'stalemate', turn })
  }, [position, turn])

  const isBlackKingStaleMated = useMemo(() => {
    return getIsBlackKingCheckMated({ position, type: 'stalemate', turn })
  }, [position, turn])

  return (
    <PositionContext.Provider
      value={{
        position,
        movePieceToCoordinate,
        history,
        animate,
        moveBackInHistory,
        future,
        moveForwardInHistory,
        pgn,
        isWhiteKingInCheck,
        isBlackKingInCheck,
        isWhiteKingCheckMated,
        isBlackKingCheckMated,
        isWhiteKingStaleMated,
        isBlackKingStaleMated
      }}
    >
      {children}
    </PositionContext.Provider>
  )
}
