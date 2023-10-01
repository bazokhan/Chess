import { TSquare } from 'types/Board'
import { TCell } from 'types/Cell'
import { getCoordinates, getSquare } from './getCoordinates'

export const checkIsSquareEmpty = (square: TSquare, position: TCell[]) => {
  return position.filter((c) => c.square === square).length === 0
}

export const getRankSquaresBetween = (square1: TSquare, square2: TSquare) => {
  const [min, max] = [square1, square2].sort()
  const { x: x1, y } = getCoordinates(min)
  const { x: x2 } = getCoordinates(max) // y should be identical.. same rank
  const squares: TSquare[] = []
  for (let i = x1 + 1; i < x2; i += 1) {
    squares.push(getSquare({ x: i, y }))
  }
  console.log(squares)
  return squares
}
