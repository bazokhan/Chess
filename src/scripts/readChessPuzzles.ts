import { CSVReader } from 'classes/CSVReader'

const csvReader = new CSVReader('data_sets/lichess_puzzle_transformed.csv')

export const Model = {
  ID: 0,
  PuzzleId: 1,
  FEN: 2,
  Moves: 3,
  Rating: 4,
  RatingDeviation: 5,
  Popularity: 6,
  NbPlays: 7,
  Themes: 8,
  GameUrl: 9
}

csvReader.readLines(10).then(() => {
  csvReader.lines
    .filter((line) => line.length === 10 && !!line[0])
    .filter((puzzle) => puzzle[Model.Themes].includes('mateIn1'))
    .forEach((line) => {
      console.log(line)
    })
})
