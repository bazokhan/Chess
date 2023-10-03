import { TCell, TCoordinate, TreeItem } from 'types/Cell'
import { getAvailableMoves } from './getAvailableMoves'
import { getSquare } from './getCoordinates'
import { makeMove } from './position'
import { fileLog } from './fileLog'
import { TPlayer } from 'types/Player'
import { getIsKingCheckMated } from './getChecks'

const WEIGHTS = {
  r: 500,
  n: 300,
  b: 320,
  q: 900,
  k: 0,
  p: 100
}

export const getPlayerEvaluation = (player: TPlayer, position: TCell[]) => {
  const ownPieces = position.filter((c) => c.piece.startsWith(player))
  return ownPieces.reduce(
    (acc, c) => (acc += WEIGHTS[c.piece[1] as keyof typeof WEIGHTS]),
    0
  )
}

type EvaluationHash = {
  ownPieces: TCell[]
  opponentPieces: TCell[]
  ownKing?: TCell
  opponentKing?: TCell
}
export const evaluatePosition = (player: TPlayer, position: TCell[]) => {
  const { ownPieces, opponentPieces, ownKing, opponentKing } =
    position.reduce<EvaluationHash>(
      (acc, c) => {
        const isOwnPiece = c.piece.startsWith(player)
        if (isOwnPiece) {
          acc.ownPieces.push(c)
          if (c.piece[1] === 'k') {
            acc.ownKing = c
          }
        } else {
          acc.opponentPieces.push(c)
          if (c.piece[1] === 'k') {
            acc.opponentKing = c
          }
        }
        return acc
      },
      { ownPieces: [], opponentPieces: [] } as EvaluationHash
    )

  const ownWeight = ownPieces.reduce(
    (acc, c) => (acc += WEIGHTS[c.piece[1] as keyof typeof WEIGHTS]),
    0
  )

  const opponentWeight = opponentPieces.reduce(
    (acc, c) => (acc += WEIGHTS[c.piece[1] as keyof typeof WEIGHTS]),
    0
  )

  const isOwnKingCheckMated = !ownKing
    ? false
    : getIsKingCheckMated({
        king: ownKing,
        ownPieces,
        opponentPieces,
        position,
        type: 'checkmate'
      })

  const isOpponentKingCheckMated = !opponentKing
    ? false
    : getIsKingCheckMated({
        king: opponentKing,
        ownPieces: opponentPieces,
        opponentPieces: ownPieces,
        position,
        type: 'checkmate'
      })

  return (
    ownWeight -
    opponentWeight +
    (isOpponentKingCheckMated ? Infinity : 0) -
    (isOwnKingCheckMated ? Infinity : 0)
  )
}

export const printMoves = (
  nextMoves: {
    piece: TCell
    moves: TCoordinate[]
  }[]
) => {
  return nextMoves.map(
    ({ piece, moves }) =>
      `* ${piece.piece.replace(/^w/g, 'White ').replace(/^b/g, 'Black ')} at ${
        piece.square
      } ${
        !moves?.length
          ? `Can't move.`
          : `Can move to ${moves.map((m) => `${getSquare(m)}`).join(' or ')}`
      }`
  )
}

export const generateAllNextMoves = (player: TPlayer, position: TCell[]) => {
  const ownPieces = position.filter((c) => c.piece.startsWith(player))
  const availableMoves = ownPieces
    .map((piece) => {
      const moves = getAvailableMoves(piece, position)
      if (!moves.length) return undefined
      return { piece, moves }
    })
    .filter(Boolean)
  return availableMoves as {
    piece: TCell
    moves: TCoordinate[]
  }[]
}

export const generatePositionsTree = (
  turn: TPlayer,
  position: TCell[],
  depth: number,
  log = false
): TreeItem[] => {
  if (!depth) return []
  const start = Date.now()
  const nextMoves = generateAllNextMoves(turn, position)
  const result = nextMoves
    .map(({ piece, moves }) => {
      const result = moves.map((move) => {
        const newPosition = makeMove(piece, move, position)
        const res = {
          piece,
          move,
          turn,
          position: newPosition,
          next: generatePositionsTree(
            turn === 'b' ? 'w' : 'b',
            newPosition,
            depth - 1,
            false
          )
        }

        return res
      })

      return result
    })
    .flat()
  const end = Date.now()

  if (log) {
    fileLog(
      'generatePositionsTree',
      `generation took ${end - start} ms and yielded ${result.length} positions`
    )
  }
  return result
}
