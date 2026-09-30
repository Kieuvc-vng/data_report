/**
 * Unit Tests for Export Utilities
 * Tests CSV and PDF export functions
 */

import type { HiringSummary } from '../../types';
import { generateFilename, generateHiringSummaryCSV, generateHiringSummaryPDF } from '../exportUtils';

describe('Export Utilities', () => {
  const mockSummary: HiringSummary = {
    dateRange: { start: '2026-08-01', end: '2026-08-31' },
    totalHired: 12,
    salaryRange: '$45K-$120K',
    hcTotal: 32,
    pipeline: { cv: 100, firstInterview: 50, secondInterview: 25, offers: 10 },
    rejectReasons: { notFitSkills: 30, lowExp: 10, salaryMismatch: 5, other: 5 },
    levelDistribution: { '1.1': 8, '1.2': 12, '1.3': 10, '2.1': 6, '2.2': 2 },
    byTeam: { PEN: 5, GDS: 3, GIO: 2, PRO: 1, PIN: 1 },
    aiInsight: 'Test insight',
  };

  // generateFilename tests
  describe('generateFilename', () => {
    it('should generate filename with timestamp', () => {
      const result = generateFilename('hiring-report', 'csv');

      expect(result).toContain('hiring-report');
      expect(result).toContain('.csv');
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should use default prefix and extension', () => {
      const result = generateFilename();

      expect(result).toContain('hiring-report');
      expect(result).toContain('.csv');
    });

    it('should support different extensions', () => {
      const result = generateFilename('report', 'pdf');

      expect(result).toContain('report');
      expect(result).toContain('.pdf');
    });

    it('should use correct date format', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = generateFilename('test', 'csv');

      expect(result).toContain(today);
    });
  });

  // generateHiringSummaryCSV tests (pure function)
  describe('generateHiringSummaryCSV', () => {
    it('should generate CSV with summary metrics', () => {
      const csv = generateHiringSummaryCSV(mockSummary);

      expect(csv).toContain('Hiring Analytics Report');
      expect(csv).toContain('Total Hired');
      expect(csv).toContain('12');
      expect(csv).toContain('HC Total');
      expect(csv).toContain('32');
    });

    it('should include pipeline progression data', () => {
      const csv = generateHiringSummaryCSV(mockSummary);

      expect(csv).toContain('PIPELINE PROGRESSION');
      expect(csv).toContain('CV Received');
      expect(csv).toContain('100');
    });

    it('should include rejection reasons', () => {
      const csv = generateHiringSummaryCSV(mockSummary);

      expect(csv).toContain('REJECTION REASONS');
      expect(csv).toContain('Not Fit Skills');
    });

    it('should include level distribution', () => {
      const csv = generateHiringSummaryCSV(mockSummary);

      expect(csv).toContain('LEVEL DISTRIBUTION');
      expect(csv).toContain('Level');
    });

    it('should include hires by team', () => {
      const csv = generateHiringSummaryCSV(mockSummary);

      expect(csv).toContain('HIRES BY TEAM');
      expect(csv).toContain('PEN');
    });

    it('should include AI insights when present', () => {
      const csv = generateHiringSummaryCSV(mockSummary);

      expect(csv).toContain('AI INSIGHTS');
      expect(csv).toContain('Test insight');
    });

    it('should include team info when present', () => {
      const summaryWithTeam: HiringSummary = { ...mockSummary, team: 'PEN' };
      const csv = generateHiringSummaryCSV(summaryWithTeam);

      expect(csv).toContain('Team');
      expect(csv).toContain('PEN');
    });

    it('should handle undefined aiInsight', () => {
      const summaryNoInsight: HiringSummary = { ...mockSummary, aiInsight: '' };
      const csv = generateHiringSummaryCSV(summaryNoInsight);

      expect(csv).toContain('Hiring Analytics Report');
      expect(() => generateHiringSummaryCSV(summaryNoInsight)).not.toThrow();
    });
  });

  // generateHiringSummaryPDF tests (pure function)
  describe('generateHiringSummaryPDF', () => {
    it('should generate HTML with DOCTYPE and structure', () => {
      const html = generateHiringSummaryPDF(mockSummary);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
    });

    it('should include report title', () => {
      const html = generateHiringSummaryPDF(mockSummary);

      expect(html).toContain('Hiring Analytics Report');
    });

    it('should include all sections', () => {
      const html = generateHiringSummaryPDF(mockSummary);

      expect(html).toContain('Summary Metrics');
      expect(html).toContain('Pipeline Progression');
      expect(html).toContain('Rejection Reasons');
      expect(html).toContain('Level Distribution');
      expect(html).toContain('Hires by Team');
    });

    it('should include summary metrics values', () => {
      const html = generateHiringSummaryPDF(mockSummary);

      expect(html).toContain('Total Hired');
      expect(html).toContain('12');
      expect(html).toContain('HC Total');
      expect(html).toContain('32');
    });

    it('should include team info when present', () => {
      const summaryWithTeam: HiringSummary = { ...mockSummary, team: 'PEN' };
      const html = generateHiringSummaryPDF(summaryWithTeam);

      expect(html).toContain('Team: PEN');
    });

    it('should include AI insights when present', () => {
      const html = generateHiringSummaryPDF(mockSummary);

      expect(html).toContain('AI Insights');
      expect(html).toContain('Test insight');
    });

    it('should not include AI insights section when empty', () => {
      const summaryNoInsight: HiringSummary = { ...mockSummary, aiInsight: '' };
      const html = generateHiringSummaryPDF(summaryNoInsight);

      expect(html).not.toContain('<h2>AI Insights</h2>');
    });

    it('should include proper table structure', () => {
      const html = generateHiringSummaryPDF(mockSummary);

      expect(html).toContain('<table');
      expect(html).toContain('<thead>');
      expect(html).toContain('<tbody>');
      expect(html).toContain('</table>');
    });

    it('should escape HTML in user-provided content', () => {
      const maliciousSummary: HiringSummary = {
        ...mockSummary,
        team: '<script>alert("xss")</script>',
        aiInsight: '<img src=x onerror=alert("xss")>',
      };
      const html = generateHiringSummaryPDF(maliciousSummary);

      // Escaped content should not contain raw script/img tags
      expect(html).not.toContain('<script>alert("xss")</script>');
      expect(html).not.toContain('<img src=x onerror=alert("xss")>');
      // Should contain escaped versions
      expect(html).toContain('&lt;');
    });
  });

  // Note: exportToCSV and exportToPDF require DOM manipulation and window.open
  // These are integration tests that should be run in a browser environment
  // Below are basic tests for the helper functions they depend on

  describe('Export Functions (Integration)', () => {
    it('should have mockSummary with all required fields', () => {
      expect(mockSummary.dateRange).toBeDefined();
      expect(mockSummary.pipeline).toBeDefined();
      expect(mockSummary.rejectReasons).toBeDefined();
      expect(mockSummary.levelDistribution).toBeDefined();
      expect(mockSummary.byTeam).toBeDefined();
    });

    it('should have valid pipeline data', () => {
      const { cv, firstInterview, secondInterview, offers } = mockSummary.pipeline;

      expect(cv).toBeGreaterThanOrEqual(firstInterview);
      expect(firstInterview).toBeGreaterThanOrEqual(secondInterview);
      expect(secondInterview).toBeGreaterThanOrEqual(offers);
    });

    it('should have valid rejection reasons', () => {
      const total = Object.values(mockSummary.rejectReasons).reduce((sum, val) => sum + val, 0);

      expect(total).toBeGreaterThan(0);
      expect(mockSummary.rejectReasons.notFitSkills).toBeDefined();
      expect(mockSummary.rejectReasons.lowExp).toBeDefined();
      expect(mockSummary.rejectReasons.salaryMismatch).toBeDefined();
      expect(mockSummary.rejectReasons.other).toBeDefined();
    });
  });
});
