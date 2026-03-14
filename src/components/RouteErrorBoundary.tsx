import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export const RouteErrorBoundary = () => {
  const error = useRouteError()

  const details = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unexpected route error.'

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="relative">
        {Array.from({ length: 14 }).map((_, index) => (
          <span
            key={index}
            className="absolute h-2 w-2 animate-ping rounded-full bg-[#d8c098]"
            style={{
              left: `${Math.cos((index / 14) * Math.PI * 2) * 70 + 70}px`,
              top: `${Math.sin((index / 14) * Math.PI * 2) * 70 + 70}px`,
              animationDelay: `${index * 90}ms`
            }}
          />
        ))}
        <div className="relative z-10 flex h-36 w-36 items-center justify-center rounded-full border border-[#7c735f] bg-[#2f2d29] shadow-2xl">
          <span className="animate-bounce text-7xl" role="img" aria-label="funny pawn">
            ♟
          </span>
        </div>
      </div>

      <div className="max-w-[720px] space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#7b715d] bg-[#3a372f] px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#eadfc9]">
          <Sparkles className="h-4 w-4" />
          Unexpected Application Error
        </div>
        <p className="text-xl font-black text-white">The pawn tripped on a tactic.</p>
        <p className="rounded-lg border border-[#5e584c] bg-[#312f2a] p-3 text-sm text-[#d5cebf]">
          {details}
        </p>
        <p className="text-xs text-[#b6ad9b]">
          Refresh the page or navigate back. If this persists, the engine logs can
          help isolate the failing step.
        </p>
      </div>
    </div>
  )
}

