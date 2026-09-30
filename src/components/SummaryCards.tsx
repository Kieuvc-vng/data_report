import { Card } from './Card';

interface SummaryCardsProps {
  totalHC: number;
  priority1Count: number;
  avgFillDays: number;
}

export function SummaryCards({ totalHC, priority1Count, avgFillDays }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 uppercase">Total HC</p>
          <p className="text-4xl font-bold text-gray-900">{totalHC}</p>
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 uppercase">Priority 1</p>
          <p className="text-4xl font-bold text-gray-900">{priority1Count}</p>
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 uppercase">Avg Fill Time</p>
          <p className="text-4xl font-bold text-gray-900">{avgFillDays} days</p>
        </div>
      </Card>
    </div>
  );
}
