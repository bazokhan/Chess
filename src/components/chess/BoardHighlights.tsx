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

  const lastMove = history?.at(-1)?.coordinates ?? []
  const checkHighlights = [
    isBlackKingInCheck ? { x: blackX, y: blackY } : null,
    isWhiteKingInCheck ? { x: whiteX, y: whiteY } : null
  ].filter(Boolean) as { x: number; y: number }[]

  return (
    <>
      {lastMove.map(({ x, y }) => {
        const c = toDisplay(x, y)
        return <HighLight key={`last-${x}-${y}`} x={c.x} y={c.y} variant="move" />
      })}
      {checkHighlights.map(({ x, y }) => {
        const c = toDisplay(x, y)
        return <HighLight key={`check-${x}-${y}`} x={c.x} y={c.y} variant="check" />
      })}
      {highlightedCoordinates?.map(({ x, y }) => {
        const c = toDisplay(x, y)
        return <HighLight key={`${x}-${y}`} x={c.x} y={c.y} />
      })}
      {availableMoves?.map((m) => {
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
      })}
      {activeCoordinates
        ? (() => {
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
        : null}
    </>
  )
}
