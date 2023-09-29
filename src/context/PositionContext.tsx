import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState
} from 'react'
import { TCell, TCoordinate } from 'types/Cell'
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
  animate: {
    cell: TCell
    move: [TCoordinate, TCoordinate]
  } | null
  moveBackInHistory: () => void
  future: HistoryItem[]
  moveForwardInHistory: () => void
}>({
  position: initialPosition,
  movePieceToCoordinate: () => {},
  history: [],
  animate: null,
  moveBackInHistory: () => {},
  future: [],
  moveForwardInHistory: () => {}
})

type HistoryItem = {
  oldCell: TCell
  newCell: TCell
  coordinates: [TCoordinate, TCoordinate]
}

export const usePositionContext = () => useContext(PositionContext)

export const PositionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [position, setPosition] = useState<TCell[]>(initialPosition)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [future, setFuture] = useState<HistoryItem[]>([])
  const [animate, setAnimate] = useState<{
    cell: TCell
    move: [TCoordinate, TCoordinate]
  } | null>(null)

  const tween = async (cell: TCell, move: [TCoordinate, TCoordinate]) => {
    setAnimate({ cell, move })
    return new Promise((resolve) => {
      setTimeout(() => {
        setAnimate(null)
        resolve(true)
      }, 300)
    })
  }

  const movePieceToCoordinate = async (
    cell: TCell,
    coordinate: TCoordinate,
    skipHistory: boolean = false
  ) => {
    const cellIndex = position.findIndex((c) => c.square === cell.square)
    const oldCoordinates = getCoordinates(cell.square)
    if (cellIndex < 0) return
    const newCell = { ...cell, square: getSquare(coordinate) }
    const move: HistoryItem = {
      oldCell: cell,
      newCell,
      coordinates: [oldCoordinates, coordinate]
    }
    const newPosition = [...position]
    newPosition.splice(cellIndex, 1, newCell)
    if (!skipHistory) {
      setHistory([...history, move])
    }
    await tween(cell, move.coordinates)
    setPosition(newPosition)
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

  console.log(history.length, future.length)

  return (
    <PositionContext.Provider
      value={{
        position,
        movePieceToCoordinate,
        history,
        animate,
        moveBackInHistory,
        future,
        moveForwardInHistory
      }}
    >
      {children}
    </PositionContext.Provider>
  )
}
