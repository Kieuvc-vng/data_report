import type { FC } from 'react'

export const AccordionSkeleton: FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-gray-200 h-12 rounded animate-pulse"
      />
    ))}
  </div>
)

export const MetricsSkeleton: FC = () => (
  <div className="grid grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-gray-200 h-24 rounded animate-pulse"
      />
    ))}
  </div>
)

export const ChartSkeleton: FC = () => (
  <div className="bg-gray-200 h-64 rounded animate-pulse" />
)
