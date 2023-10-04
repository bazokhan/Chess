import { usePositionContext } from 'context/PositionContext'
import { useTurnContext } from 'context/TurnContext'
import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react'
import {
  LuChevronLast,
  LuChevronFirst,
  LuChevronRight,
  LuChevronLeft,
  LuStopCircle,
  LuRedo
} from 'react-icons/lu'
import { FaCheck, FaChessPawn } from 'react-icons/fa'
import {
  generateAllNextMoves,
  getPlayerEvaluation,
  printMoves
} from 'utils/getPlayerEvaluation'
import { useDebugContext } from 'context/DebugContext'
import EvalBar from './EvalBar'
import { useDisclosure } from 'hooks/useDisclosure'

const Switch: FC<
  PropsWithChildren &
    ButtonHTMLAttributes<HTMLButtonElement> & {
      active: boolean
      hideCheck?: boolean
    }
> = ({ children, className, active, hideCheck, ...props }) => {
  return (
    <button
      className={`flex items-center justify-start rounded-md border-b-2 border-black ${
        active ? (hideCheck ? 'bg-green-900' : 'bg-[#4c4b47]') : 'bg-[#41403d]'
      } p-4 font-black text-white text-opacity-80 transition-all hover:bg-[#4c4b47] ${className}`}
      {...props}
    >
      {children}
      {active && !hideCheck ? (
        <FaCheck className="ml-auto mr-0 text-green-500" />
      ) : null}
    </button>
  )
}

const Paragraph: FC<PropsWithChildren & { className?: string }> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={`rounded-md border-b-2 border-black bg-[#41403d] p-4 font-black text-opacity-80 transition-all hover:bg-[#4c4b47] ${className}`}
      {...props}
    >
      {children}
    </p>
  )
}

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
    isBlackKingStaleMated,
    resetPosition,
    fen
  } = usePositionContext()

  const { turn } = useTurnContext()

  const {
    setTurnToBlack,
    setTurnToWhite,
    setForceStop,
    aiStopped,
    aiPlayers,
    aiPlayBlack,
    aiPlayWhite,
    aiPlayBoth
  } = useDebugContext()

  const { isOpen: isSnackbarOpen, onToggle: onSnackbarToggle } = useDisclosure()

  return (
    <div
      className="grid h-full w-full justify-center gap-8 p-20"
      style={{
        gridTemplateColumns: isSnackbarOpen
          ? '5px auto 500px 300px'
          : 'auto 500px 300px'
      }}
    >
      {isSnackbarOpen ? <EvalBar fen={fen} /> : null}
      {children}
      <div className="flex flex-col gap-2 rounded-md bg-[#383734] p-4 text-[#9c9b9a]">
        <p className="mt-2 text-lg font-bold">Evaluation bar</p>
        <Switch active={isSnackbarOpen} onClick={onSnackbarToggle}>
          {isSnackbarOpen ? 'Disable' : 'Enable'} Eval Bar{' '}
          <span className="ml-4 text-xs font-normal">
            It&apos;s currently {isSnackbarOpen ? 'enabled' : 'disabled'}
          </span>
        </Switch>
        <p className="mt-2 text-lg font-bold">Turn</p>
        <div className="flex items-center justify-between gap-2">
          <Switch
            className="w-full"
            onClick={setTurnToBlack}
            disabled={turn === 'b'}
            active={turn === 'b'}
          >
            <FaChessPawn className="text-black" />
            <span className="ml-4 text-black">
              {turn === 'b' ? 'Black to play' : 'Switch turn to Black'}
            </span>
          </Switch>
          <Switch
            className="w-full"
            onClick={setTurnToWhite}
            disabled={turn === 'w'}
            active={turn === 'w'}
          >
            <FaChessPawn className="text-white" />
            <span className="ml-4 text-white">
              {turn === 'w' ? 'White to play' : 'Switch turn to White'}
            </span>
          </Switch>
        </div>
        <p className="mt-2 text-lg font-bold">Computer play as</p>
        <div className="flex items-center justify-between gap-2">
          <Switch
            className="w-full"
            onClick={aiPlayBlack}
            disabled={aiPlayers.includes('b') && aiPlayers.length === 1}
            active={aiPlayers.includes('b') && aiPlayers.length === 1}
          >
            <FaChessPawn className="text-black" />
            <span className="ml-4 text-black">Black</span>
          </Switch>
          <Switch
            className="w-full"
            onClick={aiPlayWhite}
            disabled={aiPlayers.includes('w') && aiPlayers.length === 1}
            active={aiPlayers.includes('w') && aiPlayers.length === 1}
          >
            <FaChessPawn className="text-white" />
            <span className="ml-4 text-white">White</span>
          </Switch>
          <Switch
            className="w-full"
            onClick={aiPlayBoth}
            disabled={aiPlayers.length === 2}
            active={aiPlayers.length === 2}
          >
            <FaChessPawn className="text-gray-500" />
            <span className="ml-4 text-gray-500">Both</span>
          </Switch>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Switch
            className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]"
            onClick={() => {
              setForceStop(true)
              resetPosition()
            }}
            active={aiStopped && position.every((m) => !m.moved)}
            disabled={aiStopped && position.every((m) => !m.moved)}
            hideCheck
          >
            <LuRedo />
          </Switch>
          <Switch
            className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]"
            onClick={() => setForceStop(true)}
            active={aiStopped}
            disabled={aiStopped}
            hideCheck
          >
            <LuStopCircle />
          </Switch>
          <Switch
            className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]"
            onClick={() => {
              setForceStop(false)
            }}
            active={!aiStopped}
            disabled={!aiStopped}
            hideCheck
          >
            <LuChevronRight />
          </Switch>
        </div>
        <p className="mt-2 text-lg font-bold">History</p>
        <div className="flex items-center justify-between gap-2">
          <Switch
            hideCheck
            className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]"
            active={false}
            disabled
          >
            <LuChevronFirst />
          </Switch>
          <Switch
            hideCheck
            className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]"
            onClick={moveBackInHistory}
            disabled={!history.length}
            active={!!future.length}
          >
            <LuChevronLeft />
          </Switch>
          <Switch
            hideCheck
            className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]"
            onClick={moveForwardInHistory}
            disabled={!future.length}
            active={!!history.length}
          >
            <LuChevronRight />
          </Switch>
          <Switch
            hideCheck
            className="flex w-full items-center justify-center text-[#9c9b9a] hover:text-[#c7c7c7]"
            active={false}
            disabled
          >
            <LuChevronLast />
          </Switch>
        </div>
      </div>
      <div className="flex flex-col rounded-md bg-[#383734] p-4 text-[#9c9b9a]">
        <p className="mt-2 text-lg font-bold">PGN</p>
        <div className="h-full max-h-[200px] overflow-y-auto">
          <Paragraph className="min-h-[200px] text-sm font-light text-white">
            {pgn?.map((item) => <p key={item}>{item}</p>)}
          </Paragraph>
        </div>
        <p className="mt-2 text-lg font-bold">Game notifications</p>
        <Paragraph className="min-h-[60px] w-full p-2 text-center font-black text-red-200">
          {isWhiteKingCheckMated ? `CHECKMATE - Black Wins!` : null}
          {isBlackKingCheckMated ? `CHECKMATE - White Wins!` : null}
          {isWhiteKingStaleMated || isBlackKingStaleMated
            ? `STALEMATE - Draw!`
            : null}
          {isWhiteKingInCheck ? `White King Is In Check!` : null}
          {isBlackKingInCheck ? `Black King Is In Check!` : null}
        </Paragraph>

        <p className="mt-2 text-lg font-bold">Possible moves</p>
        {printMoves(generateAllNextMoves(turn, position)).map((text) => (
          <p key={text} className="m-0 w-full px-2 py-0 text-xs">
            {text}
          </p>
        ))}
        <p className="mt-2 text-lg font-bold">Piece Evaluation</p>
        <div className="flex items-center justify-between gap-2">
          <Paragraph className="w-full text-center text-white">
            {getPlayerEvaluation('w', position)}
          </Paragraph>
          <Paragraph className="w-full text-center text-black">
            {getPlayerEvaluation('b', position)}
          </Paragraph>
        </div>
        <p className="mt-2 text-lg font-bold">History</p>
        <Paragraph>
          Move {history.length ?? 0} /{' '}
          {(future.length ?? 0) + (history.length ?? 0)}
        </Paragraph>
      </div>
    </div>
  )
}
