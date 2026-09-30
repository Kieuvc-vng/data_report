/**
 * Export Utilities
 * Provides functions for exporting data to CSV and PDF formats
 */

import Papa from 'papaparse';
import type { HiringSummary, Position } from '../types';
import { formatDate, formatNumber } from './formatUtils';
import {
  transformPipelineData,
  transformRejectReasonsData,
  transformLevelDistributionData,
  transformByTeamData,
} from './dataTransformUtils';

/**
 * Exports HiringSummary data to CSV format
 * @param data - HiringSummary object to export
 * @param filename - Optional filename (default: 'hiring-summary.csv')
 */
export const exportToCSV = (data: HiringSummary, filename: string = 'hiring-summary.csv'): void => {
  try {
    const csvContent = generateCSVContent(data);
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export data to CSV');
  }
};

/**
 * Exports HiringSummary data to PDF format
 * Uses browser's print API to generate PDF
 * @param summary - HiringSummary object to export
 * @param filename - Optional filename (default: 'hiring-summary.pdf')
 */
export const exportToPDF = (summary: HiringSummary, filename: string = 'hiring-summary.pdf'): void => {
  try {
    const htmlContent = generatePDFContent(summary);
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      throw new Error('Failed to open print window. Please check popup blockers.');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      // Set document title for PDF
      printWindow.document.title = filename.replace('.pdf', '');

      // Trigger print dialog
      setTimeout(() => {
        printWindow.print();
        // Note: Closing is handled by user choice (they can save or cancel)
      }, 250);
    };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export data to PDF');
  }
};

/**
 * Generates CSV content from HiringSummary
 * @param data - HiringSummary object
 * @returns CSV content string
 */
const generateCSVContent = (data: HiringSummary): string => {
  const rows: string[][] = [];

  // Title and date range
  rows.push(['Hiring Analytics Report']);
  rows.push([]);
  rows.push(['Date Range', `${formatDate(data.dateRange.start)} - ${formatDate(data.dateRange.end)}`]);
  if (data.team) {
    rows.push(['Team', data.team]);
  }
  rows.push([]);

  // Summary Metrics Section
  rows.push(['SUMMARY METRICS']);
  rows.push(['Metric', 'Value']);
  rows.push(['Total Hired', data.totalHired.toString()]);
  rows.push(['HC Total', data.hcTotal.toString()]);
  rows.push(['Salary Range', data.salaryRange]);
  rows.push(['CVs Received', data.pipeline.cv.toString()]);
  rows.push([]);

  // Pipeline Section
  rows.push(['PIPELINE PROGRESSION']);
  rows.push(['Stage', 'Count', 'Percentage']);
  const pipelineData = transformPipelineData(data);
  pipelineData.forEach(stage => {
    rows.push([stage.name, stage.value.toString(), `${stage.percentage}%`]);
  });
  rows.push([]);

  // Rejection Reasons Section
  rows.push(['REJECTION REASONS']);
  rows.push(['Reason', 'Count', 'Percentage']);
  const rejectData = transformRejectReasonsData(data);
  rejectData.forEach(reason => {
    rows.push([reason.name, reason.value.toString(), `${reason.percentage}%`]);
  });
  rows.push([]);

  // Level Distribution Section
  rows.push(['LEVEL DISTRIBUTION']);
  rows.push(['Level', 'Count', 'Percentage']);
  const levelData = transformLevelDistributionData(data);
  levelData.forEach(level => {
    rows.push([level.name, level.value.toString(), `${level.percentage}%`]);
  });
  rows.push([]);

  // By Team Section
  rows.push(['HIRES BY TEAM']);
  rows.push(['Team', 'Count', 'Percentage']);
  const teamData = transformByTeamData(data);
  teamData.forEach(team => {
    rows.push([team.name, team.value.toString(), `${team.percentage}%`]);
  });
  rows.push([]);

  // AI Insight Section
  if (data.aiInsight) {
    rows.push(['AI INSIGHTS']);
    rows.push([data.aiInsight]);
  }

  // Convert to CSV using Papa Parse
  return Papa.unparse(rows);
};

/**
 * Generates printable HTML content for PDF export
 * @param summary - HiringSummary object
 * @returns HTML string
 */
const generatePDFContent = (summary: HiringSummary): string => {
  const dateRangeStr = `${formatDate(summary.dateRange.start)} - ${formatDate(summary.dateRange.end)}`;
  const pipelineData = transformPipelineData(summary);
  const rejectData = transformRejectReasonsData(summary);
  const levelData = transformLevelDistributionData(summary);
  const teamData = transformByTeamData(summary);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hiring Analytics Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9fafb;
          padding: 20px;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        header {
          margin-bottom: 30px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
        }

        h1 {
          font-size: 28px;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .date-range {
          font-size: 14px;
          color: #6b7280;
        }

        .team-info {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }

        section {
          margin-bottom: 32px;
        }

        h2 {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .metric-card {
          padding: 16px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }

        .metric-card.blue { background-color: #dbeafe; border-color: #93c5fd; }
        .metric-card.purple { background-color: #ede9fe; border-color: #d8b4fe; }
        .metric-card.green { background-color: #dcfce7; border-color: #86efac; }
        .metric-card.amber { background-color: #fef3c7; border-color: #fcd34d; }

        .metric-label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          font-size: 13px;
        }

        th {
          background-color: #f3f4f6;
          padding: 10px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
          color: #374151;
        }

        td {
          padding: 8px 10px;
          border-bottom: 1px solid #e5e7eb;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .number {
          text-align: right;
          font-weight: 500;
        }

        .ai-insight {
          padding: 16px;
          background-color: #f0f9ff;
          border-left: 4px solid #0284c7;
          border-radius: 4px;
          line-height: 1.6;
          font-size: 13px;
          color: #0c4a6e;
        }

        .page-break {
          page-break-after: always;
        }

        @media print {
          body {
            padding: 0;
            background-color: white;
          }
          .container {
            max-width: 100%;
            padding: 0;
            margin: 0;
            box-shadow: none;
            border-radius: 0;
          }
          section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>Hiring Analytics Report</h1>
          <div class="date-range">${dateRangeStr}</div>
          ${summary.team ? `<div class="team-info">Team: ${summary.team}</div>` : ''}
        </header>

        <section>
          <h2>Summary Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-card blue">
              <div class="metric-label">Total Hired</div>
              <div class="metric-value">${summary.totalHired}</div>
            </div>
            <div class="metric-card purple">
              <div class="metric-label">HC Total</div>
              <div class="metric-value">${summary.hcTotal}</div>
            </div>
            <div class="metric-card green">
              <div class="metric-label">CVs Received</div>
              <div class="metric-value">${formatNumber(summary.pipeline.cv)}</div>
            </div>
            <div class="metric-card amber">
              <div class="metric-label">Salary Range</div>
              <div class="metric-value">${summary.salaryRange}</div>
            </div>
          </div>
        </section>

        <section>
          <h2>Pipeline Progression</h2>
          <table>
            <thead>
              <tr>
                <th>Stage</th>
                <th class="number">Count</th>
                <th class="number">Progress</th>
              </tr>
            </thead>
            <tbody>
              ${pipelineData.map(stage => `
                <tr>
                  <td>${stage.name}</td>
                  <td class="number">${formatNumber(stage.value)}</td>
                  <td class="number">${stage.percentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Rejection Reasons</h2>
          <table>
            <thead>
              <tr>
                <th>Reason</th>
                <th class="number">Count</th>
                <th class="number">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${rejectData.map(reason => `
                <tr>
                  <td>${reason.name}</td>
                  <td class="number">${formatNumber(reason.value)}</td>
                  <td class="number">${reason.percentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Level Distribution</h2>
          <table>
            <thead>
              <tr>
                <th>Level</th>
                <th class="number">Count</th>
                <th class="number">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${levelData.map(level => `
                <tr>
                  <td>${level.name}</td>
                  <td class="number">${formatNumber(level.value)}</td>
                  <td class="number">${level.percentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Hires by Team</h2>
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th class="number">Count</th>
                <th class="number">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${teamData.map(team => `
                <tr>
                  <td>${team.name}</td>
                  <td class="number">${formatNumber(team.value)}</td>
                  <td class="number">${team.percentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        ${summary.aiInsight ? `
          <section>
            <h2>AI Insights</h2>
            <div class="ai-insight">${summary.aiInsight}</div>
          </section>
        ` : ''}
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

/**
 * Exports positions data to CSV format
 * @param positions - Array of positions to export
 * @param filename - Optional filename
 */
export const exportPositionsToCSV = (positions: Position[], filename: string = 'positions.csv'): void => {
  try {
    const rows: string[][] = [
      ['ID', 'Team', 'Title', 'Level', 'Salary Range', 'HC', 'Priority', 'Status', 'CVs', '1st Interview', '2nd Interview', 'Offers', 'Created Date', 'Est. Fill Days'],
    ];

    positions.forEach(pos => {
      rows.push([
        pos.id,
        pos.team,
        pos.title,
        pos.level,
        pos.salary,
        pos.hc.toString(),
        pos.priority,
        pos.status,
        pos.pipeline.cv.toString(),
        pos.pipeline.firstInterview.toString(),
        pos.pipeline.secondInterview.toString(),
        pos.pipeline.offers.toString(),
        formatDate(pos.createdDate),
        pos.estimatedFillDays.toString(),
      ]);
    });

    const csvContent = Papa.unparse(rows);
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  } catch (error) {
    console.error('Error exporting positions to CSV:', error);
    throw new Error('Failed to export positions to CSV');
  }
};

/**
 * Helper function to trigger file download
 * @param content - File content
 * @param filename - Filename
 * @param type - MIME type
 */
const downloadFile = (content: string, filename: string, type: string): void => {
  const element = document.createElement('a');
  const file = new Blob([content], { type });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
};

/**
 * Generates a timestamp-based filename
 * @param prefix - Filename prefix
 * @param extension - File extension
 * @returns Filename with timestamp
 */
export const generateFilename = (prefix: string = 'hiring-report', extension: string = 'csv'): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}-${timestamp}.${extension}`;
};
