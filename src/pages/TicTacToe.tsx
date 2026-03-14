import { TicTacToe } from 'classes/TickTacToe'
import { Column } from 'components/layouts/Column'
import { GameLayout } from 'components/layouts/GameLayout'
import { Paragraph } from 'components/ui/Paragraph'
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react'
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

type TokenOption = {
  id: string
  label: string
  kind: 'emoji' | 'image'
  value: string
}

const tokenOptions: TokenOption[] = [
  { id: 'sword', label: 'Sword', kind: 'image', value: minecraftsupersword },
  { id: 'doll', label: 'Doll', kind: 'image', value: loldoll },
  { id: 'chalk-x', label: 'Chalk X', kind: 'emoji', value: '✖' },
  { id: 'chalk-o', label: 'Chalk O', kind: 'emoji', value: '◯' },
  { id: 'rocket', label: 'Rocket', kind: 'emoji', value: '🚀' },
  { id: 'unicorn', label: 'Unicorn', kind: 'emoji', value: '🦄' },
  { id: 'dino', label: 'Dino', kind: 'emoji', value: '🦖' },
  { id: 'star', label: 'Star', kind: 'emoji', value: '⭐' }
]

export const TicTacToePage: FC = () => {
  const [innerGame, setInnerGame] = useState(game)
  const [xTokenId, setXTokenId] = useState('sword')
  const [oTokenId, setOTokenId] = useState('doll')

  useEffect(() => {
    const subscription = store.subscribe(setInnerGame)
    store.init()
    return () => subscription.unsubscribe()
  }, [])

  const xToken = useMemo(
    () => tokenOptions.find((option) => option.id === xTokenId) ?? tokenOptions[0],
    [xTokenId]
  )
  const oToken = useMemo(
    () => tokenOptions.find((option) => option.id === oTokenId) ?? tokenOptions[1],
    [oTokenId]
  )

  const renderToken = (piece: number) => {
    if (piece === 0) return null
    const selected = piece === 1 ? xToken : oToken
    if (selected.kind === 'image') {
      return (
        <img
          src={selected.value}
          className={`h-[72%] w-[72%] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] ${
            innerGame.winner === piece ? 'animate-bounce' : ''
          }`}
          alt={selected.label}
          draggable={false}
        />
      )
    }
    return (
      <span
        className={`select-none text-[clamp(2rem,8vw,3.2rem)] leading-none ${
          innerGame.winner === piece ? 'animate-bounce' : ''
        }`}
      >
        {selected.value}
      </span>
    )
  }

  const winnerText =
    innerGame.winner === 1
      ? 'X wins.'
      : innerGame.winner === -1
      ? 'O wins.'
      : innerGame.winner === 0
      ? 'Draw.'
      : `Turn: ${innerGame.turn === 1 ? 'X' : 'O'}`

  const aiMode =
    innerGame.aiPlayers.length === 2
      ? 'both'
      : innerGame.aiPlayers.includes(1)
      ? 'x'
      : innerGame.aiPlayers.includes(-1)
      ? 'o'
      : 'none'

  return (
    <GameLayout>
      <div className="grid h-full min-h-0 w-full gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(390px,1fr)]">
        <Column className="relative h-full min-h-0 overflow-hidden border-[#8657c8] bg-[linear-gradient(180deg,#ffe6fb_0%,#f6f0ff_58%,#dcf9ff_100%)] px-4 pt-10 text-[#3e2e56] md:px-6">
          <div className="absolute left-2 top-2 rotate-[-10deg] rounded-full bg-[#ff9fda] px-4 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#5a2155] shadow-md">
            Creative Mode
          </div>
          <div className="absolute right-2 top-6 rounded-full bg-[#89f2ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#23445f] shadow">
            Chalkboard Theme
          </div>

          <div className="mb-2 mt-2 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b4f8f]">
              TicTacToe Playground
            </p>
            <h2 className="text-xl font-black text-[#4e2f75] md:text-2xl">TicTacToe Board</h2>
            <p className="mx-auto mt-1 hidden max-w-xl text-xs font-semibold text-[#5b4a72] md:block">
              A colorful, playful interface with customizable tokens for quick local
              matches and AI experiments.
            </p>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center py-3 md:py-4">
            <div className="ttt-board-wrap w-full max-w-[min(70vw,calc(100dvh-500px))] xl:max-w-[min(44vw,calc(100dvh-430px))]">
              <div className="ttt-board" style={{ gridTemplateColumns: `repeat(${3}, minmax(0, 1fr))` }}>
                {innerGame.board.map((piece, index) => (
                  <button
                    key={`square-${index}`}
                    type="button"
                    className="ttt-cell"
                    onClick={() => {
                      if (innerGame.winner !== null || innerGame.board[index] !== 0) return
                      store.makeMove(index)
                    }}
                  >
                    {renderToken(piece)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Paragraph className="mt-2 border-[#b48ee6] bg-[#fff7ff] py-2 text-center text-[#5d2f7f]">
            {winnerText}
          </Paragraph>
        </Column>

        <Column className="min-h-0 overflow-y-auto border-[#6f59b5] bg-[linear-gradient(180deg,#2f2644_0%,#3f315d_100%)]">
          <p className="title m-0 text-[#d7c8ff]">Computer plays as</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className={`ttt-mode-btn ${aiMode === 'x' ? 'ttt-mode-btn-active' : ''}`}
              onClick={store.aiPlayAsX}
            >
              X
            </button>
            <button
              type="button"
              className={`ttt-mode-btn ${aiMode === 'o' ? 'ttt-mode-btn-active' : ''}`}
              onClick={store.aiPlayAsY}
            >
              O
            </button>
            <button
              type="button"
              className={`ttt-mode-btn ${aiMode === 'both' ? 'ttt-mode-btn-active' : ''}`}
              onClick={store.aiPlayAsBoth}
            >
              X + O
            </button>
          </div>

          <p className="title text-[#d7c8ff]">Choose X token</p>
          <div className="grid grid-cols-2 gap-2">
            {tokenOptions.map((option) => (
              <button
                key={`x-${option.id}`}
                type="button"
                className={`ttt-token-btn ${xTokenId === option.id ? 'ttt-token-btn-active' : ''}`}
                onClick={() => setXTokenId(option.id)}
              >
                <span className="ttt-token-badge">
                  {option.kind === 'emoji' ? (
                    <span>{option.value}</span>
                  ) : (
                    <img src={option.value} alt={option.label} className="h-6 w-6 object-contain" />
                  )}
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <p className="title text-[#d7c8ff]">Choose O token</p>
          <div className="grid grid-cols-2 gap-2">
            {tokenOptions.map((option) => (
              <button
                key={`o-${option.id}`}
                type="button"
                className={`ttt-token-btn ${oTokenId === option.id ? 'ttt-token-btn-active' : ''}`}
                onClick={() => setOTokenId(option.id)}
              >
                <span className="ttt-token-badge">
                  {option.kind === 'emoji' ? (
                    <span>{option.value}</span>
                  ) : (
                    <img src={option.value} alt={option.label} className="h-6 w-6 object-contain" />
                  )}
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" className="chess-overlay-btn justify-center" onClick={store.printBoard}>
              Console board
            </button>
            <button type="button" className="chess-overlay-btn justify-center" onClick={store.reset}>
              Reset game
            </button>
          </div>
          <p className="text-xs text-[#cdbdf4]">
            Visual direction: playful chalkboard style with customizable tokens.
          </p>
        </Column>
      </div>
    </GameLayout>
  )
}
