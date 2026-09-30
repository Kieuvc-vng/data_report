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

interface HistoricalAnalyticsPageProps {
  summary: HiringSummary;
  query: {
    startDate: string;
    endDate: string;
    team?: string;
    position?: string;
  } | null;
  onBack: () => void;
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
    notFitSkills: 'Not Fit Skills',
    lowExp: 'Low Experience',
    salaryMismatch: 'Salary Mismatch',
    other: 'Other',
  };

  return Object.entries(summary.rejectReasons).map(([key, value]) => ({
    name: reasonLabels[key] || key,
    value,
  }));
};

const getLevelDistributionData = (summary: HiringSummary): Array<{ name: string; value: number }> => {
  return Object.entries(summary.levelDistribution)
    .sort(([a], [b]) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      return aNum - bNum;
    })
    .map(([level, count]) => ({
      name: level,
      value: count,
    }));
};

const getByTeamData = (summary: HiringSummary): Array<{ name: string; value: number }> => {
  return Object.entries(summary.byTeam)
    .sort((a, b) => b[1] - a[1])
    .map(([team, count]) => ({
      name: team,
      value: count,
    }));
};

export const HistoricalAnalyticsPage = React.memo(function HistoricalAnalyticsPage({
  summary,
  query,
  onBack,
}: HistoricalAnalyticsPageProps) {
  const [isExporting, setIsExporting] = useState(false);
  const pipelineData = useMemo(() => getPipelineData(summary), [summary]);
  const rejectReasonsData = useMemo(() => getRejectReasonsData(summary), [summary]);
  const levelDistributionData = useMemo(() => getLevelDistributionData(summary), [summary]);
  const byTeamData = useMemo(() => getByTeamData(summary), [summary]);

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
    <main className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
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
            <h1 className="text-2xl font-bold text-gray-900">Hiring Analytics</h1>
            <div className="w-32" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {dateRangeStr}
            {query?.team && <span> • Team: {query.team}</span>}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-semibold text-blue-600">Total Hired</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {summary.totalHired}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-sm font-semibold text-purple-600">HC Total</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {summary.hcTotal}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-sm font-semibold text-green-600">CVs Received</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {summary.pipeline.cv}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
              <p className="text-sm font-semibold text-amber-600">Salary Range</p>
              <p className="text-lg font-bold text-amber-900 mt-2">
                {summary.salaryRange}
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Pipeline Funnel Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pipeline Progression
              </h3>
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <FunnelChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Funnel
                    dataKey="value"
                    data={pipelineData}
                    fill={COLORS.primary}
                    isAnimationActive
                  >
                    {pipelineData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-gray-600 space-y-1">
                {pipelineData.map((stage, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{stage.name}</span>
                    <span className="font-semibold">{stage.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Reject Reasons Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rejection Reasons
              </h3>
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={rejectReasonsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill={COLORS.danger}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 3. Level Distribution Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Level Distribution
              </h3>
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={levelDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill={COLORS.info}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 4. By-Team Summary Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Hires by Team
              </h3>
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={byTeamData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill={COLORS.success}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insight */}
          {summary.aiInsight && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 9a1 1 0 100-2 1 1 0 000 2zm5 0a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-900">AI Insight</h4>
                  <p className="text-indigo-700 mt-1">{summary.aiInsight}</p>
                </div>
              </div>
            </div>
          )}

          {/* Export buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 py-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Back to Query
            </button>
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? '⏳' : '📊'} Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? '⏳' : '📄'} Export PDF
            </button>
          </div>
        </div>
      </div>
    </main>
  );
});
