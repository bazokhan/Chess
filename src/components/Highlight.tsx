import { FC } from 'react'
import { TCoordinate } from 'types/Cell'

export const HighLight: FC<TCoordinate> = ({ x, y }) => {
  return (
    <div
      className={`absolute  z-10 h-[12.5%] w-[12.5%] cursor-grab bg-[#eb6150]/80`}
      style={{ top: `${y * 12.5}%`, left: `${x * 12.5}%` }}
    />
  )
}
