import { initialPosition } from 'data/normalInitialPosition'
import { TCell, TCoordinate, TPosition } from 'types/Cell'
import { HistoryItem } from 'types/History'
import { calculateBestMoveV2 } from 'utils/engines/v2'
import { fileLog } from 'utils/fileLog'
import {
  getIsBlackKingCheckMated,
  getIsKingChecked,
  getIsWhiteKingCheckMated
} from 'utils/getChecks'
import { getSquare } from 'utils/getCoordinates'
import { TPlayer } from 'types/Player'
import { parseFenPosition } from 'utils/parseFenPosition'
import { isWhite } from 'utils/pieces'
import { getNewPosition, hash } from 'utils/position'

export class Chess {
  position: TCell[]
  turn: TPlayer
  moveNumber: number
  id: string | number
  constructor(id: string | number, fenPosition?: string, turn?: TPlayer) {
    console.log(`Initializing game #${id}`)
    this.id = id
    this.position = fenPosition
      ? parseFenPosition(fenPosition)
      : initialPosition
    this.turn = turn ?? 'w'
    this.moveNumber = 0
  }

  private movePieces(cellsAndCoordinates: [TCell, TCoordinate][]) {
    let initial = this.position
    const moves: HistoryItem[] = []
    cellsAndCoordinates.forEach(([cell, coordinate]) => {
      const { move, newPosition } = getNewPosition(cell, coordinate, initial)
      initial = newPosition
      moves.push(move)
    })
    return { moves, newPosition: initial }
  }

  private toggleTurn() {
    this.turn = this.turn === 'w' ? 'b' : 'w'
  }

  async movePieceToCoordinate({
    cell,
    coordinate,
    skipHistory = false,
    skipToggleTurn = false
  }: {
    cell: TCell
    coordinate: TCoordinate
    skipHistory?: boolean
    skipAnimation?: boolean
    skipToggleTurn?: boolean
  }) {
    const turnToConsider = skipHistory ? cell.piece[0] : this.turn
    // Not their turn
    if (cell.piece[0] !== turnToConsider)
      return { success: false, position: this.position }

    if (!skipToggleTurn) {
      this.toggleTurn()
    }
    // Castle
    if (
      coordinate.type === 'castle' &&
      coordinate.relatedPiece &&
      coordinate.relatedCoordinates
    ) {
      const { newPosition } = this.movePieces([
        [cell, coordinate],
        [coordinate.relatedPiece, coordinate.relatedCoordinates]
      ])

      this.position = newPosition
      return { success: true, position: newPosition }
    } else {
      const { newPosition } = getNewPosition(cell, coordinate, this.position)

      this.position = newPosition
      return { success: true, position: newPosition }
    }
  }

  get hPosition(): TPosition {
    return hash(this.position)
  }

  get blackPieces() {
    return this.position.filter((c) => !isWhite(c))
  }
  get whiteKing() {
    return this.position.find((c) => c.piece === 'wk')
  }
  get whitePieces() {
    return this.position.filter((c) => isWhite(c))
  }
  get blackKing() {
    return this.position.find((c) => c.piece === 'bk')
  }

  get isWhiteKingInCheck() {
    return getIsKingChecked({
      position: this.hPosition,
      pieces: this.blackPieces,
      king: this.whiteKing as TCell
    })
  }

  get isBlackKingInCheck() {
    return getIsKingChecked({
      position: this.hPosition,
      pieces: this.whitePieces,
      king: this.blackKing as TCell
    })
  }

  get isWhiteKingCheckMated() {
    return getIsWhiteKingCheckMated({
      position: this.position,
      turn: this.turn
    })
  }

  get isBlackKingCheckMated() {
    return getIsBlackKingCheckMated({
      position: this.position,
      turn: this.turn
    })
  }

  get isWhiteKingStaleMated() {
    return getIsWhiteKingCheckMated({
      position: this.position,
      type: 'stalemate',
      turn: this.turn
    })
  }

  get isBlackKingStaleMated() {
    return getIsBlackKingCheckMated({
      position: this.position,
      type: 'stalemate',
      turn: this.turn
    })
  }

  get isGameOver() {
    return (
      this.isWhiteKingCheckMated ||
      this.isBlackKingCheckMated ||
      this.isWhiteKingStaleMated ||
      this.isBlackKingStaleMated
    )
  }

  private async handleAIPlay(playerTurn?: TPlayer, log: boolean = false) {
    const bestMove = calculateBestMoveV2({
      turn: playerTurn ?? this.turn,
      position: this.position,
      minmaxVersion: 2
    })

    if (bestMove) {
      await this.movePieceToCoordinate({
        cell: bestMove.piece,
        coordinate: bestMove.move,
        skipAnimation: true,
        skipHistory: true
      })
      if (log) {
        console.log(
          `Moved ${bestMove.piece.piece} from ${
            bestMove.piece.square
          } to ${getSquare(bestMove.move)}`
        )
      }
    }
  }

  async runMatch(log: boolean = false) {
    const start = Date.now()
    console.log(`Game ${this.id} starting at ${new Date().toLocaleString()}..`)

    while (!this.isGameOver && this.moveNumber < 200) {
      await this.handleAIPlay(this.turn, log)
      this.moveNumber += 1
    }

    const end = Date.now()
    let logText = this.isBlackKingCheckMated
      ? 'White won by checkmate'
      : this.isWhiteKingCheckMated
      ? 'Black won by checkmate'
      : this.isBlackKingStaleMated || this.isWhiteKingStaleMated
      ? 'Game drawn by stalemate'
      : this.moveNumber >= 200
      ? 'Game ended due to exceeding move limit'
      : 'Unknown status'
    logText += `final position is ${JSON.stringify(this.position, null, 2)}`
    console.log(
      `Game over at ${new Date().toLocaleString()} in ${
        this.moveNumber
      } moves. ${logText}. Game took ${((end - start) / 1000).toFixed(
        2
      )} seconds`
    )
    fileLog(
      'Games',
      `Game #${this.id} over in ${this.moveNumber} moves. ${logText}.`
    )
  }
}
