export type TPlayer = 'w' | 'b'

export type TPiece =
  | 'br'
  | 'bn'
  | 'bb'
  | 'bq'
  | 'bk'
  | 'bp'
  | 'wr'
  | 'wn'
  | 'wb'
  | 'wq'
  | 'wk'
  | 'wp'

export type TSquare =
  | 'a1'
  | 'a2'
  | 'a3'
  | 'a4'
  | 'a5'
  | 'a6'
  | 'a7'
  | 'a8'
  | 'b1'
  | 'b2'
  | 'b3'
  | 'b4'
  | 'b5'
  | 'b6'
  | 'b7'
  | 'b8'
  | 'c1'
  | 'c2'
  | 'c3'
  | 'c4'
  | 'c5'
  | 'c6'
  | 'c7'
  | 'c8'
  | 'd1'
  | 'd2'
  | 'd3'
  | 'd4'
  | 'd5'
  | 'd6'
  | 'd7'
  | 'd8'
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8'
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8'
  | 'g1'
  | 'g2'
  | 'g3'
  | 'g4'
  | 'g5'
  | 'g6'
  | 'g7'
  | 'g8'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'h7'
  | 'h8'

export type TCell = { square: TSquare; piece: TPiece; moved?: boolean }

export type TMoveType = 'castle'

export type TCoordinate = {
  x: number
  y: number
  type?: TMoveType
  relatedPiece?: TCell
  relatedCoordinates?: TCoordinate
}

export type TPromotion = 'Q' | 'R' | 'B' | 'N'

export type TreeItem = {
  piece: TCell
  move: TSquare
  turn: TPlayer
  next?: TreeItem[]
  position?: TCell[]
  evaluation: number
}

export type TPosition = Record<TSquare, TCell>

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

export type Analysis = 'single_board' | 'board_tree' | 'tree_diagram' | 'none'
