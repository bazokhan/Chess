import { TCell, TCoordinate, TPosition } from 'types/Cell'
import { getBishopAvailableMoves } from './moves/bishop'
import { getRockAvailableMoves } from './moves/rock'
import { getQueenAvailableMoves } from './moves/queen'
import { getKingAvailableMoves } from './moves/king'
import { getKnightAvailableMoves } from './moves/knight'
import { getPawnAvailableMoves } from './moves/pawn'
import { TPlayer } from './getPlayerEvaluation'
import { getNewPosition, hash } from './position'
import { getIsBlackKingChecked, getIsWhiteKingChecked } from './getChecks'

const validateNotCheckedKing = (
  kingColor: TPlayer,
  move: TCoordinate,
  activeCell: TCell | null,
  position?: TCell[]
) => {
  if (!activeCell || !position) return false
  const { newPosition } = getNewPosition(activeCell, move, position)
  const isChecked =
    kingColor === 'w'
      ? getIsWhiteKingChecked({ position: newPosition })
      : getIsBlackKingChecked({ position: newPosition })

  return !isChecked
}

export const getAvailableMovesWithoutFiltering = (
  activeCell: TCell | null,
  position?: TPosition
): TCoordinate[] => {
  if (!activeCell || !position) return []
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

  return moves
}

export const getAvailableMoves = (
  activeCell: TCell | null,
  position?: TCell[]
): TCoordinate[] => {
  if (!activeCell || !position) return []
  const hashed = hash(position)
  const moves = getAvailableMovesWithoutFiltering(activeCell, hashed)

  return moves.filter((m) =>
    validateNotCheckedKing(
      activeCell.piece[0] as TPlayer,
      m,
      activeCell,
      position
    )
  )
}
