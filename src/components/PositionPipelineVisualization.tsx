import React, { useState, useMemo } from 'react';
import type { Position } from '../types';

interface PositionPipelineVisualizationProps {
  position: Position;
}

export const PositionPipelineVisualization = React.memo(function PositionPipelineVisualization({
  position,
}: PositionPipelineVisualizationProps) {
  const [activeTab, setActiveTab] = useState<'kanban' | 'funnel'>('kanban');
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const kanbanData = useMemo(() => {
    const cvSendReject = position.pipeline.cv - position.pipeline.firstInterview;
    const hmScreening = position.pipeline.firstInterview;
    const rejected = position.rejectReasons.byStage?.cv
      ? Object.values(position.rejectReasons.byStage.cv).reduce((a, b) => a + b, 0)
      : 0;
    const withdrawn = position.rejectReasons.candidateWithdrawn || 0;

    const stages = [
      { name: 'CV Send/Reject', count: cvSendReject, color: 'bg-red-500' },
      { name: 'HM Screening', count: hmScreening, color: 'bg-blue-500' },
      { name: '1st Interview', count: position.pipeline.firstInterview, color: 'bg-purple-500' },
      { name: '2nd Interview', count: position.pipeline.secondInterview, color: 'bg-pink-500' },
      { name: 'Offer Neg.', count: position.pipeline.offers - (position.onboardedCount || 0), color: 'bg-orange-500' },
      { name: 'Offer Accepted', count: position.onboardedCount || 0, color: 'bg-green-500' },
      { name: 'Rejected', count: rejected, color: 'bg-gray-500' },
      { name: 'Withdrawn', count: withdrawn, color: 'bg-slate-500' },
    ];

    const maxCount = Math.max(...stages.map(s => s.count), 1);
    return { stages, maxCount };
  }, [position]);

  const funnelData = useMemo(() => {
    const total = position.pipeline.cv;
    const onboardedCount = position.onboardedCount || 0;

    return [
      {
        stage: 'CV Sent',
        count: position.pipeline.cv,
        rate: 100,
        drop: position.pipeline.cv - position.pipeline.firstInterview,
        dropRate: total > 0 ? Math.round(((position.pipeline.cv - position.pipeline.firstInterview) / position.pipeline.cv) * 100) : 0,
      },
      {
        stage: '1st Interview',
        count: position.pipeline.firstInterview,
        rate: total > 0 ? Math.round((position.pipeline.firstInterview / total) * 100) : 0,
        drop: position.pipeline.firstInterview - position.pipeline.secondInterview,
        dropRate: position.pipeline.firstInterview > 0 ? Math.round(((position.pipeline.firstInterview - position.pipeline.secondInterview) / position.pipeline.firstInterview) * 100) : 0,
      },
      {
        stage: '2nd Interview',
        count: position.pipeline.secondInterview,
        rate: total > 0 ? Math.round((position.pipeline.secondInterview / total) * 100) : 0,
        drop: position.pipeline.secondInterview - position.pipeline.offers,
        dropRate: position.pipeline.secondInterview > 0 ? Math.round(((position.pipeline.secondInterview - position.pipeline.offers) / position.pipeline.secondInterview) * 100) : 0,
      },
      {
        stage: 'Offer Sent',
        count: position.pipeline.offers,
        rate: total > 0 ? Math.round((position.pipeline.offers / total) * 100) : 0,
        drop: position.pipeline.offers - onboardedCount,
        dropRate: position.pipeline.offers > 0 ? Math.round(((position.pipeline.offers - onboardedCount) / position.pipeline.offers) * 100) : 0,
      },
      {
        stage: 'Offer Accepted',
        count: onboardedCount,
        rate: total > 0 ? Math.round((onboardedCount / total) * 100) : 0,
        isLast: true,
      },
    ];
  }, [position]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'kanban'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Kanban View
        </button>
        <button
          onClick={() => setActiveTab('funnel')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'funnel'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📈 Funnel View
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pipeline Stages</h3>

          {kanbanData.stages.map((stage) => {
            const barWidth = (stage.count / kanbanData.maxCount) * 100;
            return (
              <div key={stage.name} className="flex items-center gap-4">
                {/* Stage Name */}
                <div className="w-32 flex-shrink-0">
                  <div className="font-semibold text-gray-900 text-sm">{stage.name}</div>
                </div>

                {/* Bar Chart */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                      {barWidth > 0 && (
                        <div
                          className={`${stage.color} h-full rounded-full flex items-center justify-center text-white text-sm font-semibold transition-all`}
                          style={{ width: `${barWidth}%`, minWidth: '2rem' }}
                        >
                          {stage.count > 5 && stage.count}
                        </div>
                      )}
                    </div>
                    <div className="w-12 text-right">
                      <span className="font-semibold text-gray-900 text-sm">{stage.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      )}

      {activeTab === 'funnel' && (
        <div className="space-y-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pipeline Progression & Analysis</h3>

          {funnelData.map((item, index) => (
            <div key={item.stage}>
              {/* Stage row with metrics */}
              <div className="flex items-center gap-4 py-3">
                {/* Stage name & count */}
                <div className="w-32">
                  <div className="font-semibold text-gray-900">{item.stage}</div>
                  <div className="text-sm text-gray-600">{item.count}</div>
                </div>

                {/* Bar visualization */}
                <div className="flex-1">
                  {item.count > 0 && (
                    <div
                      className="bg-blue-500 rounded px-3 py-2 text-white text-sm font-semibold"
                      style={{ width: `${item.rate}%`, minWidth: '2rem' }}
                    >
                      {item.count}
                    </div>
                  )}
                </div>

                {/* Metrics on the right */}
                <div className="w-48 text-right">
                  <div className="font-semibold text-gray-900">
                    {item.rate}% of baseline
                  </div>
                  {!item.isLast && (
                    <div className="text-sm text-gray-600">
                      {item.dropRate}% drop
                    </div>
                  )}
                  {item.isLast && (
                    <div className="text-sm font-medium text-blue-600 mt-1">
                      ({item.count}/{position.pipeline.offers} accepted)
                    </div>
                  )}
                </div>
              </div>

              {/* Drop indicator between stages */}
              {!item.isLast && item.drop > 0 && (
                <div className="text-sm text-gray-500 py-1 ml-36 flex items-center gap-2 relative">
                  <span className="font-medium">↓ {item.drop} drop</span>
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
                        Rejection Breakdown ({item.drop})
                      </div>
                      <div className="space-y-2 text-sm">
                        {index === 0 && position.rejectReasons.byStage?.cv ? (
                          Object.entries(position.rejectReasons.byStage.cv)
                            .filter(([_, value]) => value > 0)
                            .map(([key, value]) => {
                              const labels: Record<string, string> = {
                                skillsMismatch: 'Skills Mismatch',
                                insufficientExp: 'Insufficient Experience',
                                overqualified: 'Overqualified',
                                other: 'Other',
                              };
                              return (
                                <div key={key} className="flex justify-between text-gray-700">
                                  <span>{labels[key] || key}:</span>
                                  <span className="font-semibold">{value}</span>
                                </div>
                              );
                            })
                        ) : index === 1 && position.rejectReasons.byStage?.firstInterview ? (
                          Object.entries(position.rejectReasons.byStage.firstInterview)
                            .filter(([_, value]) => value > 0)
                            .map(([key, value]) => {
                              const labels: Record<string, string> = {
                                skillsMismatch: 'Skills Mismatch',
                                compensationMismatch: 'Compensation Mismatch',
                                location: 'Location',
                                language: 'Language',
                                other: 'Other',
                              };
                              return (
                                <div key={key} className="flex justify-between text-gray-700">
                                  <span>{labels[key] || key}:</span>
                                  <span className="font-semibold">{value}</span>
                                </div>
                              );
                            })
                        ) : index === 2 && position.rejectReasons.byStage?.secondInterview ? (
                          Object.entries(position.rejectReasons.byStage.secondInterview)
                            .filter(([_, value]) => value > 0)
                            .map(([key, value]) => {
                              const labels: Record<string, string> = {
                                compensationMismatch: 'Compensation Mismatch',
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
                        ) : (
                          <div className="text-gray-600">No rejection reasons available</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
