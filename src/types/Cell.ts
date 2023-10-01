import { TPiece, TSquare } from './Board'

export type TCell = { square: TSquare; piece: TPiece; moved?: boolean }

export type TMoveType = 'castle'

export type TCoordinate = {
  x: number
  y: number
  type?: TMoveType
  relatedPiece?: TCell
  relatedCoordinates?: TCoordinate
}
