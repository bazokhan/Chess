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

export class TicTacToe {
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
    const id = this.size
    const diagnoalsArr = DIAGONALS[id as keyof typeof DIAGONALS].map((d) =>
      this.board.filter((_, index) => d.includes(index))
    )

    return diagnoalsArr
  }

  get winner() {
    const lines = [...this.files, ...this.ranks, ...this.diagonals]
    for (const line of lines) {
      if (line.every((piece) => piece === -1)) return -1
      if (line.every((piece) => piece === 1)) return 1
    }
    if (this.board.every((piece) => piece === 1 || piece === -1)) return 0
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
