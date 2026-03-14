import { FC } from 'react'
import { BoardTheme } from 'controller/chess/boardPreferences'
import { TPlayer } from 'types/Chess'

type BoardGridProps = {
  hideCoordinates: boolean
  orientation: TPlayer
  theme: BoardTheme
}

const numsW = [8, 7, 6, 5, 4, 3, 2, 1]
const numsB = [1, 2, 3, 4, 5, 6, 7, 8]
const lettersW = 'abcdefgh'.split('')
const lettersB = 'hgfedcba'.split('')

const themeColors: Record<BoardTheme, { dark: string; light: string }> = {
  classic: { dark: '#6d3535', light: '#e9edcc' },
  olive: { dark: '#779954', light: '#e9edcc' },
  blue: { dark: '#4c6a92', light: '#e7f0fb' }
}

export const BoardGrid: FC<BoardGridProps> = ({
  hideCoordinates,
  orientation,
  theme
}) => (
  <svg
    width="800px"
    height="800px"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    className="relative h-full w-full"
    style={{ backgroundColor: themeColors[theme].light }}
  >
    <path
      fill={themeColors[theme].dark}
      d="M255.9.2h-64v64h64zM0 64.17v64h64v-64zM128 .2H64v64h64zm64 255.9v64h64v-64zM0 192.12v64h64v-64zM383.85.2h-64v64h64zm128 0h-64v64h64zM128 256.1H64v64h64zM511.8 448v-64h-64v64zm0-128v-64h-64v64zM383.85 512h64v-64h-64zm128-319.88v-64h-64v64zM128 512h64v-64h-64zM0 512h64v-64H0zm255.9 0h64v-64h-64zM0 320.07v64h64v-64zm319.88-191.92v-64h-64v64zm-64 128h64v-64h-64zm-64 128v64h64v-64zm128-64h64v-64h-64zm0-127.95h64v-64h-64zm0 191.93v64h64v-64zM64 384.05v64h64v-64zm128-255.9v-64h-64v64zm191.92 255.9h64v-64h-64zm-128-191.93v-64h-64v64zm128-127.95v64h64v-64zm-128 255.9v64h64v-64zm-64-127.95H128v64h64zm191.92 64h64v-64h-64zM128 128.15H64v64h64zm0 191.92v64h64v-64z"
    />
    {hideCoordinates ? null : (
      <>
        {(orientation === 'w' ? numsW : numsB).map((num, index) => (
          <text
            key={num}
            x="4"
            y={index * 64 + 16}
            fontSize="14"
            fill={
              index % 2 === 0
                ? themeColors[theme].dark
                : themeColors[theme].light
            }
          >
            {num}
          </text>
        ))}
        {(orientation === 'w' ? lettersW : lettersB).map((letter, index) => (
          <text
            key={letter}
            x={(index + 1) * 64 - 12}
            y="506"
            fontSize="14"
            fill={
              index % 2 === 0
                ? themeColors[theme].light
                : themeColors[theme].dark
            }
          >
            {letter}
          </text>
        ))}
      </>
    )}
  </svg>
)
