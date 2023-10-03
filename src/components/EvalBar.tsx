import { useTurnContext } from 'context/TurnContext'
import { useState, useEffect, useRef, useMemo } from 'react'

type StockFishRes = {
  bestMove: string
  evaluation: string
}
const EvalBar = ({ fen }: { fen: string }) => {
  const { turn } = useTurnContext()
  const [stockFishRes, setStokFishRes] = useState<StockFishRes>(
    {} as StockFishRes
  )

  const cache = useRef<Record<string, StockFishRes>>({})

  useEffect(() => {
    const id = fen.split(' ')[0]
    if (cache.current[id]) {
      if (JSON.stringify(stockFishRes) !== JSON.stringify(cache.current[id])) {
        setStokFishRes(cache.current[id])
      }
      return
    }
    fetch('http://localhost:8080', {
      method: 'POST',
      body: JSON.stringify({ fen }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then((res) => res.json())
      .then((res) => {
        cache.current[id] = res
        setStokFishRes(res)
      })
  }, [stockFishRes, fen])

  const wHeight = useMemo(() => {
    const evaluation = stockFishRes.evaluation
    if (evaluation?.includes('mate')) return 100
    return (
      (50 + Number(evaluation?.split?.(' ')?.[1] ?? '') / 100) *
      (turn === 'w' ? 1 : -1)
    )
  }, [stockFishRes.evaluation, turn])

  const mate = useMemo(() => {
    const isMate = stockFishRes.evaluation?.includes('mate')
    return isMate ? stockFishRes.evaluation : ''
  }, [stockFishRes.evaluation])

  return (
    <div key={100} className="mr-1 h-full max-h-[80vh] w-7">
      <div
        style={{ height: `${100 - wHeight}%` }}
        className="w-full bg-black text-center transition duration-700 ease-in-out"
      >
        <span className="text-sm font-bold text-white">
          {mate.replace('mate', 'M')}
        </span>
      </div>
      <div
        style={{ height: `${wHeight}%` }}
        className="w-full bg-gray-300 text-center transition duration-700 ease-in-out"
      >
        <div style={{ flex: '1' }} />
        {mate ? null : (
          <span className="text-sm font-bold text-black">
            {(wHeight - 50).toFixed(1)}
          </span>
        )}
      </div>
    </div>
  )
}

export default EvalBar
