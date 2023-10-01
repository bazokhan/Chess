import { ANIMATION_DURATION } from 'constants/pieces'
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState
} from 'react'
import { TCell, TCoordinate } from 'types/Cell'
import { AnimationRecord, HistoryItem } from 'types/History'
import { encodePgn } from 'utils/encodePgn'
import { getCoordinates, getSquare } from 'utils/getCoordinates'

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
}>({
  position: initialPosition,
  movePieceToCoordinate: () => {},
  history: [],
  animate: {},
  moveBackInHistory: () => {},
  future: [],
  moveForwardInHistory: () => {},
  pgn: []
})

export const usePositionContext = () => useContext(PositionContext)

const getNewPosition = (
  cell: TCell,
  coordinate: TCoordinate,
  position: TCell[]
) => {
  const cellIndex = position.findIndex((c) => c.square === cell.square)
  const oldCoordinates = getCoordinates(cell.square)
  const newSquare = getSquare(coordinate)
  const newCell = { ...cell, square: newSquare, moved: true }
  const move: HistoryItem = {
    oldCell: cell,
    newCell,
    coordinates: [oldCoordinates, coordinate]
  }
  const newPosition = [...position]
  newPosition.splice(cellIndex, 1)
  newPosition.push(newCell)
  return { move, newPosition, newSquare, newCell }
}

export const PositionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [position, setPosition] = useState<TCell[]>(initialPosition)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [future, setFuture] = useState<HistoryItem[]>([])
  const [pgn, setPgn] = useState<string[]>([])
  const [animate, setAnimate] = useState<AnimationRecord>({})

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

  const movePieces = async (cellsAndCoordinates: [TCell, TCoordinate][]) => {
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
    let final = position

    // Castle
    if (
      coordinate.type === 'castle' &&
      coordinate.relatedPiece &&
      coordinate.relatedCoordinates
    ) {
      const { moves, newPosition } = await movePieces([
        [cell, coordinate],
        [coordinate.relatedPiece, coordinate.relatedCoordinates]
      ])
      final = newPosition
      await tween(moves.map((m) => [m.oldCell, m.coordinates]))
      setPosition(final)
      return final
    }

    const { move, newPosition, newSquare } = getNewPosition(
      cell,
      coordinate,
      position
    )
    const alreadyHasPiece = position.find((c) => c.square === newSquare)
    final = newPosition

    // Capture
    if (alreadyHasPiece) {
      final = newPosition.filter((c) => c !== alreadyHasPiece)
      move.capturedCell = alreadyHasPiece
    }

    if (!skipHistory) {
      setHistory([...history, move])
      setPgn(encodePgn(pgn, move))
    }
    await tween([[cell, move.coordinates]])
    setPosition(final)
    return final
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
        pgn
      }}
    >
      {children}
    </PositionContext.Provider>
  )
}
