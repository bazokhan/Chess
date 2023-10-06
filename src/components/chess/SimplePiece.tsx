import br from 'assets/chess_pieces/br.png'
import bn from 'assets/chess_pieces/bn.png'
import bb from 'assets/chess_pieces/bb.png'
import bq from 'assets/chess_pieces/bq.png'
import bk from 'assets/chess_pieces/bk.png'
import bp from 'assets/chess_pieces/bp.png'
import wr from 'assets/chess_pieces/wr.png'
import wn from 'assets/chess_pieces/wn.png'
import wb from 'assets/chess_pieces/wb.png'
import wq from 'assets/chess_pieces/wq.png'
import wk from 'assets/chess_pieces/wk.png'
import wp from 'assets/chess_pieces/wp.png'

import { CSSProperties, FC } from 'react'
import { TCell } from 'types/Cell'

const pieceImages = {
  br: br,
  bn: bn,
  bb: bb,
  bq: bq,
  bk: bk,
  bp: bp,
  wr: wr,
  wn: wn,
  wb: wb,
  wq: wq,
  wk: wk,
  wp: wp
}

type SimplePieceProps = {
  cell: TCell
  style?: CSSProperties
}

// #eb6150  /80
// #ffff33  /50

export const SimplePiece: FC<SimplePieceProps> = ({ cell, style }) => {
  return (
    <div className={`h-full w-full cursor-grab`} style={style}>
      <img className="h-full w-full" src={pieceImages[cell.piece]} />
    </div>
  )
}
