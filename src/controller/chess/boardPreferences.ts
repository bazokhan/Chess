export type BoardTheme = 'classic' | 'olive' | 'blue'
export type PieceTheme = 'classic' | 'neo' | 'icons' | 'glyphs'
export type AnnotationColor = 'green' | 'red' | 'blue' | 'yellow'

export type BoardPreferences = {
  showCoordinates: boolean
  moveSounds: boolean
  animationSpeed: number
  boardTheme: BoardTheme
  pieceTheme: PieceTheme
  annotationColor: AnnotationColor
}

const STORAGE_KEY = 'chess.board.preferences.v1'

const DEFAULTS: BoardPreferences = {
  showCoordinates: true,
  moveSounds: true,
  animationSpeed: 1,
  boardTheme: 'classic',
  pieceTheme: 'classic',
  annotationColor: 'green'
}

export const getDefaultBoardPreferences = () => ({ ...DEFAULTS })

const sanitize = (input: Partial<BoardPreferences>): BoardPreferences => ({
  showCoordinates:
    typeof input.showCoordinates === 'boolean'
      ? input.showCoordinates
      : DEFAULTS.showCoordinates,
  moveSounds: typeof input.moveSounds === 'boolean' ? input.moveSounds : DEFAULTS.moveSounds,
  animationSpeed:
    typeof input.animationSpeed === 'number' &&
    Number.isFinite(input.animationSpeed) &&
    input.animationSpeed >= 0.5 &&
    input.animationSpeed <= 2
      ? input.animationSpeed
      : DEFAULTS.animationSpeed,
  boardTheme:
    input.boardTheme === 'classic' || input.boardTheme === 'olive' || input.boardTheme === 'blue'
      ? input.boardTheme
      : DEFAULTS.boardTheme,
  pieceTheme:
    input.pieceTheme === 'neo' ||
    input.pieceTheme === 'icons' ||
    input.pieceTheme === 'glyphs'
      ? input.pieceTheme
      : 'classic',
  annotationColor:
    input.annotationColor === 'red' ||
    input.annotationColor === 'blue' ||
    input.annotationColor === 'yellow' ||
    input.annotationColor === 'green'
      ? input.annotationColor
      : DEFAULTS.annotationColor
})

export const loadBoardPreferences = (): BoardPreferences => {
  if (typeof window === 'undefined') return getDefaultBoardPreferences()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultBoardPreferences()
    const parsed = JSON.parse(raw) as Partial<BoardPreferences>
    return sanitize(parsed)
  } catch {
    return getDefaultBoardPreferences()
  }
}

export const saveBoardPreferences = (preferences: BoardPreferences) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
}

