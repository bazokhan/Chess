import { getDisplayCoordinate } from 'controller/chess/coordinates'
import { AnnotationColor } from 'controller/chess/boardPreferences'
import { FC } from 'react'
import { TCoordinate, TPlayer } from 'types/Chess'

type AnnotationArrow = {
  from: TCoordinate
  to: TCoordinate
  color: AnnotationColor
}

type AnnotationCircle = {
  at: TCoordinate
  color: AnnotationColor
}

const colorMap: Record<AnnotationColor, string> = {
  green: '#7ac74f',
  red: '#ef4444',
  blue: '#60a5fa',
  yellow: '#facc15'
}

type Props = {
  arrows: AnnotationArrow[]
  circles: AnnotationCircle[]
  preview:
    | {
        from: TCoordinate
        to: TCoordinate
        color: AnnotationColor
      }
    | null
  orientation: TPlayer
}

const toCenterPercent = (coordinate: TCoordinate, orientation: TPlayer) => {
  const c = getDisplayCoordinate(coordinate, orientation)
  return {
    x: c.x * 12.5 + 6.25,
    y: c.y * 12.5 + 6.25
  }
}

export const BoardAnnotations: FC<Props> = ({
  arrows,
  circles,
  preview,
  orientation
}) => (
  <svg
    className="pointer-events-none absolute inset-0 z-40 h-full w-full"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <defs>
      {(Object.keys(colorMap) as AnnotationColor[]).map((key) => (
        <marker
          key={`marker-${key}`}
          id={`arrowhead-${key}`}
          markerWidth="4"
          markerHeight="4"
          refX="2.8"
          refY="2"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,4 L4,2 z" fill={colorMap[key]} />
        </marker>
      ))}
    </defs>

    {arrows.map((arrow, index) => {
      const from = toCenterPercent(arrow.from, orientation)
      const to = toCenterPercent(arrow.to, orientation)
      return (
        <line
          key={`arrow-${index}-${arrow.from.x}-${arrow.from.y}-${arrow.to.x}-${arrow.to.y}`}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={colorMap[arrow.color]}
          strokeWidth="1.8"
          strokeLinecap="round"
          markerEnd={`url(#arrowhead-${arrow.color})`}
          opacity="0.9"
        />
      )
    })}

    {preview ? (
      (() => {
        const from = toCenterPercent(preview.from, orientation)
        const to = toCenterPercent(preview.to, orientation)
        return (
          <line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={colorMap[preview.color]}
            strokeWidth="1.6"
            strokeDasharray="2 1"
            strokeLinecap="round"
            markerEnd={`url(#arrowhead-${preview.color})`}
            opacity="0.75"
          />
        )
      })()
    ) : null}

    {circles.map((circle, index) => {
      const center = toCenterPercent(circle.at, orientation)
      return (
        <circle
          key={`circle-${index}-${circle.at.x}-${circle.at.y}`}
          cx={center.x}
          cy={center.y}
          r="4.4"
          fill="transparent"
          stroke={colorMap[circle.color]}
          strokeWidth="1.2"
          opacity="0.95"
        />
      )
    })}
  </svg>
)

