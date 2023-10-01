import { TSquare } from 'types/Board'
import { TCell, TCoordinate } from 'types/Cell'
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
  position: TCell[]
) => {
  const cellIndex = position.findIndex((c) => c.square === cell.square)
  const oldCoordinates = getCoordinates(cell.square)
  const newSquare = getSquare(coordinate)
  const newCell = { ...cell, square: newSquare, moved: true }
  const move: HistoryItem = {
    oldCell: cell,
    newCell,
    coordinates: [oldCoordinates, coordinate]
  }
  let newPosition = [...position]
  newPosition.splice(cellIndex, 1)
  newPosition.push(newCell)

  const alreadyHasPiece = position.find((c) => c.square === newSquare)

  // Capture
  if (alreadyHasPiece) {
    move.capturedCell = alreadyHasPiece
    newPosition = newPosition.filter((c) => c !== alreadyHasPiece)
  }

  return { move, newPosition, newSquare, newCell }
}
