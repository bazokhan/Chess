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

const BoardContext = createContext<{
  activeCell: TCell | null
  setActiveCell: (cell: TCell | null) => void
  highlightedCoordinates: TCoordinate[]
  toggleHighlight: (cell: TCoordinate) => void
  resetHighlightedCoordinates: () => void
  availableMoves: TCoordinate[]
}>({
  activeCell: null,
  setActiveCell: () => {},
  highlightedCoordinates: [],
  toggleHighlight: () => {},
  resetHighlightedCoordinates: () => {},
  availableMoves: []
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
  const availableMoves = useMemo(() => {
    return getAvailableMoves(activeCell)
  }, [activeCell])
  return (
    <BoardContext.Provider
      value={{
        activeCell,
        setActiveCell,
        highlightedCoordinates,
        toggleHighlight,
        resetHighlightedCoordinates,
        availableMoves
      }}
    >
      {children}
    </BoardContext.Provider>
  )
}
