import { getPawnAvailableMoves } from './pawn'
import { TCell, TPosition, TSquare } from 'types/Chess'

describe('getPawnAvailableMoves', () => {
  it('should return correct moves for a white pawn on initial position', () => {
    const piece: TCell = { square: 'e2', piece: 'wp' }
    const position: Partial<TPosition> = {}
    const moves = getPawnAvailableMoves({ piece, position })
    expect(moves).toEqual(['e3', 'e4'])
  })

  it('should return correct moves for a black pawn on initial position', () => {
    const piece: TCell = { square: 'e7', piece: 'bp' }
    const position: Partial<TPosition> = {}
    const moves = getPawnAvailableMoves({ piece, position })
    expect(moves).toEqual(['e6', 'e5'])
  })

  it('should return correct capture moves for a white pawn', () => {
    const piece: TCell = { square: 'e4', piece: 'wp' }
    const position: Partial<TPosition> = {
      d5: { square: 'd5', piece: 'bp' },
      f5: { square: 'f5', piece: 'bp' }
    }
    const moves = getPawnAvailableMoves({ piece, position })
    expect(moves).toEqual(['e5', 'd5', 'f5'])
  })

  it('should return correct capture moves for a black pawn', () => {
    const piece: TCell = { square: 'e5', piece: 'bp' }
    const position: Partial<TPosition> = {
      d4: { square: 'd4', piece: 'wp' },
      f4: { square: 'f4', piece: 'wp' }
    }
    const moves = getPawnAvailableMoves({ piece, position })
    expect(moves).toEqual(['e4', 'd4', 'f4'])
  })

  it('should not allow moves off the board', () => {
    const piece: TCell = { square: 'e8', piece: 'wp' }
    const position: Partial<TPosition> = {}
    const moves = getPawnAvailableMoves({ piece, position })
    expect(moves).toEqual([])
  })
})

describe('getPawnAvailableMoves Stress Tests', () => {
  it('should handle a full row of white pawns efficiently', () => {
    const position: Partial<TPosition> = {}
    for (let i = 0; i < 8; i++) {
      const square = (String.fromCharCode(97 + i) + '2') as keyof TPosition
      position[square] = { square, piece: 'wp' }
    }

    console.time('Full row of white pawns')
    for (let i = 0; i < 8; i++) {
      const square = (String.fromCharCode(97 + i) + '2') as keyof TPosition
      const piece: TCell = { square, piece: 'wp' }
      getPawnAvailableMoves({ piece, position })
    }
    console.timeEnd('Full row of white pawns')
  })

  it('should handle a full row of black pawns efficiently', () => {
    const position: Partial<TPosition> = {}
    for (let i = 0; i < 8; i++) {
      const square = (String.fromCharCode(97 + i) + '7') as keyof TPosition
      position[square] = { square, piece: 'bp' }
    }

    console.time('Full row of black pawns')
    for (let i = 0; i < 8; i++) {
      const square = (String.fromCharCode(97 + i) + '7') as keyof TPosition
      const piece: TCell = { square, piece: 'bp' }
      getPawnAvailableMoves({ piece, position })
    }
    console.timeEnd('Full row of black pawns')
  })

  it('should handle pawns scattered across the board efficiently', () => {
    const position: Partial<TPosition> = {}
    const squares = ['a2', 'b3', 'c4', 'd5', 'e6', 'f7', 'g8', 'h1']
    squares.forEach((square, index) => {
      position[square as keyof TPosition] = {
        square: square as TSquare,
        piece: index % 2 === 0 ? 'wp' : 'bp'
      }
    })

    console.time('Scattered pawns')
    squares.forEach((square, index) => {
      const piece: TCell = {
        square: square as keyof TPosition,
        piece: index % 2 === 0 ? 'wp' : 'bp'
      }
      getPawnAvailableMoves({ piece, position })
    })
    console.timeEnd('Scattered pawns')
  })

  it('should handle multiple rows of pawns efficiently', () => {
    const position: Partial<TPosition> = {}
    for (let row = 2; row <= 7; row++) {
      for (let i = 0; i < 8; i++) {
        const square = (String.fromCharCode(97 + i) + row) as keyof TPosition
        position[square] = { square, piece: row <= 4 ? 'wp' : 'bp' }
      }
    }

    console.time('Multiple rows of pawns')
    for (let row = 2; row <= 7; row++) {
      for (let i = 0; i < 8; i++) {
        const square = (String.fromCharCode(97 + i) + row) as keyof TPosition
        const piece: TCell = { square, piece: row <= 4 ? 'wp' : 'bp' }
        getPawnAvailableMoves({ piece, position })
      }
    }
    console.timeEnd('Multiple rows of pawns')
  })

  it('should handle pawns on every square of the board efficiently', () => {
    const position: Partial<TPosition> = {}
    for (let row = 1; row <= 8; row++) {
      for (let i = 0; i < 8; i++) {
        const square = (String.fromCharCode(97 + i) + row) as keyof TPosition
        position[square] = { square, piece: row % 2 === 0 ? 'wp' : 'bp' }
      }
    }

    console.time('Pawns on every square')
    for (let row = 1; row <= 8; row++) {
      for (let i = 0; i < 8; i++) {
        const square = (String.fromCharCode(97 + i) + row) as keyof TPosition
        const piece: TCell = { square, piece: row % 2 === 0 ? 'wp' : 'bp' }
        getPawnAvailableMoves({ piece, position })
      }
    }
    console.timeEnd('Pawns on every square')
  })

  it('should handle alternating rows of white and black pawns efficiently', () => {
    const position: Partial<TPosition> = {}
    for (let row = 1; row <= 8; row++) {
      for (let i = 0; i < 8; i++) {
        const square = (String.fromCharCode(97 + i) + row) as keyof TPosition
        position[square] = { square, piece: row % 2 === 0 ? 'wp' : 'bp' }
      }
    }

    console.time('Alternating rows of pawns')
    for (let row = 1; row <= 8; row++) {
      for (let i = 0; i < 8; i++) {
        const square = (String.fromCharCode(97 + i) + row) as keyof TPosition
        const piece: TCell = { square, piece: row % 2 === 0 ? 'wp' : 'bp' }
        getPawnAvailableMoves({ piece, position })
      }
    }
    console.timeEnd('Alternating rows of pawns')
  })

  it('should handle a large number of random pawn positions efficiently', () => {
    const position: Partial<TPosition> = {}
    for (let i = 0; i < 64; i++) {
      const row = Math.floor(i / 8) + 1
      const col = String.fromCharCode(97 + (i % 8))
      const square = (col + row) as keyof TPosition
      position[square] = { square, piece: i % 2 === 0 ? 'wp' : 'bp' }
    }

    console.time('Large number of random pawns')
    for (let i = 0; i < 64; i++) {
      const row = Math.floor(i / 8) + 1
      const col = String.fromCharCode(97 + (i % 8))
      const square = (col + row) as keyof TPosition
      const piece: TCell = { square, piece: i % 2 === 0 ? 'wp' : 'bp' }
      getPawnAvailableMoves({ piece, position })
    }
    console.timeEnd('Large number of random pawns')
  })
})
