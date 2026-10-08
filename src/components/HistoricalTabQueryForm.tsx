import { useState, useMemo } from 'react';
import { parse, isValid, isBefore } from 'date-fns';
import { BUSINESS_UNITS } from '../constants/businessUnits';

export interface HistoricalQueryParams {
  startDate: string;
  endDate: string;
  businessUnit?: string;
  department?: string;
  position?: string;
}

interface HistoricalTabQueryFormProps {
  onSubmit: (params: HistoricalQueryParams) => void;
  initialValues?: Partial<HistoricalQueryParams>;
}

export function HistoricalTabQueryForm({
  onSubmit,
  initialValues,
}: HistoricalTabQueryFormProps) {
  const [startDate, setStartDate] = useState(initialValues?.startDate || '');
  const [endDate, setEndDate] = useState(initialValues?.endDate || '');
  const [businessUnit, setBusinessUnit] = useState(initialValues?.businessUnit || '');
  const [department, setDepartment] = useState(initialValues?.department || '');
  const [position, setPosition] = useState(initialValues?.position || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get available departments for selected BU
  const selectedBUData = BUSINESS_UNITS.find((bu) => bu.code === businessUnit);
  const availableDepts = useMemo(() => selectedBUData?.departments || [], [selectedBUData]);

  // Reset department when BU changes
  const handleBUChange = (newBU: string) => {
    setBusinessUnit(newBU);
    setDepartment('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (startDate && endDate) {
      const parsedStartDate = parse(startDate, 'yyyy-MM-dd', new Date());
      const parsedEndDate = parse(endDate, 'yyyy-MM-dd', new Date());

      if (!isValid(parsedStartDate)) {
        newErrors.startDate = 'Invalid start date format';
      } else if (!isValid(parsedEndDate)) {
        newErrors.endDate = 'Invalid end date format';
      } else if (isBefore(parsedEndDate, parsedStartDate)) {
        newErrors.dateRange = 'Start date must be before end date';
      }
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
      businessUnit: businessUnit || undefined,
      department: department || undefined,
      position: position.trim() || undefined,
    };

    onSubmit(params);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
      <label className="block text-sm font-semibold text-gray-600 uppercase mb-4 tracking-wide">
        Filters
      </label>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="startDate" className="block text-xs font-semibold text-gray-600 mb-2">
            START DATE
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-xs font-semibold text-gray-600 mb-2">
            END DATE
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.endDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
        </div>
      </div>

      {errors.dateRange && <p className="text-red-500 text-sm mb-4">{errors.dateRange}</p>}

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Business Unit */}
        <div>
          <label htmlFor="bu" className="block text-xs font-semibold text-gray-600 mb-2">
            BUSINESS UNIT
          </label>
          <select
            id="bu"
            value={businessUnit}
            onChange={(e) => handleBUChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All</option>
            {BUSINESS_UNITS.map((bu) => (
              <option key={bu.code} value={bu.code}>
                {bu.label}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label htmlFor="dept" className="block text-xs font-semibold text-gray-600 mb-2">
            DEPARTMENT
          </label>
          <select
            id="dept"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={availableDepts.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
          >
            <option value="">All</option>
            {availableDepts.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Position Title */}
        <div className="lg:col-span-2">
          <label htmlFor="position" className="block text-xs font-semibold text-gray-600 mb-2">
            POSITION TITLE (OPTIONAL)
          </label>
          <input
            id="position"
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g., Senior Engineer, Product Manager"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          className="px-4 py-3 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium min-h-[44px] sm:min-h-fit"
        >
          🔍 Search
        </button>
        <button
          type="reset"
          onClick={() => {
            setStartDate('');
            setEndDate('');
            setBusinessUnit('');
            setDepartment('');
            setPosition('');
            setErrors({});
          }}
          className="px-4 py-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium min-h-[44px] sm:min-h-fit"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
