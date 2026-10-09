/**
 * Unit Tests for CurrentOpeningsTab Component
 * Tests position rendering, filtering, and interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurrentOpeningsTab } from '../../components/CurrentOpeningsTab';
import type { Position } from '../../types';

// Mock child components
vi.mock('../../components/TeamFilter', () => ({
  TeamFilter: ({ activeTeam, onTeamChange }: any) => (
    <select data-testid="team-filter" value={activeTeam} onChange={(e) => onTeamChange(e.target.value)}>
      <option>All Teams</option>
      <option>PEN</option>
      <option>GDS</option>
      <option>GIO</option>
      <option>PRO</option>
      <option>PIN</option>
    </select>
  ),
}));

vi.mock('../../components/SummaryCards', () => ({
  SummaryCards: (props: any) => (
    <div data-testid="summary-cards">
      <div>Total HC: {props.totalHC}</div>
      <div>Priority 1: {props.priority1Count}</div>
      <div>Avg Fill Days: {props.avgFillDays}</div>
    </div>
  ),
}));

vi.mock('../../components/PositionAccordion', () => ({
  PositionAccordion: ({ positions }: any) => (
    <div data-testid="position-accordion">
      {positions.map((pos: Position) => (
        <div key={pos.id} data-testid={`position-${pos.id}`}>
          {pos.title} - {pos.team}
        </div>
      ))}
    </div>
  ),
}));

describe('CurrentOpeningsTab', () => {
  const mockOnTeamChange = vi.fn();

  const mockPositions: Position[] = [
    {
      id: 'pos_1',
      team: 'PEN',
      title: 'Senior Engineer',
      level: '1.2',
      salary: '$50K-$75K',
      hc: 2,
      priority: 'P1',
      status: 'open',
      pipeline: { cv: 20, firstInterview: 8, secondInterview: 2, offers: 1 },
      rejectReasons: { notFitSkills: 8, lowExp: 2, salaryMismatch: 1, other: 1 },
      createdDate: '2026-08-15',
      estimatedFillDays: 20,
    },
    {
      id: 'pos_2',
      team: 'PEN',
      title: 'Product Manager',
      level: '1.3',
      salary: '$60K-$90K',
      hc: 1,
      priority: 'P2',
      status: 'open',
      pipeline: { cv: 15, firstInterview: 5, secondInterview: 2, offers: 0 },
      rejectReasons: { notFitSkills: 5, lowExp: 3, salaryMismatch: 2, other: 0 },
      createdDate: '2026-08-20',
      estimatedFillDays: 18,
    },
    {
      id: 'pos_3',
      team: 'GDS',
      title: 'Data Analyst',
      level: '1.1',
      salary: '$45K-$65K',
      hc: 3,
      priority: 'P1',
      status: 'open',
      pipeline: { cv: 25, firstInterview: 10, secondInterview: 4, offers: 2 },
      rejectReasons: { notFitSkills: 10, lowExp: 4, salaryMismatch: 3, other: 2 },
      createdDate: '2026-08-25',
      estimatedFillDays: 25,
    },
  ];

  describe('Rendering', () => {
    it('should render component with all positions', () => {
      render(
        <CurrentOpeningsTab
          positions={mockPositions}
          activeTeam="All Teams"
          onTeamChange={mockOnTeamChange}
        />
      );

      expect(screen.getByTestId('team-filter')).toBeInTheDocument();
      expect(screen.getByTestId('summary-cards')).toBeInTheDocument();
      expect(screen.getByTestId('position-accordion')).toBeInTheDocument();
    });

    it('should display position count in title', () => {
      render(
        <CurrentOpeningsTab
          positions={mockPositions}
          activeTeam="All Teams"
          onTeamChange={mockOnTeamChange}
        />
      );

      expect(screen.getByText(/Positions by Team \(3 positions\)/)).toBeInTheDocument();
    });

    it('should render export buttons', () => {
      render(
        <CurrentOpeningsTab
          positions={mockPositions}
          activeTeam="All Teams"
          onTeamChange={mockOnTeamChange}
        />
      );

      expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
    });
  });

  describe('Team Filter', () => {
    it('should pass activeTeam to TeamFilter', () => {
      render(
        <CurrentOpeningsTab
          positions={mockPositions}
          activeTeam="PEN"
          onTeamChange={mockOnTeamChange}
        />
      );

      const teamFilter = screen.getByTestId('team-filter') as HTMLSelectElement;
      expect(teamFilter.value).toBe('PEN');
    });

    it('should call onTeamChange when team is selected', () => {
      render(
        <CurrentOpeningsTab
          positions={mockPositions}
          activeTeam="All Teams"
          onTeamChange={mockOnTeamChange}
        />
      );

      const teamFilter = screen.getByTestId('team-filter');
      fireEvent.change(teamFilter, { target: { value: 'GDS' } });

      expect(mockOnTeamChange).toHaveBeenCalledWith('GDS');
    });
  });

  describe('Position Filtering', () => {
    it('should show all positions when "All Teams" is selected', () => {
      render(
        <CurrentOpeningsTab
          positions={mockPositions}
          activeTeam="All Teams"
          onTeamChange={mockOnTeamChange}
        />
      );

      expect(screen.getByText(/3 positions/)).toBeInTheDocument();
      expect(screen.getByTestId('position-pos_1')).toBeInTheDocument();
      expect(screen.getByTestId('position-pos_2')).toBeInTheDocument();
      expect(screen.getByTestId('position-pos_3')).toBeInTheDocument();
    });

    it('should filter positions by team', () => {
      render(
        <CurrentOpeningsTab
          positions={mockPositions}
          activeTeam="PEN"
          onTeamChange={mockOnTeamChange}
        />
      );

      expect(screen.getByText(/2 positions/)).toBeInTheDocument();
      expect(screen.getByTestId('position-pos_1')).toBeInTheDocument();
      expect(screen.getByTestId('position-pos_2')).toBeInTheDocument();
      expect(screen.queryByTestId('position-pos_3')).not.toBeInTheDocument();
    });

    it('should filter positions for GDS team', () => {
      render(
        <CurrentOpeningsTab
          positions={mockPositions}
          activeTeam="GDS"
          onTeamChange={mockOnTeamChange}
        />
      );

      expect(screen.getByText(/1 positions/)).toBeInTheDocument();
      expect(screen.getByTestId('position-pos_3')).toBeInTheDocument();
      expect(screen.queryByTestId('position-pos_1')).not.toBeInTheDocument();
    });
  });

  describe('Summary Metrics', () => {
    it('should calculate metrics for all positions', () => {
      render(
        <CurrentOpeningsTab
          positions={mockPositions}
          activeTeam="All Teams"
          onTeamChange={mockOnTeamChange}
        />
      );

      const summaryCards = screen.getByTestId('summary-cards');
      expect(summaryCards.textContent).toContain('Total HC: 6'); // 2 + 1 + 3
      expect(summaryCards.textContent).toContain('Priority 1: 2'); // pos_1 and pos_3
    });

    it('should calculate metrics for filtered team positions', () => {
      render(
        <CurrentOpeningsTab
          positions={mockPositions}
          activeTeam="PEN"
          onTeamChange={mockOnTeamChange}
        />
      );

      const summaryCards = screen.getByTestId('summary-cards');
      expect(summaryCards.textContent).toContain('Total HC: 3'); // 2 + 1
      expect(summaryCards.textContent).toContain('Priority 1: 1'); // pos_1
    });

    it('should calculate average fill days correctly', () => {
      render(
        <CurrentOpeningsTab
          positions={mockPositions}
          activeTeam="All Teams"
          onTeamChange={mockOnTeamChange}
        />
      );

      const summaryCards = screen.getByTestId('summary-cards');
      // (20 + 18 + 25) / 3 = 21
      expect(summaryCards.textContent).toContain('Avg Fill Days: 21');
    });
  });

  describe('Empty State', () => {
    it('should show no positions message when team has no positions', () => {
      render(
        <CurrentOpeningsTab
          positions={mockPositions}
          activeTeam="PIN"
          onTeamChange={mockOnTeamChange}
        />
      );

      expect(screen.getByText(/No positions found for PIN/)).toBeInTheDocument();
      expect(screen.queryByTestId('position-accordion')).not.toBeInTheDocument();
    });

    it('should show no positions message when positions array is empty', () => {
      render(
        <CurrentOpeningsTab
          positions={[]}
          activeTeam="All Teams"
          onTeamChange={mockOnTeamChange}
        />
      );

      expect(screen.getByText(/No positions found for All Teams/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle positions with same team', () => {
      const singleTeamPositions = mockPositions.filter(p => p.team === 'PEN');
      render(
        <CurrentOpeningsTab
          positions={singleTeamPositions}
          activeTeam="All Teams"
          onTeamChange={mockOnTeamChange}
        />
      );

      expect(screen.getByText(/2 positions/)).toBeInTheDocument();
    });

    it('should handle very long position titles', () => {
      const longTitlePosition: Position = {
        ...mockPositions[0],
        title: 'This is a very long position title that might wrap in the UI',
      };

      render(
        <CurrentOpeningsTab
          positions={[longTitlePosition]}
          activeTeam="All Teams"
          onTeamChange={mockOnTeamChange}
        />
      );

      expect(screen.getByText(/This is a very long position title that might wrap in the UI/)).toBeInTheDocument();
    });

    it('should handle single position', () => {
      render(
        <CurrentOpeningsTab
          positions={[mockPositions[0]]}
          activeTeam="All Teams"
          onTeamChange={mockOnTeamChange}
        />
      );

      expect(screen.getByText(/1 positions/)).toBeInTheDocument();
    });
  });
});
