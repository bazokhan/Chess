import { TCell, TCoordinate } from './Cell'

export type HistoryItem = {
  oldCell: TCell
  newCell: TCell
  coordinates: [TCoordinate, TCoordinate]
}
