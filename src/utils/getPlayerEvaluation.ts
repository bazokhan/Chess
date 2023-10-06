import { TCell, TreeItem } from 'types/Cell'
import { getAvailableMoves } from './getAvailableMoves'
import { makeMove } from './position'
import { fileLog } from './fileLog'
import { TPlayer } from 'types/Player'
import { getIsKingCheckMated } from './getChecks'
import { TSquare } from 'types/Board'

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
  whitePieces: TCell[]
  blackPieces: TCell[]
  whiteKing?: TCell
  blackKing?: TCell
}
export const evaluatePosition = (position: TCell[]) => {
  const { whitePieces, blackPieces, whiteKing, blackKing } =
    position.reduce<EvaluationHash>(
      (acc, c) => {
        const isWhitePiece = c.piece.startsWith('w')
        if (isWhitePiece) {
          acc.whitePieces.push(c)
          if (c.piece[1] === 'k') {
            acc.whiteKing = c
          }
        } else {
          acc.blackPieces.push(c)
          if (c.piece[1] === 'k') {
            acc.blackKing = c
          }
        }
        return acc
      },
      { whitePieces: [], blackPieces: [] } as EvaluationHash
    )

  const whiteWeight = whitePieces.reduce(
    (acc, c) => (acc += WEIGHTS[c.piece[1] as keyof typeof WEIGHTS]),
    0
  )

  const blackWeight = blackPieces.reduce(
    (acc, c) => (acc += WEIGHTS[c.piece[1] as keyof typeof WEIGHTS]),
    0
  )

  const isWhiteKingCheckMated = !whiteKing
    ? false
    : getIsKingCheckMated({
        king: whiteKing,
        ownPieces: whitePieces,
        opponentPieces: blackPieces,
        position,
        type: 'checkmate'
      })

  const isOpponentKingCheckMated = !blackKing
    ? false
    : getIsKingCheckMated({
        king: blackKing,
        ownPieces: blackPieces,
        opponentPieces: whitePieces,
        position,
        type: 'checkmate'
      })

  const finalWeight =
    whiteWeight -
    blackWeight +
    (isOpponentKingCheckMated ? Infinity : 0) -
    (isWhiteKingCheckMated ? Infinity : 0)

  return finalWeight
}

export const printMoves = (
  nextMoves: {
    piece: TCell
    moves: TSquare[]
  }[]
) => {
  return nextMoves.map(
    ({ piece, moves }) =>
      `* ${piece.piece.replace(/^w/g, 'White ').replace(/^b/g, 'Black ')} at ${
        piece.square
      } ${
        !moves?.length
          ? `Can't move.`
          : `Can move to ${moves.map((m) => `${m}`).join(' or ')}`
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
    moves: TSquare[]
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
        const { newPosition } = makeMove(piece, move, position)
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
