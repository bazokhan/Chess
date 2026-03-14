import { CSSProperties, FC } from 'react'
import { TCell } from 'types/Chess'
import { renderPieceSet } from './pieceSet'
import { useBoardContext } from 'context/BoardContext'

type SimplePieceProps = {
  cell: TCell
  style?: CSSProperties
}

// #eb6150  /80
// #ffff33  /50

export const SimplePiece: FC<SimplePieceProps> = ({ cell, style }) => {
  const { preferences } = useBoardContext()
  return (
    <div className={`h-full w-full cursor-grab p-2`} style={style}>
      {renderPieceSet(cell.piece, preferences.pieceTheme, 'h-full w-full')}
    </div>
  )
}
