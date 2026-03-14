import { FC, MouseEventHandler, useCallback, useMemo, useRef } from 'react'
import { useBoardContext } from 'context/BoardContext'
import { TCell } from 'types/Chess'
import {
  getCoordinates,
  getDisplayCoordinate
} from 'controller/chess/coordinates'
import { usePositionContext } from 'context/PositionContext'
import { ANIMATION_DURATION } from 'controller/chess/constants'
import { TPlayer } from 'types/Chess'
import { renderPieceSet } from './pieceSet'

type PieceProps = {
  cell: TCell
  orientation: TPlayer
}

// #eb6150  /80
// #ffff33  /50

export const Piece: FC<PieceProps> = ({ cell, orientation }) => {
  const {
    activeCell,
    setActiveCell,
    availableMoves,
    startDrag,
    dragState,
    preferences
  } = useBoardContext()
  const { animate, future, isWhiteKingCheckMated, isBlackKingCheckMated } =
    usePositionContext()
  const isActive = activeCell?.square === cell.square
  const isAnimated = animate[cell.square]?.cell.square === cell.square
  const suppressNextClickRef = useRef(false)
  const isCheckmatedKing =
    (cell.piece === 'wk' && isWhiteKingCheckMated) ||
    (cell.piece === 'bk' && isBlackKingCheckMated)

  const logicalCoordinates = getCoordinates(cell.square)

  const onToggle: MouseEventHandler = useCallback(
    (e) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false
        e.stopPropagation()
        return
      }
      if (isActive) {
        e.stopPropagation()
        setActiveCell(null)
        return
      }
      // If another piece is active and this is a valid capture target, let board handle it
      if (activeCell && availableMoves.includes(cell.square)) {
        return
      }
      // Switch selection to this piece
      e.stopPropagation()
      setActiveCell(cell)
    },
    [activeCell, availableMoves, cell, isActive, setActiveCell]
  )

  const displayCoordinates = useMemo(() => {
    const currentCoordinates = isAnimated
      ? {
          x: animate[cell.square]?.move?.[1]?.x ?? 0,
          y: animate[cell.square]?.move?.[1]?.y ?? 0
        }
      : logicalCoordinates
    return getDisplayCoordinate(currentCoordinates, orientation)
  }, [animate, cell.square, isAnimated, logicalCoordinates.x, logicalCoordinates.y, orientation])

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (future?.length) return
      if (e.button !== 0) return
      // If another piece is active and this is a valid capture target, let click/board handle it
      if (activeCell && availableMoves.includes(cell.square)) return
      e.stopPropagation()
      suppressNextClickRef.current = true
      setActiveCell(cell)
      startDrag({
        cell,
        pointerId: e.pointerId,
        clientX: e.clientX,
        clientY: e.clientY
      })
    },
    [activeCell, availableMoves, cell, future?.length, setActiveCell, startDrag]
  )

  const isDragging = dragState.active && dragState.fromCell?.square === cell.square

  return (
    <div
      className={`absolute ${
        isActive ? 'z-30' : 'z-20'
      } h-[12.5%] w-[12.5%] cursor-grab touch-none`}
      style={{
        top: `${displayCoordinates.y * 12.5}%`,
        left: `${displayCoordinates.x * 12.5}%`,
        transition: isDragging ? 'none' : `all ${ANIMATION_DURATION / preferences.animationSpeed}ms`,
        opacity: isDragging ? 0 : 1
      }}
      onClick={future?.length ? undefined : onToggle}
      onPointerDown={onPointerDown}
    >
      <div
        className={`relative h-full w-full ${
          isCheckmatedKing ? 'rotate-[14deg] scale-[0.93]' : ''
        }`}
      >
        {renderPieceSet(
          cell.piece,
          preferences.pieceTheme,
          `h-full w-full select-none ${isCheckmatedKing ? 'opacity-85' : ''}`
        )}
        {isCheckmatedKing ? (
          <span
            className="pointer-events-none absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-red-300 bg-red-600 text-[11px] font-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
            title="Checkmate"
            aria-label="Checkmate"
          >
            ✕
          </span>
        ) : null}
      </div>
    </div>
  )
}
