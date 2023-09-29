import { TCell, TCoordinate } from 'types/Cell'
import { getCoordinates } from './getCoordinates'

const validateWithinBoard = (move: TCoordinate) =>
  move.x >= 0 && move.x < 8 && move.y >= 0 && move.y < 8

export const getAvailableMoves = (
  activeCell: TCell | null,
  position?: TCell[]
): TCoordinate[] => {
  if (!activeCell) return []
  let moves: TCoordinate[] = []
  console.log(position)
  const { x, y } = getCoordinates(activeCell.square)

  switch (activeCell.piece) {
    case 'wp': {
      moves = [
        { x, y: y - 1 },
        { x, y: y - 2 }
      ]
      break
    }
    case 'bp': {
      moves = [
        { x, y: y + 1 },
        { x, y: y + 2 }
      ]
      break
    }
    case 'wn':
    case 'bn': {
      moves = [
        { x: x - 1, y: y - 2 },
        { x: x - 2, y: y - 1 },
        { x: x + 1, y: y + 2 },
        { x: x + 2, y: y + 1 },
        { x: x + 1, y: y - 2 },
        { x: x + 2, y: y - 1 },
        { x: x - 1, y: y + 2 },
        { x: x - 2, y: y + 1 }
      ]
      break
    }
    case 'wb':
    case 'bb': {
      moves = [1, 2, 3, 4, 5, 6, 7, 8].flatMap((delta) => [
        { x: x - delta, y: y - delta },
        { x: x + delta, y: y + delta },
        { x: x - delta, y: y + delta },
        { x: x + delta, y: y - delta }
      ])
      break
    }
    case 'wr':
    case 'br': {
      moves = [1, 2, 3, 4, 5, 6, 7, 8].flatMap((delta) => [
        { x, y: y - delta },
        { x, y: y + delta },
        { x: x - delta, y },
        { x: x + delta, y }
      ])
      break
    }
    case 'wq':
    case 'bq': {
      moves = [1, 2, 3, 4, 5, 6, 7, 8].flatMap((delta) => [
        { x: x - delta, y: y - delta },
        { x: x + delta, y: y + delta },
        { x: x - delta, y: y + delta },
        { x: x + delta, y: y - delta },
        { x, y: y - delta },
        { x, y: y + delta },
        { x: x - delta, y },
        { x: x + delta, y }
      ])
      break
    }
    case 'wk':
    case 'bk': {
      moves = [
        { x: x - 1, y: y - 1 },
        { x: x + 1, y: y + 1 },
        { x: x - 1, y: y + 1 },
        { x: x + 1, y: y - 1 },
        { x, y: y - 1 },
        { x, y: y + 1 },
        { x: x - 1, y },
        { x: x + 1, y }
      ]
      break
    }
    default: {
      moves = []
    }
  }

  return moves.filter(validateWithinBoard)
}
