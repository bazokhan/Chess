import { FC } from 'react'
import { TCoordinate } from 'types/Cell'

type Variant = 'mark' | 'move'

export const HighLight: FC<TCoordinate & { variant?: Variant }> = ({
  x,
  y,
  variant = 'mark'
}) => {
  if (variant === 'mark')
    return (
      <div
        className={`absolute  z-10 h-[12.5%] w-[12.5%] bg-[#eb6150]/80`}
        style={{ top: `${y * 12.5}%`, left: `${x * 12.5}%` }}
      />
    )
  if (variant === 'move')
    return (
      <div
        className={`absolute  z-10 flex h-[12.5%] w-[12.5%] items-center justify-center`}
        style={{ top: `${y * 12.5}%`, left: `${x * 12.5}%` }}
      >
        <div className="h-[30px] w-[30px] rounded-full bg-black/10" />
      </div>
    )
}
