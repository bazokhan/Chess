import {
  FC,
  PropsWithChildren,
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState
} from 'react'
import { TCell, TCoordinate } from 'types/Chess'
import { getAvailableMoves } from 'controller/chess/moves'
import { getCoordinates } from 'controller/chess/coordinates'
import { usePositionContext } from './PositionContext'
import { TPlayer, TSquare } from 'types/Chess'
import {
  AnnotationColor,
  BoardPreferences,
  loadBoardPreferences,
  saveBoardPreferences
} from 'controller/chess/boardPreferences'
import { useTurnContext } from './TurnContext'

type BoardArrow = {
  from: TCoordinate
  to: TCoordinate
  color: AnnotationColor
}

type BoardCircle = {
  at: TCoordinate
  color: AnnotationColor
}

type Premove = {
  from: TSquare
  to: TSquare
}

type DragState = {
  active: boolean
  pointerId: number | null
  fromCell: TCell | null
  clientX: number
  clientY: number
}

const BoardContext = createContext<{
  activeCell: TCell | null
  setActiveCell: (cell: TCell | null) => void
  highlightedCoordinates: TCoordinate[]
  toggleHighlight: (cell: TCoordinate) => void
  resetHighlightedCoordinates: () => void
  availableMoves: TSquare[]
  activeCoordinates: TCoordinate | null
  arrows: BoardArrow[]
  circles: BoardCircle[]
  drawPreview: {
    from: TCoordinate
    to: TCoordinate
    color: AnnotationColor
  } | null
  setDrawPreview: (
    preview: { from: TCoordinate; to: TCoordinate; color: AnnotationColor } | null
  ) => void
  toggleCircle: (coordinate: TCoordinate, color: AnnotationColor) => void
  toggleArrow: (from: TCoordinate, to: TCoordinate, color: AnnotationColor) => void
  clearAnnotations: () => void
  clearAnnotationsAtCell: (coordinate: TCoordinate) => void
  removeLastAnnotation: () => void
  premove: Premove | null
  setPremove: (premove: Premove | null) => void
  dragState: DragState
  startDrag: (args: {
    cell: TCell
    pointerId: number
    clientX: number
    clientY: number
  }) => void
  updateDrag: (clientX: number, clientY: number) => void
  stopDrag: () => void
  preferences: BoardPreferences
  updatePreferences: (next: Partial<BoardPreferences>) => void
  getAnnotationColorFromEvent: (args: {
    shiftKey: boolean
    altKey: boolean
    ctrlKey: boolean
    metaKey: boolean
  }) => AnnotationColor
}>({
  activeCell: null,
  setActiveCell: () => {},
  highlightedCoordinates: [],
  toggleHighlight: () => {},
  resetHighlightedCoordinates: () => {},
  availableMoves: [],
  activeCoordinates: null,
  arrows: [],
  circles: [],
  drawPreview: null,
  setDrawPreview: () => {},
  toggleCircle: () => {},
  toggleArrow: () => {},
  clearAnnotations: () => {},
  clearAnnotationsAtCell: () => {},
  removeLastAnnotation: () => {},
  premove: null,
  setPremove: () => {},
  dragState: {
    active: false,
    pointerId: null,
    fromCell: null,
    clientX: 0,
    clientY: 0
  },
  startDrag: () => {},
  updateDrag: () => {},
  stopDrag: () => {},
  preferences: loadBoardPreferences(),
  updatePreferences: () => {},
  getAnnotationColorFromEvent: () => 'green'
})

export const useBoardContext = () => useContext(BoardContext)

export const BoardProvider: FC<PropsWithChildren> = ({ children }) => {
  const { turn } = useTurnContext()
  const [activeCell, setActiveCell] = useState<TCell | null>(null)
  const [drawPreview, setDrawPreview] = useState<{
    from: TCoordinate
    to: TCoordinate
    color: AnnotationColor
  } | null>(null)
  const [arrows, setArrows] = useState<BoardArrow[]>([])
  const [circles, setCircles] = useState<BoardCircle[]>([])
  const [premove, setPremove] = useState<Premove | null>(null)
  const [dragState, setDragState] = useState<DragState>({
    active: false,
    pointerId: null,
    fromCell: null,
    clientX: 0,
    clientY: 0
  })
  const [preferences, setPreferences] = useState<BoardPreferences>(
    loadBoardPreferences()
  )
  const [highlightedCoordinates, setHighlightedCoordinates] = useState<
    TCoordinate[]
  >([])
  const { position, isGameOver, movePieceToCoordinate, hPosition } =
    usePositionContext()
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

  const getAnnotationColorFromEvent = ({
    shiftKey,
    altKey,
    ctrlKey,
    metaKey
  }: {
    shiftKey: boolean
    altKey: boolean
    ctrlKey: boolean
    metaKey: boolean
  }): AnnotationColor => {
    if (shiftKey) return 'green'
    if (altKey) return 'blue'
    if (ctrlKey || metaKey) return 'yellow'
    return preferences.annotationColor || 'red'
  }

  const toggleCircle = (coordinate: TCoordinate, color: AnnotationColor) => {
    setCircles((prev) => {
      const exists = prev.find(
        (item) =>
          item.at.x === coordinate.x && item.at.y === coordinate.y
      )
      if (exists) {
        return prev.filter(
          (item) =>
            !(item.at.x === coordinate.x && item.at.y === coordinate.y)
        )
      }
      return [...prev, { at: coordinate, color }]
    })
  }

  const toggleArrow = (
    from: TCoordinate,
    to: TCoordinate,
    color: AnnotationColor
  ) => {
    setArrows((prev) => {
      const exists = prev.find(
        (item) =>
          item.from.x === from.x &&
          item.from.y === from.y &&
          item.to.x === to.x &&
          item.to.y === to.y
      )
      if (exists) {
        return prev.filter(
          (item) =>
            !(
              item.from.x === from.x &&
              item.from.y === from.y &&
              item.to.x === to.x &&
              item.to.y === to.y
            )
        )
      }
      return [...prev, { from, to, color }]
    })
  }

  const clearAnnotations = () => {
    setArrows([])
    setCircles([])
    setDrawPreview(null)
  }

  const clearAnnotationsAtCell = (coordinate: TCoordinate) => {
    setArrows((prev) =>
      prev.filter(
        (item) =>
          !(
            (item.from.x === coordinate.x && item.from.y === coordinate.y) ||
            (item.to.x === coordinate.x && item.to.y === coordinate.y)
          )
      )
    )
    setCircles((prev) =>
      prev.filter((item) => !(item.at.x === coordinate.x && item.at.y === coordinate.y))
    )
    setDrawPreview((prev) => {
      if (!prev) return prev
      const touchesCell =
        (prev.from.x === coordinate.x && prev.from.y === coordinate.y) ||
        (prev.to.x === coordinate.x && prev.to.y === coordinate.y)
      return touchesCell ? null : prev
    })
  }

  const removeLastAnnotation = () => {
    setArrows((prev) => prev.slice(0, Math.max(0, prev.length - 1)))
    setCircles((prev) => prev.slice(0, Math.max(0, prev.length - 1)))
  }

  const startDrag = ({
    cell,
    pointerId,
    clientX,
    clientY
  }: {
    cell: TCell
    pointerId: number
    clientX: number
    clientY: number
  }) => {
    setDragState({
      active: true,
      pointerId,
      fromCell: cell,
      clientX,
      clientY
    })
  }

  const updateDrag = (clientX: number, clientY: number) => {
    setDragState((prev) => ({
      ...prev,
      clientX,
      clientY
    }))
  }

  const stopDrag = () => {
    setDragState({
      active: false,
      pointerId: null,
      fromCell: null,
      clientX: 0,
      clientY: 0
    })
  }

  const updatePreferences = (next: Partial<BoardPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...next }
      saveBoardPreferences(updated)
      return updated
    })
  }

  const availableMoves = useMemo(() => {
    if (isGameOver) return []
    if (!activeCell) return []
    return getAvailableMoves(activeCell, position)
  }, [activeCell, isGameOver, position])
  const activeCoordinates = activeCell
    ? getCoordinates(activeCell.square)
    : null

  useEffect(() => {
    if (!premove) return
    const piece = hPosition[premove.from]
    if (!piece) {
      setPremove(null)
      return
    }
    const side = piece.piece[0] as TPlayer
    if (side !== turn) return
    const legal = getAvailableMoves(piece, position)
    if (!legal.includes(premove.to)) {
      setPremove(null)
      return
    }
    movePieceToCoordinate({
      cell: piece,
      coordinate: premove.to,
      skipAnimation: false
    })
    setPremove(null)
  }, [hPosition, movePieceToCoordinate, position, premove, turn])

  return (
    <BoardContext.Provider
      value={{
        activeCell,
        setActiveCell,
        highlightedCoordinates,
        toggleHighlight,
        resetHighlightedCoordinates,
        availableMoves,
        activeCoordinates,
        arrows,
        circles,
        drawPreview,
        setDrawPreview,
        toggleCircle,
        toggleArrow,
        clearAnnotations,
        clearAnnotationsAtCell,
        removeLastAnnotation,
        premove,
        setPremove,
        dragState,
        startDrag,
        updateDrag,
        stopDrag,
        preferences,
        updatePreferences,
        getAnnotationColorFromEvent
      }}
    >
      {children}
    </BoardContext.Provider>
  )
}
