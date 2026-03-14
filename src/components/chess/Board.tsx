import { useBoardContext } from 'context/BoardContext'
import { FC, useEffect, useMemo, useRef } from 'react'
import { Highlights } from './BoardHighlights'
import { Pieces } from './BoardPieces'
import { BoardGrid } from './BoardGrid'
import { usePositionContext } from 'context/PositionContext'
import { getCoordinates } from 'controller/chess/coordinates'
import { getPosition } from 'controller/chess/getPosition.web'
import { TSquare } from 'types/Chess'

type BoardProps = {
  hideCoordinates?: boolean
}

export const Board: FC<BoardProps> = ({ hideCoordinates = false }) => {
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
            .map(getCoordinates),
    [activeCell, blackMoves, whiteMoves]
  )

  useEffect(() => {
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault()
      const { x, y } = getPosition(e.clientX, e.clientY, boardRef.current)
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
      const { x: boardX, y: boardY } = getPosition(
        e.clientX,
        e.clientY,
        boardRef.current
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
      className="relative max-h-[80vh] w-[80vh] overflow-hidden rounded-md bg-white"
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
      />
      <BoardGrid hideCoordinates={hideCoordinates} />
      <Pieces position={position} />
    </div>
  )
}
