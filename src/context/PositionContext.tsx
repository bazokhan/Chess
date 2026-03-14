import { ANIMATION_DURATION } from 'controller/chess/constants'
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState
} from 'react'
import { TCell, TCoordinate, TPosition, TPromotion } from 'types/Chess'
import { AnimationRecord, HistoryItem } from 'types/Chess'
// import { encodePgn } from 'utils/encodePgn'
import { useTurnContext } from './TurnContext'
import { hash, makeMove, parseFenMove } from 'controller/chess/position'
import {
  getIsBlackKingCheckMated,
  getIsKingChecked,
  getIsWhiteKingCheckMated
} from 'controller/chess/checks'
import { encodeFenPosition } from 'controller/chess/fen'
import { initialPosition } from 'data/normalInitialPosition'
import { isWhite } from 'controller/chess/isWhite'
import { defaultPuzzleFen, initPosition, standardFen } from 'data/initPosition'
import { TSquare } from 'types/Chess'
import { encodePgn } from 'controller/chess/pgn'
import { getMoves } from 'controller/chess/moves'
import { parseFenPosition } from 'controller/chess/fen'

type MovePieceArgs = {
  cell: TCell
  coordinate: TSquare
  skipHistory?: boolean
  skipAnimation?: boolean
  skipToggleTurn?: boolean
}

type PositionContextValue = {
  position: TCell[]
  movePieceToCoordinate: (args: MovePieceArgs) => void
  history: HistoryItem[]
  animate: AnimationRecord
  moveBackInHistory: () => void
  future: HistoryItem[]
  moveForwardInHistory: () => void
  pgn: string[]
  isWhiteKingInCheck: boolean
  isBlackKingInCheck: boolean
  isWhiteKingCheckMated: boolean
  isBlackKingCheckMated: boolean
  isWhiteKingStaleMated: boolean
  isBlackKingStaleMated: boolean
  isGameOver: boolean
  setPromotionType: (promotionType: TPromotion) => void
  promotionType: TPromotion
  hPosition: TPosition
  resetPosition: () => void
  resetToCurrentSetup: () => void
  resetToStandardGame: () => void
  loadFenPosition: (fen: string) => void
  currentSetupFen: string
  fen: string
  whiteMoves: string[]
  blackMoves: string[]
}

const PositionContext = createContext<PositionContextValue>({
  position: initialPosition,
  movePieceToCoordinate: () => {},
  history: [],
  animate: {},
  moveBackInHistory: () => {},
  future: [],
  moveForwardInHistory: () => {},
  pgn: [],
  isWhiteKingInCheck: false,
  isBlackKingInCheck: false,
  isWhiteKingCheckMated: false,
  isBlackKingCheckMated: false,
  isWhiteKingStaleMated: false,
  isBlackKingStaleMated: false,
  isGameOver: false,
  setPromotionType: () => {},
  promotionType: 'Q',
  hPosition: {} as TPosition,
  resetPosition: () => {},
  resetToCurrentSetup: () => {},
  resetToStandardGame: () => {},
  loadFenPosition: () => {},
  currentSetupFen: defaultPuzzleFen,
  fen: encodeFenPosition(initialPosition, 'w'),
  whiteMoves: [],
  blackMoves: []
})

export const usePositionContext = () => useContext(PositionContext)
export const PositionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [position, setPosition] = useState<TCell[]>(initPosition)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [future] = useState<HistoryItem[]>([])
  const [pgn, setPgn] = useState<string[]>([])
  const [animate, setAnimate] = useState<AnimationRecord>({})
  const [promotionType, setPromotionType] = useState<TPromotion>('Q')
  const [currentSetupFen, setCurrentSetupFen] = useState(defaultPuzzleFen)

  const { turn, toggleTurn, setTurn } = useTurnContext()

  const clearTransientState = () => {
    setHistory([])
    setPgn([])
    setAnimate({})
  }

  const loadFenPosition = (fen: string) => {
    setCurrentSetupFen(fen)
    setPosition(parseFenPosition(fen))
    setTurn((fen.split(' ')[1] ?? 'w') as 'w' | 'b')
    clearTransientState()
  }

  const resetToCurrentSetup = () => {
    setPosition(parseFenPosition(currentSetupFen))
    setTurn((currentSetupFen.split(' ')[1] ?? 'w') as 'w' | 'b')
    clearTransientState()
  }

  const resetToStandardGame = () => {
    setCurrentSetupFen(standardFen)
    setPosition(parseFenPosition(standardFen))
    setTurn('w')
    clearTransientState()
  }

  const resetPosition = resetToCurrentSetup

  const tween = async (
    cellsAndMoves: [TCell, [TCoordinate, TCoordinate]][]
  ) => {
    const newTweens = cellsAndMoves.reduce((acc, [cell, move]) => {
      acc[cell.square] = { cell, move }
      return acc
    }, {} as AnimationRecord)
    setAnimate({ ...animate, ...newTweens })
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTweens = cellsAndMoves.reduce((acc, [cell]) => {
          acc[cell.square] = null
          return acc
        }, {} as AnimationRecord)
        setAnimate({ ...animate, ...newTweens })
        resolve(true)
      }, ANIMATION_DURATION)
    })
  }

  const movePieces = (cellsAndCoordinates: [TCell, TSquare][]) => {
    let initial = position
    const moves: string[] = []
    cellsAndCoordinates.forEach(([cell, coordinate]) => {
      const { move, newPosition } = makeMove(cell, coordinate, initial)
      initial = newPosition
      moves.push(move)
    })
    return { moves, newPosition: initial }
  }

  const movePieceToCoordinate = async ({
    cell,
    coordinate,
    skipHistory = false,
    skipAnimation = false,
    skipToggleTurn = false
  }: {
    cell: TCell
    coordinate: TSquare
    skipHistory?: boolean
    skipAnimation?: boolean
    skipToggleTurn?: boolean
  }) => {
    const turnToConsider = skipHistory ? cell.piece[0] : turn
    // Not their turn
    if (cell.piece[0] !== turnToConsider) return { success: false, position }

    // Castle
    const castlingPositions = { wk: ['c1', 'g1'], bk: ['c8', 'g8'] }
    const kingPositions = { wk: 'e1', bk: 'e8' }
    const rooks = { c1: 'a1', g1: 'h1', c8: 'a8', g8: 'h8' }
    const rookDestination = { a1: 'd1', h1: 'f1', a8: 'd8', h8: 'f8' }
    if (
      castlingPositions[cell.piece as keyof typeof castlingPositions]?.includes(
        coordinate
      ) &&
      kingPositions[cell.piece as keyof typeof kingPositions] === cell.square
    ) {
      const rook = rooks[coordinate as keyof typeof rooks] as TSquare
      const newRookPlace = rookDestination[rook as keyof typeof rookDestination]

      const { moves, newPosition } = movePieces([
        [cell, coordinate],
        ...(newRookPlace
          ? [[hPosition[rook], newRookPlace as TSquare] as [TCell, TSquare]]
          : [])
      ])
      if (!skipAnimation) {
        await tween(
          moves.map((m) => [
            hPosition[m.slice(0, 2) as TSquare],
            parseFenMove(m)
          ])
        )
      }
      setPosition(newPosition)
      if (!skipToggleTurn) {
        toggleTurn()
      }
      return { success: true, position: newPosition }
    } else {
      const { move, newPosition } = makeMove(cell, coordinate, position)
      if (!skipHistory) {
        setHistory([
          ...history,
          {
            coordinates: parseFenMove(move),
            oldCell: cell,
            newCell: { ...cell, square: move.slice(2) as TSquare }
          }
        ])
        setPgn(
          encodePgn(pgn, {
            coordinates: parseFenMove(move),
            oldCell: cell,
            newCell: { ...cell, square: move.slice(2) as TSquare }
          })
        )
      }
      if (!skipAnimation) {
        await tween([[cell, parseFenMove(move)]])
      }
      setPosition(newPosition)
      if (!skipToggleTurn) {
        toggleTurn()
      }
      return { success: true, position: newPosition }
    }
  }

  const moveBackInHistory = async () => {
    // if (Object.values(animate).filter(Boolean).length) return
    // if (!history.length) return
    // const lastMove = history.at(-1)
    // if (!lastMove?.newCell) return
    // const { success } = await movePieceToCoordinate({
    //   cell: lastMove?.newCell,
    //   coordinate: lastMove?.coordinates?.[0],
    //   skipHistory: true,
    //   skipToggleTurn: true
    // })
    // if (success) {
    //   setHistory(history.filter((i) => i !== lastMove))
    //   setFuture([...future, lastMove])
    // }
  }

  const moveForwardInHistory = async () => {
    // if (Object.values(animate).filter(Boolean).length) return
    // if (!future.length) return
    // const lastMove = future.at(-1)
    // if (!lastMove?.oldCell) return
    // const { success } = await movePieceToCoordinate({
    //   cell: lastMove?.oldCell,
    //   coordinate: lastMove?.coordinates?.[1],
    //   skipHistory: true,
    //   skipToggleTurn: true
    // })
    // if (success) {
    //   setFuture(future.filter((i) => i !== lastMove))
    //   setHistory([...history, lastMove])
    // }
  }

  const hPosition: TPosition = hash(position)

  const blackPieces = position.filter((c) => !isWhite(c))
  const whiteKing = position.find((c) => c.piece === 'wk')
  const whitePieces = position.filter((c) => isWhite(c))
  const blackKing = position.find((c) => c.piece === 'bk')

  const isWhiteKingInCheck = useMemo(() => {
    return getIsKingChecked({
      position: hPosition,
      pieces: blackPieces,
      king: whiteKing as TCell
    })
  }, [blackPieces, hPosition, whiteKing])

  const isBlackKingInCheck = useMemo(() => {
    return getIsKingChecked({
      position: hPosition,
      pieces: whitePieces,
      king: blackKing as TCell
    })
  }, [blackKing, hPosition, whitePieces])

  const isWhiteKingCheckMated = useMemo(() => {
    return getIsWhiteKingCheckMated({ position, turn })
  }, [position, turn])

  const isBlackKingCheckMated = useMemo(() => {
    return getIsBlackKingCheckMated({ position, turn })
  }, [position, turn])

  const isWhiteKingStaleMated = useMemo(() => {
    return getIsWhiteKingCheckMated({ position, type: 'stalemate', turn })
  }, [position, turn])

  const isBlackKingStaleMated = useMemo(() => {
    return getIsBlackKingCheckMated({ position, type: 'stalemate', turn })
  }, [position, turn])

  const isGameOver =
    isWhiteKingCheckMated ||
    isBlackKingCheckMated ||
    isWhiteKingStaleMated ||
    isBlackKingStaleMated

  const fen = encodeFenPosition(position, turn)

  const whiteMoves = useMemo(() => getMoves('w', hPosition, true), [hPosition])
  const blackMoves = useMemo(() => getMoves('b', hPosition, true), [hPosition])

  return (
    <PositionContext.Provider
      value={{
        position,
        movePieceToCoordinate,
        history,
        animate,
        moveBackInHistory,
        future,
        moveForwardInHistory,
        pgn,
        isWhiteKingInCheck,
        isBlackKingInCheck,
        isWhiteKingCheckMated,
        isBlackKingCheckMated,
        isWhiteKingStaleMated,
        isBlackKingStaleMated,
        isGameOver,
        promotionType,
        setPromotionType,
        hPosition,
        resetPosition,
        resetToCurrentSetup,
        resetToStandardGame,
        loadFenPosition,
        currentSetupFen,
        fen,
        whiteMoves,
        blackMoves
      }}
    >
      {children}
    </PositionContext.Provider>
  )
}
