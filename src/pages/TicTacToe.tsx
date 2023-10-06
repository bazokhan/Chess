import { TicTacToe } from 'classes/TickTacToe'
import { Column } from 'components/layouts/Column'
import { GameLayout } from 'components/layouts/GameLayout'
import { Paragraph } from 'components/ui/Paragraph'
import { Switch } from 'components/ui/Switch'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
// import { FaXbox } from 'react-icons/fa'
import { Subject } from 'rxjs'
import loldoll from 'assets/tictactoe/loldoll.png'
import minecraftsupersword from 'assets/tictactoe/mcsword.png'

const game = new TicTacToe(3)

const subject = new Subject()

let state = { ...game, winner: game.winner }
const store = {
  init: () => {
    state = { ...game, winner: game.winner }
    subject.next(state)
  },
  subscribe: (setState: Dispatch<SetStateAction<TicTacToe>>) =>
    subject.subscribe(setState as (value: unknown) => void),
  makeMove: (position: number) => {
    game.makeMove(position)
    state = { ...game, winner: game.winner }
    subject.next(state)
  },
  reset: () => {
    game.reset()
    state = { ...game, winner: game.winner }
    subject.next(state)
  },
  aiPlayAsX: () => {
    game.aiPlayAsX()
    state = { ...game, winner: game.winner }
    subject.next(state)
  },
  aiPlayAsY: () => {
    game.aiPlayAsY()
    state = { ...game, winner: game.winner }
    subject.next(state)
  },
  aiPlayAsBoth: () => {
    game.aiPlayAsBoth()
    state = { ...game, winner: game.winner }
    subject.next(state)
  },
  printBoard: () => {
    game.printBoard()
  }
}

export const TicTacToePage: FC = () => {
  const [innerGame, setInnerGame] = useState(game)

  useEffect(() => {
    store.subscribe(setInnerGame)
    store.init()
  }, [])

  return (
    <GameLayout>
      <Column>
        <div
          className="grid bg-white"
          style={{ gridTemplateColumns: `repeat(${3}, auto)` }}
        >
          {innerGame.board.map((piece, index) => (
            <div
              key={`${piece}-${index}`}
              className="flex h-[150px] w-[150px] items-center justify-center border border-black text-4xl font-normal text-black"
              onClick={
                innerGame.winner !== null
                  ? undefined
                  : () => {
                      store.makeMove(index)
                    }
              }
            >
              {piece === 1 ? (
                <img
                  src={minecraftsupersword}
                  className={`${
                    innerGame.winner === 1 ? 'animate-bounce' : ''
                  } w-[80px]`}
                />
              ) : // <FaXbox className="text-teal-800" />
              piece === -1 ? (
                <img
                  src={loldoll}
                  className={`${
                    innerGame.winner === -1 ? 'animate-bounce' : ''
                  } w-[80px]`}
                />
              ) : (
                ''
              )}
            </div>
          ))}
        </div>
      </Column>
      <Column width={300}>
        <p className="title">Computer play as</p>
        <div className="btn-group">
          <Switch
            className="w-full"
            onClick={store.aiPlayAsX}
            disabled={
              innerGame.aiPlayers.includes(1) &&
              innerGame.aiPlayers.length === 1
            }
            active={
              innerGame.aiPlayers.includes(1) &&
              innerGame.aiPlayers.length === 1
            }
            hideCheck
          >
            <span className="w-full text-center text-black">X</span>
          </Switch>
          <Switch
            className="w-full"
            onClick={store.aiPlayAsY}
            disabled={
              innerGame.aiPlayers.includes(-1) &&
              innerGame.aiPlayers.length === 1
            }
            active={
              innerGame.aiPlayers.includes(-1) &&
              innerGame.aiPlayers.length === 1
            }
            hideCheck
          >
            <span className="w-full text-center text-white">O</span>
          </Switch>
          <Switch
            className="w-full"
            onClick={store.aiPlayAsBoth}
            disabled={innerGame.aiPlayers.length === 2}
            active={innerGame.aiPlayers.length === 2}
            hideCheck
          >
            <span className="w-full text-center text-gray-500">XO</span>
          </Switch>
        </div>
        <Paragraph className="min-h-[60px] text-green-400">
          {innerGame.winner === 1
            ? 'X won!'
            : innerGame.winner === -1
            ? 'O won!'
            : innerGame.winner === 0
            ? 'Draw!'
            : ''}
        </Paragraph>
        <Switch active={false} onClick={() => innerGame.printBoard()}>
          Console Board
        </Switch>
        <Switch active={false} onClick={() => store.reset()}>
          Reset
        </Switch>
      </Column>
    </GameLayout>
  )
}
