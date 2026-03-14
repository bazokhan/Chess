import { useBoardContext } from 'context/BoardContext'
import { FC, useEffect, useMemo, useRef } from 'react'
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

type BoardProps = {
  hideCoordinates?: boolean
  orientation?: TPlayer
}

export const Board: FC<BoardProps> = ({
  hideCoordinates = false,
  orientation = 'w'
}) => {
  const boardRef = useRef<HTMLDivElement>(null)

  const {
    activeCell,
    activeCoordinates,
    setActiveCell,
    toggleHighlight,
    highlightedCoordinates,
    resetHighlightedCoordinates,
    availableMoves
  } = useBoardContext()

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

  useEffect(() => {
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault()
      const displayCoordinate = getPosition(e.clientX, e.clientY, boardRef.current)
      const { x, y } = getLogicalCoordinate(displayCoordinate, orientation)
      if (!activeCell) {
        toggleHighlight({ x, y })
      } else {
        setActiveCell(null)
      }
    }

    const board = boardRef.current
    board?.addEventListener('contextmenu', handleRightClick)
    return () => board?.removeEventListener('contextmenu', handleRightClick)
  }, [activeCell, setActiveCell, toggleHighlight])

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.isPropagationStopped()) {
      const displayCoordinate = getPosition(e.clientX, e.clientY, boardRef.current)
      const { x: boardX, y: boardY } = getLogicalCoordinate(
        displayCoordinate,
        orientation
      )
      const targetMove = availableMoves.find((m) => {
        const { x, y } = getCoordinates(m)
        return x === boardX && y === boardY
      })
      if (activeCell && targetMove) {
        movePieceToCoordinate({
          cell: activeCell,
          coordinate: targetMove
        })
      }
      setActiveCell(null)
      resetHighlightedCoordinates()
    }
  }

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[min(92vw,76vh)] overflow-hidden rounded-lg border border-[#5e5a52] bg-white shadow-[0_16px_28px_rgba(0,0,0,0.35)] xl:max-w-[76vh]"
      ref={boardRef}
      onClick={handleBoardClick}
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
      <BoardGrid hideCoordinates={hideCoordinates} orientation={orientation} />
      <Pieces position={position} orientation={orientation} />
    </div>
  )
}
