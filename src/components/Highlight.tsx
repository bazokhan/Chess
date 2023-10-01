import { usePositionContext } from 'context/PositionContext'
import { FC } from 'react'
import { TCoordinate } from 'types/Cell'
import { getSquare } from 'utils/getCoordinates'

type Variant = 'mark' | 'availableMove' | 'move'

export const HighLight: FC<TCoordinate & { variant?: Variant }> = ({
  x,
  y,
  variant = 'mark'
}) => {
  const { position } = usePositionContext()
  const square = getSquare({ x, y })
  const hasPieceOnIt = position.find((cell) => cell.square === square)
  if (variant === 'mark')
    return (
      <div
        className={`absolute  z-10 h-[12.5%] w-[12.5%] bg-[#eb6150]/80`}
        style={{ top: `${y * 12.5}%`, left: `${x * 12.5}%` }}
      />
    )
  if (variant === 'availableMove' && hasPieceOnIt)
    return (
      <div
        className={`absolute z-20 flex h-[12.5%] w-[12.5%] items-center justify-center`}
        style={{ top: `${y * 12.5}%`, left: `${x * 12.5}%` }}
      >
        <div className="h-[90px] w-[90px] rounded-full border-8 border-black opacity-10" />
      </div>
    )
  if (variant === 'availableMove')
    return (
      <div
        className={`absolute  z-20 flex h-[12.5%] w-[12.5%] items-center justify-center`}
        style={{ top: `${y * 12.5}%`, left: `${x * 12.5}%` }}
      >
        <div className="h-[30px] w-[30px] rounded-full bg-black/10" />
      </div>
    )
  if (variant === 'move')
    return (
      <div
        className={`absolute  z-10 h-[12.5%] w-[12.5%] bg-[#ffff33]/50`}
        style={{ top: `${y * 12.5}%`, left: `${x * 12.5}%` }}
      />
    )
}
