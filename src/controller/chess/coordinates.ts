import { TSquare } from 'types/Chess'
import { TCoordinate } from 'types/Chess'

export const getCoordinates = (square: TSquare) => {
  const [_x, _y] = square.split('')
  return {
    x: 'abcdefgh'.indexOf(_x),
    y: 8 - Number(_y)
  }
}

export const getSquare = (coordinate: TCoordinate): TSquare => {
  return ('abcdefgh'[coordinate.x] + (8 - coordinate.y)) as TSquare
}
