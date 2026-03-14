import { FC, useMemo, useState } from 'react'
import { TPiece, TSquare } from 'types/Chess'
import { TCell, TreeItem } from 'types/Chess'
import { TPlayer } from 'types/Chess'
import {
  evaluatePosition,
  generatePositionsTree
} from 'controller/chess/evaluation'

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
  const [isOpen, setIsOpen] = useState(Boolean(active))
  const tree = useMemo(() => {
    const source =
      next ??
      (depth > 0
        ? generatePositionsTree(turn, position, Math.min(2, depth))
        : [])
    const enriched = source
      .map((branch) => ({
        ...branch,
        evaluation: branch.position ? evaluatePosition(branch.position) : 0
      }))
      .sort((a, b) =>
        turn === 'w' ? b.evaluation - a.evaluation : a.evaluation - b.evaluation
      )
      .slice(0, 4)
    return enriched
  }, [depth, next, position, turn])

  const pointEval = useMemo(() => evaluatePosition(position), [position])
  const bestChildEval = tree.length
    ? turn === 'w'
      ? Math.max(...tree.map((b) => b.evaluation))
      : Math.min(...tree.map((b) => b.evaluation))
    : null
  const effectiveBest = bestChildEval ?? pointEval
  const isBetterOrEqual =
    calculateFor === 'w' ? effectiveBest >= bestScore : effectiveBest <= bestScore
  const best =
    calculateFor === 'w'
      ? Math.max(effectiveBest, bestScore)
      : Math.min(effectiveBest, bestScore)
  const moveLabel = piece && move ? `${piece}${move}` : 'root'

  return (
    <div className="w-full">
      <button
        className={`w-full rounded-md border px-2 py-2 text-left text-xs ${
          isBetterOrEqual
            ? 'border-green-600 bg-green-900/30 text-green-100'
            : 'border-[#5f5a50] bg-[#2f2d29] text-[#e7dfcf]'
        }`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold uppercase tracking-[0.08em]">{moveLabel}</span>
          <span>{isOpen ? 'Hide' : 'Show'}</span>
        </div>
        <div className="mt-1 grid grid-cols-3 gap-1 text-[10px]">
          <span className="rounded border border-[#645f56] bg-[#393631] px-1 py-[2px]">
            Eval: {pointEval}
          </span>
          <span className="rounded border border-[#645f56] bg-[#393631] px-1 py-[2px]">
            BestChild: {bestChildEval ?? '--'}
          </span>
          <span className="rounded border border-[#645f56] bg-[#393631] px-1 py-[2px]">
            Turn: {turn === 'w' ? 'White' : 'Black'}
          </span>
        </div>
      </button>
      <div className={`mt-2 space-y-2 ${isOpen ? 'block' : 'hidden'}`}>
        {tree.length ? (
          tree.map((branch) =>
            branch.position ? (
              <div key={`${branch.piece.square}-${branch.move}`} className="ml-3 border-l border-[#575148] pl-2">
                <Diagram
                  turn={turn === 'w' ? 'b' : 'w'}
                  position={branch.position}
                  piece={branch.piece.piece}
                  move={branch.move}
                  depth={Math.max(0, depth - 1)}
                  next={branch.next}
                  index={index + 1}
                  bestScore={best}
                  calculateFor={calculateFor}
                  active={false}
                />
              </div>
            ) : null
          )
        ) : (
          <p className="text-[11px] text-[#a89f8f]">Leaf node</p>
        )}
      </div>
    </div>
  )
}
