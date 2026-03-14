import { FC } from 'react'
import { Piece } from './Piece'
import { TCell } from 'types/Chess'
import { TPlayer } from 'types/Chess'

type PiecesProps = {
  position: TCell[]
  orientation: TPlayer
}

export const Pieces: FC<PiecesProps> = ({ position, orientation }) => (
  <>
    {position.map((cell) => (
      <Piece key={cell.square} cell={cell} orientation={orientation} />
    ))}
  </>
)
