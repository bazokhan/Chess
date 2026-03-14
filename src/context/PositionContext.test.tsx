import { renderHook, act } from '@testing-library/react'
import { FC, PropsWithChildren } from 'react'
import { vi, beforeEach, afterEach } from 'vitest'
import { PositionProvider, usePositionContext } from './PositionContext'
import { TurnProvider, useTurnContext } from './TurnContext'
import { fen_positions } from 'data/initPosition'

const standardFen = `${fen_positions.normal} - - 0 1` // white to move

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <TurnProvider>
    <PositionProvider>{children}</PositionProvider>
  </TurnProvider>
)

const useCtx = () => ({
  pos: usePositionContext(),
  turn: useTurnContext()
})

describe('PositionContext move validation (skipAnimation: true)', () => {
  it('correct-turn piece returns success and advances turn once', async () => {
    const { result } = renderHook(useCtx, { wrapper })

    act(() => {
      result.current.pos.loadFenPosition(standardFen)
    })
    expect(result.current.turn.turn).toBe('w')

    const whitePawn = result.current.pos.position.find(
      (c) => c.piece === 'wp' && c.square === 'e2'
    )!

    let moveResult!: { success: boolean; position: unknown }
    await act(async () => {
      moveResult = await result.current.pos.movePieceToCoordinate({
        cell: whitePawn,
        coordinate: 'e4',
        skipAnimation: true
      })
    })

    expect(moveResult.success).toBe(true)
    expect(result.current.turn.turn).toBe('b')
  })

  it('wrong-turn piece returns failure and leaves turn unchanged', async () => {
    const { result } = renderHook(useCtx, { wrapper })

    act(() => {
      result.current.pos.loadFenPosition(standardFen)
    })
    expect(result.current.turn.turn).toBe('w')

    const blackPawn = result.current.pos.position.find(
      (c) => c.piece === 'bp' && c.square === 'e7'
    )!

    let moveResult!: { success: boolean; position: unknown }
    await act(async () => {
      moveResult = await result.current.pos.movePieceToCoordinate({
        cell: blackPawn,
        coordinate: 'e5',
        skipAnimation: true
      })
    })

    expect(moveResult.success).toBe(false)
    expect(result.current.turn.turn).toBe('w')
  })

  it('skipToggleTurn leaves turn unchanged after successful move', async () => {
    const { result } = renderHook(useCtx, { wrapper })

    act(() => {
      result.current.pos.loadFenPosition(standardFen)
    })

    const whitePawn = result.current.pos.position.find(
      (c) => c.piece === 'wp' && c.square === 'e2'
    )!

    let moveResult!: { success: boolean; position: unknown }
    await act(async () => {
      moveResult = await result.current.pos.movePieceToCoordinate({
        cell: whitePawn,
        coordinate: 'e4',
        skipAnimation: true,
        skipToggleTurn: true
      })
    })

    expect(moveResult.success).toBe(true)
    expect(result.current.turn.turn).toBe('w')
  })

  it('turn advances exactly once per successful move across two moves', async () => {
    const { result } = renderHook(useCtx, { wrapper })

    act(() => {
      result.current.pos.loadFenPosition(standardFen)
    })
    expect(result.current.turn.turn).toBe('w')

    const whitePawn = result.current.pos.position.find(
      (c) => c.piece === 'wp' && c.square === 'e2'
    )!
    await act(async () => {
      await result.current.pos.movePieceToCoordinate({
        cell: whitePawn,
        coordinate: 'e4',
        skipAnimation: true
      })
    })
    expect(result.current.turn.turn).toBe('b')

    const blackPawn = result.current.pos.position.find(
      (c) => c.piece === 'bp' && c.square === 'e7'
    )!
    await act(async () => {
      await result.current.pos.movePieceToCoordinate({
        cell: blackPawn,
        coordinate: 'e5',
        skipAnimation: true
      })
    })
    expect(result.current.turn.turn).toBe('w')
  })

  it('castling succeeds and advances turn once', async () => {
    const { result } = renderHook(useCtx, { wrapper })

    act(() => {
      result.current.pos.loadFenPosition(fen_positions.castling)
    })
    expect(result.current.turn.turn).toBe('w')

    const king = result.current.pos.position.find((c) => c.piece === 'wk')!

    let moveResult!: { success: boolean; position: unknown }
    await act(async () => {
      moveResult = await result.current.pos.movePieceToCoordinate({
        cell: king,
        coordinate: 'g1',
        skipAnimation: true
      })
    })

    expect(moveResult.success).toBe(true)
    expect(result.current.turn.turn).toBe('b')
  })
})
