import { ANIMATION_DURATION } from 'constants/pieces'
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState
} from 'react'
import { TCell, TCoordinate, TPosition, TPromotion } from 'types/Cell'
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
  normal: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  stalemate: '3k4/3P4/3K4/8/8/8/8/7R',
  promotion: '8/3P4/3K4/8/8/8/8/7R'
}
const initPosition = parseFenPosition(positions.normal)
// const initPosition = initialPosition

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
  isGameOver: boolean
  setPromotionType: (promotionType: TPromotion) => void
  promotionType: TPromotion
  hashedPosition: TPosition
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
  isBlackKingStaleMated: false,
  isGameOver: false,
  setPromotionType: () => {},
  promotionType: 'Q',
  hashedPosition: {} as TPosition
})

export const usePositionContext = () => useContext(PositionContext)
export const PositionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [position, setPosition] = useState<TCell[]>(initPosition)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [future, setFuture] = useState<HistoryItem[]>([])
  const [pgn, setPgn] = useState<string[]>([])
  const [animate, setAnimate] = useState<AnimationRecord>({})
  const [promotionType, setPromotionType] = useState<TPromotion>('Q')

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
    let initial = hashedPosition
    const moves: HistoryItem[] = []
    cellsAndCoordinates.forEach(([cell, coordinate]) => {
      const { move, hashedPosition: newPosition } = getNewPosition(
        cell,
        coordinate,
        initial
      )
      initial = newPosition
      moves.push(move)
    })
    return { moves, newPosition: Object.values(initial) }
  }

  const movePieceToCoordinate = async (
    cell: TCell,
    coordinate: TCoordinate,
    skipHistory: boolean = false
  ) => {
    const turnToConsider = skipHistory ? cell.piece[0] : turn
    // Not their turn
    if (cell.piece[0] !== turnToConsider) return { success: false, position }

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
      return { success: true, position: newPosition }
    } else {
      const { move, newPosition } = getNewPosition(
        cell,
        coordinate,
        hashedPosition
      )
      if (!skipHistory) {
        setHistory([...history, move])
        setPgn(encodePgn(pgn, move))
      }
      await tween([[cell, move.coordinates]])
      setPosition(newPosition)
      return { success: true, position: newPosition }
    }
  }

  const moveBackInHistory = async () => {
    if (Object.values(animate).filter(Boolean).length) return
    if (!history.length) return
    const lastMove = history.at(-1)
    if (!lastMove?.newCell) return
    const { success } = await movePieceToCoordinate(
      lastMove?.newCell,
      lastMove?.coordinates?.[0],
      true
    )
    if (success) {
      setHistory(history.filter((i) => i !== lastMove))
      setFuture([...future, lastMove])
    }
  }

  const moveForwardInHistory = async () => {
    if (Object.values(animate).filter(Boolean).length) return
    if (!future.length) return
    const lastMove = future.at(-1)
    if (!lastMove?.oldCell) return
    const { success } = await movePieceToCoordinate(
      lastMove?.oldCell,
      lastMove?.coordinates?.[1],
      true
    )
    if (success) {
      setFuture(future.filter((i) => i !== lastMove))
      setHistory([...history, lastMove])
    }
  }

  const hashedPosition = useMemo(() => {
    return position.reduce((acc, cell) => {
      acc[cell.square] = cell
      return acc
    }, {} as TPosition)
  }, [position])

  const isWhiteKingInCheck = useMemo(() => {
    return getIsWhiteKingChecked({ position, hashedPosition })
  }, [position, hashedPosition])

  const isBlackKingInCheck = useMemo(() => {
    return getIsBlackKingChecked({ position, hashedPosition })
  }, [position, hashedPosition])

  const isWhiteKingCheckMated = useMemo(() => {
    return getIsWhiteKingCheckMated({ position, turn, hashedPosition })
  }, [position, turn, hashedPosition])

  const isBlackKingCheckMated = useMemo(() => {
    return getIsBlackKingCheckMated({ position, turn, hashedPosition })
  }, [position, turn, hashedPosition])

  const isWhiteKingStaleMated = useMemo(() => {
    return getIsWhiteKingCheckMated({
      position,
      type: 'stalemate',
      turn,
      hashedPosition
    })
  }, [position, turn, hashedPosition])

  const isBlackKingStaleMated = useMemo(() => {
    return getIsBlackKingCheckMated({
      position,
      type: 'stalemate',
      turn,
      hashedPosition
    })
  }, [position, turn, hashedPosition])

  const isGameOver =
    isWhiteKingCheckMated ||
    isBlackKingCheckMated ||
    isWhiteKingStaleMated ||
    isBlackKingStaleMated

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
        isBlackKingStaleMated,
        isGameOver,
        promotionType,
        setPromotionType,
        hashedPosition
      }}
    >
      {children}
    </PositionContext.Provider>
  )
}
