import { TPlayer } from 'types/Chess'
import { parseFenPosition } from 'controller/chess/fen'
import { mateIn2Puzzles } from './mateIn2Puzzles'

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

// const positions = {
//   random: '8/3Pk3/2KN2r1/8/5n2/8/8/3R4 b - - 0 76',
//   normal: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w',
//   stalemate: '3k4/3P4/3K4/8/8/8/8/7R',
//   promotion: '8/3P4/3K4/8/8/8/8/7R',
//   mateIn2: '4r1k1/5ppp/r1p5/p1n1RP2/8/2P2N1P/2P3P1/3R2K1 b - - 0 21'
//   castling: '8/8/8/8/8/8/8/4K2R w'
//   only2horses: '8/8/3n4/8/8/3N4/8/8 b'\
//   stalemateIn1: '8/8/8/8/6pN/7p/7p/1KR3nk b --0 1'
// }

const position = mateIn2Puzzles[4][Model.FEN]
// const position = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w'
export const initPosition = parseFenPosition(position)
export const initialTurn = (position.split(' ')[1] ?? 'w') as TPlayer
// const initPosition = initialPosition
