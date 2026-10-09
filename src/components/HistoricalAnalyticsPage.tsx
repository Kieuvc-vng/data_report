import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  Cell,
} from 'recharts';
import type { HiringSummary } from '../types';
import { exportToCSV, exportToPDF, generateFilename } from '../utils';
import { filterSummaryByTeamsAndLevels } from '../utils/dataTransformUtils';
import { mockPositions } from '../data/mockData';
import { Header } from './Header';
import { RejectionPopover } from './RejectionPopover';
import { PipelineFlowChart } from './PipelineFlowChart';
import { DonutChart } from './DonutChart';
import { BUSINESS_UNITS } from '../constants/businessUnits';

interface HistoricalAnalyticsPageProps {
  summary: HiringSummary;
  query: {
    startDate: string;
    endDate: string;
    businessUnit?: string;
    department?: string;
    position?: string;
  } | null;
  onBack: () => void;
  tabs?: Array<{ id: string; label: string }>;
  activeTab?: string;
}

// Chart dimensions
const CHART_HEIGHT = 300;

// Color palette for charts
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const getPipelineData = (summary: HiringSummary): Array<{ name: string; value: number }> => {
  return [
    { name: 'CV Received', value: summary.pipeline.cv },
    { name: '1st Interview', value: summary.pipeline.firstInterview },
    { name: '2nd Interview', value: summary.pipeline.secondInterview },
    { name: 'Offer', value: summary.pipeline.offers },
  ];
};

const getRejectReasonsData = (summary: HiringSummary): Array<{ name: string; value: number }> => {
  const reasonLabels: Record<string, string> = {
    skillsMismatch: 'Skills Mismatch',
    insufficientExp: 'Insufficient Experience',
    overqualified: 'Overqualified',
    compensationMismatch: 'Compensation Mismatch',
    location: 'Location',
    language: 'Language',
    background: 'Background',
    positionClosed: 'Position Closed',
    notProgressedInTime: 'Not Progressed In Time',
    other: 'Other',
  };

  return Object.entries(summary.rejectReasons.allReasons || {}).map(([key, value]) => ({
    name: reasonLabels[key] || key,
    value,
  }));
};


export const HistoricalAnalyticsPage = React.memo(function HistoricalAnalyticsPage({
  summary,
  query,
  onBack,
  tabs,
  activeTab,
}: HistoricalAnalyticsPageProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showRejectionPopover, setShowRejectionPopover] = useState(false);
  const [selectedBU, setSelectedBU] = useState(query?.businessUnit || '');
  const [selectedDept, setSelectedDept] = useState(query?.department || '');
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(
    new Set(['PEN', 'GDS', 'GIO', 'PRO', 'PIN'])
  );
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(
    new Set(['1.1', '1.2', '1.3', '2.1', '2.2', '2.3'])
  );
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(
    new Set(['P1', 'P2', 'P3'])
  );

  // Get available departments for selected BU
  const selectedBUData = BUSINESS_UNITS.find((bu) => bu.code === selectedBU);
  const availableDepts = useMemo(() => selectedBUData?.departments || [], [selectedBUData]);

  // Reset department when BU changes
  const handleBUChange = (newBU: string) => {
    setSelectedBU(newBU);
    setSelectedDept('');
  };

  // Filter positions by BU and Department
  const buDeptFilteredPositions = useMemo(() => {
    return mockPositions.filter(pos => {
      const buMatch = !selectedBU || pos.businessUnit === selectedBU;
      const deptMatch = !selectedDept || pos.department === selectedDept;
      return buMatch && deptMatch;
    });
  }, [selectedBU, selectedDept]);

  // Filter summary based on BU/Dept and selected teams and levels
  const filteredSummary = useMemo(() => {
    return filterSummaryByTeamsAndLevels(buDeptFilteredPositions, selectedTeams, selectedLevels, summary);
  }, [buDeptFilteredPositions, selectedTeams, selectedLevels, summary]);

  const pipelineData = useMemo(() => getPipelineData(filteredSummary), [filteredSummary]);
  const rejectReasonsData = useMemo(() => getRejectReasonsData(filteredSummary), [filteredSummary]);

  const dateRangeStr = `${formatDate(summary.dateRange.start)} - ${formatDate(
    summary.dateRange.end
  )}`;

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      const filename = generateFilename('hiring-summary', 'csv');
      exportToCSV(summary, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      const filename = generateFilename('hiring-summary', 'pdf');
      exportToPDF(summary, filename);
      setIsExporting(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Analytics Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Back button and title row */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Query
            </button>
          </div>

          {/* Title section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Hiring Analytics</h1>
            <p className="text-gray-600 mt-2">
              {dateRangeStr}
              {selectedBU && <span> • Business Unit: {BUSINESS_UNITS.find(bu => bu.code === selectedBU)?.label}</span>}
              {selectedDept && <span> • Department: {selectedDept}</span>}
            </p>
          </div>

          {/* BU & Department Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4">
            {/* Business Unit Filter */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-2">BUSINESS UNIT</label>
              <select
                value={selectedBU}
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

            {/* Department Filter */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-2">DEPARTMENT</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
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
          </div>

        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Filters - TODO: Update to use new FilterBar interface */}
          {/*
          <FilterBar
            selectedTeams={selectedTeams}
            selectedLevels={selectedLevels}
            selectedPriorities={selectedPriorities}
            onTeamsChange={setSelectedTeams}
            onLevelsChange={setSelectedLevels}
            onPrioritiesChange={setSelectedPriorities}
          />
          */}

          {/* Summary Metrics - 5 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-semibold text-blue-600">Total Hired</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {filteredSummary.totalHired}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-sm font-semibold text-green-600">CVs Received</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {filteredSummary.pipeline.cv}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
              <p className="text-sm font-semibold text-amber-600">Offer Salary</p>
              <p className="text-lg font-bold text-amber-900 mt-2">
                {filteredSummary.totalHired > 0 ? filteredSummary.salaryRange : 'N/A'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
              <p className="text-sm font-semibold text-cyan-600">Time to Fill</p>
              <p className="text-3xl font-bold text-cyan-900 mt-2">
                {filteredSummary.totalHired > 0 ? filteredSummary.timeToFill : 'N/A'}
              </p>
              {filteredSummary.totalHired > 0 && <p className="text-sm text-cyan-700 mt-1">days</p>}
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-4 border border-rose-200">
              <p className="text-sm font-semibold text-rose-600">Offer Acceptance</p>
              <p className="text-3xl font-bold text-rose-900 mt-2">
                {filteredSummary.offersCount > 0 ? `${filteredSummary.offerAcceptanceRate}%` : 'N/A'}
              </p>
              {filteredSummary.offersCount > 0 && <p className="text-sm text-rose-700 mt-1">({filteredSummary.onboardedCount}/{filteredSummary.offersCount} offers)</p>}
            </div>
          </div>

          {/* Pipeline Flow Chart */}
          <PipelineFlowChart summary={filteredSummary} />

          {/* Candidate Insights */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">CANDIDATE INSIGHTS</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Industry */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Industry</h3>
                <p className="text-xs text-gray-500 mb-4">Hired candidates · all time</p>

                <div className="space-y-3">
                  {filteredSummary.topIndustries && filteredSummary.topIndustries.length > 0 ? (
                    filteredSummary.topIndustries.map((industry, idx) => {
                      const total = filteredSummary.topIndustries?.reduce((sum, ind) => sum + ind.count, 0) || 1;
                      const percentage = Math.round((industry.count / total) * 100);
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 mb-1">{industry.name}</p>
                            <div className="flex items-center gap-2 h-5">
                              <div className="flex-1 bg-gray-200 rounded h-2 overflow-hidden">
                                <div
                                  className="bg-orange-400 h-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 w-16">
                            <p className="text-sm font-semibold text-gray-900">{industry.count}</p>
                            <p className="text-xs text-gray-500">{percentage}%</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-600">No industry data available</p>
                  )}
                </div>
              </div>

              {/* Company */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Company</h3>
                <p className="text-xs text-gray-500 mb-4">Hired candidates · all time</p>

                <div className="space-y-3">
                  {filteredSummary.topCompanies && filteredSummary.topCompanies.length > 0 ? (
                    filteredSummary.topCompanies.map((company, idx) => {
                      const total = filteredSummary.topCompanies?.reduce((sum, comp) => sum + comp.count, 0) || 1;
                      const percentage = Math.round((company.count / total) * 100);
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 mb-1">{company.name}</p>
                            <div className="flex items-center gap-2 h-5">
                              <div className="flex-1 bg-gray-200 rounded h-2 overflow-hidden">
                                <div
                                  className="bg-blue-400 h-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 w-16">
                            <p className="text-sm font-semibold text-gray-900">{company.count}</p>
                            <p className="text-xs text-gray-500">{percentage}%</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-600">No company data available</p>
                  )}
                </div>
              </div>

              {/* Education Background */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Education Background</h3>
                  <p className="text-xs text-gray-500 mb-6">Hired candidates · all time</p>
                  {filteredSummary.topEducationBackground && filteredSummary.topEducationBackground.length > 0 ? (
                    <DonutChart
                      data={filteredSummary.topEducationBackground}
                      colors={['#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']}
                    />
                  ) : (
                    <p className="text-sm text-gray-600">No education data available</p>
                  )}
                </div>
              </div>

              {/* Source */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Source</h3>
                  <p className="text-xs text-gray-500 mb-6">Hired candidates · all time</p>
                  {filteredSummary.topSource && filteredSummary.topSource.length > 0 ? (
                    <DonutChart
                      data={filteredSummary.topSource}
                      colors={['#4ade80', '#86efac', '#bbf7d0', '#dcfce7']}
                    />
                  ) : (
                    <p className="text-sm text-gray-600">No source data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 py-4">
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? '⏳' : '📊'} Export CSV
            </button>
          </div>
        </div>
      </main>

      <RejectionPopover
        isOpen={showRejectionPopover}
        onClose={() => setShowRejectionPopover(false)}
        rejectReasons={filteredSummary.rejectReasons}
      />
    </div>
  );
});
