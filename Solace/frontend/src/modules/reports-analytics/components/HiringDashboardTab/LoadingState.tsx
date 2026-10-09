import React from 'react'

const ACCORDION_SKELETON_COUNT = 3
const METRICS_SKELETON_COUNT = 4

export const AccordionSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: ACCORDION_SKELETON_COUNT }).map((_, i) => (
      <div
        key={i}
        className="bg-gray-200 dark:bg-gray-700 h-12 rounded animate-pulse"
      />
    ))}
  </div>
)

export const MetricsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: METRICS_SKELETON_COUNT }).map((_, i) => (
      <div
        key={i}
        className="bg-gray-200 dark:bg-gray-700 h-24 rounded animate-pulse"
      />
    ))}
  </div>
)

export const ChartSkeleton: React.FC = () => (
  <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded animate-pulse" />
)
