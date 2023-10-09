import { TCell, TreeItem } from 'types/Chess'
import { getAvailableMoves } from './moves'
import { makeMove } from './position'
import { fileLog } from '../shared/fileLog'
import { TPlayer } from 'types/Chess'
import { getCheckMate, getIsKingCheckMated } from './checks'
import { TSquare } from 'types/Chess'
import proximityTable from '../../../data_sets/proximityTable.json'

const WEIGHTS = {
  r: 500,
  n: 300,
  b: 320,
  q: 900,
  k: 0,
  p: 100
}

const FASTER_WEIGHTS = {
  wr: 500,
  wn: 300,
  wb: 320,
  wq: 900,
  wk: 0,
  wp: 100,
  br: -500,
  bn: -300,
  bb: -320,
  bq: -900,
  bk: -0,
  bp: -100
}

export const getPlayerEvaluation = (player: TPlayer, position: TCell[]) => {
  const ownPieces = position.filter((c) => c.piece.startsWith(player))
  return ownPieces.reduce(
    (acc, c) => (acc += WEIGHTS[c.piece[1] as keyof typeof WEIGHTS]),
    0
  )
}

export const fasterEvaluatePosition = (position: TCell[]) => {
  const piecesWeight = position.reduce(
    (acc, c) => (acc += FASTER_WEIGHTS[c.piece as keyof typeof FASTER_WEIGHTS]),
    0
  )

  const isWhiteKingCheckMated = getCheckMate({ turn: 'w', position })
  const isBlackKingCheckMated = getCheckMate({ turn: 'b', position })

  const finalWeight =
    piecesWeight +
    (isBlackKingCheckMated ? Infinity : 0) -
    (isWhiteKingCheckMated ? Infinity : 0)

  return finalWeight
}

type EvaluationHash = {
  whitePieces: TCell[]
  blackPieces: TCell[]
  whiteKing?: TCell
  blackKing?: TCell
}

// let i = 0
export const evaluatePosition = (position: TCell[]) => {
  // const start = Date.now()
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

  // const end = Date.now()
  // console.log(++i, end - start)

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

export const sortByProximity = (
  square1: TSquare,
  square2: TSquare,
  targetSquare: TSquare
) => {
  const dist1 =
    Math.abs(targetSquare.charCodeAt(0) - square1.charCodeAt(0)) +
    Math.abs(targetSquare.charCodeAt(1) - square1.charCodeAt(1))
  const dist2 =
    Math.abs(targetSquare.charCodeAt(0) - square2.charCodeAt(0)) +
    Math.abs(targetSquare.charCodeAt(1) - square2.charCodeAt(1))
  return dist1 - dist2
}

export const generateAllNextMoves = (player: TPlayer, position: TCell[]) => {
  const kingSquare = position.find((c) => c.piece === `${player}k`)?.square
  const ownPieces = position.filter((c) => c.piece.startsWith(player))
  const sortedOwnPieces = ownPieces
  // .sort((a, b) =>
  //   // SORTING: prioritize pieces that are in the opponent field (aggressive???)
  //   player === 'w'
  //     ? Number(b.square[1]) - Number(a.square[1])
  //     : Number(a.square[1]) - Number(b.square[1])
  // )

  const availableMoves = sortedOwnPieces
    .map((piece) => {
      const moves = getAvailableMoves(piece, position)
      if (!moves.length) return undefined
      return {
        piece,
        // SORTING: prioritize pieces nearer to opponent king
        moves: kingSquare
          ? moves.sort((a, b) => {
              const id = `${kingSquare}${a}${b}`
              return proximityTable[id as keyof typeof proximityTable]
            })
          : moves
      }
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
  log = false,
  withEvaluation = false
): TreeItem[] => {
  if (!depth) return []
  const nextMoves = generateAllNextMoves(turn, position)
  const start = Date.now()
  let result = nextMoves
    .map(({ piece, moves }) => {
      return moves.map((move) => {
        const { newPosition } = makeMove(piece, move, position)
        return {
          piece,
          move,
          turn,
          position: newPosition,
          next: generatePositionsTree(
            turn === 'b' ? 'w' : 'b',
            newPosition,
            depth - 1,
            false,
            withEvaluation
          )
        }
      })
    })
    .flat()
  const end = Date.now()
  // console.log('===============', result?.length)
  // i = 0
  if (withEvaluation) {
    result = result.map((b) => ({
      ...b,
      evaluation: evaluatePosition(b.position)
    }))
  }

  if (log) {
    fileLog(
      'generatePositionsTree',
      `generation took ${end - start} ms and yielded ${result.length} positions`
    )
  }
  return result as TreeItem[]
}
