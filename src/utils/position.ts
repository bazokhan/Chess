import { TPiece, TSquare } from 'types/Board'
import { TCell, TCoordinate, TPosition, TPromotion } from 'types/Cell'
import { getCoordinates, getSquare } from './getCoordinates'
import { HistoryItem } from 'types/History'

export const checkIsSquareEmpty = (square: TSquare, position: TCell[]) => {
  return position.filter((c) => c.square === square).length === 0
}

export const hash = (position: TCell[]): TPosition =>
  position.reduce((acc, cell) => {
    acc[cell.square] = cell
    return acc
  }, {} as TPosition)

export const getRankSquaresBetween = (square1: TSquare, square2: TSquare) => {
  const [min, max] = [square1, square2].sort()
  const { x: x1, y } = getCoordinates(min)
  const { x: x2 } = getCoordinates(max) // y should be identical.. same rank
  const squares: TSquare[] = []
  for (let i = x1 + 1; i < x2; i += 1) {
    squares.push(getSquare({ x: i, y }))
  }
  return squares
}

type PositionReturnType = {
  move: HistoryItem
  newPosition: TCell[]
  newSquare: TSquare
  newCell: {
    square: TSquare
    moved: boolean
    piece: TPiece
  }
}
const cache: Record<string, PositionReturnType> = {}

export const getNewPosition = (
  cell: TCell,
  coordinate: TCoordinate,
  position: TCell[],
  promotionType: TPromotion = 'Q'
) => {
  const id = `${cell.piece}-${cell.square}-${coordinate.x}-${coordinate.y}-${
    coordinate.type
  }-${coordinate.relatedPiece?.piece}-${coordinate.relatedPiece
    ?.square}-${coordinate.relatedCoordinates?.x}-${coordinate
    .relatedCoordinates?.y}-${promotionType}-${JSON.stringify(position)}`
  if (cache[id]) {
    return cache[id]
  }
  const hashed = hash(position)
  const start = Date.now()
  const oldCoordinates = getCoordinates(cell.square)
  const newSquare = getSquare(coordinate)

  const newCell = { ...cell, square: newSquare, moved: true }
  if (
    (cell.piece === 'wp' && coordinate.y === 0) ||
    (cell.piece === 'bp' && coordinate.y === 7)
  ) {
    newCell.piece = `${cell.piece[0]}${promotionType.toLowerCase()}` as TPiece
  }

  const move: HistoryItem = {
    oldCell: cell,
    newCell,
    coordinates: [oldCoordinates, coordinate]
  }

  // Capture
  const newPosition = { ...hashed }
  if (newPosition[newSquare]) {
    move.capturedCell = hashed[newSquare]
  }
  delete newPosition[cell.square]
  newPosition[newSquare] = newCell

  const end = Date.now()
  const time = end - start
  if (time > 10000) {
    console.log(
      `moving ${cell.piece} from ${cell.square} to ${getSquare(
        coordinate
      )} took ${time} ms`
    )
  }

  const result = {
    move,
    newPosition: Object.values(newPosition),
    newSquare,
    newCell
  }

  cache[id] = result
  return result
}

export const validateWithinBoard = (move: TCoordinate) =>
  move.x >= 0 && move.x < 8 && move.y >= 0 && move.y < 8
