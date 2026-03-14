import { renderHook, act } from '@testing-library/react'
import { FC, PropsWithChildren } from 'react'
import { BoardProvider, useBoardContext } from './BoardContext'
import { PositionProvider } from './PositionContext'
import { TurnProvider } from './TurnContext'

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <TurnProvider>
    <PositionProvider>
      <BoardProvider>{children}</BoardProvider>
    </PositionProvider>
  </TurnProvider>
)

describe('BoardContext interactions', () => {
  it('toggles circles and arrows', () => {
    const { result } = renderHook(() => useBoardContext(), { wrapper })

    act(() => {
      result.current.toggleCircle({ x: 3, y: 3 }, 'green')
    })
    expect(result.current.circles.length).toBe(1)

    act(() => {
      result.current.toggleCircle({ x: 3, y: 3 }, 'green')
    })
    expect(result.current.circles.length).toBe(0)

    act(() => {
      result.current.toggleArrow({ x: 0, y: 0 }, { x: 1, y: 1 }, 'red')
    })
    expect(result.current.arrows.length).toBe(1)

    act(() => {
      result.current.toggleArrow({ x: 0, y: 0 }, { x: 1, y: 1 }, 'red')
    })
    expect(result.current.arrows.length).toBe(0)
  })

  it('clears all annotations touching a cell', () => {
    const { result } = renderHook(() => useBoardContext(), { wrapper })

    act(() => {
      result.current.toggleArrow({ x: 2, y: 2 }, { x: 6, y: 6 }, 'green')
      result.current.toggleArrow({ x: 1, y: 1 }, { x: 2, y: 2 }, 'red')
      result.current.toggleCircle({ x: 2, y: 2 }, 'blue')
      result.current.toggleCircle({ x: 4, y: 4 }, 'yellow')
    })
    expect(result.current.arrows.length).toBe(2)
    expect(result.current.circles.length).toBe(2)

    act(() => {
      result.current.clearAnnotationsAtCell({ x: 2, y: 2 })
    })
    expect(result.current.arrows.length).toBe(0)
    expect(result.current.circles).toEqual([{ at: { x: 4, y: 4 }, color: 'yellow' }])
  })

  it('tracks drag lifecycle', () => {
    const { result } = renderHook(() => useBoardContext(), { wrapper })

    act(() => {
      result.current.startDrag({
        cell: { square: 'e2', piece: 'wp' },
        pointerId: 7,
        clientX: 100,
        clientY: 120
      })
    })
    expect(result.current.dragState.active).toBe(true)
    expect(result.current.dragState.fromCell?.square).toBe('e2')

    act(() => {
      result.current.stopDrag()
    })
    expect(result.current.dragState.active).toBe(false)
  })

  it('updates preferences state', () => {
    const { result } = renderHook(() => useBoardContext(), { wrapper })
    act(() => {
      result.current.updatePreferences({
        moveSounds: false,
        showCoordinates: false
      })
    })
    expect(result.current.preferences.moveSounds).toBe(false)
    expect(result.current.preferences.showCoordinates).toBe(false)
  })
})

