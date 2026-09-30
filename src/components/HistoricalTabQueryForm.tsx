import { useState } from 'react';

export interface HistoricalQueryParams {
  startDate: string;
  endDate: string;
  team?: string;
  position?: string;
}

interface HistoricalTabQueryFormProps {
  onSubmit: (params: HistoricalQueryParams) => void;
  initialValues?: Partial<HistoricalQueryParams>;
}

const TEAMS = ['All Teams', 'PEN', 'GDS', 'GIO', 'PRO', 'PIN'];

export function HistoricalTabQueryForm({
  onSubmit,
  initialValues,
}: HistoricalTabQueryFormProps) {
  const [startDate, setStartDate] = useState(initialValues?.startDate || '');
  const [endDate, setEndDate] = useState(initialValues?.endDate || '');
  const [team, setTeam] = useState(initialValues?.team || 'All Teams');
  const [position, setPosition] = useState(initialValues?.position || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (startDate && endDate && startDate > endDate) {
      newErrors.dateRange = 'Start date must be before end date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const params: HistoricalQueryParams = {
      startDate,
      endDate,
      team: team !== 'All Teams' ? team : undefined,
      position: position.trim() || undefined,
    };

    onSubmit(params);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-6 mb-6"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-6">Query Historical Data</h3>

      <div className="space-y-4">
        {/* Date Range Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-semibold text-gray-600 mb-2"
            >
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startDate
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-semibold text-gray-600 mb-2"
            >
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endDate
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Date Range Error */}
        {errors.dateRange && (
          <p className="text-red-500 text-sm">{errors.dateRange}</p>
        )}

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Team Filter */}
          <div>
            <label
              htmlFor="team"
              className="block text-sm font-semibold text-gray-600 mb-2"
            >
              Team
            </label>
            <select
              id="team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TEAMS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Position Search */}
          <div>
            <label
              htmlFor="position"
              className="block text-sm font-semibold text-gray-600 mb-2"
            >
              Position Title (Optional)
            </label>
            <input
              id="position"
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g., Senior Engineer, Product Manager"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            🔍 Search
          </button>
          <button
            type="reset"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setTeam('All Teams');
              setPosition('');
              setErrors({});
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}
