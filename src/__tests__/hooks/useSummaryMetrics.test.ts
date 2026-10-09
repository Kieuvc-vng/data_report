/**
 * Unit Tests for useSummaryMetrics Hook
 * Tests calculation of summary metrics from positions data
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSummaryMetrics } from '../../hooks/useSummaryMetrics';
import type { Position } from '../../types';

describe('useSummaryMetrics', () => {
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
      estimatedFillDays: 30,
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

  describe('Total HC Calculation', () => {
    it('should calculate total HC for all positions', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions));

      expect(result.current.totalHC).toBe(6); // 2 + 1 + 3
    });

    it('should calculate total HC for specific team', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions, 'PEN'));

      expect(result.current.totalHC).toBe(3); // 2 + 1
    });

    it('should calculate total HC for different team', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions, 'GDS'));

      expect(result.current.totalHC).toBe(3); // 3
    });

    it('should return 0 HC for team with no positions', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions, 'PRO'));

      expect(result.current.totalHC).toBe(0);
    });

    it('should return 0 HC for empty positions array', () => {
      const { result } = renderHook(() => useSummaryMetrics([]));

      expect(result.current.totalHC).toBe(0);
    });
  });

  describe('Priority 1 Count Calculation', () => {
    it('should count P1 priorities for all positions', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions));

      expect(result.current.priority1Count).toBe(2); // pos_1 and pos_3
    });

    it('should count P1 priorities for specific team', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions, 'PEN'));

      expect(result.current.priority1Count).toBe(1); // pos_1
    });

    it('should count P1 priorities for team with multiple P1s', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions, 'GDS'));

      expect(result.current.priority1Count).toBe(1); // pos_3
    });

    it('should return 0 P1 for team with only lower priorities', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions, 'PRO'));

      expect(result.current.priority1Count).toBe(0);
    });

    it('should return 0 P1 for empty positions array', () => {
      const { result } = renderHook(() => useSummaryMetrics([]));

      expect(result.current.priority1Count).toBe(0);
    });
  });

  describe('Average Fill Days Calculation', () => {
    it('should calculate average fill days for all positions', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions));

      // (20 + 30 + 25) / 3 = 25
      expect(result.current.avgFillDays).toBe(25);
    });

    it('should calculate average fill days for specific team', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions, 'PEN'));

      // (20 + 30) / 2 = 25
      expect(result.current.avgFillDays).toBe(25);
    });

    it('should calculate average fill days for single position', () => {
      const { result } = renderHook(() => useSummaryMetrics([mockPositions[0]]));

      expect(result.current.avgFillDays).toBe(20);
    });

    it('should round average fill days', () => {
      const positionsUneven: Position[] = [
        { ...mockPositions[0], estimatedFillDays: 10 },
        { ...mockPositions[1], estimatedFillDays: 11 },
        { ...mockPositions[2], estimatedFillDays: 12 },
      ];

      const { result } = renderHook(() => useSummaryMetrics(positionsUneven));

      // (10 + 11 + 12) / 3 = 11
      expect(result.current.avgFillDays).toBe(11);
    });

    it('should return 0 for empty positions array', () => {
      const { result } = renderHook(() => useSummaryMetrics([]));

      expect(result.current.avgFillDays).toBe(0);
    });

    it('should return 0 for team with no positions', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions, 'PRO'));

      expect(result.current.avgFillDays).toBe(0);
    });
  });

  describe('Team Filtering', () => {
    it('should filter by "All Teams" as undefined', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions, undefined));

      expect(result.current.totalHC).toBe(6);
    });

    it('should treat "All Teams" string like undefined', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions, 'All Teams'));

      expect(result.current.totalHC).toBe(6);
    });
  });

  describe('Edge Cases', () => {
    it('should handle positions with zero HC', () => {
      const positionsZeroHC: Position[] = [
        { ...mockPositions[0], hc: 0 },
        { ...mockPositions[1], hc: 0 },
      ];

      const { result } = renderHook(() => useSummaryMetrics(positionsZeroHC));

      expect(result.current.totalHC).toBe(0);
    });

    it('should handle positions with high HC values', () => {
      const positionsHighHC: Position[] = [
        { ...mockPositions[0], hc: 1000 },
        { ...mockPositions[1], hc: 999 },
      ];

      const { result } = renderHook(() => useSummaryMetrics(positionsHighHC));

      expect(result.current.totalHC).toBe(1999);
    });

    it('should handle all P1 priorities', () => {
      const allP1Positions: Position[] = mockPositions.map(p => ({ ...p, priority: 'P1' }));

      const { result } = renderHook(() => useSummaryMetrics(allP1Positions));

      expect(result.current.priority1Count).toBe(3);
    });

    it('should handle no P1 priorities', () => {
      const noP1Positions: Position[] = mockPositions.map(p => ({ ...p, priority: 'P2' }));

      const { result } = renderHook(() => useSummaryMetrics(noP1Positions));

      expect(result.current.priority1Count).toBe(0);
    });

    it('should handle very large fill days', () => {
      const largePositions: Position[] = [
        { ...mockPositions[0], estimatedFillDays: 999 },
        { ...mockPositions[1], estimatedFillDays: 1000 },
      ];

      const { result } = renderHook(() => useSummaryMetrics(largePositions));

      expect(result.current.avgFillDays).toBe(1000); // (999 + 1000) / 2 = 999.5 rounded to 1000
    });

    it('should handle decimal fill days (rounds down)', () => {
      const decimalPositions: Position[] = [
        { ...mockPositions[0], estimatedFillDays: 10 },
        { ...mockPositions[1], estimatedFillDays: 11 },
      ];

      const { result } = renderHook(() => useSummaryMetrics(decimalPositions));

      expect(result.current.avgFillDays).toBe(11); // (10 + 11) / 2 = 10.5 rounded to 11
    });
  });

  describe('Return Value Consistency', () => {
    it('should return consistent object structure', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions));

      expect(result.current).toEqual(
        expect.objectContaining({
          totalHC: expect.any(Number),
          priority1Count: expect.any(Number),
          avgFillDays: expect.any(Number),
        })
      );
    });

    it('should have only expected properties', () => {
      const { result } = renderHook(() => useSummaryMetrics(mockPositions));

      const keys = Object.keys(result.current);
      expect(keys).toEqual(['totalHC', 'priority1Count', 'avgFillDays']);
    });
  });
});
