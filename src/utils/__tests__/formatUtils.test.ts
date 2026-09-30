/**
 * Unit Tests for Format Utilities
 * Tests formatting functions for dates, numbers, currencies, and strings
 */

import {
  formatDate,
  formatCurrency,
  formatNumber,
  truncateString,
  capitalizeWords,
  toTitleCase,
  formatPercentage,
  formatPropertyName,
} from '../formatUtils';

describe('Format Utilities', () => {
  // formatDate tests
  describe('formatDate', () => {
    it('should format date in short format', () => {
      const result = formatDate('2026-09-15');
      expect(result).toBe('Sep 15, 2026');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('invalid-date');
    });
  });

  // formatCurrency tests
  describe('formatCurrency', () => {
    it('should return salary with K format as-is', () => {
      const result = formatCurrency('$50K-$75K');
      expect(result).toBe('$50K-$75K');
    });

    it('should return empty string for empty input', () => {
      const result = formatCurrency('');
      expect(result).toBe('');
    });
  });

  // formatNumber tests
  describe('formatNumber', () => {
    it('should format number with thousand separator', () => {
      const result = formatNumber(1234567);
      expect(result).toBe('1,234,567');
    });

    it('should handle decimals', () => {
      const result = formatNumber(123.456, 2);
      expect(result).toBe('123.46');
    });

    it('should handle NaN', () => {
      const result = formatNumber(NaN);
      expect(result).toBe('0');
    });
  });

  // truncateString tests
  describe('truncateString', () => {
    it('should truncate long strings', () => {
      const result = truncateString('This is a long string', 10);
      expect(result).toBe('This is...');
    });

    it('should return short strings unchanged', () => {
      const result = truncateString('Short', 10);
      expect(result).toBe('Short');
    });

    it('should support custom suffix', () => {
      const result = truncateString('This is a long string', 10, '→');
      expect(result).toBe('This is a→');
    });
  });

  // capitalizeWords tests
  describe('capitalizeWords', () => {
    it('should capitalize each word', () => {
      const result = capitalizeWords('hello world test');
      expect(result).toBe('Hello World Test');
    });

    it('should handle empty strings', () => {
      const result = capitalizeWords('');
      expect(result).toBe('');
    });
  });

  // toTitleCase tests
  describe('toTitleCase', () => {
    it('should convert camelCase to title case', () => {
      const result = toTitleCase('camelCaseString');
      expect(result).toBe('Camel Case String');
    });

    it('should convert snake_case to title case', () => {
      const result = toTitleCase('snake_case_string');
      expect(result).toBe('Snake Case String');
    });
  });

  // formatPercentage tests
  describe('formatPercentage', () => {
    it('should format decimal as percentage', () => {
      const result = formatPercentage(0.856, 1, true);
      expect(result).toBe('85.6%');
    });

    it('should format integer as percentage', () => {
      const result = formatPercentage(85.6, 1, false);
      expect(result).toBe('85.6%');
    });
  });

  // formatPropertyName tests
  describe('formatPropertyName', () => {
    it('should format known property names', () => {
      expect(formatPropertyName('notFitSkills')).toBe('Not Fit Skills');
      expect(formatPropertyName('lowExp')).toBe('Low Experience');
      expect(formatPropertyName('salaryMismatch')).toBe('Salary Mismatch');
    });

    it('should handle unknown properties', () => {
      const result = formatPropertyName('unknownProperty');
      expect(result.includes('Unknown')).toBe(true);
    });
  });
});
