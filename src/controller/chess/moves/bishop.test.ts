import { getBishopAvailableMoves } from './bishop'
import { TCell, TPosition, TSquare } from 'types/Chess'

describe('getBishopAvailableMoves', () => {
  it('should return correct moves for a bishop in an empty board', () => {
    const piece: TCell = { piece: 'wb', square: 'd4' as TSquare }
    const position: Partial<TPosition> = {}
    const moves = getBishopAvailableMoves({ piece, position })
    expect(moves).toEqual(
      expect.arrayContaining([
        'c3',
        'b2',
        'a1',
        'e5',
        'f6',
        'g7',
        'h8',
        'c5',
        'b6',
        'a7',
        'e3',
        'f2',
        'g1'
      ])
    )
  })

  it('should stop at blocking pieces', () => {
    const piece: TCell = { piece: 'wb', square: 'd4' as TSquare }
    const position: Partial<TPosition> = {
      c3: { piece: 'wp', square: 'c3' as TSquare },
      e5: { piece: 'bp', square: 'e5' as TSquare }
    }
    const moves = getBishopAvailableMoves({ piece, position })
    expect(moves).toEqual(
      expect.arrayContaining(['e5', 'c5', 'b6', 'a7', 'e3', 'f2', 'g1'])
    )
    expect(moves).not.toContain('c3')
  })

  it('should capture opponent pieces', () => {
    const piece: TCell = { piece: 'wb', square: 'd4' as TSquare }
    const position: Partial<TPosition> = {
      e5: { piece: 'bp', square: 'e5' as TSquare }
    }
    const moves = getBishopAvailableMoves({ piece, position })
    expect(moves).toContain('e5')
  })
})

describe('getBishopAvailableMoves - Stress Tests', () => {
  it('should handle a large number of pieces on the board', () => {
    const piece: TCell = { piece: 'wb', square: 'd4' as TSquare }
    const position: Partial<TPosition> = {}
    console.time('Large number of pieces')
    for (let i = 0; i < 1000; i++) {
      const file = String.fromCharCode(97 + (i % 8))
      const rank = (i % 8) + 1
      const square = `${file}${rank}` as TSquare
      position[square] = { piece: 'bp', square }
    }
    const moves = getBishopAvailableMoves({ piece, position })
    console.timeEnd('Large number of pieces')
    expect(moves.length).toBeLessThanOrEqual(13)
  })

  it('should handle edge cases with bishop at the edge of the board', () => {
    const piece: TCell = { piece: 'wb', square: 'a1' as TSquare }
    const position: Partial<TPosition> = {}
    const moves = getBishopAvailableMoves({ piece, position })
    expect(moves).toEqual(
      expect.arrayContaining(['b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8'])
    )
  })
})
