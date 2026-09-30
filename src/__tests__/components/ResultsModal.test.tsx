/**
 * Unit Tests for ResultsModal Component
 * Tests modal rendering, data display, and interactions
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResultsModal } from '../../components/ResultsModal';
import type { HiringSummary } from '../../types';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  FunnelChart: ({ children }: any) => <div data-testid="funnel-chart">{children}</div>,
  Funnel: ({ children, data }: any) => (
    <div data-testid="funnel">
      {data?.map((item: any) => <div key={item.name}>{item.name}</div>)}
      {children}
    </div>
  ),
  BarChart: ({ children, data }: any) => (
    <div data-testid="bar-chart">
      {data?.map((item: any) => <div key={item.name}>{item.name}</div>)}
      {children}
    </div>
  ),
  Bar: ({ children, dataKey }: any) => <div data-testid="bar">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

// Mock exportUtils
vi.mock('../../utils', () => ({
  exportToCSV: vi.fn(),
  exportToPDF: vi.fn(),
  generateFilename: vi.fn((prefix, ext) => `${prefix}-2026-09-30.${ext}`),
}));

describe('ResultsModal', () => {
  const mockOnClose = vi.fn();

  const mockSummary: HiringSummary = {
    dateRange: { start: '2026-08-01', end: '2026-08-31' },
    team: 'PEN',
    totalHired: 12,
    salaryRange: '$45K-$120K',
    hcTotal: 32,
    pipeline: { cv: 100, firstInterview: 50, secondInterview: 25, offers: 10 },
    rejectReasons: { notFitSkills: 30, lowExp: 10, salaryMismatch: 5, other: 5 },
    levelDistribution: { '1.1': 8, '1.2': 12, '1.3': 10, '2.1': 6, '2.2': 2 },
    byTeam: { PEN: 5, GDS: 3, GIO: 2, PRO: 1, PIN: 1 },
    aiInsight: 'Test insight about hiring trends',
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Modal Rendering', () => {
    it('should render the modal with title and date range', () => {
      const { container } = render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      expect(screen.getByText('Hiring Analytics')).toBeInTheDocument();
      expect(container.textContent).toMatch(/Aug\s+\d+,\s+2026.*Aug\s+\d+,\s+2026/);
    });

    it('should display team information when team is provided', () => {
      const { container } = render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      expect(container.textContent).toContain('Team: PEN');
    });

    it('should not display team information when team is not provided', () => {
      const summaryNoTeam = { ...mockSummary, team: undefined };
      render(<ResultsModal summary={summaryNoTeam} onClose={mockOnClose} />);

      expect(screen.queryByText(/Team:/)).not.toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Summary Metrics Cards', () => {
    it('should display all summary metric cards', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      expect(screen.getByText('Total Hired')).toBeInTheDocument();
      expect(screen.getByText('HC Total')).toBeInTheDocument();
      expect(screen.getByText('CVs Received')).toBeInTheDocument();
      expect(screen.getByText('Salary Range')).toBeInTheDocument();
    });

    it('should display correct metric values', () => {
      const { container } = render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      // Check that metric values are in the document
      expect(container.textContent).toContain('Total Hired');
      expect(container.textContent).toContain('HC Total');
      expect(container.textContent).toContain('CVs Received');
      expect(container.textContent).toContain('Salary Range');
      expect(container.textContent).toContain('$45K-$120K');
    });
  });

  describe('Charts Rendering', () => {
    it('should render pipeline funnel chart', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      expect(screen.getByText('Pipeline Progression')).toBeInTheDocument();
      expect(screen.getByTestId('funnel-chart')).toBeInTheDocument();
    });

    it('should render reject reasons bar chart', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      expect(screen.getByText('Rejection Reasons')).toBeInTheDocument();
      const barCharts = screen.getAllByTestId('bar-chart');
      expect(barCharts.length).toBeGreaterThan(0);
    });

    it('should render level distribution chart', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      expect(screen.getByText('Level Distribution')).toBeInTheDocument();
    });

    it('should render hires by team chart', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      expect(screen.getByText('Hires by Team')).toBeInTheDocument();
    });

    it('should display pipeline stage data', () => {
      const { container } = render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      // Check for pipeline stage data in the document
      expect(container.textContent).toContain('CV Received');
      expect(container.textContent).toContain('1st Interview');
      expect(container.textContent).toContain('2nd Interview');
      expect(container.textContent).toContain('Offer');
    });
  });

  describe('AI Insight Section', () => {
    it('should display AI insight when present', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      expect(screen.getByText('AI Insight')).toBeInTheDocument();
      expect(screen.getByText('Test insight about hiring trends')).toBeInTheDocument();
    });

    it('should not display AI insight section when empty', () => {
      const summaryNoInsight = { ...mockSummary, aiInsight: '' };
      render(<ResultsModal summary={summaryNoInsight} onClose={mockOnClose} />);

      expect(screen.queryByText('AI Insight')).not.toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button in footer is clicked', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      fireEvent.click(closeButtons[1]); // Footer close button

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking outside modal overlay', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      const overlay = screen.getByRole('dialog');
      fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not call onClose when clicking inside modal content', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      const title = screen.getByText('Hiring Analytics');
      fireEvent.click(title);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Export Buttons', () => {
    it('should render export CSV button', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
    });

    it('should render export PDF button', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pipeline data', () => {
      const summaryEmptyPipeline = {
        ...mockSummary,
        pipeline: { cv: 0, firstInterview: 0, secondInterview: 0, offers: 0 },
      };

      const { container } = render(<ResultsModal summary={summaryEmptyPipeline} onClose={mockOnClose} />);

      expect(container.textContent).toContain('Pipeline Progression');
    });

    it('should handle single team in byTeam data', () => {
      const summarySingleTeam = {
        ...mockSummary,
        byTeam: { PEN: 5 },
      };

      const { container } = render(<ResultsModal summary={summarySingleTeam} onClose={mockOnClose} />);

      expect(container.textContent).toContain('Hires by Team');
    });

    it('should handle large numbers correctly', () => {
      const summaryLargeNumbers = {
        ...mockSummary,
        totalHired: 99,
        hcTotal: 12345,
        pipeline: { cv: 999999, firstInterview: 500000, secondInterview: 250000, offers: 100000 },
      };

      render(<ResultsModal summary={summaryLargeNumbers} onClose={mockOnClose} />);

      // Check that large numbers are rendered without errors
      expect(screen.getByText('Total Hired')).toBeInTheDocument();
      expect(screen.getByText('HC Total')).toBeInTheDocument();
    });

    it('should handle special characters in team name', () => {
      const summarySpecialChars = {
        ...mockSummary,
        team: 'Team-A&B',
      };

      render(<ResultsModal summary={summarySpecialChars} onClose={mockOnClose} />);

      expect(screen.getByText(/Team-A&B/)).toBeInTheDocument();
    });
  });

  describe('Modal Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ResultsModal summary={mockSummary} onClose={mockOnClose} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByText('Hiring Analytics')).toHaveAttribute('id', 'modal-title');
    });
  });
});
