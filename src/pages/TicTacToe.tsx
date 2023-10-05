import { Column } from 'components/layouts/Column'
import { GameLayout } from 'components/layouts/GameLayout'
import { Switch } from 'components/ui/Switch'
import { FC, useState } from 'react'

const DIAGONALS = {
  3: [
    [0, 4, 8],
    [2, 4, 6]
  ],
  4: [
    [0, 5, 10, 15],
    [3, 6, 9, 12]
  ]
}
class TicTacToe {
  size: number = 3
  board: number[] = []
  turn: number = 1
  constructor(size: number = 3) {
    this.size = size
    this.board = Array(size * size).fill(0)
  }
  private toggleTurn() {
    this.turn *= -1
  }
  addPiece(position: number) {
    this.board[position] = this.turn
    this.toggleTurn()
  }
  get boardPositions() {
    return this.board.map((_, index) => index)
  }
  get ranks() {
    const ranksArr = []
    for (let i = 0; i < this.size; i += 1) {
      ranksArr.push(this.board.slice(i * this.size, i * this.size + this.size))
    }
    return ranksArr
  }

  get files() {
    const filesArr = []
    for (let i = 0; i < this.size; i += 1) {
      filesArr.push(this.board.filter((_, index) => index % this.size === i))
    }
    return filesArr
  }

  get diagonals() {
    return DIAGONALS[this.size as keyof typeof DIAGONALS]
  }

  get winner() {
    const lines = [...this.files, ...this.ranks, ...this.diagonals]
    for (const line of lines) {
      if (line.every((piece) => piece === -1)) return -1
      if (line.every((piece) => piece === 1)) return 1
    }
    if (lines.flat().every((piece) => piece === 1 || piece === -1)) return 0
    return null
  }

  reset() {
    this.board = Array(this.size * this.size).fill(0)
    this.turn = 1
  }

  printBoard() {
    const text = this.ranks
      .map((r) =>
        r.map((p) => (p === 1 ? 'X' : p === -1 ? 'O' : ' ')).join('|')
      )
      .join('\n')
    console.log(text)
  }
}

const game = new TicTacToe(3)

export const TicTacToePage: FC = () => {
  const [board, setBoard] = useState(game.board)

  return (
    <GameLayout>
      <Column>
        <div
          className="grid bg-white"
          style={{ gridTemplateColumns: `repeat(${3}, auto)` }}
        >
          {board.map((piece, index) => (
            <div
              key={`${piece}-${index}`}
              className="flex h-[150px] w-[150px] items-center justify-center border border-black text-4xl font-normal text-black"
              onClick={() => {
                game.addPiece(index)
                setBoard([...game.board])
              }}
            >
              {piece === 1 ? 'X' : piece === -1 ? 'O' : ''}
            </div>
          ))}
        </div>
      </Column>
      <Column width={300}>
        <p>
          {game.winner === 1
            ? 'X won!'
            : game.winner === -1
            ? 'O won!'
            : game.winner === 0
            ? 'Draw!'
            : ''}
        </p>
        <Switch active={false} onClick={() => game.printBoard()}>
          Console Board
        </Switch>
      </Column>
    </GameLayout>
  )
}
