import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState
} from 'react'
import { TCell, TCoordinate } from 'types/Cell'
import { getAvailableMoves } from 'utils/getAvailableMoves'
import { getCoordinates } from 'utils/getCoordinates'
import { usePositionContext } from './PositionContext'

const BoardContext = createContext<{
  activeCell: TCell | null
  setActiveCell: (cell: TCell | null) => void
  highlightedCoordinates: TCoordinate[]
  toggleHighlight: (cell: TCoordinate) => void
  resetHighlightedCoordinates: () => void
  availableMoves: TCoordinate[]
  activeCoordinates: TCoordinate | null
}>({
  activeCell: null,
  setActiveCell: () => {},
  highlightedCoordinates: [],
  toggleHighlight: () => {},
  resetHighlightedCoordinates: () => {},
  availableMoves: [],
  activeCoordinates: null
})

export const useBoardContext = () => useContext(BoardContext)

export const BoardProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeCell, setActiveCell] = useState<TCell | null>(null)
  const [highlightedCoordinates, setHighlightedCoordinates] = useState<
    TCoordinate[]
  >([])
  const { position, hashedPosition, isGameOver } = usePositionContext()
  const toggleHighlight = (cell: TCoordinate) => {
    if (highlightedCoordinates.find((c) => c.x === cell.x && c.y === cell.y)) {
      setHighlightedCoordinates(
        highlightedCoordinates.filter((c) => c.x !== cell.x || c.y !== cell.y)
      )
    } else {
      setHighlightedCoordinates([...highlightedCoordinates, cell])
    }
  }
  const resetHighlightedCoordinates = () => setHighlightedCoordinates([])
  const availableMoves = useMemo(() => {
    if (isGameOver) return []
    if (!activeCell) return []
    return getAvailableMoves(activeCell, hashedPosition, position)
  }, [isGameOver, activeCell, hashedPosition, position])
  const activeCoordinates = activeCell
    ? getCoordinates(activeCell.square)
    : null
  return (
    <BoardContext.Provider
      value={{
        activeCell,
        setActiveCell,
        highlightedCoordinates,
        toggleHighlight,
        resetHighlightedCoordinates,
        availableMoves,
        activeCoordinates
      }}
    >
      {children}
    </BoardContext.Provider>
  )
}
