import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import type { Position } from '../types';
import { useHiringStore } from '../stores/hiringStore';
import { Badge } from './Badge';
import { PositionPipelineVisualization } from './PositionPipelineVisualization';
import { DonutChart } from './DonutChart';

export function PositionDetailPage() {
  const { jobCode } = useParams<{ jobCode: string }>();
  const navigate = useNavigate();
  const hiringStore = useHiringStore();
  const positions = hiringStore.positions;

  const position = useMemo(
    () => positions.find((p) => p.jobCode === jobCode),
    [positions, jobCode]
  );

  if (!position) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Position not found</p>
          <button
            onClick={() => navigate('/current-openings')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Positions
          </button>
        </div>
      </div>
    );
  }

  // Calculate rejection percentages
  const totalRejections =
    (position.rejectReasons.byStage?.cv
      ? Object.values(position.rejectReasons.byStage.cv).reduce((a, b) => a + b, 0)
      : 0) +
    (position.rejectReasons.byStage?.firstInterview
      ? Object.values(position.rejectReasons.byStage.firstInterview).reduce((a, b) => a + b, 0)
      : 0) +
    (position.rejectReasons.byStage?.secondInterview
      ? Object.values(position.rejectReasons.byStage.secondInterview).reduce((a, b) => a + b, 0)
      : 0) +
    position.rejectReasons.candidateWithdrawn;

  const rejectReasonPercentages = totalRejections > 0
    ? {
        notFitSkills:
          Math.round(
            (((position.rejectReasons.byStage?.cv?.skillsMismatch || 0) +
              (position.rejectReasons.byStage?.firstInterview?.skillsMismatch || 0)) /
              totalRejections) *
              100
          ) || 0,
        lowExp:
          Math.round(
            (((position.rejectReasons.byStage?.cv?.insufficientExp || 0) +
              (position.rejectReasons.byStage?.firstInterview?.['compensationMismatch'] || 0)) /
              totalRejections) *
              100
          ) || 0,
        salaryMismatch:
          Math.round(
            (((position.rejectReasons.byStage?.firstInterview?.compensationMismatch || 0) +
              (position.rejectReasons.byStage?.cv?.['other'] || 0)) /
              totalRejections) *
              100
          ) || 0,
      }
    : { notFitSkills: 0, lowExp: 0, salaryMismatch: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
          >
            ← Back
          </button>

          <div className="bg-blue-100 rounded-lg p-6 mb-6">
            {/* Top Row: Job Code and Position Title */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{position.title}</h1>
              </div>
              <p className="text-sm bg-blue-600 text-white px-3 py-1 rounded font-mono font-semibold">
                {position.jobCode}
              </p>
            </div>

            {/* Info Row: Level, HC, Priority, Line Manager */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-medium">Level</p>
                <p className="text-gray-900 font-semibold">{position.level}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">HC</p>
                <p className="text-gray-900 font-semibold">{position.hc}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Priority</p>
                <Badge
                  variant={
                    position.priority === 'P1' ? 'p1' : position.priority === 'P2' ? 'p2' : 'p3'
                  }
                >
                  {position.priority}
                </Badge>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Manager</p>
                <p className="text-gray-900 font-semibold">
                  {position.lineManager?.name || '-'}
                </p>
                {position.lineManager && (
                  <p className="text-gray-500 text-xs">{position.lineManager.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics - 1 Row */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">KEY METRICS</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Expected Salary */}
            <div>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-2">Expected Salary</p>
              <p className="text-lg font-semibold text-gray-900">{position.salary}</p>
            </div>

            {/* Days Job Open */}
            <div>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-2">Days Open</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.floor(
                  (new Date().getTime() - new Date(position.createdDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </p>
            </div>

            {/* Estimated Fill Days */}
            <div>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-2">Estimated Fill Days</p>
              <p className="text-lg font-semibold text-gray-900">{position.estimatedFillDays} days</p>
            </div>

            {/* Total Pipeline */}
            <div>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-2">Pipeline Total</p>
              <p className="text-lg font-semibold text-gray-900">{position.pipeline.cv} CVs</p>
            </div>
          </div>
        </div>

        {/* Pipeline Visualization with Tabs */}
        <div className="mb-6">
          <PositionPipelineVisualization position={position} />
        </div>

{/* Candidate Insights */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">CANDIDATE INSIGHTS</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Industries */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Industry</h3>
              <p className="text-xs text-gray-500 mb-4">Active pipeline · all time</p>

              <div className="space-y-3">
                {position.topIndustries && position.topIndustries.length > 0 ? (
                  position.topIndustries.map((industry, idx) => {
                    const total = position.topIndustries?.reduce((sum, ind) => sum + ind.count, 0) || 1;
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

            {/* Top Companies */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Company</h3>
              <p className="text-xs text-gray-500 mb-4">Active pipeline · all time</p>

              <div className="space-y-3">
                {position.topCompanies && position.topCompanies.length > 0 ? (
                  position.topCompanies.map((company, idx) => {
                    const total = position.topCompanies?.reduce((sum, comp) => sum + comp.count, 0) || 1;
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
                <p className="text-xs text-gray-500 mb-6">Active pipeline · all time</p>
                {position.topEducationBackground && position.topEducationBackground.length > 0 ? (
                  <DonutChart
                    data={position.topEducationBackground}
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
                <p className="text-xs text-gray-500 mb-6">Active pipeline · all time</p>
                {position.topSource && position.topSource.length > 0 ? (
                  <DonutChart
                    data={position.topSource}
                    colors={['#4ade80', '#86efac', '#bbf7d0', '#dcfce7']}
                  />
                ) : (
                  <p className="text-sm text-gray-600">No source data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
