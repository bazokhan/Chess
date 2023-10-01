import { TCell, TCoordinate } from 'types/Cell'
import { getBishopAvailableMoves } from './moves/bishop'
import { getRockAvailableMoves } from './moves/rock'
import { getQueenAvailableMoves } from './moves/queen'
import { getKingAvailableMoves } from './moves/king'
import { getKnightAvailableMoves } from './moves/knight'
import { getPawnAvailableMoves } from './moves/pawn'

const validateWithinBoard = (move: TCoordinate) =>
  move.x >= 0 && move.x < 8 && move.y >= 0 && move.y < 8

export const getAvailableMoves = (
  activeCell: TCell | null,
  position?: TCell[]
): TCoordinate[] => {
  if (!activeCell) return []
  let moves: TCoordinate[] = []

  switch (activeCell.piece) {
    case 'wp':
    case 'bp': {
      moves = getPawnAvailableMoves({ piece: activeCell, position })
      break
    }
    case 'wn':
    case 'bn': {
      moves = getKnightAvailableMoves({ piece: activeCell, position })
      break
    }
    case 'wb':
    case 'bb': {
      moves = getBishopAvailableMoves({ piece: activeCell, position })
      break
    }
    case 'wr':
    case 'br': {
      moves = getRockAvailableMoves({ piece: activeCell, position })
      break
    }
    case 'wq':
    case 'bq': {
      moves = getQueenAvailableMoves({ piece: activeCell, position })
      break
    }
    case 'wk':
    case 'bk': {
      moves = getKingAvailableMoves({ piece: activeCell, position })
      break
    }
    default: {
      moves = []
    }
  }

  return moves.filter(validateWithinBoard)
}
