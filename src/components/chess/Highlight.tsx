import { FC } from 'react'
import { TCoordinate } from 'types/Chess'

type Variant =
  | 'mark'
  | 'availableMove'
  | 'availableCapture'
  | 'move'
  | 'check'
  | 'newMove'

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
  if (variant === 'check')
    return (
      <div
        className={`absolute z-10 h-[12.5%] w-[12.5%] bg-[#eb6150]/80`}
        style={{ top: `${y * 12.5}%`, left: `${x * 12.5}%` }}
      />
    )
  if (variant === 'newMove')
    return (
      <div
        className={`absolute z-10 h-[12.5%] w-[12.5%]`}
        style={{ top: `${y * 12.5}%`, left: `${x * 12.5}%` }}
      >
        <div className="h-[90px] w-[90px] rounded-full border-8 bg-[#CFAA01]/90 opacity-10" />
      </div>
    )
  if (variant === 'availableCapture')
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
