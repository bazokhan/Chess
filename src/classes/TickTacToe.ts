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

type Branch = {
  position: number
  board: number[]
  next: Branch[]
}

const evaluate = (board: number[], size: number): number => {
  const ranks = []
  for (let i = 0; i < size; i += 1) {
    ranks.push(board.slice(i * size, i * size + size))
  }

  const files = []
  for (let i = 0; i < size; i += 1) {
    files.push(board.filter((_, index) => index % size === i))
  }

  const id = size
  const diagonals = DIAGONALS[id as keyof typeof DIAGONALS].map((d) =>
    board.filter((_, index) => d.includes(index))
  )

  const lines = [...files, ...ranks, ...diagonals]

  for (const line of lines) {
    if (line.every((piece) => piece === 1)) return 1
    if (line.every((piece) => piece === -1)) return -1
  }
  return 0
}

const minimax = ({
  branch,
  depth,
  alpha,
  beta,
  turn,
  size
}: {
  branch: Branch
  depth: number
  alpha: number
  beta: number
  turn: number
  size: number
}) => {
  const children = getTree(turn * -1, branch.board, 1)

  if (depth < 0 || !children.length) {
    const evaluation = evaluate(branch.board, size)
    return evaluation
  }

  let maxEval = -Infinity
  let minEval = Infinity
  for (const childBranch of children) {
    const nextEval = minimax({
      branch: childBranch,
      depth: depth - 1,
      alpha,
      beta,
      turn: turn * -1,
      size
    })
    if (turn > 1) {
      maxEval = Math.max(maxEval, nextEval)
      alpha = Math.max(alpha, nextEval)
    } else {
      minEval = Math.min(minEval, nextEval)
      beta = Math.min(beta, nextEval)
    }
    if (beta <= alpha) break
  }
  if (turn > 1) {
    return maxEval
  } else {
    return minEval
  }
}

const getAvailable = (board: number[]) => {
  const evaluationX = evaluate(board, Math.sqrt(board.length))
  const evaluationY = evaluate(board, Math.sqrt(board.length))
  if (evaluationX || evaluationY) return []
  return board
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p === 0)
    .map(({ i }) => i)
}

const addPiece = (position: number, turn: number, board: number[]) => {
  board[position] = turn
  return board
}

const getTree = (turn: number, board: number[], depth: number) => {
  const available = getAvailable(board)
  if (!available.length || depth < 0) return []
  return available.map((p) => {
    const newBoard = addPiece(p, turn, [...board])
    const next: Branch[] = getTree(turn * -1, newBoard, depth - 1)
    return { position: p, board: newBoard, next }
  })
}

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
