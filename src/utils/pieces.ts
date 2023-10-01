import { TCell } from 'types/Cell'

export const isWhite = (piece?: TCell) => piece?.piece?.startsWith('w')
