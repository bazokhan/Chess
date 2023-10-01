import { TCell, TCoordinate } from './Cell'

export type HistoryItem = {
  oldCell: TCell
  newCell: TCell
  coordinates: [TCoordinate, TCoordinate]
  capturedCell?: TCell
}

export type AnimationRecord = Record<
  string,
  {
    cell: TCell
    move: [TCoordinate, TCoordinate]
  } | null
>
