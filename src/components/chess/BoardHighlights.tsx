import { FC } from 'react'
import { HighLight } from './Highlight'
import { getCoordinates } from 'controller/chess/coordinates'
import { TCell, TSquare } from 'types/Chess'

type HighlightsProps = {
  isBlackKingInCheck: boolean
  isWhiteKingInCheck: boolean
  highlightedCoordinates: { x: number; y: number }[]
  availableMoves: TSquare[]
  moves: { x: number; y: number }[]
  history: { coordinates: { x: number; y: number }[] }[]
  activeCoordinates: { x: number; y: number } | null
  position: TCell[]
}

export const Highlights: FC<HighlightsProps> = ({
  isBlackKingInCheck,
  isWhiteKingInCheck,
  highlightedCoordinates,
  availableMoves,
  moves,
  history,
  activeCoordinates,
  position
}) => {
  const blackKing = position.find((p) => p.piece === 'bk')
  const whiteKing = position.find((p) => p.piece === 'wk')
  const { x: blackX, y: blackY } = blackKing
    ? getCoordinates(blackKing?.square)
    : { x: 0, y: 0 }
  const { x: whiteX, y: whiteY } = whiteKing
    ? getCoordinates(whiteKing?.square)
    : { x: 0, y: 0 }

  return (
    <>
      {isBlackKingInCheck ? (
        <HighLight
          key={`${blackX}-${blackY}-${isBlackKingInCheck}`}
          x={blackX}
          y={blackY}
          variant="check"
        />
      ) : null}
      {isWhiteKingInCheck ? (
        <HighLight
          key={`${whiteX}-${whiteY}-${isWhiteKingInCheck}`}
          x={whiteX}
          y={whiteY}
          variant="check"
        />
      ) : null}
      {isBlackKingInCheck ? (
        <HighLight key={`${blackX}-${blackY}`} x={blackX} y={blackY} />
      ) : null}
      {highlightedCoordinates?.map(({ x, y }) => (
        <HighLight key={`${x}-${y}`} x={x} y={y} />
      ))}
      {availableMoves?.map((m) => (
        <HighLight
          key={`${getCoordinates(m).x}-${getCoordinates(m).y}`}
          x={getCoordinates(m).x}
          y={getCoordinates(m).y}
          variant={
            position.find((cell) => cell.square === m)
              ? 'availableCapture'
              : 'availableMove'
          }
        />
      ))}
      {moves?.map((m) => (
        <HighLight key={`${m.x}-${m.y}`} x={m.x} y={m.y} variant="newMove" />
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
    </>
  )
}
