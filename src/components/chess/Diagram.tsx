import { useDisclosure } from 'hooks/useDisclosure'
import { FC } from 'react'
import { TPiece, TSquare } from 'types/Board'
import { TCell, TreeItem } from 'types/Cell'
import { TPlayer } from 'types/Player'
import {
  evaluatePosition,
  generatePositionsTree
} from 'utils/getPlayerEvaluation'

type DiagramProps = {
  turn: TPlayer
  position: TCell[]
  piece?: TPiece
  move?: TSquare
  active?: boolean
  depth: number
  next?: TreeItem[]
  index?: number
  bestScore: number
  calculateFor: TPlayer
}

const COLOR = [
  'border-red-700',
  'border-orange-700',
  'border-yellow-700',
  'border-green-700',
  'border-blue-700',
  'border-purple-700',
  'border-pink-700',
  'border-teal-700',
  'border-brown-700'
]
export const Diagram: FC<DiagramProps> = ({
  turn,
  position,
  piece,
  move,
  active,
  depth,
  next,
  index = 0,
  bestScore,
  calculateFor
}) => {
  const { isOpen, onToggle } = useDisclosure(active)
  const tree =
    next
      ?.map((p) => ({
        ...p,
        evaluation: p.position ? evaluatePosition(p.position) : 0
      }))
      .sort((a, b) => b.evaluation - a.evaluation)
      .slice(0, 3) ??
    (depth || isOpen
      ? generatePositionsTree(turn, position, depth)
          .map((p) => ({
            ...p,
            evaluation: p.position ? evaluatePosition(p.position) : 0
          }))
          .sort((a, b) => b.evaluation - a.evaluation)
          .slice(0, 3)
      : [])

  const pointEval = evaluatePosition(position)
  const isLastStep = !tree.length
  const pointAsParentEval = isLastStep
    ? pointEval
    : turn === 'w'
    ? Math.max(...tree.map((b) => b.evaluation))
    : Math.min(...tree.map((b) => b.evaluation))

  const isBetterOrEqual =
    calculateFor === 'w'
      ? pointAsParentEval >= bestScore
      : pointAsParentEval <= bestScore
  const best =
    calculateFor === 'w'
      ? Math.max(pointAsParentEval, bestScore)
      : Math.min(pointAsParentEval, bestScore)

  return (
    <div className="flex flex-col items-center justify-start overflow-auto">
      <button
        className={`flex h-[48px] w-[48px] flex-col items-center justify-center rounded-full border-2 ${
          isOpen ? 'bg-red-100' : isBetterOrEqual ? 'bg-green-400' : ''
        } ${turn === 'b' ? 'text-white' : 'text-black'} p-2 font-black ${
          // *** turn is reversed because this step represent the previous move by the opposite player
          // i.e. turn toggles after each move, but we are still evaluating this position
          // so if white palyed, then position is for white's move, but turn in memory now is black
          COLOR[index % COLOR.length]
        }`}
        onClick={onToggle}
      >
        <p className="text-xs font-normal">
          {piece}
          {move}
        </p>
        <p className="text-xs">{pointEval}</p>
        <p className="text-xs">{pointAsParentEval}</p>
      </button>
      {isLastStep ? null : (
        <div className="m-auto h-[10px] w-[4px] bg-red-600" />
      )}
      <div className="flex flex-wrap items-start justify-center">
        {tree.map((branch) =>
          branch.position ? (
            <Diagram
              key={branch.move}
              turn={turn === 'w' ? 'b' : 'w'}
              position={branch.position}
              piece={branch.piece.piece}
              move={branch.move}
              depth={0}
              next={branch.next}
              index={index + 1}
              bestScore={best}
              calculateFor={calculateFor}
            />
          ) : null
        )}
      </div>
    </div>
  )
}
