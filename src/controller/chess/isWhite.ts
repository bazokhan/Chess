import { TCell } from 'types/Chess'

export const isWhite = (piece?: TCell) => piece?.piece?.startsWith('w')
