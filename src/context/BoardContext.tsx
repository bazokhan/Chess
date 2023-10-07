import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState
} from 'react'
import { TCell, TCoordinate } from 'types/Chess'
import { getAvailableMoves } from 'controller/chess/moves'
import { getCoordinates } from 'controller/chess/coordinates'
import { usePositionContext } from './PositionContext'
import { TSquare } from 'types/Chess'

const BoardContext = createContext<{
  activeCell: TCell | null
  setActiveCell: (cell: TCell | null) => void
  highlightedCoordinates: TCoordinate[]
  toggleHighlight: (cell: TCoordinate) => void
  resetHighlightedCoordinates: () => void
  availableMoves: TSquare[]
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
  const { position, isGameOver } = usePositionContext()
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
    return getAvailableMoves(activeCell, position)
  }, [activeCell, isGameOver, position])
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
