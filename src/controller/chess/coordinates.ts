import { TSquare } from 'types/Chess'
import { TCoordinate } from 'types/Chess'
import { TPlayer } from 'types/Chess'

const fileToIndexMap: { [key: string]: number } = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  g: 6,
  h: 7
}

const indexToFileArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

export const getCoordinates = (square: TSquare) => {
  const _x = square[0]
  const _y = square[1]
  return {
    x: fileToIndexMap[_x],
    y: 8 - Number(_y)
  }
}

export const getIndex = (square: TSquare) => {
  const _x = square[0]
  const _y = square[1]
  return (8 - Number(_y)) * 8 + fileToIndexMap[_x]
}

export const getSquare = (coordinate: TCoordinate): TSquare => {
  return (indexToFileArray[coordinate.x] + (8 - coordinate.y)) as TSquare
}

export const getDisplayCoordinate = (
  coordinate: TCoordinate,
  orientation: TPlayer = 'w'
) => {
  if (orientation === 'w') return coordinate
  return { x: 7 - coordinate.x, y: 7 - coordinate.y }
}

export const getLogicalCoordinate = (
  coordinate: TCoordinate,
  orientation: TPlayer = 'w'
) => {
  if (orientation === 'w') return coordinate
  return { x: 7 - coordinate.x, y: 7 - coordinate.y }
}
