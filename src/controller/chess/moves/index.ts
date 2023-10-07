import { TCell, TPosition } from 'types/Chess'
import { getBishopAvailableMoves } from './bishop'
import { getRockAvailableMoves } from './rock'
import { getQueenAvailableMoves } from './queen'
import { getKingAvailableMoves } from './king'
import { getKnightAvailableMoves } from './knight'
import { getPawnAvailableMoves } from './pawn'
import { TPlayer } from 'types/Chess'
import { hash, makeMove } from '../position'
import { getIsBlackKingChecked, getIsWhiteKingChecked } from '../checks'
import { TSquare } from 'types/Chess'

const validateNotCheckedKing = (
  kingColor: TPlayer,
  move: TSquare,
  activeCell: TCell | null,
  position?: TCell[]
) => {
  if (!activeCell || !position) return false
  const { newPosition } = makeMove(activeCell, move, position)
  const isChecked =
    kingColor === 'w'
      ? getIsWhiteKingChecked({ position: newPosition })
      : getIsBlackKingChecked({ position: newPosition })

  return !isChecked
}

export const getAvailableMovesWithoutFiltering = (
  activeCell: TCell | null,
  position?: TPosition
): TSquare[] => {
  if (!activeCell || !position) return []
  let moves: TSquare[] = []

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
): TSquare[] => {
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
