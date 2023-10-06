import { FC } from 'react'
import { HighLight } from './Highlight'
import { Piece } from './Piece'
// import { usePositionContext } from 'context/PositionContext'
// import { getCoordinates } from 'utils/getCoordinates'
import { TCell, TCoordinate, TreeItem } from 'types/Cell'
import { getCoordinates } from 'utils/getCoordinates'
import { SimplePiece } from './SimplePiece'

type SimpleBoardProps = {
  hideCoordinates?: boolean
  from?: TCoordinate
  to?: TCoordinate
  position?: TCell[]
  evaluation?: number
  next?: (TreeItem & { evaluation?: number })[]
}

const nums = [8, 7, 6, 5, 4, 3, 2, 1]
const letters = 'abcdefgh'.split('')

export const SimpleBoard: FC<SimpleBoardProps> = ({
  hideCoordinates = false,
  from,
  to,
  position,
  next
}) => {
  // const { isBlackKingInCheck, isWhiteKingInCheck } = usePositionContext()

  // const blackKing = position?.find((p) => p.piece === 'bk')
  // const whiteKing = position?.find((p) => p.piece === 'wk')
  // const { x: blackX, y: blackY } = blackKing
  //   ? getCoordinates(blackKing?.square)
  //   : { x: 0, y: 0 }
  // const { x: whiteX, y: whiteY } = whiteKing
  //   ? getCoordinates(whiteKing?.square)
  //   : { x: 0, y: 0 }

  return (
    <div className="relative  overflow-hidden rounded-md bg-white">
      {/* {isBlackKingInCheck ? (
        <HighLight
          key={`${blackX}-${blackY}-${isBlackKingInCheck}`}
          x={blackX}
          y={blackY}
          variant="check"
        />
      ) : null}
      {isWhiteKingInCheck ? (
        <HighLight
          key={`${whiteX}-${whiteY}-${isWhiteKingInCheck}`}
          x={whiteX}
          y={whiteY}
          variant="check"
        />
      ) : null}
      {isBlackKingInCheck ? (
        <HighLight key={`${blackX}-${blackY}`} x={blackX} y={blackY} />
      ) : null} */}

      {from ? (
        <HighLight
          key={`${from.x}-${from.y}`}
          x={from.x}
          y={from.y}
          variant="move"
        />
      ) : null}
      {to ? (
        <HighLight key={`${to.x}-${to.y}`} x={to.x} y={to.y} variant="move" />
      ) : null}
      {next?.map((nextMove) =>
        nextMove.evaluation !== undefined ? (
          <div
            key={nextMove.evaluation}
            className={`absolute z-50 h-[12.5%] w-[12.5%] text-2xl text-[#eb6150]/80`}
            style={{
              top: `${getCoordinates(nextMove.move).y * 12.5}%`,
              left: `${getCoordinates(nextMove.move).x * 12.5}%`
            }}
          >
            <span className="absolute left-0 top-0 font-black">
              {nextMove.evaluation / 100}
            </span>
            <SimplePiece
              key={nextMove.move}
              style={{ opacity: 0.3 }}
              cell={nextMove.piece}
            />
          </div>
        ) : null
      )}

      <svg
        width="800px"
        height="800px"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-full bg-[#e9edcc]"
      >
        <path
          fill="#779954"
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
      {position?.map((cell) => <Piece key={cell.square} cell={cell} />)}
    </div>
  )
}
