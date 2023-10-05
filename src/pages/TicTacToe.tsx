import { TicTacToe } from 'classes/TickTacToe'
import { Column } from 'components/layouts/Column'
import { GameLayout } from 'components/layouts/GameLayout'
import { Paragraph } from 'components/ui/Paragraph'
import { Switch } from 'components/ui/Switch'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import { Subject } from 'rxjs'

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
  addPiece: (position: number) => {
    game.addPiece(position)
    state = { ...game, winner: game.winner }
    subject.next(state)
  },
  reset: () => {
    game.reset()
    state = { ...game, winner: game.winner }
    subject.next(state)
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
                      store.addPiece(index)
                    }
              }
            >
              {piece === 1 ? 'X' : piece === -1 ? 'O' : ''}
            </div>
          ))}
        </div>
      </Column>
      <Column width={300}>
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
