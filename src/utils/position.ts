import { TPiece, TSquare } from 'types/Board'
import { TCell, TCoordinate, TPosition, TPromotion } from 'types/Cell'
import { getCoordinates, getSquare } from './getCoordinates'
import { HistoryItem } from 'types/History'

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
  return squares
}

export const getNewPosition = (
  cell: TCell,
  coordinate: TCoordinate,
  position: TPosition,
  promotionType: TPromotion = 'Q'
) => {
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
  const newPosition = { ...position }
  const alreadyHasPiece = position[newSquare]
  // Capture
  if (alreadyHasPiece) {
    move.capturedCell = alreadyHasPiece
  }
  newPosition[newSquare] = newCell

  return {
    move,
    newPosition: Object.values(newPosition),
    newSquare,
    newCell,
    hashedPosition: newPosition
  }
}
