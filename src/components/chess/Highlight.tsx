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
  const squareStyle = {
    top: `${y * 12.5}%`,
    left: `${x * 12.5}%`
  }
  if (variant === 'mark')
    return (
      <div
        className="absolute z-10 h-[12.5%] w-[12.5%] bg-[#eb6150]/80"
        style={squareStyle}
      />
    )
  if (variant === 'check')
    return (
      <div
        className="absolute z-10 h-[12.5%] w-[12.5%] bg-[#eb6150]/80"
        style={squareStyle}
      />
    )
  if (variant === 'newMove')
    return (
      <div
        className="absolute z-10 flex h-[12.5%] w-[12.5%] items-center justify-center"
        style={squareStyle}
      >
        <div className="h-[84%] w-[84%] rounded-full border-[0.34rem] border-[#CFAA01]/50 bg-[#CFAA01]/15" />
      </div>
    )
  if (variant === 'availableCapture')
    return (
      <div
        className="absolute z-20 flex h-[12.5%] w-[12.5%] items-center justify-center"
        style={squareStyle}
      >
        <div className="h-[84%] w-[84%] rounded-full border-[0.32rem] border-black/35" />
      </div>
    )
  if (variant === 'availableMove')
    return (
      <div
        className="absolute z-20 flex h-[12.5%] w-[12.5%] items-center justify-center"
        style={squareStyle}
      >
        <div className="h-[34%] w-[34%] rounded-full bg-black/20" />
      </div>
    )
  if (variant === 'move')
    return (
      <div
        className="absolute z-10 h-[12.5%] w-[12.5%] bg-[#ffff33]/50"
        style={squareStyle}
      />
    )
}
