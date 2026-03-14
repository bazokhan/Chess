import { FC } from 'react'
import { Piece } from './Piece'
import { TCell } from 'types/Chess'

type PiecesProps = {
  position: TCell[]
}

export const Pieces: FC<PiecesProps> = ({ position }) => (
  <>
    {position.map((cell) => (
      <Piece key={cell.square} cell={cell} />
    ))}
  </>
)
