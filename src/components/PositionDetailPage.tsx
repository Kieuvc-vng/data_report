import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import type { Position } from '../types';
import { useHiringStore } from '../stores/hiringStore';
import { Badge } from './Badge';

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

        {/* Pipeline Section */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">PIPELINE</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-sm font-medium text-gray-700 mb-4">📊 [Funnel Chart]</p>

            <div className="space-y-4">
              {/* CV to 1st */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">CV → 1st Interview</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {position.pipeline.cv} → {position.pipeline.firstInterview} (
                    {Math.round(
                      ((position.pipeline.cv - position.pipeline.firstInterview) /
                        position.pipeline.cv) *
                        100
                    )}
                    % drop)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(position.pipeline.firstInterview / position.pipeline.cv) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* 1st to 2nd */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">1st → 2nd Interview</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {position.pipeline.firstInterview} → {position.pipeline.secondInterview} (
                    {Math.round(
                      ((position.pipeline.firstInterview - position.pipeline.secondInterview) /
                        position.pipeline.firstInterview) *
                        100
                    )}
                    % drop)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(position.pipeline.secondInterview / position.pipeline.firstInterview) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* 2nd to Offer */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">2nd → Offer</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {position.pipeline.secondInterview} → {position.pipeline.offers} (
                    {Math.round(
                      ((position.pipeline.secondInterview - position.pipeline.offers) /
                        position.pipeline.secondInterview) *
                        100
                    )}
                    % drop)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${(position.pipeline.offers / position.pipeline.secondInterview) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reject Reasons */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">REJECT REASONS</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-4">📊 [Horizontal Bar Chart]</p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">Not fit skills</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {rejectReasonPercentages.notFitSkills}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${rejectReasonPercentages.notFitSkills}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">Low experience</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {rejectReasonPercentages.lowExp}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${rejectReasonPercentages.lowExp}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">Salary mismatch</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {rejectReasonPercentages.salaryMismatch}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${rejectReasonPercentages.salaryMismatch}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Insights */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">CANDIDATE INSIGHTS</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium">Top industries:</span> Tech, Finance, Consulting
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Top companies:</span> Google, Meta, Microsoft, Apple,
              Amazon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
