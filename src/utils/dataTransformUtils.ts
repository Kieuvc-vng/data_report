/**
 * Data Transformation Utilities
 * Provides functions for transforming data into chart-ready formats
 */

import type { HiringSummary, Position } from '../types';

/**
 * Chart data point structure
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  percentage?: number;
  label?: string;
}

/**
 * Transforms HiringSummary pipeline data to Funnel chart format
 * @param summary - HiringSummary object
 * @returns Array of chart data points
 */
export const transformPipelineData = (summary: HiringSummary): ChartDataPoint[] => {
  const stages = [
    { name: 'CV Received', key: 'cv' },
    { name: '1st Interview', key: 'firstInterview' },
    { name: '2nd Interview', key: 'secondInterview' },
    { name: 'Offer', key: 'offers' },
  ] as const;

  const data = stages.map(stage => ({
    name: stage.name,
    value: summary.pipeline[stage.key as keyof typeof summary.pipeline] as number,
  }));

  // Calculate percentages based on initial CV count
  const initialValue = data[0].value || 1;
  return data.map(point => ({
    ...point,
    percentage: Math.round((point.value / initialValue) * 100),
  }));
};

/**
 * Transforms reject reasons to Bar chart format
 * @param summary - HiringSummary object
 * @returns Array of chart data points
 */
export const transformRejectReasonsData = (summary: HiringSummary): ChartDataPoint[] => {
  const reasonLabels: Record<string, string> = {
    notFitSkills: 'Not Fit Skills',
    lowExp: 'Low Experience',
    salaryMismatch: 'Salary Mismatch',
    other: 'Other',
  };

  const data = Object.entries(summary.rejectReasons).map(([key, value]) => ({
    name: reasonLabels[key] || key,
    value,
  }));

  // Calculate total for percentages
  const total = data.reduce((sum, point) => sum + point.value, 0) || 1;
  return data.map(point => ({
    ...point,
    percentage: Math.round((point.value / total) * 100),
  }));
};

/**
 * Transforms level distribution to Bar chart format
 * @param summary - HiringSummary object
 * @returns Array of chart data points sorted by level
 */
export const transformLevelDistributionData = (summary: HiringSummary): ChartDataPoint[] => {
  const data = Object.entries(summary.levelDistribution)
    .map(([level, count]) => ({
      name: `Level ${level}`,
      value: count,
      label: level,
    }))
    .sort((a, b) => {
      // Sort levels numerically
      const aNum = parseFloat(a.label || '0');
      const bNum = parseFloat(b.label || '0');
      return aNum - bNum;
    });

  // Calculate percentages
  const total = data.reduce((sum, point) => sum + point.value, 0) || 1;
  return data.map(point => ({
    ...point,
    percentage: Math.round((point.value / total) * 100),
  }));
};

/**
 * Transforms by-team data to Bar chart format
 * @param summary - HiringSummary object
 * @returns Array of chart data points sorted by value descending
 */
export const transformByTeamData = (summary: HiringSummary): ChartDataPoint[] => {
  const data = Object.entries(summary.byTeam)
    .map(([team, count]) => ({
      name: team,
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate percentages
  const total = data.reduce((sum, point) => sum + point.value, 0) || 1;
  return data.map(point => ({
    ...point,
    percentage: Math.round((point.value / total) * 100),
  }));
};

/**
 * Calculates summary metrics from a list of positions
 * @param positions - Array of positions
 * @returns Record of metric names and values
 */
export const calculateMetrics = (positions: Position[]): Record<string, number> => {
  if (!positions || positions.length === 0) {
    return {
      totalPositions: 0,
      totalHC: 0,
      totalCVs: 0,
      totalOffers: 0,
      avgFillTime: 0,
    };
  }

  const totalCVs = positions.reduce((sum, p) => sum + p.pipeline.cv, 0);
  const totalOffers = positions.reduce((sum, p) => sum + p.pipeline.offers, 0);
  const totalHC = positions.reduce((sum, p) => sum + p.hc, 0);
  const avgFillTime = positions.reduce((sum, p) => sum + p.estimatedFillDays, 0) / positions.length;

  return {
    totalPositions: positions.length,
    totalHC,
    totalCVs,
    totalOffers,
    avgFillTime: Math.round(avgFillTime),
    openPositions: positions.filter(p => p.status === 'open').length,
    filledPositions: positions.filter(p => p.status === 'filled').length,
    closedPositions: positions.filter(p => p.status === 'closed').length,
  };
};

/**
 * Validates if a string is a valid date in YYYY-MM-DD format
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export const validateDateString = (dateString: string): boolean => {
  // Check format YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  // Check if valid date
  const parsed = new Date(dateString);
  return !isNaN(parsed.getTime());
};

/**
 * Filters data by date range
 * @param data - Array of items with createdDate
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Filtered array
 * @throws Error if date format is invalid
 */
export const filterByDateRange = <T extends { createdDate: string }>(
  data: T[],
  startDate: string,
  endDate: string
): T[] => {
  // Validate dates
  if (!validateDateString(startDate) || !validateDateString(endDate)) {
    throw new Error(
      `Invalid date format. Expected YYYY-MM-DD. Got startDate: ${startDate}, endDate: ${endDate}`
    );
  }

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return data.filter(item => {
    const itemDate = new Date(item.createdDate).getTime();
    return itemDate >= start && itemDate <= end;
  });
};

/**
 * Groups items by a specific property
 * @param items - Array of items to group
 * @param getGroupKey - Function to extract the group key
 * @returns Object with groups
 */
export const groupBy = <T>(
  items: T[],
  getGroupKey: (item: T) => string
): Record<string, T[]> => {
  return items.reduce(
    (groups, item) => {
      const key = getGroupKey(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
};

/**
 * Aggregates numeric values by a grouping function
 * @param items - Array of items to aggregate
 * @param getKey - Function to extract the group key
 * @param getValue - Function to extract the numeric value
 * @returns Record of aggregated values
 */
export const aggregateByKey = <T>(
  items: T[],
  getKey: (item: T) => string,
  getValue: (item: T) => number
): Record<string, number> => {
  return items.reduce(
    (acc, item) => {
      const key = getKey(item);
      acc[key] = (acc[key] || 0) + getValue(item);
      return acc;
    },
    {} as Record<string, number>
  );
};

/**
 * Converts a flat record into chart data points
 * @param record - Record to convert
 * @param sortByValue - Whether to sort by value descending (default: true)
 * @returns Array of chart data points
 */
export const recordToChartData = (
  record: Record<string, number>,
  sortByValue: boolean = true
): ChartDataPoint[] => {
  const data = Object.entries(record).map(([name, value]) => ({
    name,
    value,
  }));

  if (sortByValue) {
    return data.sort((a, b) => b.value - a.value);
  }

  return data;
};
