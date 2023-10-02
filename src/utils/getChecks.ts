import { TCell } from 'types/Cell'
import { isWhite } from './pieces'
import { getAvailableMoves } from './getAvailableMoves'
import { getSquare } from './getCoordinates'

export const getIsWhiteKingChecked = ({ position }: { position: TCell[] }) => {
  const blackPieces = position.filter((c) => !isWhite(c))
  const whiteKing = position.find((c) => c.piece === 'wk')
  const allAvailableMovesForBlack = blackPieces.flatMap((c) =>
    getAvailableMoves(c, position, true)
  )
  return !!allAvailableMovesForBlack.find(
    (m) => getSquare(m) === whiteKing?.square
  )
}

export const getIsBlackKingChecked = ({ position }: { position: TCell[] }) => {
  const whitePieces = position.filter((c) => isWhite(c))
  const blackKing = position.find((c) => c.piece === 'bk')
  const allAvailableMovesForWhite = whitePieces.flatMap((c) =>
    getAvailableMoves(c, position, true)
  )
  return !!allAvailableMovesForWhite.find(
    (m) => getSquare(m) === blackKing?.square
  )
}

export const getIsWhiteKingCheckMated = ({
  position
}: {
  position: TCell[]
}) => {
  const blackPieces = position.filter((c) => !isWhite(c))
  const whitePieces = position.filter((c) => isWhite(c))
  const whiteKing = position.find((c) => c.piece === 'wk')
  const allAvailableMovesForBlack = blackPieces.flatMap((c) =>
    getAvailableMoves(c, position, true)
  )
  const allAvailableMovesForWhite = whitePieces.flatMap((c) =>
    getAvailableMoves(c, position)
  )
  const isWhiteKingChecked = !!allAvailableMovesForBlack.find(
    (m) => getSquare(m) === whiteKing?.square
  )

  return isWhiteKingChecked && !allAvailableMovesForWhite.length
}

export const getIsBlackKingCheckMated = ({
  position
}: {
  position: TCell[]
}) => {
  const blackPieces = position.filter((c) => !isWhite(c))
  const whitePieces = position.filter((c) => isWhite(c))
  const blackKing = position.find((c) => c.piece === 'bk')
  const allAvailableMovesForBlack = blackPieces.flatMap((c) =>
    getAvailableMoves(c, position)
  )
  const allAvailableMovesForWhite = whitePieces.flatMap((c) =>
    getAvailableMoves(c, position, true)
  )
  const isBlackKingChecked = !!allAvailableMovesForWhite.find(
    (m) => getSquare(m) === blackKing?.square
  )

  return isBlackKingChecked && !allAvailableMovesForBlack.length
}
