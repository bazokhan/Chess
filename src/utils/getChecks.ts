import { TCell, TPosition } from 'types/Cell'
import { isWhite } from './pieces'
import {
  getAvailableMoves,
  getAvailableMovesWithoutFiltering
} from './getAvailableMoves'
import { getSquare } from './getCoordinates'
import { TPlayer } from './getPlayerEvaluation'
import { hash } from './position'

export const getIsKingChecked = ({
  pieces,
  king,
  position
}: {
  pieces: TCell[]
  king: TCell
  position: TPosition
}) => {
  const allAvailableMovesForBlack = pieces.flatMap((c) =>
    getAvailableMovesWithoutFiltering(c, position)
  )
  return !!allAvailableMovesForBlack.find((m) => getSquare(m) === king?.square)
}

export const getIsWhiteKingChecked = ({ position }: { position: TCell[] }) => {
  const blackPieces = position.filter((c) => !isWhite(c))
  const whiteKing = position.find((c) => c.piece === 'wk')
  const allAvailableMovesForBlack = blackPieces.flatMap((c) =>
    getAvailableMovesWithoutFiltering(c, hash(position))
  )
  return !!allAvailableMovesForBlack.find(
    (m) => getSquare(m) === whiteKing?.square
  )
}

export const getIsBlackKingChecked = ({ position }: { position: TCell[] }) => {
  const whitePieces = position.filter((c) => isWhite(c))
  const blackKing = position.find((c) => c.piece === 'bk')
  const allAvailableMovesForWhite = whitePieces.flatMap((c) =>
    getAvailableMovesWithoutFiltering(c, hash(position))
  )
  return !!allAvailableMovesForWhite.find(
    (m) => getSquare(m) === blackKing?.square
  )
}

type TCheckType = 'checkmate' | 'stalemate'
export const getIsWhiteKingCheckMated = ({
  position,
  turn,
  type = 'checkmate'
}: {
  position: TCell[]
  turn: TPlayer
  type?: TCheckType
}) => {
  if (turn !== 'w') return false
  const blackPieces = position.filter((c) => !isWhite(c))
  const whitePieces = position.filter((c) => isWhite(c))
  const whiteKing = position.find((c) => c.piece === 'wk')
  const allAvailableMovesForBlack = blackPieces.flatMap((c) =>
    getAvailableMovesWithoutFiltering(c, hash(position))
  )
  const allAvailableMovesForWhite = whitePieces.flatMap((c) =>
    getAvailableMoves(c, position)
  )
  const isWhiteKingChecked = !!allAvailableMovesForBlack.find(
    (m) => getSquare(m) === whiteKing?.square
  )

  return (
    (type === 'checkmate' ? isWhiteKingChecked : !isWhiteKingChecked) &&
    !allAvailableMovesForWhite.length
  )
}

export const getIsBlackKingCheckMated = ({
  position,
  turn,
  type = 'checkmate'
}: {
  position: TCell[]
  turn: TPlayer
  type?: TCheckType
}) => {
  if (turn !== 'b') return false
  const blackPieces = position.filter((c) => !isWhite(c))
  const whitePieces = position.filter((c) => isWhite(c))
  const blackKing = position.find((c) => c.piece === 'bk')
  const allAvailableMovesForBlack = blackPieces.flatMap((c) =>
    getAvailableMoves(c, position)
  )
  const allAvailableMovesForWhite = whitePieces.flatMap((c) =>
    getAvailableMovesWithoutFiltering(c, hash(position))
  )
  const isBlackKingChecked = !!allAvailableMovesForWhite.find(
    (m) => getSquare(m) === blackKing?.square
  )

  return (
    (type === 'checkmate' ? isBlackKingChecked : !isBlackKingChecked) &&
    !allAvailableMovesForBlack.length
  )
}
