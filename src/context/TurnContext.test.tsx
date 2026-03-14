import { renderHook, act } from '@testing-library/react'
import { FC, PropsWithChildren } from 'react'
import { TurnProvider, useTurnContext } from './TurnContext'

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <TurnProvider>{children}</TurnProvider>
)

describe('TurnContext', () => {
  it('toggleTurn flips between w and b', () => {
    const { result } = renderHook(() => useTurnContext(), { wrapper })
    const initial = result.current.turn
    const flipped = initial === 'w' ? 'b' : 'w'

    act(() => {
      result.current.toggleTurn()
    })
    expect(result.current.turn).toBe(flipped)

    act(() => {
      result.current.toggleTurn()
    })
    expect(result.current.turn).toBe(initial)
  })

  it('setTurn sets the turn directly', () => {
    const { result } = renderHook(() => useTurnContext(), { wrapper })

    act(() => {
      result.current.setTurn('w')
    })
    expect(result.current.turn).toBe('w')

    act(() => {
      result.current.setTurn('b')
    })
    expect(result.current.turn).toBe('b')
  })

  it('toggleTurn is idempotent over two flips', () => {
    const { result } = renderHook(() => useTurnContext(), { wrapper })
    const initial = result.current.turn

    act(() => {
      result.current.toggleTurn()
      result.current.toggleTurn()
    })
    expect(result.current.turn).toBe(initial)
  })
})
