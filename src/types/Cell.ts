import { TPlayer } from 'types/Player'
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

export type TPromotion = 'Q' | 'R' | 'B' | 'N'

export type TreeItem = {
  piece: TCell
  move: TCoordinate
  turn: TPlayer
  next?: TreeItem[]
  position?: TCell[]
}

export type TPosition = Record<TSquare, TCell>
