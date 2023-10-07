import { TCell } from 'types/Chess'
import { getSquare } from './coordinates'
import { TPlayer } from 'types/Chess'

const getXY = (index: number) => {
  const x = index % 8
  const y = Math.floor(index / 8)
  return { x, y }
}

export const parseFenPosition = (fen: string) => {
  return fen
    .split(' ')[0]
    .split('')
    .map((token) => {
      if (token === '/') return undefined
      if (!Number.isNaN(Number(token))) {
        return Array(Number(token)).fill('empty')
      }
      return {
        piece: `${
          token === token.toLowerCase() ? 'b' : 'w'
        }${token.toLowerCase()}`
      }
    })
    .flat()
    .filter(Boolean)
    .map((piece, index) => {
      if (piece === 'empty') return undefined
      return { ...piece, square: getSquare(getXY(index)) }
    })
    .filter(Boolean)
}

export const encodeFenPosition = (oldPosition: TCell[], turn: TPlayer) => {
  let position = ''
  let empty = 0
  let currentLineSpaces = 0
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const square = getSquare({ x, y })
      if (currentLineSpaces >= 8) {
        if (empty) {
          position += empty
        }
        position += '/'
        empty = 0
        currentLineSpaces = 0
      }
      const foundPiece = oldPosition.find((c) => c.square === square)
      if (foundPiece) {
        if (empty) {
          position += empty
        }
        const pieceNotation =
          foundPiece.piece[0] === 'w'
            ? foundPiece.piece[1].toUpperCase()
            : foundPiece.piece[1]
        position += pieceNotation
        empty = 0
      } else {
        empty += 1
      }
      currentLineSpaces += 1
    }
  }
  if (empty) {
    position += empty
  }
  return [position, turn, '- - 0 1'].join(' ')
}
