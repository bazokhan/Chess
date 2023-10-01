import { TCell, TCoordinate } from 'types/Cell'
import { getAvailableMoves } from './getAvailableMoves'
import { getSquare } from './getCoordinates'
import { getNewPosition } from './position'

export type TPlayer = 'w' | 'b'

const WEIGHTS = {
  r: 5,
  n: 3,
  b: 3,
  q: 9,
  k: 0,
  p: 1
}

export const getPlayerEvaluation = (player: TPlayer, position: TCell[]) => {
  const ownPieces = position.filter((c) => c.piece.startsWith(player))
  return ownPieces.reduce(
    (acc, c) => (acc += WEIGHTS[c.piece[1] as keyof typeof WEIGHTS]),
    0
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
      return { piece, moves }
    })
    .filter((m) => m.moves.length)
  return availableMoves
}

type TreeItem = {
  piece: TCell
  move: TCoordinate
  turn: TPlayer
  next?: TreeItem[]
}

const generatePositionsTree = (
  turn: TPlayer,
  position: TCell[],
  depth: number
): TreeItem[] => {
  if (!depth) return []
  const nextMoves = generateAllNextMoves(turn, position)
  return nextMoves
    .map(({ piece, moves }) => {
      return moves.map((move) => {
        const { newPosition } = getNewPosition(piece, move, position)
        return {
          piece,
          move,
          turn,
          next: generatePositionsTree(
            turn === 'b' ? 'w' : 'b',
            newPosition,
            depth - 1
          )
        }
      })
    })
    .flat()
}

function flatten(input: TreeItem[]): TreeItem[][] {
  // Initialize an empty array to store the output
  const output: TreeItem[][] = []

  // Define a helper function that takes an input element and an output element
  // and recursively adds the input element and its children to the output element
  function helper(inputElement: TreeItem, outputElement: TreeItem[]) {
    // Add the input element to the output element
    outputElement.push({
      piece: inputElement.piece,
      move: inputElement.move,
      turn: inputElement.turn
    })

    // If the input element has no children, add the output element to the output array
    if (inputElement.next?.length === 0) {
      output.push(outputElement)
    } else {
      // Otherwise, loop through the children of the input element
      for (const child of inputElement.next ?? []) {
        // Make a copy of the output element
        const newOutputElement = [...outputElement]

        // Call the helper function with the child and the new output element
        helper(child, newOutputElement)
      }
    }
  }

  // Loop through the input array
  for (const element of input) {
    // Call the helper function with each element and an empty array
    helper(element, [])
  }

  // Return the output array
  return output
}

export const calculateBestMove = ({
  turn,
  position,
  depth = 3
}: {
  turn: TPlayer
  position: TCell[]
  depth?: number
}): TreeItem | null => {
  const before = Date.now()
  const lines = flatten(generatePositionsTree(turn, position, depth))

  const hashedDeltas: Record<
    string,
    { delta: number; move: TreeItem; line: TreeItem[] }
  > = {} as Record<string, { delta: number; move: TreeItem; line: TreeItem[] }>

  lines.forEach((line) => {
    let originalPosition = position

    line.forEach(({ piece, move }) => {
      originalPosition = getNewPosition(
        piece,
        move,
        originalPosition
      ).newPosition
      const id = line[0].piece.square + '-' + getSquare(move)
      const selfEvaluation = getPlayerEvaluation(turn, originalPosition)
      const opponentEvaluation = getPlayerEvaluation(
        turn === 'w' ? 'b' : 'w',
        originalPosition
      )
      const deltaEvaluation = selfEvaluation - opponentEvaluation

      const thisLine = deltaEvaluation > hashedDeltas[id]?.delta ?? 0

      hashedDeltas[id] = {
        delta: Math.min(deltaEvaluation, hashedDeltas[id]?.delta ?? 0),
        move: line[0],
        line: thisLine ? line : hashedDeltas[id]?.line
      }
    })
  })

  const after = Date.now()
  console.log(
    `calculated ${lines?.length ?? 0} lines at depth ${depth} in ${
      after - before
    }ms`
  )

  const valuesSorted = Object.values(hashedDeltas)
    .filter((l) => !!l.line)
    .sort((a, b) => b.delta - a.delta)
  console.log(valuesSorted)
  return valuesSorted[0].move
}
