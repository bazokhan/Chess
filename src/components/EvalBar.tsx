import { useState, useEffect, useRef, useMemo } from 'react'

type StockFishRes = {
  bestMove: string
  evaluation: string
}
const EvalBar = ({ fen }: { fen: string }) => {
  const [stockFishRes, setStokFishRes] = useState<StockFishRes>(
    {} as StockFishRes
  )

  const [loading, setLoading] = useState(false)

  const cache = useRef<Record<string, StockFishRes>>({})

  useEffect(() => {
    const id = fen.split(' ')[0]
    if (cache.current[id]) {
      if (JSON.stringify(stockFishRes) !== JSON.stringify(cache.current[id])) {
        setStokFishRes(cache.current[id])
      }
      return
    }
    setLoading(true)
    fetch('http://localhost:8080', {
      method: 'POST',
      body: JSON.stringify({ fen }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then((res) => res.json())
      .then((res) => {
        cache.current[id] = res
        setStokFishRes(res)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [stockFishRes, fen])

  const evaluation: number | undefined | null = useMemo(() => {
    const e = stockFishRes.evaluation
    if (e?.includes('mate')) return null
    return (
      (Number(e?.split?.(' ')?.[1] ?? '') / 100) *
      (fen.split(' ')?.[1] === 'b' ? -1 : 1)
    )
  }, [fen, stockFishRes.evaluation])

  const wHeight = useMemo(() => {
    if (evaluation === null) return 100
    if (!evaluation) return 50
    return 50 + evaluation
  }, [evaluation])

  const mate = useMemo(() => {
    const isMate = stockFishRes.evaluation?.includes('mate')
    return isMate ? stockFishRes.evaluation.replace('mate', 'M') : ''
  }, [stockFishRes.evaluation])

  return (
    <div
      key={100}
      className={`mr-1 h-full max-h-[80vh] w-7 ${
        loading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        style={{ height: `${100 - wHeight}%`, transition: 'all 350ms' }}
        className="w-full bg-black text-center transition duration-700 ease-in-out"
      />
      <div
        style={{ height: `${wHeight}%`, transition: 'all 350ms' }}
        className="w-full bg-gray-300 text-center transition duration-700 ease-in-out"
      >
        {mate ? (
          <span className="text-sm font-bold text-black">{mate}</span>
        ) : (
          <span className="text-sm font-bold text-black">
            {evaluation ? evaluation.toFixed(1) : ''}
          </span>
        )}
      </div>
    </div>
  )
}

export default EvalBar
