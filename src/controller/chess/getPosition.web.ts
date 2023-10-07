export const getPosition = (
  _x: number,
  _y: number,
  board: HTMLDivElement | null
) => {
  const {
    left = 0,
    top = 0,
    width = 0,
    height = 0
  } = board?.getBoundingClientRect() ?? {}
  const cellWidth = Math.floor((width ?? 0) / 8)
  const cellHeight = Math.floor((height ?? 0) / 8)
  const x = cellWidth ? Math.floor((_x - left) / cellWidth) : 0
  const y = cellHeight ? Math.floor((_y - top) / cellHeight) : 0
  return { x, y }
}
