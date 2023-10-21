import { getAvailableMovesWithoutFiltering } from './index';
import { TCell, TPosition, TSquare } from 'types/Chess';

describe('getAvailableMovesWithoutFiltering', () => {
  it('returns correct moves for pawn', () => {
    const pawn: TCell = { piece: 'wp', square: 'e2', moved: false };
    const position: TPosition = { 'e2': pawn };
    const expectedMoves: TSquare[] = ['e3', 'e4'];

    const moves = getAvailableMovesWithoutFiltering(pawn, position);

    expect(moves).toEqual(expectedMoves);
  });

  it('returns correct moves for knight', () => {
    const knight: TCell = { piece: 'wn', square: 'b1', moved: false };
    const position: TPosition = { 'b1': knight };
    const expectedMoves: TSquare[] = ['a3', 'c3'];
  
    const moves = getAvailableMovesWithoutFiltering(knight, position);
  
    expect(moves).toEqual(expectedMoves);
  });
  
  it('returns correct moves for bishop', () => {
    const bishop: TCell = { piece: 'wb', square: 'c1', moved: false };
    const position: TPosition = { 'c1': bishop };
    const expectedMoves: TSquare[] = ['b2', 'a3', 'd2', 'e3', 'f4', 'g5', 'h6'];
  
    const moves = getAvailableMovesWithoutFiltering(bishop, position);
  
    expect(moves).toEqual(expectedMoves);
  });
  
  it('returns correct moves for rook', () => {
    const rook: TCell = { piece: 'wr', square: 'a1', moved: false };
    const position: TPosition = { 'a1': rook };
    const expectedMoves: TSquare[] = ['a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'];
  
    const moves = getAvailableMovesWithoutFiltering(rook, position);
  
    expect(moves).toEqual(expectedMoves);
  });
  
  it('returns correct moves for queen', () => {
    const queen: TCell = { piece: 'wq', square: 'd1', moved: false };
    const position: TPosition = { 'd1': queen };
    const expectedMoves: TSquare[] = ['d2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'c1', 'b2', 'a3', 'e1', 'f1', 'g1', 'h1', 'e2', 'f3', 'g4', 'h5', 'c2', 'b3', 'a4'];
  
    const moves = getAvailableMovesWithoutFiltering(queen, position);
  
    expect(moves).toEqual(expectedMoves);
  });
  
  it('returns correct moves for king', () => {
    const king: TCell = { piece: 'wk', square: 'e1', moved: false };
    const position: TPosition = { 'e1': king };
    const expectedMoves: TSquare[] = ['d1', 'f1', 'd2', 'e2', 'f2'];
  
    const moves = getAvailableMovesWithoutFiltering(king, position);
  
    expect(moves).toEqual(expectedMoves);
  });

  it('returns empty array for null piece', () => {
    const moves = getAvailableMovesWithoutFiltering(null, {});

    expect(moves).toEqual([]);
  });

  it('returns empty array for null position', () => {
    const pawn: TCell = { piece: 'wp', square: 'e2', moved: false };

    const moves = getAvailableMovesWithoutFiltering(pawn, null);

    expect(moves).toEqual([]);
  });
});
