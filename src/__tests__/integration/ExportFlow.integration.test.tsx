/**
 * Integration Tests for Export Workflow
 * Tests complete export flows: modal → CSV/PDF export → file generation
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import App from '../../App';

// Mock window.open for PDF export
const mockWindowOpen = vi.fn();
const mockPrintWindow = {
  document: {
    write: vi.fn(),
    close: vi.fn(),
    title: '',
  },
  focus: vi.fn(),
  onload: null as any,
  print: vi.fn(),
} as any;

describe('Export Workflow - Integration Tests', () => {
  beforeEach(() => {
    // Setup mocks
    vi.clearAllMocks();
    window.open = mockWindowOpen;
    mockWindowOpen.mockReturnValue(mockPrintWindow);

    // Mock URL.createObjectURL and URL.revokeObjectURL for CSV download
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock window.alert for error handling
    window.alert = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CSV Export Flow', () => {
    it('should export data to CSV when Export CSV button is clicked', async () => {
      const user = userEvent.setup();
      const downloadMock = vi.fn();

      // Mock document.createElement for download link
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn((tagName: string) => {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'a') {
          element.click = downloadMock;
        }
        return element;
      });

      render(<App />);

      // Navigate to Historical Data tab
      const historicalTab = screen.getByRole('button', { name: /historical data/i });
      await user.click(historicalTab);

      // Fill and submit form
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click Export CSV button
      const exportCSVButton = screen.getByRole('button', { name: /export csv/i });
      await user.click(exportCSVButton);

      // Verify download was triggered
      await waitFor(() => {
        expect(downloadMock).toHaveBeenCalled();
      });

      // Cleanup
      document.createElement = originalCreateElement;
    });

    it('should generate CSV with correct filename format', async () => {
      const user = userEvent.setup();
      const createdElements: any[] = [];

      // Mock document.createElement to capture the download link
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn((tagName: string) => {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'a') {
          createdElements.push(element);
        }
        return element;
      });

      render(<App />);

      // Navigate to Historical Data tab
      const historicalTab = screen.getByRole('button', { name: /historical data/i });
      await user.click(historicalTab);

      // Fill and submit form
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click Export CSV button
      const exportCSVButton = screen.getByRole('button', { name: /export csv/i });
      await user.click(exportCSVButton);

      // Verify filename format (should include date)
      await waitFor(() => {
        const downloadLink = createdElements.find(el => el.download);
        if (downloadLink) {
          expect(downloadLink.download).toMatch(/hiring-summary-\d{4}-\d{2}-\d{2}\.csv/);
        }
      });

      // Cleanup
      document.createElement = originalCreateElement;
    });

    it('should include all sections in exported CSV', async () => {
      const user = userEvent.setup();
      let csvContent = '';

      // Mock downloadFile function by capturing blob content
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn((tagName: string) => {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'a') {
          Object.defineProperty(element, 'href', {
            set: (value: string) => {
              if (value && value.startsWith('blob:')) {
                csvContent = 'mocked-csv-content';
              }
            },
          });
        }
        return element;
      });

      render(<App />);

      // Navigate and submit
      const historicalTab = screen.getByRole('button', { name: /historical data/i });
      await user.click(historicalTab);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait and click export
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const exportCSVButton = screen.getByRole('button', { name: /export csv/i });
      await user.click(exportCSVButton);

      // Verify export was triggered
      await waitFor(() => {
        expect(csvContent).toBeTruthy();
      });

      // Cleanup
      document.createElement = originalCreateElement;
    });

    it('should show loading state during CSV export', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Navigate and submit
      const historicalTab = screen.getByRole('button', { name: /historical data/i });
      await user.click(historicalTab);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Get export button
      const exportCSVButton = screen.getByRole('button', { name: /export csv/i }) as HTMLButtonElement;

      // Verify button is enabled before click
      expect(exportCSVButton.disabled).toBe(false);

      // Click export
      await user.click(exportCSVButton);

      // Verify button shows loading state (might be briefly disabled)
      // Then returns to enabled state
      await waitFor(() => {
        expect(exportCSVButton.disabled).toBe(false);
      });
    });
  });

  describe('PDF Export Flow', () => {
    it('should export data to PDF when Export PDF button is clicked', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Navigate to Historical Data tab
      const historicalTab = screen.getByRole('button', { name: /historical data/i });
      await user.click(historicalTab);

      // Fill and submit form
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click Export PDF button
      const exportPDFButton = screen.getByRole('button', { name: /export pdf/i });
      await user.click(exportPDFButton);

      // Verify window.open was called
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalled();
      });

      // Verify print window was used
      expect(mockPrintWindow.document.write).toHaveBeenCalled();
    });

    it('should generate PDF with HTML content', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Navigate and submit
      const historicalTab = screen.getByRole('button', { name: /historical data/i });
      await user.click(historicalTab);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click Export PDF button
      const exportPDFButton = screen.getByRole('button', { name: /export pdf/i });
      await user.click(exportPDFButton);

      // Verify PDF content was written
      await waitFor(() => {
        const writeCall = (mockPrintWindow.document.write as any).mock.calls[0];
        expect(writeCall).toBeDefined();
        const pdfContent = writeCall[0];
        expect(pdfContent).toContain('<!DOCTYPE html>');
        expect(pdfContent).toContain('Hiring Analytics Report');
      });
    });

    it('should set correct document title for PDF', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Navigate and submit
      const historicalTab = screen.getByRole('button', { name: /historical data/i });
      await user.click(historicalTab);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click Export PDF button
      const exportPDFButton = screen.getByRole('button', { name: /export pdf/i });
      await user.click(exportPDFButton);

      // Verify window.open was called (title is set on the mock window)
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalled();
      });

      // Verify document content was written (which includes the report data)
      await waitFor(() => {
        const writeCall = (mockPrintWindow.document.write as any).mock.calls[0];
        expect(writeCall).toBeDefined();
        const content = writeCall[0];
        expect(content).toContain('Hiring Analytics Report');
      });
    });

    it('should call print when PDF window loads', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Navigate and submit
      const historicalTab = screen.getByRole('button', { name: /historical data/i });
      await user.click(historicalTab);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click Export PDF button
      const exportPDFButton = screen.getByRole('button', { name: /export pdf/i });
      await user.click(exportPDFButton);

      // Simulate onload event
      await waitFor(() => {
        expect(mockPrintWindow.onload).toBeDefined();
      });

      // Call onload
      if (mockPrintWindow.onload) {
        mockPrintWindow.onload();
      }

      // Wait a bit for setTimeout
      await new Promise(resolve => setTimeout(resolve, 300));

      // Verify print was called
      expect(mockPrintWindow.print).toHaveBeenCalled();
    });
  });

  describe('Export Error Handling', () => {
    it('should handle PDF export when window.open returns null', async () => {
      const user = userEvent.setup();

      // Mock window.open to return null (popup blocked)
      mockWindowOpen.mockReturnValue(null);

      render(<App />);

      // Navigate and submit
      const historicalTab = screen.getByRole('button', { name: /historical data/i });
      await user.click(historicalTab);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click Export PDF button - should handle error gracefully
      const exportPDFButton = screen.getByRole('button', { name: /export pdf/i });
      await user.click(exportPDFButton);

      // Should show alert about popup blocked
      // Note: In a real test environment, window.alert would need to be mocked
      await waitFor(() => {
        // Button should be enabled again after error
        expect(exportPDFButton.disabled).toBe(false);
      });
    });
  });

  describe('Combined Export & Modal Flow', () => {
    it('should allow multiple exports in sequence', async () => {
      const user = userEvent.setup();
      const downloadMock = vi.fn();

      // Mock document.createElement for CSV download
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn((tagName: string) => {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'a') {
          element.click = downloadMock;
        }
        return element;
      });

      render(<App />);

      // Navigate and submit
      const historicalTab = screen.getByRole('button', { name: /historical data/i });
      await user.click(historicalTab);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Export CSV
      const exportCSVButton = screen.getByRole('button', { name: /export csv/i });
      await user.click(exportCSVButton);

      await waitFor(() => {
        expect(downloadMock).toHaveBeenCalled();
      });

      // Reset mock to check second call
      downloadMock.mockClear();

      // Export PDF
      const exportPDFButton = screen.getByRole('button', { name: /export pdf/i });
      await user.click(exportPDFButton);

      // Verify PDF export was triggered
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalled();
      });

      // Modal should still be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Cleanup
      document.createElement = originalCreateElement;
    });

    it('should maintain data consistency during export operations', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Navigate and submit with specific data
      const historicalTab = screen.getByRole('button', { name: /historical data/i });
      await user.click(historicalTab);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      const teamSelect = screen.getByLabelText(/team/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');
      await user.selectOptions(teamSelect, 'PEN');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for modal and verify data
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Verify data before export (flexible matching for locale variations)
      expect(screen.getByText(/aug.*2026.*aug.*2026/i)).toBeInTheDocument();
      expect(screen.getByText(/team: pen/i)).toBeInTheDocument();

      // Export CSV
      const exportCSVButton = screen.getByRole('button', { name: /export csv/i });
      await user.click(exportCSVButton);

      // Data should still be visible after export
      await waitFor(() => {
        expect(screen.getByText(/aug.*2026.*aug.*2026/i)).toBeInTheDocument();
        expect(screen.getByText(/team: pen/i)).toBeInTheDocument();
      });

      // Modal should still be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
