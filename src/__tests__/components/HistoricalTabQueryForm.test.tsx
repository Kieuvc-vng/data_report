/**
 * Unit Tests for HistoricalTabQueryForm Component
 * Tests form rendering, validation, state changes, and callbacks
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HistoricalTabQueryForm, type HistoricalQueryParams } from '../../components/HistoricalTabQueryForm';

describe('HistoricalTabQueryForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('Rendering', () => {
    it('should render the form with all fields', () => {
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/team/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/position title/i)).toBeInTheDocument();
    });

    it('should render submit and clear buttons', () => {
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('should render form title', () => {
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/query historical data/i)).toBeInTheDocument();
    });

    it('should render team options', () => {
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const teamSelect = screen.getByLabelText(/team/i) as HTMLSelectElement;
      expect(teamSelect.options.length).toBe(6); // All Teams + 5 teams
      expect(teamSelect.options[0].value).toBe('All Teams');
      expect(teamSelect.options[1].value).toBe('PEN');
      expect(teamSelect.options[2].value).toBe('GDS');
    });
  });

  describe('Form State', () => {
    it('should initialize with empty values', () => {
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      expect((screen.getByLabelText(/start date/i) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/end date/i) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/position title/i) as HTMLInputElement).value).toBe('');
    });

    it('should initialize with initial values if provided', () => {
      const initialValues = {
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        team: 'PEN',
        position: 'Engineer',
      };

      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} initialValues={initialValues} />);

      expect((screen.getByLabelText(/start date/i) as HTMLInputElement).value).toBe('2026-08-01');
      expect((screen.getByLabelText(/end date/i) as HTMLInputElement).value).toBe('2026-08-31');
      expect((screen.getByLabelText(/team/i) as HTMLSelectElement).value).toBe('PEN');
      expect((screen.getByLabelText(/position title/i) as HTMLInputElement).value).toBe('Engineer');
    });

    it('should update state when inputs change', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
      const endDateInput = screen.getByLabelText(/end date/i) as HTMLInputElement;
      const positionInput = screen.getByLabelText(/position title/i) as HTMLInputElement;

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');
      await user.type(positionInput, 'Senior Engineer');

      expect(startDateInput.value).toBe('2026-08-01');
      expect(endDateInput.value).toBe('2026-08-31');
      expect(positionInput.value).toBe('Senior Engineer');
    });

    it('should update team state when dropdown changes', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const teamSelect = screen.getByLabelText(/team/i) as HTMLSelectElement;
      await user.selectOptions(teamSelect, 'GDS');

      expect(teamSelect.value).toBe('GDS');
    });
  });

  describe('Validation', () => {
    it('should show error when start date is missing', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const endDateInput = screen.getByLabelText(/end date/i);
      await user.type(endDateInput, '2026-08-31');

      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when end date is missing', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2026-08-01');

      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when start date is after end date', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-31');
      await user.type(endDateInput, '2026-08-01');

      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      expect(screen.getByText(/start date must be before end date/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not show error when dates are equal', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-15');
      await user.type(endDateInput, '2026-08-15');

      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      expect(screen.queryByText(/start date must be before end date/i)).not.toBeInTheDocument();
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with valid form data', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      const teamSelect = screen.getByLabelText(/team/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');
      await user.selectOptions(teamSelect, 'PEN');

      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2026-08-01',
          endDate: '2026-08-31',
          team: 'PEN',
        })
      );
    });

    it('should not include team when "All Teams" is selected', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');

      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2026-08-01',
          endDate: '2026-08-31',
          team: undefined,
        })
      );
    });

    it('should not include position when empty', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');

      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          position: undefined,
        })
      );
    });

    it('should include position when provided', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      const positionInput = screen.getByLabelText(/position title/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');
      await user.type(positionInput, '  Engineer  ');

      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          position: 'Engineer',
        })
      );
    });
  });

  describe('Clear Button', () => {
    it('should reset all fields when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
      const endDateInput = screen.getByLabelText(/end date/i) as HTMLInputElement;
      const teamSelect = screen.getByLabelText(/team/i) as HTMLSelectElement;
      const positionInput = screen.getByLabelText(/position title/i) as HTMLInputElement;

      // Fill in the form
      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');
      await user.selectOptions(teamSelect, 'PEN');
      await user.type(positionInput, 'Engineer');

      // Clear the form
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      // Verify all fields are reset
      expect(startDateInput.value).toBe('');
      expect(endDateInput.value).toBe('');
      expect(teamSelect.value).toBe('All Teams');
      expect(positionInput.value).toBe('');
    });

    it('should clear validation errors when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      // Try to submit with missing dates
      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      // Verify errors are shown
      expect(screen.getByText(/start date is required/i)).toBeInTheDocument();

      // Clear the form
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      // Verify errors are gone
      expect(screen.queryByText(/start date is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle position input with only whitespace', async () => {
      const user = userEvent.setup();
      render(<HistoricalTabQueryForm onSubmit={mockOnSubmit} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      const positionInput = screen.getByLabelText(/position title/i);

      await user.type(startDateInput, '2026-08-01');
      await user.type(endDateInput, '2026-08-31');
      await user.type(positionInput, '   ');

      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          position: undefined,
        })
      );
    });
  });
});
