import { initialPosition } from 'data/normalInitialPosition'
import { generatePositionsTree } from './getPlayerEvaluation'
import { flatten } from './flatten'

describe('generatePositionTree', () => {
  it('should generate the correct number of positions', () => {
    expect(
      flatten(generatePositionsTree('w', initialPosition, 1, false)).length
    ).toBe(20)
    expect(
      flatten(generatePositionsTree('w', initialPosition, 2, false)).length
    ).toBe(400)
    expect(
      flatten(generatePositionsTree('w', initialPosition, 3, false)).length
    ).toBe(8902)
    expect(flatten(generatePositionsTree('w', initialPosition, 4)).length).toBe(
      197281
    )
  })
})
