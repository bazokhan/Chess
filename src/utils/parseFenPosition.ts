import { getSquare } from './getCoordinates'

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
