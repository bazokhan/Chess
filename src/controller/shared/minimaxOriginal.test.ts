import { Tree } from 'types/Shared'
import { minimax } from './minimax'

const tree: Tree = {
  id: '1',
  evaluation: 0,
  next: [
    {
      id: '2',
      evaluation: 0,
      next: [
        {
          id: '3',
          evaluation: 0,
          next: [
            { id: '13', evaluation: 0 },
            { id: '14', evaluation: 4 },
            { id: '15', evaluation: -4 }
          ]
        },
        {
          id: '4',
          evaluation: 2,
          next: [
            { id: '16', evaluation: 0 },
            { id: '17', evaluation: 5 },
            { id: '18', evaluation: -5 }
          ]
        },
        {
          id: '22',
          evaluation: -2,
          next: [
            { id: '19', evaluation: 0 },
            { id: '20', evaluation: 6 },
            { id: '21', evaluation: -6 }
          ]
        }
      ]
    },
    {
      id: '5',
      evaluation: 1,
      next: [
        {
          id: '6',
          evaluation: 0,
          next: [
            { id: '23', evaluation: 0 },
            { id: '24', evaluation: 7 },
            { id: '25', evaluation: -7 }
          ]
        },
        {
          id: '7',
          evaluation: 1,
          next: [
            { id: '26', evaluation: 0 },
            { id: '27', evaluation: 8 },
            { id: '28', evaluation: -8 }
          ]
        },
        {
          id: '8',
          evaluation: -1,
          next: [
            { id: '29', evaluation: 0 },
            { id: '30', evaluation: 9 },
            { id: '31', evaluation: -9 }
          ]
        }
      ]
    },
    {
      id: '9',
      evaluation: -1,
      next: [
        {
          id: '10',
          evaluation: 0,
          next: [
            { id: '32', evaluation: 0 },
            { id: '33', evaluation: 10 },
            { id: '34', evaluation: -10 }
          ]
        },
        {
          id: '11',
          evaluation: 3,
          next: [
            { id: '35', evaluation: 0 },
            { id: '36', evaluation: 11 },
            { id: '37', evaluation: -11 }
          ]
        },
        {
          id: '12',
          evaluation: -3,
          next: [
            { id: '38', evaluation: 0 },
            { id: '39', evaluation: 12 },
            { id: '40', evaluation: -12 }
          ]
        }
      ]
    }
  ]
}

describe('minimax', () => {
  it('should generate the correct minimax', () => {
    expect(minimax('w', tree)).toEqual({ evaluation: 10, id: '9' })
    expect(minimax('b', tree)).toEqual({ evaluation: -10, id: '9' })
  })

  // https://github.com/marcelxyz/minimax-typescript/blob/master/__tests__/MinimaxTest.ts
  it('should find optimal solution for min and max', function () {
    const tree = {
      id: '1',
      evaluation: 0,
      next: [
        {
          id: '11',
          evaluation: 0,
          next: [
            { id: '111', evaluation: 3 },
            { id: '112', evaluation: 12 },
            { id: '113', evaluation: 8 }
          ]
        },
        {
          id: '12',
          evaluation: 0,
          next: [
            { id: '121', evaluation: 2 },
            { id: '122', evaluation: 4 },
            { id: '123', evaluation: 6 }
          ]
        },
        {
          id: '13',
          evaluation: 0,
          next: [
            { id: '131', evaluation: 14 },
            { id: '132', evaluation: 5 },
            { id: '133', evaluation: 2 }
          ]
        }
      ]
    }

    expect(minimax('w', tree)).toEqual({ evaluation: 3, id: '11' })
    expect(minimax('b', tree)).toEqual({ evaluation: 6, id: '12' })
  })
})
