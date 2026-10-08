import type { Position } from '../types';

export function useSummaryMetrics(positions: Position[], team?: string) {
  const filtered = !team || team === 'All Teams'
    ? positions
    : positions.filter((p) => p.department === team);

  const totalHC = filtered.reduce((sum, p) => sum + p.hc, 0);
  const priority1Count = filtered.filter((p) => p.priority === 'P1').length;
  const avgFillDays = filtered.length > 0
    ? Math.round(filtered.reduce((sum, p) => sum + p.estimatedFillDays, 0) / filtered.length)
    : 0;

  return { totalHC, priority1Count, avgFillDays };
}


