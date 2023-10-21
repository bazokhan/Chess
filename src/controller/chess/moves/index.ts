import { TCell, TPiece, TPosition, TPromotion } from 'types/Chess';
import { getBishopAvailableMoves } from './bishop';
import { getRockAvailableMoves } from './rock';
import { getQueenAvailableMoves } from './queen';
import { getKingAvailableMoves } from './king';
import { getKnightAvailableMoves } from './knight';
import { getPawnAvailableMoves } from './pawn';
import { TPlayer } from 'types/Chess';
import { hash, makeMove } from '../position';
import { memoize } from 'lodash';

const pieceToMoveFunctionMap = {
  'wp': getPawnAvailableMoves,
  'bp': getPawnAvailableMoves,
  'wn': getKnightAvailableMoves,
  'bn': getKnightAvailableMoves,
  'wb': getBishopAvailableMoves,
  'bb': getBishopAvailableMoves,
  'wr': getRockAvailableMoves,
  'br': getRockAvailableMoves,
  'wq': getQueenAvailableMoves,
  'bq': getQueenAvailableMoves,
  'wk': getKingAvailableMoves,
  'bk': getKingAvailableMoves,
};

const getAvailableMovesWithoutFilteringMemoized = memoize(getAvailableMovesWithoutFiltering);
getCheck,
getIsBlackKingChecked,
getIsWhiteKingChecked
} from '../checks';
import { TSquare } from 'types/Chess';
import { getCoordinates } from '../coordinates';

const validateNotCheckedKing = (
  kingColor: TPlayer,
  move: TSquare,
  activeCell: TCell | null,
  position?: TCell[],
) => {
  if (!activeCell || !position) return false;
  const { newPosition } = makeMove(activeCell, move, position);
  const isChecked =
    kingColor === 'w'
      ? getIsWhiteKingChecked({ position: newPosition })
      : getIsBlackKingChecked({ position: newPosition });

  return !isChecked;
};

export const makeFenMove = (
  fenMove: string,
  position: TPosition,
  promotionType: TPromotion = 'Q',
) => {
  const [piece, from, to] = [
    fenMove.slice(0, 2),
    fenMove.slice(2, 4),
    fenMove.slice(4),
  ] as [TPiece, TSquare, TSquare];
  const cell = position[from];
  if (!cell) return { newPosition: position, move: `` };
  const newCell = { piece, square: to, moved: true };
  if ((piece === 'wp' && to[1] === '8') || (piece === 'bp' && to[1] === '1')) {
    newCell.piece = `${piece[0]}${promotionType.toLowerCase()}` as TPiece;
  }

  const newPosition = { ...position };
  delete newPosition[from];
  newPosition[to] = newCell;

  return {
    newPosition,
    move: fenMove,
  };
};

export const getMoves = (
  turn: TPlayer,
  position: TPosition,
  validateChecks: boolean = false,
): string[] => {
  const pieces = Object.values(position).filter((c) => c.piece.startsWith(turn));
  const moves: string[] = [];
  pieces.forEach((p) => {
    const piece = p.piece;
    const currentSquare = p.square;
    const isKing = piece[1] === 'k';
    const isBishop = piece[1] === 'b';
    const isRook = piece[1] === 'r';
    const isKnight = piece[1] === 'n';
    const isPawn = piece[1] === 'p';
    const isWhitePiece = piece[0] === 'w';
    const { x, y } = getCoordinates(p.square);

    if (isPawn) {
      const yDirection = isWhitePiece ? -1 : 1;
      const firstPawnRank = isWhitePiece ? '2' : '7';
      const maxDelta = p.square[1] === firstPawnRank ? 2 : 1;

      for (let delta = 1; delta <= maxDelta; delta += 1) {
        const newY = y + delta * yDirection;
        if (newY < 0 || newY > 7) continue;
        const square = (p.square[0] + (8 - newY)) as TSquare;
        const targetPiece = position[square];
        if (targetPiece) {
          break;
        }
        moves.push(`${piece}${currentSquare}${square}`);
      }

      for (
        let possibleCaptureDeltaX = -1;
        possibleCaptureDeltaX <= 1;
        possibleCaptureDeltaX += 1
      ) {
        if (possibleCaptureDeltaX === 0) continue; // pawns can't capture in front of them
        const newX = x + possibleCaptureDeltaX;
        const newY = y + yDirection;
        if (newX < 0 || newX > 7 || newY < 0 || newY > 7) continue;
        const square = (String.fromCharCode(
          p.square.charCodeAt(0) + possibleCaptureDeltaX,
        ) +
          (8 - newY)) as TSquare;
        const targetPiece = position[square];
        if (
          targetPiece &&
          targetPiece?.piece[0] !== p.piece[0] /** not same player */
        ) {
          moves.push(`${piece}${currentSquare}${square}`);
        }
      }
    } else {
      ;[
        [-1, -1],
        [1, 1],
        [-1, 1],
        [1, -1],
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ].forEach(([xDirection, yDirection], index) => {
        if (index <= 3 && isRook) return; // rocks don't move diagnoally
        if (index > 3 && (isBishop || isKnight)) return; // bishops don't move vertically, knights will have own loop
        if (isKnight) {
          for (let deltaX = 1; deltaX <= 2; deltaX += 1) {
            for (let deltaY = 1; deltaY <= 2; deltaY += 1) {
              if (deltaX === deltaY) continue; // Knights have different delta on x and y when they move, it's always 1 sqaure vs 2
              const newX = x + deltaX * xDirection;
              const newY = y + deltaY * yDirection;
              if (newX < 0 || newX > 7 || newY < 0 || newY > 7) continue;
              const square = (String.fromCharCode(
                p.square.charCodeAt(0) + deltaX * xDirection,
              ) +
                (8 - newY)) as TSquare;
              const targetPiece = position[square];
              const isSamePlayer = targetPiece?.piece[0] === p.piece[0];
              if (targetPiece) {
                if (!isSamePlayer) {
                  moves.push(`${piece}${currentSquare}${square}`);
                }
              } else {
                // this else is important since in knights, there is no break statement
                moves.push(`${piece}${currentSquare}${square}`);
              }
            }
          }
        } else {
          for (let i = 1; i <= (isKing ? 1 : 8); i += 1) {
            const delta = i;
            const newX = x + delta * xDirection;
            const newY = y + delta * yDirection;
            if (newX < 0 || newX > 7 || newY < 0 || newY > 7) continue;
            const square = (String.fromCharCode(
              p.square.charCodeAt(0) + delta * xDirection,
            ) +
              (8 - newY)) as TSquare;
            const targetPiece = position[square];
            const isSamePlayer = targetPiece?.piece[0] === p.piece[0];
            if (targetPiece) {
              if (!isSamePlayer) {
                moves.push(`${piece}${currentSquare}${square}`);
              }
              break;
            }
            moves.push(`${piece}${currentSquare}${square}`);
          }
        }
      });
    }
  });
  if (!validateChecks) return moves;
  return moves.filter((m) => {
    const { newPosition } = makeFenMove(m, position);
    const isChecked = getCheck({
      turn: turn === 'w' ? 'b' : 'w',
      position: newPosition,
    });
    return !isChecked;
  });
};

export const getAvailableMovesWithoutFiltering = (
  activePieceCell: TCell | null,
  chessPosition?: TPosition,
): TSquare[] => {
  if (!activePieceCell || !chessPosition) return [];
  const moveFunction = pieceToMoveFunctionMap[activePieceCell.piece];
  if (!moveFunction) return [];
  return moveFunction({ piece: activePieceCell, chessPosition });
};

export const getAvailableMoves = (
  activeCell: TCell | null,
  position?: TCell[],
): TSquare[] => {
  if (!activeCell || !position) return [];
  const hashed = hash(position);
  const moves = getAvailableMovesWithoutFiltering(activeCell, hashed);

  return moves.filter((m) =>
    validateNotCheckedKing(
      activeCell.piece[0] as TPlayer,
      m,
      activeCell,
      position,
    ),
  );
};
