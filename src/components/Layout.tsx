import { usePositionContext } from 'context/PositionContext'
import { useTurnContext } from 'context/TurnContext'
import { FC, PropsWithChildren, useCallback } from 'react'
import {
  LuChevronLast,
  LuChevronFirst,
  LuChevronRight,
  LuChevronLeft
} from 'react-icons/lu'
import { FaChessPawn } from 'react-icons/fa'
import {
  calculateBestMove,
  generateAllNextMoves,
  getPlayerEvaluation,
  printMoves
} from 'utils/getPlayerEvaluation'

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const {
    moveBackInHistory,
    moveForwardInHistory,
    movePieceToCoordinate,
    future,
    history,
    pgn,
    position
  } = usePositionContext()

  const { turn } = useTurnContext()

  const handleAIPlay = useCallback(() => {
    const bestMove = turn === 'b' ? calculateBestMove({ turn, position }) : null
    if (turn === 'b' && bestMove) {
      setTimeout(() => {
        movePieceToCoordinate(bestMove.piece, bestMove.move)
      }, 1000)
    }
  }, [movePieceToCoordinate, position, turn])

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

        {printMoves(generateAllNextMoves(turn, position)).map((text) => (
          <p key={text} className="m-0 w-full px-2 py-0 text-xs">
            {text}
          </p>
        ))}

        <p className="w-full p-2 text-center">
          White Evaluation: {getPlayerEvaluation('w', position)}
        </p>
        <p className="w-full p-2 text-center">
          Black Evaluation: {getPlayerEvaluation('b', position)}
        </p>
        <p className="w-full p-2 text-center">
          Move {history.length ?? 0} /{' '}
          {(future.length ?? 0) + (history.length ?? 0)}
        </p>
        <div
          className="flex w-full py-3 text-3xl font-black"
          onClick={handleAIPlay}
        >
          <button className="flex w-full items-center justify-center text-green-600 hover:text-green-500">
            <FaChessPawn />
          </button>
        </div>
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
