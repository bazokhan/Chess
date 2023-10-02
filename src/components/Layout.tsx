import { usePositionContext } from 'context/PositionContext'
import { useTurnContext } from 'context/TurnContext'
import { FC, PropsWithChildren } from 'react'
import {
  LuChevronLast,
  LuChevronFirst,
  LuChevronRight,
  LuChevronLeft,
  LuStopCircle
} from 'react-icons/lu'
import { FaChessPawn } from 'react-icons/fa'
import {
  generateAllNextMoves,
  getPlayerEvaluation,
  printMoves
} from 'utils/getPlayerEvaluation'
import { useDebugContext } from 'context/DebugContext'

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const {
    moveBackInHistory,
    moveForwardInHistory,
    future,
    history,
    pgn,
    position,
    isWhiteKingInCheck,
    isBlackKingInCheck,
    isWhiteKingCheckMated,
    isBlackKingCheckMated,
    isWhiteKingStaleMated,
    isBlackKingStaleMated
  } = usePositionContext()

  const { turn } = useTurnContext()

  const {
    setTurnToBlack,
    setTurnToWhite,
    handleAIPlay,
    runMatch,
    setForceStop
  } = useDebugContext()

  return (
    <div
      className="grid h-full w-full gap-8 p-20"
      style={{ gridTemplateColumns: 'auto 300px' }}
    >
      {children}
      <div className="flex flex-col bg-[#383734] p-4 text-[#9c9b9a]">
        <div className="h-full max-h-[200px] overflow-y-auto">
          {pgn?.map((item) => (
            <p key={item} className="text-sm text-white">
              {item}
            </p>
          ))}
        </div>
        <div className="mb-4 flex w-full text-3xl font-black">
          <button
            className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]"
            onClick={() => setForceStop(true)}
          >
            <LuStopCircle />
          </button>
          <button
            className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]"
            onClick={() => {
              setForceStop(false)
              runMatch()
            }}
          >
            <LuChevronRight />
          </button>
        </div>

        <div className="flex w-full text-3xl font-black">
          <button
            className="flex w-full items-center justify-center text-black"
            onClick={setTurnToBlack}
            disabled={turn === 'b'}
          >
            <FaChessPawn />
          </button>
          <button
            className="flex w-full items-center justify-center text-white"
            onClick={setTurnToWhite}
            disabled={turn === 'w'}
          >
            <FaChessPawn />
          </button>
        </div>

        {isWhiteKingCheckMated ? (
          <p className="w-full p-2 text-center font-black text-green-500">
            CHECKMATE - Black Wins!
          </p>
        ) : null}
        {isBlackKingCheckMated ? (
          <p className="w-full p-2 text-center font-black text-green-500">
            CHECKMATE - White Wins!
          </p>
        ) : null}
        {isWhiteKingStaleMated || isBlackKingStaleMated ? (
          <p className="w-full p-2 text-center font-black text-green-500">
            STALEMATE - Draw!
          </p>
        ) : null}

        {isWhiteKingInCheck ? (
          <p className="w-full p-2 text-center font-black text-red-500">
            White King Is In Check!
          </p>
        ) : null}

        {isBlackKingInCheck ? (
          <p className="w-full p-2 text-center font-black text-red-500">
            Black King Is In Check!
          </p>
        ) : null}

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
        <div className="flex w-full py-3 text-3xl font-black">
          <button
            className="flex w-full items-center justify-center text-green-600 hover:text-green-500"
            onClick={() => handleAIPlay()}
          >
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
