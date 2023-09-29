import { TSquare } from 'types/Board'

export const getPosition = (square: TSquare) => {
  const [_x, _y] = square.split('')
  return {
    x: 'abcdefgh'.indexOf(_x),
    y: 8 - Number(_y)
  }
}
