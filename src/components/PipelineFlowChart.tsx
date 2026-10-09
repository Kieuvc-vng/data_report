import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { HiringSummary } from '../types';

interface FlowStage {
  name: string;
  count: number;
  rejected: number;
  withdrawn: number;
  other: number;
}

interface RejectionDetail {
  [key: string]: number;
}

interface PipelineFlowChartProps {
  summary: HiringSummary;
}

export const PipelineFlowChart = React.memo(function PipelineFlowChart({
  summary,
}: PipelineFlowChartProps) {
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chartRef.current && !chartRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const flowData = useMemo(() => {
    // Calculate rejection counts by stage from byStage data
    const cvRejected = (summary.rejectReasons.byStage?.cv?.skillsMismatch || 0) +
                       (summary.rejectReasons.byStage?.cv?.insufficientExp || 0) +
                       (summary.rejectReasons.byStage?.cv?.overqualified || 0);
    const cvWithdrawn = summary.rejectReasons.byStage?.cv?.language || 0;
    const cvOther = summary.rejectReasons.byStage?.cv?.other || 0;

    const firstRejected = (summary.rejectReasons.byStage?.firstInterview?.skillsMismatch || 0) +
                          (summary.rejectReasons.byStage?.firstInterview?.compensationMismatch || 0);
    const firstWithdrawn = summary.rejectReasons.byStage?.firstInterview?.location || 0;
    const firstOther = summary.rejectReasons.byStage?.firstInterview?.other || 0;

    const secondRejected = (summary.rejectReasons.byStage?.secondInterview?.compensationMismatch || 0) +
                           (summary.rejectReasons.byStage?.secondInterview?.background || 0);
    const secondWithdrawn = summary.rejectReasons.byStage?.secondInterview?.positionClosed || 0;
    const secondOther = summary.rejectReasons.byStage?.secondInterview?.notProgressedInTime || 0;

    const offerRejected = summary.offersCount - summary.onboardedCount;

    const stages: FlowStage[] = [
      {
        name: 'CV Sent',
        count: summary.pipeline.cv,
        rejected: cvRejected,
        withdrawn: cvWithdrawn,
        other: cvOther,
      },
      {
        name: '1st Interview',
        count: summary.pipeline.firstInterview,
        rejected: firstRejected,
        withdrawn: firstWithdrawn,
        other: firstOther,
      },
      {
        name: '2nd Interview',
        count: summary.pipeline.secondInterview,
        rejected: secondRejected,
        withdrawn: secondWithdrawn,
        other: secondOther,
      },
      {
        name: 'Offer',
        count: summary.offersCount,
        rejected: 0,
        withdrawn: 0,
        other: 0,
      },
      {
        name: 'Offer Accepted',
        count: summary.onboardedCount,
        rejected: offerRejected,
        withdrawn: 0,
        other: 0,
      },
    ];

    return stages;
  }, [summary]);

  const maxCount = Math.max(...flowData.map(s => s.count));
  const scale = maxCount > 0 ? 200 / maxCount : 0; // Prevent division by zero

  return (
    <div ref={chartRef} className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Pipeline Progression & Rejection Analysis
      </h3>

      <div className="space-y-0">
        {flowData.map((stage, index) => {
          const nextCount = index < flowData.length - 1 ? flowData[index + 1].count : 0;
          const dropCount = stage.count - nextCount;

          const stageKey = index === 0 ? 'cv' : index === 1 ? 'firstInterview' : index === 2 ? 'secondInterview' : index === 3 ? 'offer' : null;
          const stageRejectionDetails = stageKey ? summary.rejectReasons.byStage?.[stageKey as keyof typeof summary.rejectReasons.byStage] : null;

          // Calculate conversion rate
          const prevStageCount = index === 0 ? summary.pipeline.cv : index === 1 ? summary.pipeline.firstInterview : index === 2 ? summary.pipeline.secondInterview : index === 3 ? summary.offersCount : 0;
          const conversionRate = prevStageCount > 0 ? Math.round((stage.count / prevStageCount) * 100) : 0;
          const baselineRate = summary.pipeline.cv > 0 ? (index === 0 ? 100 : Math.round((stage.count / summary.pipeline.cv) * 100)) : 0;

          // Scale bar based on percentage of baseline (0-100% → 0-200px)
          const width = baselineRate > 0 ? (baselineRate / 100) * 200 : 0;

          return (
            <div key={stage.name}>
              {/* Stage row with metrics */}
              <div className="flex items-center gap-4 py-3">
                {/* Stage name & count */}
                <div className="w-32">
                  <div className="font-semibold text-gray-900">{stage.name}</div>
                  <div className="text-sm text-gray-600">{stage.count}</div>
                </div>

                {/* Bar visualization */}
                <div className="flex-1">
                  {width > 0 && (
                    <div
                      className="bg-blue-500 rounded px-3 py-2 text-white text-sm font-semibold"
                      style={{ width: `${width}px` }}
                    >
                      {stage.count}
                    </div>
                  )}
                </div>

                {/* Metrics on the right */}
                <div className="w-48 text-right">
                  <div className="font-semibold text-gray-900">
                    {baselineRate}% of baseline
                  </div>
                  <div className="text-sm text-gray-600">
                    {conversionRate}% from prev
                  </div>
                  {index === flowData.length - 1 && (
                    <div className="text-sm font-medium text-blue-600 mt-1">
                      ({summary.onboardedCount}/{summary.offersCount} accepted)
                    </div>
                  )}
                </div>
              </div>

              {/* Drop indicator between stages (BETWEEN rows) */}
              {dropCount > 0 && index < flowData.length - 1 && (
                <div className="text-sm text-gray-500 py-1 ml-36 flex items-center gap-2 relative">
                  <span className="font-medium">↓ {dropCount} drop</span>
                  <button
                    onClick={() => setActivePopover(activePopover === `drop-${index}` ? null : `drop-${index}`)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="View rejection details"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {/* Popover */}
                  {activePopover === `drop-${index}` && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 min-w-72">
                      <div className="font-semibold text-gray-900 mb-3">
                        {index === flowData.length - 2 ? 'Offer Status' : 'Rejection Breakdown'} ({dropCount})
                      </div>
                      <div className="space-y-2 text-sm">
                        {index === flowData.length - 2 ? (
                          stageRejectionDetails ? (
                            <>
                              {(stageRejectionDetails.candidateDeclined || 0) > 0 && (
                                <div>
                                  <div className="flex justify-between text-gray-700 font-semibold">
                                    <span>Candidate Declined:</span>
                                    <span>{stageRejectionDetails.candidateDeclined}</span>
                                  </div>
                                  <div className="ml-4 space-y-1 text-gray-600">
                                    {(stageRejectionDetails.compSalary || 0) > 0 && (
                                      <div className="flex justify-between">
                                        <span>Compensation & Salary:</span>
                                        <span className="font-semibold">{stageRejectionDetails.compSalary}</span>
                                      </div>
                                    )}
                                    {(stageRejectionDetails.cultureFit || 0) > 0 && (
                                      <div className="flex justify-between">
                                        <span>Culture Fit:</span>
                                        <span className="font-semibold">{stageRejectionDetails.cultureFit}</span>
                                      </div>
                                    )}
                                    {(stageRejectionDetails.careerPath || 0) > 0 && (
                                      <div className="flex justify-between">
                                        <span>Career Path:</span>
                                        <span className="font-semibold">{stageRejectionDetails.careerPath}</span>
                                      </div>
                                    )}
                                    {(stageRejectionDetails.personalReason || 0) > 0 && (
                                      <div className="flex justify-between">
                                        <span>Personal Reason:</span>
                                        <span className="font-semibold">{stageRejectionDetails.personalReason}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {(stageRejectionDetails.companyWithdrew || 0) > 0 && (
                                <div className="flex justify-between text-gray-700 font-semibold">
                                  <span>Company Withdrew:</span>
                                  <span>{stageRejectionDetails.companyWithdrew}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between text-gray-700">
                                <span>Offer Accepted:</span>
                                <span className="font-semibold">{nextCount}</span>
                              </div>
                              <div className="flex justify-between text-gray-700">
                                <span>Not Accepted:</span>
                                <span className="font-semibold">{dropCount}</span>
                              </div>
                            </>
                          )
                        ) : stageRejectionDetails ? (
                          Object.entries(stageRejectionDetails)
                            .filter(([_, value]) => value > 0) // Only show reasons with data
                            .map(([key, value]) => {
                              const labels: Record<string, string> = {
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
                              return (
                                <div key={key} className="flex justify-between text-gray-700">
                                  <span>{labels[key] || key}:</span>
                                  <span className="font-semibold">{value}</span>
                                </div>
                              );
                            })
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
});
