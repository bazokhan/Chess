import { FC } from 'react'
import { HighLight } from './Highlight'
import {
  getCoordinates,
  getDisplayCoordinate
} from 'controller/chess/coordinates'
import { TCell, TSquare } from 'types/Chess'
import { TPlayer } from 'types/Chess'

type HighlightsProps = {
  isBlackKingInCheck: boolean
  isWhiteKingInCheck: boolean
  highlightedCoordinates: { x: number; y: number }[]
  availableMoves: TSquare[]
  moves: { x: number; y: number }[]
  history: { coordinates: { x: number; y: number }[] }[]
  activeCoordinates: { x: number; y: number } | null
  position: TCell[]
  orientation: TPlayer
}

export const Highlights: FC<HighlightsProps> = ({
  isBlackKingInCheck,
  isWhiteKingInCheck,
  highlightedCoordinates,
  availableMoves,
  moves,
  history,
  activeCoordinates,
  position,
  orientation
}) => {
  const blackKing = position.find((p) => p.piece === 'bk')
  const whiteKing = position.find((p) => p.piece === 'wk')
  const { x: blackX, y: blackY } = blackKing
    ? getCoordinates(blackKing?.square)
    : { x: 0, y: 0 }
  const { x: whiteX, y: whiteY } = whiteKing
    ? getCoordinates(whiteKing?.square)
    : { x: 0, y: 0 }

  const toDisplay = (x: number, y: number) =>
    getDisplayCoordinate({ x, y }, orientation)

  return (
    <>
      {isBlackKingInCheck ? (
        (() => {
          const c = toDisplay(blackX, blackY)
          return (
        <HighLight
          key={`${blackX}-${blackY}-${isBlackKingInCheck}`}
          x={c.x}
          y={c.y}
          variant="check"
        />
          )
        })()
      ) : null}
      {isWhiteKingInCheck ? (
        (() => {
          const c = toDisplay(whiteX, whiteY)
          return (
        <HighLight
          key={`${whiteX}-${whiteY}-${isWhiteKingInCheck}`}
          x={c.x}
          y={c.y}
          variant="check"
        />
          )
        })()
      ) : null}
      {isBlackKingInCheck ? (
        (() => {
          const c = toDisplay(blackX, blackY)
          return <HighLight key={`${blackX}-${blackY}`} x={c.x} y={c.y} />
        })()
      ) : null}
      {highlightedCoordinates?.map(({ x, y }) => {
        const c = toDisplay(x, y)
        return <HighLight key={`${x}-${y}`} x={c.x} y={c.y} />
      })}
      {availableMoves?.map((m) => (
        (() => {
          const mCoord = getCoordinates(m)
          const c = toDisplay(mCoord.x, mCoord.y)
          return (
            <HighLight
              key={`${mCoord.x}-${mCoord.y}`}
              x={c.x}
              y={c.y}
              variant={
                position.find((cell) => cell.square === m)
                  ? 'availableCapture'
                  : 'availableMove'
              }
            />
          )
        })()
      ))}
      {moves?.map((m) => {
        const c = toDisplay(m.x, m.y)
        return <HighLight key={`${m.x}-${m.y}`} x={c.x} y={c.y} variant="newMove" />
      })}
      {history
        ?.at(-1)
        ?.coordinates?.map(({ x, y }) => {
          const c = toDisplay(x, y)
          return <HighLight key={`${x}-${y}`} x={c.x} y={c.y} variant="move" />
        })}
      {activeCoordinates ? (
        (() => {
          const c = toDisplay(activeCoordinates.x, activeCoordinates.y)
          return (
            <HighLight
              key={`${activeCoordinates.x}-${activeCoordinates.y}`}
              x={c.x}
              y={c.y}
              variant="move"
            />
          )
        })()
      ) : null}
    </>
  )
}
