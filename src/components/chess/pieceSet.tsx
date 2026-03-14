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
import { FaChessBishop, FaChessKing, FaChessKnight, FaChessPawn, FaChessQueen, FaChessRook } from 'react-icons/fa'
import { TPiece } from 'types/Chess'
import { PieceTheme } from 'controller/chess/boardPreferences'
import { ReactNode } from 'react'

export const pieceImages: Record<TPiece, string> = {
  br,
  bn,
  bb,
  bq,
  bk,
  bp,
  wr,
  wn,
  wb,
  wq,
  wk,
  wp
}

const glyphByRole: Record<string, string> = {
  r: '♖',
  n: '♘',
  b: '♗',
  q: '♕',
  k: '♔',
  p: '♙'
}

const iconPieces: Record<TPiece, ReactNode> = {
  br: <FaChessRook className="h-full w-full text-black drop-shadow-lg" />,
  bn: <FaChessKnight className="h-full w-full text-black drop-shadow-lg" />,
  bb: <FaChessBishop className="h-full w-full text-black drop-shadow-lg" />,
  bq: <FaChessQueen className="h-full w-full text-black drop-shadow-lg" />,
  bk: <FaChessKing className="h-full w-full text-black drop-shadow-lg" />,
  bp: <FaChessPawn className="h-full w-full text-black drop-shadow-lg" />,
  wr: <FaChessRook className="h-full w-full text-white drop-shadow-lg" />,
  wn: <FaChessKnight className="h-full w-full text-white drop-shadow-lg" />,
  wb: <FaChessBishop className="h-full w-full text-white drop-shadow-lg" />,
  wq: <FaChessQueen className="h-full w-full text-white drop-shadow-lg" />,
  wk: <FaChessKing className="h-full w-full text-white drop-shadow-lg" />,
  wp: <FaChessPawn className="h-full w-full text-white drop-shadow-lg" />
}

export const renderPieceSet = (
  piece: TPiece,
  theme: PieceTheme,
  className: string
) => {
  if (theme === 'icons') {
    return (
      <div className={`${className} p-[10%]`}>
        <div className="h-full w-full">{iconPieces[piece]}</div>
      </div>
    )
  }
  if (theme === 'glyphs') {
    const glyph = glyphByRole[piece[1]] ?? '♙'
    return (
      <div
        className={`${className} flex items-center justify-center p-[8%] text-[3rem] leading-none ${
          piece[0] === 'w'
            ? 'text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.4)]'
            : 'text-black [text-shadow:0_1px_2px_rgba(255,255,255,0.18)]'
        }`}
        style={{ fontFamily: '"Segoe UI Symbol","Noto Sans Symbols","Arial Unicode MS",serif' }}
      >
        {glyph}
      </div>
    )
  }
  return (
    <img
      className={`${className} ${
        theme === 'neo' ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] saturate-110' : ''
      }`}
      src={pieceImages[piece]}
      draggable={false}
    />
  )
}

