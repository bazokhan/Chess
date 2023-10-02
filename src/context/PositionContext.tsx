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

const initialPosition: TCell[] = [
  { square: 'a1', piece: 'wr' },
  { square: 'b1', piece: 'wn' },
  { square: 'c1', piece: 'wb' },
  { square: 'd1', piece: 'wq' },
  { square: 'e1', piece: 'wk' },
  { square: 'f1', piece: 'wb' },
  { square: 'g1', piece: 'wn' },
  { square: 'h1', piece: 'wr' },
  { square: 'a2', piece: 'wp' },
  { square: 'b2', piece: 'wp' },
  { square: 'c2', piece: 'wp' },
  { square: 'd2', piece: 'wp' },
  { square: 'e2', piece: 'wp' },
  { square: 'f2', piece: 'wp' },
  { square: 'g2', piece: 'wp' },
  { square: 'h2', piece: 'wp' },
  { square: 'a8', piece: 'br' },
  { square: 'b8', piece: 'bn' },
  { square: 'c8', piece: 'bb' },
  { square: 'd8', piece: 'bq' },
  { square: 'e8', piece: 'bk' },
  { square: 'f8', piece: 'bb' },
  { square: 'g8', piece: 'bn' },
  { square: 'h8', piece: 'br' },
  { square: 'a7', piece: 'bp' },
  { square: 'b7', piece: 'bp' },
  { square: 'c7', piece: 'bp' },
  { square: 'd7', piece: 'bp' },
  { square: 'e7', piece: 'bp' },
  { square: 'f7', piece: 'bp' },
  { square: 'g7', piece: 'bp' },
  { square: 'h7', piece: 'bp' }
]

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
  isBlackKingCheckMated: false
})

export const usePositionContext = () => useContext(PositionContext)

export const PositionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [position, setPosition] = useState<TCell[]>(initialPosition)
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
    return getIsWhiteKingCheckMated({ position })
  }, [position])

  const isBlackKingCheckMated = useMemo(() => {
    return getIsBlackKingCheckMated({ position })
  }, [position])

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
        isBlackKingCheckMated
      }}
    >
      {children}
    </PositionContext.Provider>
  )
}
