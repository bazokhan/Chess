import { FC, MouseEventHandler, useCallback, useMemo } from 'react'
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
    startDrag,
    stopDrag,
    preferences
  } = useBoardContext()
  const { animate, future } = usePositionContext()
  const isActive = activeCell?.square === cell.square
  const isAnimated = animate[cell.square]?.cell.square === cell.square

  const logicalCoordinates = getCoordinates(cell.square)

  const onToggle: MouseEventHandler = useCallback(
    (e) => {
      if (!isActive && activeCell) {
        return
      }

      e.stopPropagation()

      if (isActive) {
        setActiveCell(null)
      } else {
        setActiveCell(cell)
      }
    },
    [activeCell, cell, isActive, setActiveCell]
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
      e.stopPropagation()
      setActiveCell(cell)
      startDrag({
        cell,
        pointerId: e.pointerId,
        clientX: e.clientX,
        clientY: e.clientY
      })
      ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    },
    [cell, future?.length, setActiveCell, startDrag]
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      ;(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId)
      stopDrag()
    },
    [stopDrag]
  )

  return (
    <div
      className={`absolute ${
        isActive ? 'z-30' : 'z-20'
      } h-[12.5%] w-[12.5%] cursor-grab touch-none`}
      style={{
        top: `${displayCoordinates.y * 12.5}%`,
        left: `${displayCoordinates.x * 12.5}%`,
        transition: `all ${ANIMATION_DURATION / preferences.animationSpeed}ms`
      }}
      onClick={future?.length ? undefined : onToggle}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {renderPieceSet(cell.piece, preferences.pieceTheme, 'h-full w-full select-none')}
    </div>
  )
}
