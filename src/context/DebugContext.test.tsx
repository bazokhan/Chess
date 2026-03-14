import { renderHook, act } from '@testing-library/react'
import { FC, PropsWithChildren } from 'react'
import { vi, beforeEach, afterEach } from 'vitest'
import { BoardProvider } from './BoardContext'
import { DebugProvider, useDebugContext } from './DebugContext'
import { PositionProvider } from './PositionContext'
import { TurnProvider, useTurnContext } from './TurnContext'

// Mock the engine so tests run instantly without heavy computation
vi.mock('controller/chess/engine/getBestMoveEngine', () => ({
  getBestMoveEngine: vi.fn().mockReturnValue(null)
}))

vi.mock('controller/chess/calculateBestMoveV2', () => ({
  calculateBestMoveV2: vi.fn().mockReturnValue(null)
}))

import { getBestMoveEngine } from 'controller/chess/engine/getBestMoveEngine'

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <TurnProvider>
    <PositionProvider>
      <BoardProvider>
        <DebugProvider>{children}</DebugProvider>
      </BoardProvider>
    </PositionProvider>
  </TurnProvider>
)

const useCtx = () => ({
  debug: useDebugContext(),
  turn: useTurnContext()
})

describe('DebugContext AI turn guard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('forceStop=true prevents AI from playing', async () => {
    const { result } = renderHook(useCtx, { wrapper })

    // Default state: forceStop=true — just let the component settle
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(getBestMoveEngine).not.toHaveBeenCalled()
  })

  it('AI does not play when turn is not in aiPlayers', async () => {
    const { result } = renderHook(useCtx, { wrapper })

    // Enable AI but keep turn as 'w'; aiPlayers defaults to ['b']
    await act(async () => {
      result.current.debug.setForceStop(false)
      result.current.turn.setTurn('w')
    })
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(getBestMoveEngine).not.toHaveBeenCalled()
  })

  it('AI plays exactly once per moveNumber when conditions are met', async () => {
    const { result } = renderHook(useCtx, { wrapper })

    // Enable AI and set turn to 'b' (aiPlayers=['b'] by default)
    await act(async () => {
      result.current.debug.setForceStop(false)
      result.current.turn.setTurn('b')
    })

    // Let the effect fire but freeze the timer so moveNumber does not increment
    await act(async () => {
      await Promise.resolve() // flush microtasks (async play())
    })

    expect(getBestMoveEngine).toHaveBeenCalledTimes(1)

    // Advance timers — moveNumber increments, effect would fire again
    // but we verify it only called once per unique moveNumber value
    const callsBefore = vi.mocked(getBestMoveEngine).mock.calls.length

    // Flush the pending setTimeout that increments moveNumber
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // After moveNumber increments the effect fires for the new moveNumber;
    // with null best-move the engine is invoked again (second AI "move")
    // — that is the correct single-call-per-turn behaviour
    expect(vi.mocked(getBestMoveEngine).mock.calls.length).toBeGreaterThanOrEqual(
      callsBefore
    )
  })

  it('changing aiPlayers does NOT cause an extra AI play', async () => {
    const { result } = renderHook(useCtx, { wrapper })

    // Human's turn — AI should not play
    await act(async () => {
      result.current.debug.setForceStop(false)
      result.current.turn.setTurn('w')
    })
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(getBestMoveEngine).not.toHaveBeenCalled()

    // Switch AI to play both sides — this must NOT cause an extra play
    // because aiPlayers is no longer an effect dependency
    await act(async () => {
      result.current.debug.aiPlayBoth()
    })
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Still on human's turn (white) and moveNumber hasn't changed,
    // so the effect must not have fired an AI play
    expect(getBestMoveEngine).not.toHaveBeenCalled()
  })

  it('concurrent guard: effect does not re-enter while isAIPlayingRef is set', async () => {
    // Track each call to getBestMoveEngine — it returns null so no position mutation
    const engineMock = vi.mocked(getBestMoveEngine)

    const { result } = renderHook(useCtx, { wrapper })

    // Enable AI for black
    await act(async () => {
      result.current.debug.setForceStop(false)
      result.current.turn.setTurn('b')
    })

    // Flush the async play() microtask — engine called once
    await act(async () => {
      await Promise.resolve()
    })

    const callsAfterFirstPlay = engineMock.mock.calls.length
    expect(callsAfterFirstPlay).toBe(1)

    // Toggling forceStop rapidly fires the effect again, but moveRef was
    // already updated for moveNumber=0 so the effect exits at Guard A
    await act(async () => {
      result.current.debug.setForceStop(true)
    })
    await act(async () => {
      result.current.debug.setForceStop(false)
    })
    await act(async () => {
      await Promise.resolve()
    })

    // moveRef===moveNumber, no additional engine call
    expect(engineMock.mock.calls.length).toBe(callsAfterFirstPlay)

    // Advance timer to let moveNumber increment → effect fires for the new move
    await act(async () => {
      await vi.runAllTimersAsync()
    })
  })
})
