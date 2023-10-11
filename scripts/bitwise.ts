/* eslint-disable @typescript-eslint/no-unused-vars */
const Icons = ['.', '♜', '♞', '♝', '♛', '♚', '♟', '♖', '♘', '♗', '♕', '♔', '♙']

enum Pieces {
  e,
  r,
  n,
  b,
  q,
  k,
  p,
  R,
  N,
  B,
  Q,
  K,
  P
}

const board = BigInt(0).toString(2).padStart(64, '0')

const position = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const parsePosition = (position: string) => {
  let index = 0
  let board = ''
  for (let i = 0; index < 64; i += 1) {
    const piece = position[i]
    console.log(piece)
    if (Number.isInteger(Number(piece))) {
      for (let j = 0; j < Number(piece); j += 1) {
        board += Pieces.e
        // process.stdout.write(Icons[Pieces.e] + ' ')
      }
      index += Number(piece)
      continue
    }
    if (piece === '/') {
      // process.stdout.write('\n')
      continue
    }
    if (Pieces[piece]) {
      board += Pieces[piece]
      // process.stdout.write(Icons[Pieces[piece]] + ' ' ?? '')
      index += 1
      continue
    }
  }
  return board
}

const printBoard = (board: string) => {
  for (let y = 0; y < 8; y += 1) {
    process.stdout.write(8 - y + '  ')
    for (let x = 0; x < 8; x += 1) {
      process.stdout.write(Icons[board[x + y * 8]] + ' ')
    }
    process.stdout.write('\n')
  }
  process.stdout.write('\n')
  process.stdout.write('   a b c d e f g h \n')
}

printBoard(board)
printBoard(parsePosition(position.split(' ')[0]))
