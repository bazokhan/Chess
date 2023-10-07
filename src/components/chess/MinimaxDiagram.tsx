import { FC } from 'react'
import { TPiece, TSquare } from 'types/Chess'
import { TreeItem } from 'types/Chess'
import { TPlayer } from 'types/Chess'

type DiagramProps = {
  tree: TreeItem[]
  turn: TPlayer
  piece?: TPiece
  move?: TSquare
  index?: number
  evaluation: number
  best?: {
    move?: TSquare
    evaluation: number
  }
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
export const MinimaxDiagram: FC<DiagramProps> = ({
  tree,
  turn,
  piece,
  move,
  index = 0,
  evaluation,
  best
}) => {
  return (
    <div className="flex flex-col items-center justify-start overflow-auto rounded-md border border-gray-800">
      <button
        className={`flex h-[48px] w-[48px] flex-col items-center justify-center rounded-full border-2 ${
          index === 1 && best?.move === move ? 'bg-green-400' : ''
        } ${turn === 'b' ? 'text-white' : 'text-black'} p-2 font-black ${
          // *** turn is reversed because this step represent the previous move by the opposite player
          // i.e. turn toggles after each move, but we are still evaluating this position
          // so if white palyed, then position is for white's move, but turn in memory now is black
          COLOR[index % COLOR.length]
        }`}
      >
        <p className="text-xs font-normal">
          {piece}
          {move}
        </p>
        <p className="text-xs">
          {index === 1 && best?.move === move ? best?.evaluation : evaluation}
          {/* {evaluation} */}
        </p>
      </button>
      {!tree?.length ? null : (
        <div className="m-auto h-[10px] w-[4px] bg-red-600" />
      )}
      <div className="flex flex-wrap items-start justify-center">
        {tree
          ?.slice(0, 3)
          ?.map((branch) =>
            branch.position ? (
              <MinimaxDiagram
                key={branch.move}
                turn={turn === 'w' ? 'b' : 'w'}
                piece={branch.piece.piece}
                move={branch.move}
                index={index + 1}
                tree={branch.next ?? []}
                evaluation={branch.evaluation}
                best={best}
              />
            ) : null
          )}
      </div>
    </div>
  )
}
