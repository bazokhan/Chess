import { FC } from 'react'

type BoardGridProps = {
  hideCoordinates: boolean
}

const nums = [8, 7, 6, 5, 4, 3, 2, 1]
const letters = 'abcdefgh'.split('')

export const BoardGrid: FC<BoardGridProps> = ({ hideCoordinates }) => (
  <svg
    width="800px"
    height="800px"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    className="relative h-full w-full bg-[#e9edcc]"
  >
    <path
      // fill="#779954"
      fill="#6d3535"
      d="M255.9.2h-64v64h64zM0 64.17v64h64v-64zM128 .2H64v64h64zm64 255.9v64h64v-64zM0 192.12v64h64v-64zM383.85.2h-64v64h64zm128 0h-64v64h64zM128 256.1H64v64h64zM511.8 448v-64h-64v64zm0-128v-64h-64v64zM383.85 512h64v-64h-64zm128-319.88v-64h-64v64zM128 512h64v-64h-64zM0 512h64v-64H0zm255.9 0h64v-64h-64zM0 320.07v64h64v-64zm319.88-191.92v-64h-64v64zm-64 128h64v-64h-64zm-64 128v64h64v-64zm128-64h64v-64h-64zm0-127.95h64v-64h-64zm0 191.93v64h64v-64zM64 384.05v64h64v-64zm128-255.9v-64h-64v64zm191.92 255.9h64v-64h-64zm-128-191.93v-64h-64v64zm128-127.95v64h64v-64zm-128 255.9v64h64v-64zm-64-127.95H128v64h64zm191.92 64h64v-64h-64zM128 128.15H64v64h64zm0 191.92v64h64v-64z"
    />
    {hideCoordinates ? null : (
      <>
        {nums.map((num, index) => (
          <text
            key={num}
            x="4"
            y={index * 64 + 16}
            fontSize="14"
            fill={index % 2 === 0 ? '#779954' : '#e9edcc'}
          >
            {num}
          </text>
        ))}
        {letters.map((letter, index) => (
          <text
            key={letter}
            x={(index + 1) * 64 - 12}
            y="506"
            fontSize="14"
            fill={index % 2 === 0 ? '#e9edcc' : '#779954'}
          >
            {letter}
          </text>
        ))}
      </>
    )}
  </svg>
)
