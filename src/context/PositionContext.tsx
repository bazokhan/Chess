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
import { getNewPosition, hash } from 'utils/position'
import {
  getIsBlackKingCheckMated,
  getIsKingChecked,
  getIsWhiteKingCheckMated
} from 'utils/getChecks'
import { parseFenPosition } from 'utils/parseFenPosition'
import { initialPosition } from 'data/normalInitialPosition'
import { isWhite } from 'utils/pieces'

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
  movePieceToCoordinate: ({
    cell,
    coordinate,
    skipHistory = false,
    skipAnimation = false,
    skipToggleTurn = false
  }: {
    cell: TCell
    coordinate: TCoordinate
    skipHistory?: boolean
    skipAnimation?: boolean
    skipToggleTurn?: boolean
  }) => void
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
  hPosition: TPosition
  resetPosition: () => void
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
  hPosition: {} as TPosition,
  resetPosition: () => {}
})

export const usePositionContext = () => useContext(PositionContext)
export const PositionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [position, setPosition] = useState<TCell[]>(initPosition)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [future, setFuture] = useState<HistoryItem[]>([])
  const [pgn, setPgn] = useState<string[]>([])
  const [animate, setAnimate] = useState<AnimationRecord>({})
  const [promotionType, setPromotionType] = useState<TPromotion>('Q')

  const resetPosition = () => setPosition(initPosition)

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

  const movePieceToCoordinate = async ({
    cell,
    coordinate,
    skipHistory = false,
    skipAnimation = false,
    skipToggleTurn = false
  }: {
    cell: TCell
    coordinate: TCoordinate
    skipHistory?: boolean
    skipAnimation?: boolean
    skipToggleTurn?: boolean
  }) => {
    const turnToConsider = skipHistory ? cell.piece[0] : turn
    // Not their turn
    if (cell.piece[0] !== turnToConsider) return { success: false, position }

    if (!skipToggleTurn) {
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
      if (!skipAnimation) {
        await tween(moves.map((m) => [m.oldCell, m.coordinates]))
      }
      setPosition(newPosition)
      return { success: true, position: newPosition }
    } else {
      const { move, newPosition } = getNewPosition(cell, coordinate, position)
      if (!skipHistory) {
        setHistory([...history, move])
        setPgn(encodePgn(pgn, move))
      }
      if (!skipAnimation) {
        await tween([[cell, move.coordinates]])
      }
      setPosition(newPosition)
      return { success: true, position: newPosition }
    }
  }

  const moveBackInHistory = async () => {
    if (Object.values(animate).filter(Boolean).length) return
    if (!history.length) return
    const lastMove = history.at(-1)
    if (!lastMove?.newCell) return
    const { success } = await movePieceToCoordinate({
      cell: lastMove?.newCell,
      coordinate: lastMove?.coordinates?.[0],
      skipHistory: true,
      skipToggleTurn: true
    })
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
    const { success } = await movePieceToCoordinate({
      cell: lastMove?.oldCell,
      coordinate: lastMove?.coordinates?.[1],
      skipHistory: true,
      skipToggleTurn: true
    })
    if (success) {
      setFuture(future.filter((i) => i !== lastMove))
      setHistory([...history, lastMove])
    }
  }

  const hPosition: TPosition = hash(position)

  const blackPieces = position.filter((c) => !isWhite(c))
  const whiteKing = position.find((c) => c.piece === 'wk')
  const whitePieces = position.filter((c) => isWhite(c))
  const blackKing = position.find((c) => c.piece === 'bk')

  const isWhiteKingInCheck = useMemo(() => {
    return getIsKingChecked({
      position: hPosition,
      pieces: blackPieces,
      king: whiteKing as TCell
    })
  }, [blackPieces, hPosition, whiteKing])

  const isBlackKingInCheck = useMemo(() => {
    return getIsKingChecked({
      position: hPosition,
      pieces: whitePieces,
      king: blackKing as TCell
    })
  }, [blackKing, hPosition, whitePieces])

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
        hPosition,
        resetPosition
      }}
    >
      {children}
    </PositionContext.Provider>
  )
}
