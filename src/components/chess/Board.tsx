import { useBoardContext } from 'context/BoardContext'
import { FC, useEffect, useRef, useState, useCallback } from 'react'
import { Highlights } from './BoardHighlights'
import { Pieces } from './BoardPieces'
import { BoardGrid } from './BoardGrid'
import { usePositionContext } from 'context/PositionContext'
import {
  getCoordinates,
  getLogicalCoordinate
} from 'controller/chess/coordinates'
import { getPosition } from 'controller/chess/getPosition.web'
import { getAvailableMoves } from 'controller/chess/moves'
import { TSquare } from 'types/Chess'
import { TPlayer } from 'types/Chess'
import { BoardAnnotations } from './BoardAnnotations'
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
  const ghostRef = useRef<HTMLDivElement>(null)
  const drawStartRef = useRef<{ x: number; y: number } | null>(null)
  const suppressNextBoardClickRef = useRef(false)
  const [keyboardSquare, setKeyboardSquare] = useState<{ x: number; y: number } | null>(
    null
  )

  const {
    activeCell,
    activeCoordinates,
    setActiveCell,
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
    dragState,
    stopDrag,
    preferences,
    getAnnotationColorFromEvent
  } = useBoardContext()

  const {
    position,
    movePieceToCoordinate,
    history,
    isBlackKingInCheck,
    isWhiteKingInCheck
  } = usePositionContext()

  const getBoardSquare = (clientX: number, clientY: number) => {
    const displayCoordinate = getPosition(clientX, clientY, boardRef.current)
    const clamped = {
      x: Math.min(7, Math.max(0, displayCoordinate.x)),
      y: Math.min(7, Math.max(0, displayCoordinate.y))
    }
    return getLogicalCoordinate(clamped, orientation)
  }

  const resolveMove = useCallback(async (sourceCell: typeof activeCell, targetMove?: TSquare) => {
    if (!sourceCell || !targetMove) return
    await movePieceToCoordinate({
      cell: sourceCell,
      coordinate: targetMove
    })
  }, [movePieceToCoordinate])

  const resolveMoveRef = useRef(resolveMove)
  resolveMoveRef.current = resolveMove

  const positionRef = useRef(position)
  positionRef.current = position

  useEffect(() => {
    if (!dragState.active || !dragState.fromCell) return
    const onPointerMove = (e: PointerEvent) => {
      if (ghostRef.current && boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect()
        ghostRef.current.style.left = `${e.clientX - rect.left}px`
        ghostRef.current.style.top = `${e.clientY - rect.top}px`
      }
    }
    const onPointerUp = async (e: PointerEvent) => {
      const sourceCell = dragState.fromCell
      const square = getBoardSquare(e.clientX, e.clientY)
      const movedDistance = Math.hypot(
        e.clientX - dragState.startClientX,
        e.clientY - dragState.startClientY
      )
      const didDrag = movedDistance > 5
      const dragMoves = sourceCell ? getAvailableMoves(sourceCell, positionRef.current) : []
      const targetMove = dragMoves.find((m) => {
        const c = getCoordinates(m)
        return c.x === square.x && c.y === square.y
      })
      if (didDrag) {
        await resolveMoveRef.current(sourceCell, targetMove)
        setActiveCell(null)
        suppressNextBoardClickRef.current = true
      }
      stopDrag()
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [
    dragState.active,
    dragState.fromCell,
    dragState.startClientX,
    dragState.startClientY,
    setActiveCell,
    stopDrag
  ])

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (suppressNextBoardClickRef.current) {
      suppressNextBoardClickRef.current = false
      return
    }
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
          ref={ghostRef}
          className="pointer-events-none absolute z-50 h-[12.5%] w-[12.5%] -translate-x-1/2 -translate-y-1/2"
          style={{
            left: dragState.startClientX - (boardRef.current?.getBoundingClientRect().left ?? 0),
            top: dragState.startClientY - (boardRef.current?.getBoundingClientRect().top ?? 0)
          }}
        >
          {renderPieceSet(
            dragState.fromCell.piece,
            preferences.pieceTheme,
            'h-full w-full select-none'
          )}
        </div>
      ) : null}
    </div>
  )
}
