import { TPlayer } from 'types/Player'
import { parseFenPosition } from 'utils/parseFenPosition'
// const positions = {
//   random: '8/3Pk3/2KN2r1/8/5n2/8/8/3R4 b - - 0 76',
//   normal: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
//   stalemate: '3k4/3P4/3K4/8/8/8/8/7R',
//   promotion: '8/3P4/3K4/8/8/8/8/7R',
//   mateIn2: '4r1k1/5ppp/r1p5/p1n1RP2/8/2P2N1P/2P3P1/3R2K1 b - - 0 21'
//   castling: '8/8/8/8/8/8/8/4K2R w'
// }
const position = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w'
export const initPosition = parseFenPosition(position)
export const initialTurn = (position.split(' ')[1] ?? 'w') as TPlayer
// const initPosition = initialPosition
