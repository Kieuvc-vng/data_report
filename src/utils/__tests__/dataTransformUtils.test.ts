/**
 * Unit Tests for Data Transformation Utilities
 * Tests data transformation functions for charts and aggregations
 */

import type { HiringSummary, Position } from '../../types';
import {
  transformPipelineData,
  transformRejectReasonsData,
  calculateMetrics,
  filterByDateRange,
  validateDateString,
  groupBy,
  aggregateByKey,
  recordToChartData,
} from '../dataTransformUtils';

describe('Data Transformation Utilities', () => {
  const mockSummary: HiringSummary = {
    dateRange: { start: '2026-08-01', end: '2026-08-31' },
    totalHired: 12,
    salaryRange: '$45K-$120K',
    hcTotal: 32,
    pipeline: { cv: 100, firstInterview: 50, secondInterview: 25, offers: 10 },
    timeToFill: 17,
    offerAcceptanceRate: 60,
    offersCount: 10,
    onboardedCount: 12,
    rejectReasons: {
      byStage: {
        cv: { skillsMismatch: 20, insufficientExp: 10, overqualified: 3, language: 2 },
        firstInterview: { skillsMismatch: 10, compensationMismatch: 7, location: 3, other: 2 },
        secondInterview: { compensationMismatch: 5, background: 2, positionClosed: 3, notProgressedInTime: 4 },
      },
      allReasons: {
        skillsMismatch: 35,
        insufficientExp: 15,
        overqualified: 8,
        compensationMismatch: 12,
        location: 5,
        language: 3,
        background: 2,
        positionClosed: 3,
        notProgressedInTime: 4,
        other: 8,
      },
      candidateWithdrawn: 25,
    },
  };

  const mockPositions: Position[] = [
    {
      id: 'pos_1',
      department: 'PEN',
      businessUnit: 'game_publishing_platform',
      title: 'Engineer',
      level: '1.2',
      salary: '$50K-$75K',
      hc: 2,
      priority: 'P1',
      status: 'open',
      pipeline: { cv: 20, firstInterview: 8, secondInterview: 2, offers: 1 },
      rejectReasons: {
        byStage: { cv: { skillsMismatch: 8, insufficientExp: 2 }, firstInterview: { skillsMismatch: 3, compensationMismatch: 1 } },
        candidateWithdrawn: 1,
      },
      createdDate: '2026-08-15',
      estimatedFillDays: 20,
      onboardedCount: 1,
    },
    {
      id: 'pos_2',
      department: 'GDS',
      businessUnit: 'game_publishing_platform',
      title: 'Data Analyst',
      level: '1.3',
      salary: '$60K-$90K',
      hc: 1,
      priority: 'P2',
      status: 'open',
      pipeline: { cv: 15, firstInterview: 5, secondInterview: 2, offers: 0 },
      rejectReasons: {
        byStage: { cv: { skillsMismatch: 5, insufficientExp: 3 }, firstInterview: { skillsMismatch: 2 } },
        candidateWithdrawn: 0,
      },
      createdDate: '2026-08-20',
      estimatedFillDays: 18,
      onboardedCount: 0,
    },
  ];

  // transformPipelineData tests
  describe('transformPipelineData', () => {
    it('should transform pipeline data correctly', () => {
      const result = transformPipelineData(mockSummary);

      expect(result).toHaveLength(4);
      expect(result[0].name).toBe('CV Received');
      expect(result[0].value).toBe(100);
      expect(result[3].name).toBe('Offer');
      expect(result[3].value).toBe(10);
    });

    it('should calculate percentages correctly', () => {
      const result = transformPipelineData(mockSummary);

      expect(result[0].percentage).toBe(100);
      expect(result[1].percentage).toBe(50);
      expect(result[3].percentage).toBe(10);
    });
  });

  // transformRejectReasonsData tests
  describe('transformRejectReasonsData', () => {
    it('should transform reject reasons with labels', () => {
      const result = transformRejectReasonsData(mockSummary);

      expect(result.some(r => r.name === 'Skills Mismatch')).toBe(true);
      expect(result.some(r => r.name === 'Insufficient Experience')).toBe(true);
    });

    it('should calculate percentages for reject reasons', () => {
      const result = transformRejectReasonsData(mockSummary);
      const total = result.reduce((sum, r) => sum + r.value, 0);

      result.forEach(reason => {
        const expectedPercentage = Math.round((reason.value / total) * 100);
        expect(reason.percentage).toBe(expectedPercentage);
      });
    });
  });

  // Note: transformLevelDistributionData and transformByTeamData tests disabled
  // These functions are currently commented out as the corresponding properties
  // (levelDistribution and byTeam) are not available in the HiringSummary type

  // calculateMetrics tests
  describe('calculateMetrics', () => {
    it('should calculate all metrics correctly', () => {
      const result = calculateMetrics(mockPositions);

      expect(result.totalPositions).toBe(2);
      expect(result.totalHC).toBe(3);
      expect(result.totalCVs).toBe(35);
      expect(result.totalOffers).toBe(1);
    });

    it('should handle empty positions array', () => {
      const result = calculateMetrics([]);

      expect(result.totalPositions).toBe(0);
      expect(result.totalHC).toBe(0);
      expect(result.totalCVs).toBe(0);
    });
  });

  // validateDateString tests
  describe('validateDateString', () => {
    it('should validate correct date format YYYY-MM-DD', () => {
      expect(validateDateString('2026-08-15')).toBe(true);
      expect(validateDateString('2026-01-01')).toBe(true);
      expect(validateDateString('2026-12-31')).toBe(true);
    });

    it('should reject invalid date format', () => {
      expect(validateDateString('08-15-2026')).toBe(false);
      expect(validateDateString('2026/08/15')).toBe(false);
      expect(validateDateString('15-08-2026')).toBe(false);
      expect(validateDateString('2026-8-15')).toBe(false);
    });

    it('should reject invalid dates', () => {
      expect(validateDateString('2026-02-30')).toBe(false);
      expect(validateDateString('2026-13-01')).toBe(false);
      expect(validateDateString('2026-00-01')).toBe(false);
    });

    it('should reject empty or malformed strings', () => {
      expect(validateDateString('')).toBe(false);
      expect(validateDateString('invalid')).toBe(false);
    });
  });

  // filterByDateRange tests
  describe('filterByDateRange', () => {
    it('should filter items by date range', () => {
      const result = filterByDateRange(mockPositions, '2026-08-18', '2026-08-25');

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('pos_2');
    });

    it('should return all items in range', () => {
      const result = filterByDateRange(mockPositions, '2026-08-01', '2026-08-31');

      expect(result.length).toBe(2);
    });

    it('should throw error for invalid startDate format', () => {
      expect(() => {
        filterByDateRange(mockPositions, '08-15-2026', '2026-08-25');
      }).toThrow('Invalid date format. Expected YYYY-MM-DD');
    });

    it('should throw error for invalid endDate format', () => {
      expect(() => {
        filterByDateRange(mockPositions, '2026-08-15', '25-08-2026');
      }).toThrow('Invalid date format. Expected YYYY-MM-DD');
    });

    it('should throw error for invalid date values', () => {
      expect(() => {
        filterByDateRange(mockPositions, '2026-02-30', '2026-08-25');
      }).toThrow('Invalid date format. Expected YYYY-MM-DD');
    });

    it('should throw error with descriptive message', () => {
      expect(() => {
        filterByDateRange(mockPositions, 'invalid', '2026-08-25');
      }).toThrow(/Invalid date format.*startDate: invalid/);
    });

    it('should return empty array when no items in range', () => {
      const result = filterByDateRange(mockPositions, '2026-09-01', '2026-09-30');

      expect(result.length).toBe(0);
      expect(result).toEqual([]);
    });
  });

  // groupBy tests
  describe('groupBy', () => {
    it('should group items by key', () => {
      const result = groupBy(mockPositions, pos => pos.department);

      expect(result['PEN']).toHaveLength(1);
      expect(result['GDS']).toHaveLength(1);
    });
  });

  // aggregateByKey tests
  describe('aggregateByKey', () => {
    it('should aggregate values by key', () => {
      const result = aggregateByKey(mockPositions, pos => pos.department, pos => pos.hc);

      expect(result['PEN']).toBe(2);
      expect(result['GDS']).toBe(1);
    });
  });

  // recordToChartData tests
  describe('recordToChartData', () => {
    it('should convert record to chart data', () => {
      const record = { Team1: 5, Team2: 3, Team3: 8 };
      const result = recordToChartData(record, true);

      expect(result[0].value).toBe(8);
      expect(result[1].value).toBe(5);
      expect(result[2].value).toBe(3);
    });

    it('should preserve order when sortByValue is false', () => {
      const record = { Team1: 5, Team2: 3, Team3: 8 };
      const result = recordToChartData(record, false);

      expect(result.length).toBe(3);
    });
  });
});
