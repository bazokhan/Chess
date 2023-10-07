import { TCell, TPosition } from 'types/Chess'
import { isWhite } from './isWhite'
import { getAvailableMoves, getAvailableMovesWithoutFiltering } from './moves'
import { TPlayer } from 'types/Chess'
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
  const allAvailableMovesForPieces = pieces.flatMap((c) =>
    getAvailableMovesWithoutFiltering(c, position)
  )
  return !!allAvailableMovesForPieces.find((m) => m === king?.square)
}

export const getIsWhiteKingChecked = ({ position }: { position: TCell[] }) => {
  const blackPieces = position.filter((c) => !isWhite(c))
  const whiteKing = position.find((c) => c.piece === 'wk')
  const allAvailableMovesForBlack = blackPieces.flatMap((c) =>
    getAvailableMovesWithoutFiltering(c, hash(position))
  )
  return !!allAvailableMovesForBlack.find((m) => m === whiteKing?.square)
}

export const getIsBlackKingChecked = ({ position }: { position: TCell[] }) => {
  const whitePieces = position.filter((c) => isWhite(c))
  const blackKing = position.find((c) => c.piece === 'bk')
  const allAvailableMovesForWhite = whitePieces.flatMap((c) =>
    getAvailableMovesWithoutFiltering(c, hash(position))
  )
  return !!allAvailableMovesForWhite.find((m) => m === blackKing?.square)
}

type TCheckType = 'checkmate' | 'stalemate'

export const getIsKingCheckMated = ({
  position,
  ownPieces,
  king,
  opponentPieces,
  type = 'checkmate'
}: {
  position: TCell[]
  ownPieces: TCell[]
  king?: TCell
  opponentPieces: TCell[]
  type?: TCheckType
}) => {
  const allAvailableMovesForOpponent = opponentPieces.flatMap((c) =>
    getAvailableMovesWithoutFiltering(c, hash(position))
  )
  const allAvailableMovesForPlayer = ownPieces.flatMap((c) =>
    getAvailableMoves(c, position)
  )
  const isPlayerKingChecked = !!allAvailableMovesForOpponent.find(
    (m) => m === king?.square
  )

  return (
    (type === 'checkmate' ? isPlayerKingChecked : !isPlayerKingChecked) &&
    !allAvailableMovesForPlayer.length
  )
}

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
    (m) => m === whiteKing?.square
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
    (m) => m === blackKing?.square
  )

  return (
    (type === 'checkmate' ? isBlackKingChecked : !isBlackKingChecked) &&
    !allAvailableMovesForBlack.length
  )
}
