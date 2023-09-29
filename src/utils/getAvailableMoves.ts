import { TCell, TCoordinate } from 'types/Cell'
import { getCoordinates } from './getCoordinates'

export const getAvailableMoves = (
  activeCell: TCell | null,
  position?: TCell[]
): TCoordinate[] => {
  if (!activeCell) return []
  console.log(position)
  const { x, y } = getCoordinates(activeCell.square)

  switch (activeCell.piece) {
    case 'wp': {
      return [
        { x, y: y - 1 },
        { x, y: y - 2 }
      ]
    }
    default: {
      return []
    }
  }
}
