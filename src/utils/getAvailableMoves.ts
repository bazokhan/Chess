import { TCell, TCoordinate } from 'types/Cell'
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
  const start = Date.now()
  const { newPosition } = getNewPosition(activeCell, move, position)
  const isChecked =
    kingColor === 'w'
      ? getIsWhiteKingChecked({ position: newPosition })
      : getIsBlackKingChecked({ position: newPosition })
  const end = Date.now()
  const time = end - start
  if (time > 100) {
    console.log(
      `this ${activeCell.piece} at ${activeCell.square} took ${time} ms`
    )
  }
  return !isChecked
}

export const getAvailableMoves = (
  activeCell: TCell | null,
  position?: TCell[],
  skipFilteringByChecks: boolean = false
): TCoordinate[] => {
  if (!activeCell || !position) return []
  let moves: TCoordinate[] = []
  const hashed = hash(position)

  switch (activeCell.piece) {
    case 'wp':
    case 'bp': {
      moves = getPawnAvailableMoves({ piece: activeCell, position: hashed })
      break
    }
    case 'wn':
    case 'bn': {
      moves = getKnightAvailableMoves({ piece: activeCell, position: hashed })
      break
    }
    case 'wb':
    case 'bb': {
      moves = getBishopAvailableMoves({ piece: activeCell, position: hashed })
      break
    }
    case 'wr':
    case 'br': {
      moves = getRockAvailableMoves({ piece: activeCell, position: hashed })
      break
    }
    case 'wq':
    case 'bq': {
      moves = getQueenAvailableMoves({ piece: activeCell, position: hashed })
      break
    }
    case 'wk':
    case 'bk': {
      moves = getKingAvailableMoves({ piece: activeCell, position: hashed })
      break
    }
    default: {
      moves = []
    }
  }

  if (skipFilteringByChecks) return moves

  return moves.filter((m) =>
    skipFilteringByChecks
      ? true
      : validateNotCheckedKing(
          activeCell.piece[0] as TPlayer,
          m,
          activeCell,
          position
        )
  )
}
