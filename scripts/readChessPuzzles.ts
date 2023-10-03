import { CSVReader } from '../src/classes/CSVReader'
import { Model } from './types'

const csvReader = new CSVReader('data_sets/lichess_puzzle_transformed.csv')

csvReader.readLines(10).then(() => {
  csvReader.lines
    .filter((line) => line.length === 10 && !!line[0])
    .filter((puzzle) => puzzle[Model.Themes].includes('mateIn2'))
    .forEach((line) => {
      console.log(line)
    })
})
