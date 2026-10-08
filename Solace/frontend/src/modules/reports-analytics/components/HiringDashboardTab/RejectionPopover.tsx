import React, { useEffect } from 'react';
import type { HiringSummary } from '../../types';

interface RejectionPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  rejectReasons: HiringSummary['rejectReasons'];
}

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

const stageLabels: Record<string, string> = {
  cv: 'CV Stage',
  firstInterview: '1st Interview Stage',
  secondInterview: '2nd Interview Stage',
};

export const RejectionPopover = React.memo(function RejectionPopover({
  isOpen,
  onClose,
  rejectReasons,
}: RejectionPopoverProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Rejection Breakdown by Stage</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stages Section */}
          <div className="space-y-4">
            {rejectReasons.byStage &&
              Object.entries(rejectReasons.byStage).map(([stageKey, reasons]) => {
                if (!reasons || Object.keys(reasons).length === 0) return null;

                return (
                  <div key={stageKey} className="border-l-4 border-blue-400 pl-4 py-2">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      {stageLabels[stageKey] || stageKey}
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(reasons).map(([reasonKey, count]) => (
                        <div
                          key={reasonKey}
                          className="flex justify-between items-center bg-gray-50 rounded px-3 py-2"
                        >
                          <span className="text-gray-700">
                            {reasonLabels[reasonKey] || reasonKey}
                          </span>
                          <span className="font-semibold text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Divider */}
          {rejectReasons.byStage && rejectReasons.candidateWithdrawn > 0 && (
            <div className="border-t-2 border-gray-300" />
          )}

          {/* Candidate Withdrawn Section */}
          {rejectReasons.candidateWithdrawn > 0 && (
            <div className="border-l-4 border-amber-400 pl-4 py-2">
              <h3 className="font-semibold text-gray-800 mb-3">Candidate Withdrawn</h3>
              <div className="flex justify-between items-center bg-gray-50 rounded px-3 py-2">
                <span className="text-gray-700">Withdrawn from Process</span>
                <span className="font-semibold text-gray-900">
                  {rejectReasons.candidateWithdrawn}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
