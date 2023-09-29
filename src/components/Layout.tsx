import { usePositionContext } from 'context/PositionContext'
import { FC, PropsWithChildren } from 'react'
import {
  LuChevronLast,
  LuChevronFirst,
  LuChevronRight,
  LuChevronLeft
} from 'react-icons/lu'

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { moveBackInHistory, moveForwardInHistory, future, history, pgn } =
    usePositionContext()
  return (
    <div
      className="grid h-full w-full gap-8 p-20"
      style={{ gridTemplateColumns: 'auto 300px' }}
    >
      {children}
      <div className="flex flex-col bg-[#383734] p-4 text-[#9c9b9a]">
        <div className="h-full">
          {pgn?.map((item) => (
            <p key={item} className="text-sm text-white">
              {item}
            </p>
          ))}
        </div>
        <p className="w-full p-2 text-center">
          Move {history.length ?? 0} /{' '}
          {(future.length ?? 0) + (history.length ?? 0)}
        </p>
        <div className="flex w-full text-3xl font-black">
          <button className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]">
            <LuChevronFirst />
          </button>
          <button
            className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]"
            onClick={moveBackInHistory}
          >
            <LuChevronLeft />
          </button>
          <button
            className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]"
            onClick={moveForwardInHistory}
          >
            <LuChevronRight />
          </button>
          <button className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]">
            <LuChevronLast />
          </button>
        </div>
      </div>
    </div>
  )
}
