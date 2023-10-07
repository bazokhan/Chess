import { addPiece } from 'controller/tictactoe/addPiece'
import { DIAGONALS } from 'controller/tictactoe/constants'
import { getTree } from 'controller/tictactoe/getTree'
import { minimax } from 'controller/tictactoe/minimax'

export class TicTacToe {
  size: number = 3
  board: number[] = []
  turn: number = 1
  aiPlayers: number[] = []
  constructor(size: number = 3) {
    this.size = size
    this.board = Array(size * size).fill(0)
  }
  private toggleTurn() {
    this.turn *= -1
    if (this.aiPlayers.includes(this.turn)) {
      this.makeAiMove()
    }
  }

  private removePiece(position: number) {
    this.board[position] = 0
  }

  private getBestMove() {
    const depth = 3
    const tree = getTree(this.turn, this.board, 1)
    console.log(tree)
    const best = tree
      .map((branch) => ({
        ...branch,
        evaluation: minimax({
          branch,
          depth,
          alpha: -Infinity,
          beta: Infinity,
          turn: this.turn,
          size: this.size
        })
      }))
      .sort((a, b) => b.evaluation - a.evaluation)
    console.log(best)
    return best[0]
  }

  makeMove(position: number) {
    this.board = addPiece(position, this.turn, this.board)
    this.toggleTurn()
  }
  aiPlayAsX() {
    this.aiPlayers = [1]
    if (this.aiPlayers.includes(this.turn)) {
      this.makeAiMove()
    }
  }
  aiPlayAsY() {
    this.aiPlayers = [-1]
    if (this.aiPlayers.includes(this.turn)) {
      this.makeAiMove()
    }
  }
  aiPlayAsBoth() {
    this.aiPlayers = [1, -1]
    if (this.aiPlayers.includes(this.turn)) {
      this.makeAiMove()
    }
  }
  private get available() {
    return this.boardPositions.filter((p) => this.board[p] === 0)
  }
  private makeAiMove() {
    if (this.winner !== null) return // Game over
    const best = this.getBestMove()
    const nextMove =
      best.position ?? // found best move
      this.available[Math.floor(Math.random() * this.available.length)] // random move
    if (nextMove !== undefined) {
      this.makeMove(nextMove)
    }
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
    this.aiPlayers = []
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
