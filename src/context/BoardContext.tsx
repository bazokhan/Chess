import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState
} from 'react'
import { TCell, TCoordinate } from 'types/Cell'

const BoardContext = createContext<{
  activeCell: TCell | null
  setActiveCell: (cell: TCell | null) => void
  highlightedCoordinates: TCoordinate[]
  toggleHighlight: (cell: TCoordinate) => void
  resetHighlightedCoordinates: () => void
}>({
  activeCell: null,
  setActiveCell: () => {},
  highlightedCoordinates: [],
  toggleHighlight: () => {},
  resetHighlightedCoordinates: () => {}
})

export const useBoardContext = () => useContext(BoardContext)

export const BoardProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeCell, setActiveCell] = useState<TCell | null>(null)
  const [highlightedCoordinates, setHighlightedCoordinates] = useState<
    TCoordinate[]
  >([])
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
  return (
    <BoardContext.Provider
      value={{
        activeCell,
        setActiveCell,
        highlightedCoordinates,
        toggleHighlight,
        resetHighlightedCoordinates
      }}
    >
      {children}
    </BoardContext.Provider>
  )
}
