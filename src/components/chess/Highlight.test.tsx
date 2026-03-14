import { render } from '@testing-library/react'
import { HighLight } from './Highlight'

describe('HighLight geometry', () => {
  it('positions on square percentage grid', () => {
    const { container } = render(<HighLight x={2} y={3} variant="availableMove" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.left).toBe('25%')
    expect(wrapper.style.top).toBe('37.5%')
  })

  it('keeps centered capture marker with relative sizing', () => {
    const { container } = render(<HighLight x={4} y={4} variant="availableCapture" />)
    expect(container.innerHTML).toContain('h-[84%]')
    expect(container.innerHTML).toContain('w-[84%]')
  })
})

