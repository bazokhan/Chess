import { FC } from 'react'
import { TreeItem } from 'types/Chess'
import { getCoordinates } from 'controller/chess/coordinates'
import { SimplePiece } from './SimplePiece'

type MoveProps = {
  leaf: TreeItem & { evaluation?: number }
  boardWidth: number
  boardHeight: number
}
export const Move: FC<MoveProps> = ({ leaf, boardHeight, boardWidth }) => {
  const to = getCoordinates(leaf.move)
  const from = getCoordinates(leaf.piece.square)

  // Differ according to direction
  const topPoint = to.y < from.y ? to : from
  const bottomPoint = to.y >= from.y ? to : from
  const leftPoint = to.x < from.x ? to : from
  const rightPoint = to.x >= from.x ? to : from
  const squareHeight = boardHeight / 8
  const top = squareHeight * topPoint.y + squareHeight / 2
  const squareWidth = boardWidth / 8
  const left = squareWidth * leftPoint.x + squareWidth / 2
  const height = (bottomPoint.y - topPoint.y) * squareHeight
  const width = (rightPoint.x - leftPoint.x) * squareWidth
  const angle = Math.atan(height / width)
  const diagonal = Math.sqrt(width ** 2 + height ** 2)
  const styleLeft =
    (rightPoint === to && topPoint === to) ||
    (leftPoint === to && bottomPoint === to)
      ? '100%'
      : '0'

  const transform =
    (rightPoint === to && topPoint === to) ||
    (leftPoint === to && bottomPoint === to)
      ? `rotate(${Math.PI - angle}rad)`
      : `rotate(${angle}rad)`

  // Differ according to turn
  const backgroundImage = `linear-gradient(${angle}rad, ${
    topPoint === to ? 'yellow, green' : 'green, yellow'
  })`
  const className =
    topPoint === to
      ? 'absolute left-[-2px] top-[-10px]'
      : 'absolute right-[-2px] bottom-[-10px]'
  const style =
    topPoint === to
      ? {
          border: '12px solid transparent',
          borderLeft: 0,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: 'yellow'
        }
      : {
          border: '12px solid transparent',
          borderRight: 0,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'yellow'
        }

  return leaf.evaluation !== undefined ? (
    <>
      <div
        key={leaf.evaluation}
        className={`absolute z-50 h-[12.5%] w-[12.5%] text-2xl text-[#eb6150]/80`}
        style={{
          top: `${to.y * 12.5}%`,
          left: `${to.x * 12.5}%`
        }}
      >
        <span className="absolute left-0 top-0 font-black">
          {leaf.evaluation / 100}
        </span>
        <SimplePiece
          key={leaf.move}
          style={{ opacity: 0.3 }}
          cell={leaf.piece}
        />
      </div>

      <div
        className={`absolute z-10 min-h-[5px] min-w-[5px]`}
        style={{
          top: `${top}px`,
          left: `${left}px`,
          height: `${height}px`,
          width: `${width}px`
        }}
      >
        <div
          className="absolute inset-0 z-10 h-[5px] origin-top-left"
          style={{
            transform: transform,
            left: styleLeft,
            width: `${diagonal}px`,
            backgroundImage
          }}
        >
          <div className={className} style={style} />
        </div>
      </div>
    </>
  ) : null
}
