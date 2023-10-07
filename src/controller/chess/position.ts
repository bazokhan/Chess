import { TPiece, TSquare } from 'types/Chess'
import { TCell, TCoordinate, TPosition, TPromotion } from 'types/Chess'
import { getCoordinates, getSquare } from './coordinates'
import { HistoryItem } from 'types/Chess'

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

export const makeMove = (
  cell: TCell,
  coordinate: TSquare,
  position: TCell[],
  promotionType: TPromotion = 'Q'
) => {
  const hashed = hash(position)

  const newCell = { ...cell, square: coordinate, moved: true }
  if (
    (cell.piece === 'wp' && coordinate[1] === '8') ||
    (cell.piece === 'bp' && coordinate[1] === '1')
  ) {
    newCell.piece = `${cell.piece[0]}${promotionType.toLowerCase()}` as TPiece
  }

  const newPosition = { ...hashed }
  delete newPosition[cell.square]
  newPosition[coordinate] = newCell

  return {
    newPosition: Object.values(newPosition),
    move: `${cell.square}${coordinate}`
  }
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

export const getNewPosition = (
  cell: TCell,
  coordinate: TCoordinate,
  position: TCell[],
  promotionType: TPromotion = 'Q'
): PositionReturnType => {
  const hashed = hash(position)
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

  const result = {
    move,
    newPosition: Object.values(newPosition),
    newSquare,
    newCell
  }

  return result
}

export const validateWithinBoard = (move: TCoordinate) =>
  move.x >= 0 && move.x < 8 && move.y >= 0 && move.y < 8

export const parseFenMove = (fenMove: string) => {
  return [
    getCoordinates(fenMove.slice(0, 2) as TSquare),
    getCoordinates(fenMove.slice(2) as TSquare)
  ] as [TCoordinate, TCoordinate]
}
