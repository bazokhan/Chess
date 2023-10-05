import { usePositionContext } from 'context/PositionContext'
import { useTurnContext } from 'context/TurnContext'
import { FC, PropsWithChildren } from 'react'
import {
  LuChevronLast,
  LuChevronFirst,
  LuChevronRight,
  LuChevronLeft,
  LuStopCircle,
  LuRedo
} from 'react-icons/lu'
import { FaChessPawn } from 'react-icons/fa'
import {
  generateAllNextMoves,
  getPlayerEvaluation,
  printMoves
} from 'utils/getPlayerEvaluation'
import { useDebugContext } from 'context/DebugContext'
import EvalBar from './EvalBar'
import { useDisclosure } from 'hooks/useDisclosure'
import { Switch } from '../ui/Switch'
import { Paragraph } from '../ui/Paragraph'
import { GameLayout } from 'components/layouts/GameLayout'
import { Column } from '../layouts/Column'

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
    <GameLayout>
      {isSnackbarOpen ? (
        <Column>
          <EvalBar fen={fen} />
        </Column>
      ) : null}
      <Column>{children}</Column>
      <Column width={500}>
        <p className="title">Evaluation bar</p>
        <Switch active={isSnackbarOpen} onClick={onSnackbarToggle}>
          {isSnackbarOpen ? 'Disable' : 'Enable'} Eval Bar{' '}
          <span className="ml-4 text-xs font-normal">
            It&apos;s currently {isSnackbarOpen ? 'enabled' : 'disabled'}
          </span>
        </Switch>
        <p className="title">Turn</p>
        <div className="btn-group">
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
        <p className="title">Computer play as</p>
        <div className="btn-group">
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
        <div className="btn-group">
          <Switch
            className="w-full justify-center"
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
            className="w-full justify-center"
            onClick={() => setForceStop(true)}
            active={aiStopped}
            disabled={aiStopped}
            hideCheck
          >
            <LuStopCircle />
          </Switch>
          <Switch
            className="w-full justify-center"
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
        <p className="title">History</p>
        <div className="btn-group">
          <Switch
            hideCheck
            className="w-full justify-center"
            active={false}
            disabled
          >
            <LuChevronFirst />
          </Switch>
          <Switch
            hideCheck
            className="w-full justify-center"
            onClick={moveBackInHistory}
            disabled={!history.length}
            active={!!future.length}
          >
            <LuChevronLeft />
          </Switch>
          <Switch
            hideCheck
            className="w-full justify-center"
            onClick={moveForwardInHistory}
            disabled={!future.length}
            active={!!history.length}
          >
            <LuChevronRight />
          </Switch>
          <Switch
            hideCheck
            className="w-full justify-center"
            active={false}
            disabled
          >
            <LuChevronLast />
          </Switch>
        </div>
      </Column>
      <Column width={300}>
        <p className="title">PGN</p>
        <div className="h-[150px] overflow-y-auto">
          <Paragraph className="h-full text-sm font-light text-white">
            {pgn?.map((item) => <p key={item}>{item}</p>)}
          </Paragraph>
        </div>
        <p className="title">Game notifications</p>
        <Paragraph className="min-h-[60px] w-full p-2 text-center font-black text-red-200">
          {isWhiteKingCheckMated ? `CHECKMATE - Black Wins!` : null}
          {isBlackKingCheckMated ? `CHECKMATE - White Wins!` : null}
          {isWhiteKingStaleMated || isBlackKingStaleMated
            ? `STALEMATE - Draw!`
            : null}
          {isWhiteKingInCheck ? `White King Is In Check!` : null}
          {isBlackKingInCheck ? `Black King Is In Check!` : null}
        </Paragraph>

        <p className="title">Possible moves</p>
        <div className="h-[150px] overflow-y-auto">
          {printMoves(generateAllNextMoves(turn, position)).map((text) => (
            <p key={text} className="m-0 w-full px-2 py-0 text-xs">
              {text}
            </p>
          ))}
        </div>
        <p className="title">Piece Evaluation</p>
        <div className="btn-group">
          <Paragraph className="w-full text-center text-white">
            {getPlayerEvaluation('w', position)}
          </Paragraph>
          <Paragraph className="w-full text-center text-black">
            {getPlayerEvaluation('b', position)}
          </Paragraph>
        </div>
        <p className="title">History</p>
        <Paragraph>
          Move {history.length ?? 0} /{' '}
          {(future.length ?? 0) + (history.length ?? 0)}
        </Paragraph>
      </Column>
    </GameLayout>
  )
}
