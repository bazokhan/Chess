import { initialPosition } from 'data/normalInitialPosition'
import { generatePositionsTree } from './getPlayerEvaluation'
import { flatten } from './flatten'

describe('generatePositionTree', () => {
  it('should generate the correct number of positions', () => {
    expect(flatten(generatePositionsTree('w', initialPosition, 1)).length).toBe(
      20
    )
    expect(flatten(generatePositionsTree('w', initialPosition, 2)).length).toBe(
      400
    )
    expect(flatten(generatePositionsTree('w', initialPosition, 3)).length).toBe(
      8902
    )
    expect(
      flatten(generatePositionsTree('w', initialPosition, 4, true)).length
    ).toBe(197281)
  })
})
