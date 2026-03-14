import { useBoardContext } from 'context/BoardContext'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { Highlights } from './BoardHighlights'
import { Pieces } from './BoardPieces'
import { BoardGrid } from './BoardGrid'
import { usePositionContext } from 'context/PositionContext'
import {
  getCoordinates,
  getDisplayCoordinate,
  getLogicalCoordinate
} from 'controller/chess/coordinates'
import { getPosition } from 'controller/chess/getPosition.web'
import { TSquare } from 'types/Chess'
import { TPlayer } from 'types/Chess'
import { BoardAnnotations } from './BoardAnnotations'
import { useTurnContext } from 'context/TurnContext'
import { renderPieceSet } from './pieceSet'

type BoardProps = {
  hideCoordinates?: boolean
  orientation?: TPlayer
}

export const Board: FC<BoardProps> = ({
  hideCoordinates = false,
  orientation = 'w'
}) => {
  const boardRef = useRef<HTMLDivElement>(null)
  const drawStartRef = useRef<{ x: number; y: number } | null>(null)
  const [keyboardSquare, setKeyboardSquare] = useState<{ x: number; y: number } | null>(
    null
  )

  const {
    activeCell,
    activeCoordinates,
    setActiveCell,
    toggleHighlight,
    highlightedCoordinates,
    resetHighlightedCoordinates,
    availableMoves,
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
    updateDrag,
    stopDrag,
    preferences,
    getAnnotationColorFromEvent
  } = useBoardContext()

  const { turn } = useTurnContext()
  const {
    position,
    movePieceToCoordinate,
    history,
    isBlackKingInCheck,
    isWhiteKingInCheck,
    whiteMoves,
    blackMoves
  } = usePositionContext()

  const moves = useMemo(
    () =>
      !activeCell
        ? []
        : [...whiteMoves, ...blackMoves]
            .filter(
              (m) =>
                activeCell.piece === m.slice(0, 2) &&
                activeCell.square === m.slice(2, 4)
            )
            .map((m) => m.slice(4) as TSquare)
            .map(getCoordinates)
            .map((coord) => getDisplayCoordinate(coord, orientation)),
    [activeCell, blackMoves, orientation, whiteMoves]
  )

  const getBoardSquare = (clientX: number, clientY: number) => {
    const displayCoordinate = getPosition(clientX, clientY, boardRef.current)
    const clamped = {
      x: Math.min(7, Math.max(0, displayCoordinate.x)),
      y: Math.min(7, Math.max(0, displayCoordinate.y))
    }
    return getLogicalCoordinate(clamped, orientation)
  }

  const resolveMove = async (sourceCell: typeof activeCell, targetMove?: TSquare) => {
    if (!sourceCell || !targetMove) return
    const result = await movePieceToCoordinate({
      cell: sourceCell,
      coordinate: targetMove
    })
    if (!result?.success && sourceCell.piece[0] !== turn) {
      setPremove({
        from: sourceCell.square,
        to: targetMove
      })
    } else {
      setPremove(null)
    }
  }

  useEffect(() => {
    if (!dragState.active || !dragState.fromCell) return
    const onPointerMove = (e: PointerEvent) => {
      updateDrag(e.clientX, e.clientY)
    }
    const onPointerUp = async (e: PointerEvent) => {
      const sourceCell = dragState.fromCell
      const square = getBoardSquare(e.clientX, e.clientY)
      const targetMove = availableMoves.find((m) => {
        const c = getCoordinates(m)
        return c.x === square.x && c.y === square.y
      })
      await resolveMove(sourceCell, targetMove)
      stopDrag()
      setActiveCell(null)
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [
    availableMoves,
    dragState.active,
    dragState.fromCell,
    setActiveCell,
    stopDrag,
    updateDrag
  ])

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.isPropagationStopped()) {
      const { x: boardX, y: boardY } = getBoardSquare(e.clientX, e.clientY)
      const targetMove = availableMoves.find((m) => {
        const { x, y } = getCoordinates(m)
        return x === boardX && y === boardY
      })
      if (activeCell && targetMove) {
        resolveMove(activeCell, targetMove)
      }
      setActiveCell(null)
      resetHighlightedCoordinates()
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 2) return
    e.preventDefault()
    const point = getBoardSquare(e.clientX, e.clientY)
    drawStartRef.current = point
    const color = getAnnotationColorFromEvent({
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey
    })
    setDrawPreview({ from: point, to: point, color })
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drawStartRef.current || !drawPreview) return
    const point = getBoardSquare(e.clientX, e.clientY)
    setDrawPreview({
      from: drawStartRef.current,
      to: point,
      color: drawPreview.color
    })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 2) return
    e.preventDefault()
    if (!drawStartRef.current || !drawPreview) return
    const end = getBoardSquare(e.clientX, e.clientY)
    const start = drawStartRef.current
    if (start.x === end.x && start.y === end.y) {
      toggleCircle(start, drawPreview.color)
    } else {
      toggleArrow(start, end, drawPreview.color)
    }
    drawStartRef.current = null
    setDrawPreview(null)
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const square = getBoardSquare(e.clientX, e.clientY)
    clearAnnotationsAtCell(square)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!keyboardSquare) {
      setKeyboardSquare({ x: 4, y: 4 })
      return
    }
    if (e.key === 'Escape') {
      setActiveCell(null)
      setPremove(null)
      setKeyboardSquare(null)
      return
    }
    if (e.key === 'ArrowUp') setKeyboardSquare((prev) => ({ x: prev?.x ?? 4, y: Math.max(0, (prev?.y ?? 4) - 1) }))
    if (e.key === 'ArrowDown') setKeyboardSquare((prev) => ({ x: prev?.x ?? 4, y: Math.min(7, (prev?.y ?? 4) + 1) }))
    if (e.key === 'ArrowLeft') setKeyboardSquare((prev) => ({ x: Math.max(0, (prev?.x ?? 4) - 1), y: prev?.y ?? 4 }))
    if (e.key === 'ArrowRight') setKeyboardSquare((prev) => ({ x: Math.min(7, (prev?.x ?? 4) + 1), y: prev?.y ?? 4 }))
    if (e.key.toLowerCase() === 'c') clearAnnotations()
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') removeLastAnnotation()
    if (e.key === 'Enter' || e.key === ' ') {
      const targetMove = availableMoves.find((m) => {
        const c = getCoordinates(m)
        return c.x === keyboardSquare.x && c.y === keyboardSquare.y
      })
      if (activeCell && targetMove) {
        resolveMove(activeCell, targetMove)
        setActiveCell(null)
      } else {
        const square = (String.fromCharCode(97 + keyboardSquare.x) + (8 - keyboardSquare.y)) as TSquare
        const cell = position.find((p) => p.square === square) ?? null
        setActiveCell(cell)
      }
    }
  }

  const themeClass =
    preferences.boardTheme === 'blue'
      ? 'board-theme-blue'
      : preferences.boardTheme === 'olive'
      ? 'board-theme-olive'
      : 'board-theme-classic'

  return (
    <div
      className={`relative mx-auto aspect-square w-full max-w-[min(92vw,76vh)] overflow-hidden rounded-lg border border-[#5e5a52] bg-white shadow-[0_16px_28px_rgba(0,0,0,0.35)] xl:max-w-[76vh] ${themeClass}`}
      ref={boardRef}
      onClick={handleBoardClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Highlights
        isBlackKingInCheck={isBlackKingInCheck}
        isWhiteKingInCheck={isWhiteKingInCheck}
        highlightedCoordinates={highlightedCoordinates}
        availableMoves={availableMoves}
        moves={moves}
        history={history}
        activeCoordinates={activeCoordinates}
        position={position}
        orientation={orientation}
      />
      <BoardAnnotations
        arrows={arrows}
        circles={circles}
        preview={drawPreview}
        orientation={orientation}
      />
      <BoardGrid
        hideCoordinates={hideCoordinates || !preferences.showCoordinates}
        orientation={orientation}
        theme={preferences.boardTheme}
      />
      <Pieces position={position} orientation={orientation} />
      {dragState.active && dragState.fromCell ? (
        <div
          className="pointer-events-none absolute z-50 h-[12.5%] w-[12.5%] -translate-x-1/2 -translate-y-1/2 opacity-85"
          style={{
            left: dragState.clientX - (boardRef.current?.getBoundingClientRect().left ?? 0),
            top: dragState.clientY - (boardRef.current?.getBoundingClientRect().top ?? 0)
          }}
        >
          {renderPieceSet(
            dragState.fromCell.piece,
            preferences.pieceTheme,
            'h-full w-full select-none'
          )}
        </div>
      ) : null}
      {premove ? (
        <div className="pointer-events-none absolute bottom-2 right-2 z-40 rounded bg-black/60 px-2 py-1 text-[10px] text-white">
          Premove: {premove.from}
          {'->'}
          {premove.to}
        </div>
      ) : null}
    </div>
  )
}
