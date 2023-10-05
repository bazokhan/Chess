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

import { FC, MouseEventHandler, useCallback, useMemo } from 'react'
import { useBoardContext } from 'context/BoardContext'
import { TCell } from 'types/Cell'
import { getCoordinates } from 'utils/getCoordinates'
import { usePositionContext } from 'context/PositionContext'
import { ANIMATION_DURATION } from 'constants/pieces'

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

type PieceProps = {
  cell: TCell
}

// #eb6150  /80
// #ffff33  /50

export const Piece: FC<PieceProps> = ({ cell }) => {
  const { activeCell, setActiveCell } = useBoardContext()
  const { animate, future } = usePositionContext()
  const isActive = activeCell?.square === cell.square
  const isAnimated = animate[cell.square]?.cell.square === cell.square

  const { x, y } = getCoordinates(cell.square)

  const onToggle: MouseEventHandler = useCallback(
    (e) => {
      if (!isActive && activeCell) {
        return
      }

      e.stopPropagation()

      if (isActive) {
        setActiveCell(null)
      } else {
        setActiveCell(cell)
      }
    },
    [activeCell, cell, isActive, setActiveCell]
  )

  const currentX = useMemo(() => {
    if (!isAnimated) return x
    return animate[cell.square]?.move?.[1]?.x ?? 0
  }, [animate, cell.square, isAnimated, x])

  const currentY = useMemo(() => {
    if (!isAnimated) return y
    return animate[cell.square]?.move?.[1]?.y ?? 0
  }, [animate, cell.square, isAnimated, y])

  return (
    <div
      className={`absolute ${
        isActive ? 'z-30' : 'z-20'
      }  h-[12.5%] w-[12.5%] cursor-grab`}
      style={{
        top: `${currentY * 12.5}%`,
        left: `${currentX * 12.5}%`,
        transition: `all ${ANIMATION_DURATION}ms`
      }}
      onClick={future?.length ? undefined : onToggle}
    >
      <img className="h-full w-full" src={pieceImages[cell.piece]} />
    </div>
  )
}
