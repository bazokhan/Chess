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

export const fen_positions = {
  random: '8/3Pk3/2KN2r1/8/5n2/8/8/3R4 b - - 0 76',
  normal: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w',
  stalemate: '3k4/3P4/3K4/8/8/8/8/7R',
  promotion: '8/3P4/3K4/8/8/8/8/7R',
  mateIn2: '4r1k1/5ppp/r1p5/p1n1RP2/8/2P2N1P/2P3P1/3R2K1 b - - 0 21',
  castling: '8/8/8/8/8/8/8/4K2R w',
  only2horses: '8/8/3n4/8/8/3N4/8/8 b',
  stalemateIn1: '8/8/8/8/6pN/7p/7p/1KR3nk b --0 1'
}

export const null_move_positions = [
  '8/8/p1p5/1p5p/1P5p/8/PPP2K1p/4R1rk w - - 0 1 bm Rf1; id "zugzwang.001"',
  '1q1k4/2Rr4/8/2Q3K1/8/8/8/8 w - - 0 1 bm Kh6;  id "zugzwang.002"',
  '7k/5K2/5P1p/3p4/6P1/3p4/8/8 w - - 0 1 bm g5; id "zugzwang.003"',
  '8/6B1/p5p1/Pp4kp/1P5r/5P1Q/4q1PK/8 w - - 0 32 bm Qxh4; id "zugzwang.004"',
  '8/8/1p1r1k2/p1pPN1p1/P3KnP1/1P6/8/3R4 b - - 0 1 bm Nxd5; id "zugzwang.005"'
]

export const standardFen = `${fen_positions.normal} - - 0 1`
export const defaultPuzzleFen = mateIn2Puzzles[4][Model.FEN]
const initialFen = defaultPuzzleFen
export const initPosition = parseFenPosition(initialFen)
export const initialTurn = (initialFen.split(' ')[1] ?? 'w') as TPlayer
// const initPosition = initialPosition
