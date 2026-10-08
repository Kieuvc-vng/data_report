import React, { useState, useMemo } from 'react';
import type { HiringSummary } from '../../types';
import { PipelineFlowChart } from './PipelineFlowChart';

interface PipelineVisualizationTabsProps {
  summary: HiringSummary;
}

export const PipelineVisualizationTabs = React.memo(function PipelineVisualizationTabs({
  summary,
}: PipelineVisualizationTabsProps) {
  const [activeTab, setActiveTab] = useState<'kanban' | 'funnel'>('kanban');

  const kanbanData = useMemo(() => {
    const stages = [
      { name: 'CV Sent', count: summary.pipeline.cv, color: 'bg-blue-500' },
      { name: '1st Interview', count: summary.pipeline.firstInterview, color: 'bg-purple-500' },
      { name: '2nd Interview', count: summary.pipeline.secondInterview, color: 'bg-pink-500' },
      { name: 'Offer', count: summary.offersCount, color: 'bg-orange-500' },
      { name: 'Offer Accepted', count: summary.onboardedCount, color: 'bg-green-500' },
    ];

    const maxCount = Math.max(...stages.map(s => s.count), 1);
    return { stages, maxCount };
  }, [summary]);

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
          <h3 className="text-lg font-semibold text-gray-900">Pipeline Stages</h3>

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

          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Total CV Sent</div>
                <div className="text-2xl font-bold text-gray-900">{summary.pipeline.cv}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">1st Interview Rate</div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.pipeline.cv > 0
                    ? Math.round((summary.pipeline.firstInterview / summary.pipeline.cv) * 100)
                    : 0}
                  %
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Offer Rate</div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.pipeline.cv > 0
                    ? Math.round((summary.offersCount / summary.pipeline.cv) * 100)
                    : 0}
                  %
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Acceptance Rate</div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.offersCount > 0
                    ? Math.round((summary.onboardedCount / summary.offersCount) * 100)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'funnel' && (
        <div>
          <PipelineFlowChart summary={summary} />
        </div>
      )}
    </div>
  );
});
