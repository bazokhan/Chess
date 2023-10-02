import { initialPosition } from 'data/normalInitialPosition'
import { generatePositionsTree } from './getPlayerEvaluation'
import { flatten } from './flatten'
import { TPosition } from 'types/Cell'

const hashedPosition = initialPosition.reduce((acc, cell) => {
  acc[cell.square] = cell
  return acc
}, {} as TPosition)

describe('generatePositionTree', () => {
  it('should generate the correct number of positions', () => {
    expect(
      flatten(generatePositionsTree('w', hashedPosition, initialPosition, 1))
        .length
    ).toBe(20)
    expect(
      flatten(generatePositionsTree('w', hashedPosition, initialPosition, 2))
        .length
    ).toBe(400)
    expect(
      flatten(generatePositionsTree('w', hashedPosition, initialPosition, 3))
        .length
    ).toBe(8902)
    expect(
      flatten(generatePositionsTree('w', hashedPosition, initialPosition, 4))
        .length
    ).toBe(197281)
  })
})
