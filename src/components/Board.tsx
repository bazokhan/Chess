import { useBoardContext } from 'context/BoardContext'
import { FC, useEffect, useRef } from 'react'
import { HighLight } from './Highlight'
import { Piece } from './Piece'
import { usePositionContext } from 'context/PositionContext'

type BoardProps = {
  hideCoordinates?: boolean
}

const nums = [8, 7, 6, 5, 4, 3, 2, 1]
const letters = 'abcdefgh'.split('')

const getPosition = (_x: number, _y: number, board: HTMLDivElement | null) => {
  const {
    left = 0,
    top = 0,
    width = 0,
    height = 0
  } = board?.getBoundingClientRect() ?? {}
  const cellWidth = Math.floor((width ?? 0) / 8)
  const cellHeight = Math.floor((height ?? 0) / 8)
  const x = cellWidth ? Math.floor((_x - left) / cellWidth) : 0
  const y = cellHeight ? Math.floor((_y - top) / cellHeight) : 0
  return { x, y }
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

  const { position, movePieceToCoordinate, history } = usePositionContext()

  // User Interaction with the board
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

  return (
    <div
      className="relative max-h-[80vh] w-[80vh] overflow-hidden rounded-md bg-white"
      ref={boardRef}
      onClick={(e) => {
        // User Interaction with the board
        if (!e.isPropagationStopped()) {
          const { x: boardX, y: boardY } = getPosition(
            e.clientX,
            e.clientY,
            boardRef.current
          )
          if (
            activeCell &&
            availableMoves.find(({ x, y }) => x === boardX && y === boardY)
          ) {
            movePieceToCoordinate(activeCell, { x: boardX, y: boardY })
          }
          setActiveCell(null)
          resetHighlightedCoordinates()
        }
      }}
    >
      {highlightedCoordinates?.map(({ x, y }) => (
        <HighLight key={`${x}-${y}`} x={x} y={y} />
      ))}
      {availableMoves?.map(({ x, y }) => (
        <HighLight key={`${x}-${y}`} x={x} y={y} variant="availableMove" />
      ))}
      {history
        ?.at(-1)
        ?.coordinates?.map(({ x, y }) => (
          <HighLight key={`${x}-${y}`} x={x} y={y} variant="move" />
        ))}
      {activeCoordinates ? (
        <HighLight
          key={`${activeCoordinates.x}-${activeCoordinates.y}`}
          x={activeCoordinates.x}
          y={activeCoordinates.y}
          variant="move"
        />
      ) : null}
      <svg
        width="800px"
        height="800px"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-full bg-[#e9edcc]"
      >
        <path
          fill="#779954"
          d="M255.9.2h-64v64h64zM0 64.17v64h64v-64zM128 .2H64v64h64zm64 255.9v64h64v-64zM0 192.12v64h64v-64zM383.85.2h-64v64h64zm128 0h-64v64h64zM128 256.1H64v64h64zM511.8 448v-64h-64v64zm0-128v-64h-64v64zM383.85 512h64v-64h-64zm128-319.88v-64h-64v64zM128 512h64v-64h-64zM0 512h64v-64H0zm255.9 0h64v-64h-64zM0 320.07v64h64v-64zm319.88-191.92v-64h-64v64zm-64 128h64v-64h-64zm-64 128v64h64v-64zm128-64h64v-64h-64zm0-127.95h64v-64h-64zm0 191.93v64h64v-64zM64 384.05v64h64v-64zm128-255.9v-64h-64v64zm191.92 255.9h64v-64h-64zm-128-191.93v-64h-64v64zm128-127.95v64h64v-64zm-128 255.9v64h64v-64zm-64-127.95H128v64h64zm191.92 64h64v-64h-64zM128 128.15H64v64h64zm0 191.92v64h64v-64z"
        />
        {hideCoordinates ? null : (
          <>
            {nums.map((num, index) => (
              <text
                key={num}
                x="4"
                y={index * 64 + 16}
                fontSize="14"
                fill={index % 2 === 0 ? '#779954' : '#e9edcc'}
              >
                {num}
              </text>
            ))}
            {letters.map((letter, index) => (
              <text
                key={letter}
                x={(index + 1) * 64 - 12}
                y="506"
                fontSize="14"
                fill={index % 2 === 0 ? '#e9edcc' : '#779954'}
              >
                {letter}
              </text>
            ))}
          </>
        )}
      </svg>
      {position.map((cell) => (
        <Piece key={cell.square} cell={cell} />
      ))}
    </div>
  )
}
