/**
 * Unit Tests for hiringStore (Zustand)
 * Tests state management and getters
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useHiringStore } from '../../stores/hiringStore';
import type { Position, Candidate } from '../../types';

describe('hiringStore', () => {
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

  const mockCandidates: Candidate[] = [
    {
      id: 'cand_1',
      name: 'John Doe',
      previousCompany: 'Company A',
      industry: 'Tech',
      education: 'BS Computer Science',
      salary: '$70K',
      hireDate: '2026-08-15',
      position: 'Senior Engineer',
      team: 'PEN',
    },
    {
      id: 'cand_2',
      name: 'Jane Smith',
      previousCompany: 'Company B',
      industry: 'Finance',
      education: 'MBA',
      salary: '$80K',
      hireDate: '2026-08-20',
      position: 'Data Analyst',
      team: 'GDS',
    },
  ];

  beforeEach(() => {
    // Reset store state before each test
    useHiringStore.setState({
      positions: [],
      candidates: [],
      currentTeam: 'All Teams',
    });
  });

  describe('State Initialization', () => {
    it('should initialize with empty positions', () => {
      const state = useHiringStore.getState();
      expect(state.positions).toEqual([]);
    });

    it('should initialize with empty candidates', () => {
      const state = useHiringStore.getState();
      expect(state.candidates).toEqual([]);
    });

    it('should initialize with "All Teams"', () => {
      const state = useHiringStore.getState();
      expect(state.currentTeam).toBe('All Teams');
    });
  });

  describe('setPositions', () => {
    it('should set positions in store', () => {
      useHiringStore.setState({ positions: mockPositions });

      const state = useHiringStore.getState();
      expect(state.positions).toEqual(mockPositions);
      expect(state.positions.length).toBe(2);
    });

    it('should replace previous positions', () => {
      useHiringStore.setState({ positions: [mockPositions[0]] });
      expect(useHiringStore.getState().positions.length).toBe(1);

      useHiringStore.setState({ positions: mockPositions });
      expect(useHiringStore.getState().positions.length).toBe(2);
    });

    it('should handle empty array', () => {
      useHiringStore.setState({ positions: mockPositions });
      useHiringStore.setState({ positions: [] });

      const state = useHiringStore.getState();
      expect(state.positions).toEqual([]);
    });

    it('should set different position objects', () => {
      const newPositions = [
        { ...mockPositions[0], id: 'pos_new_1' },
        { ...mockPositions[1], id: 'pos_new_2' },
      ];

      useHiringStore.setState({ positions: newPositions });

      const state = useHiringStore.getState();
      expect(state.positions[0].id).toBe('pos_new_1');
      expect(state.positions[1].id).toBe('pos_new_2');
    });
  });

  describe('setCandidates', () => {
    it('should set candidates in store', () => {
      useHiringStore.setState({ candidates: mockCandidates });

      const state = useHiringStore.getState();
      expect(state.candidates).toEqual(mockCandidates);
      expect(state.candidates.length).toBe(2);
    });

    it('should replace previous candidates', () => {
      useHiringStore.setState({ candidates: [mockCandidates[0]] });
      expect(useHiringStore.getState().candidates.length).toBe(1);

      useHiringStore.setState({ candidates: mockCandidates });
      expect(useHiringStore.getState().candidates.length).toBe(2);
    });

    it('should handle empty array', () => {
      useHiringStore.setState({ candidates: mockCandidates });
      useHiringStore.setState({ candidates: [] });

      const state = useHiringStore.getState();
      expect(state.candidates).toEqual([]);
    });
  });

  describe('setCurrentTeam', () => {
    it('should set current team', () => {
      useHiringStore.setState({ currentTeam: 'PEN' });

      const state = useHiringStore.getState();
      expect(state.currentTeam).toBe('PEN');
    });

    it('should change team from "All Teams"', () => {
      useHiringStore.setState({ currentTeam: 'GDS' });

      const state = useHiringStore.getState();
      expect(state.currentTeam).toBe('GDS');
    });

    it('should change back to "All Teams"', () => {
      useHiringStore.setState({ currentTeam: 'PEN' });
      useHiringStore.setState({ currentTeam: 'All Teams' });

      const state = useHiringStore.getState();
      expect(state.currentTeam).toBe('All Teams');
    });

    it('should accept any team value', () => {
      useHiringStore.setState({ currentTeam: 'PIN' });
      expect(useHiringStore.getState().currentTeam).toBe('PIN');

      useHiringStore.setState({ currentTeam: 'PRO' });
      expect(useHiringStore.getState().currentTeam).toBe('PRO');
    });
  });

  describe('getVisiblePositions', () => {
    it('should return all positions when team is "All Teams"', () => {
      useHiringStore.setState({ positions: mockPositions, currentTeam: 'All Teams' });

      const state = useHiringStore.getState();
      const visible = state.getVisiblePositions();

      expect(visible).toEqual(mockPositions);
      expect(visible.length).toBe(2);
    });

    it('should return filtered positions for specific team', () => {
      useHiringStore.setState({ positions: mockPositions, currentTeam: 'PEN' });

      const state = useHiringStore.getState();
      const visible = state.getVisiblePositions();

      expect(visible).toEqual([mockPositions[0]]);
      expect(visible.length).toBe(1);
      expect(visible[0].team).toBe('PEN');
    });

    it('should return empty array for team with no positions', () => {
      useHiringStore.setState({ positions: mockPositions, currentTeam: 'PRO' });

      const state = useHiringStore.getState();
      const visible = state.getVisiblePositions();

      expect(visible).toEqual([]);
    });

    it('should return all positions for different team filters', () => {
      useHiringStore.setState({ positions: mockPositions, currentTeam: 'GDS' });

      const state = useHiringStore.getState();
      const visible = state.getVisiblePositions();

      expect(visible.length).toBe(1);
      expect(visible[0].team).toBe('GDS');
    });

    it('should handle empty positions array', () => {
      useHiringStore.setState({ positions: [], currentTeam: 'PEN' });

      const state = useHiringStore.getState();
      const visible = state.getVisiblePositions();

      expect(visible).toEqual([]);
    });
  });

  describe('getVisibleCandidates', () => {
    it('should return all candidates when team is "All Teams"', () => {
      useHiringStore.setState({ candidates: mockCandidates, currentTeam: 'All Teams' });

      const state = useHiringStore.getState();
      const visible = state.getVisibleCandidates();

      expect(visible).toEqual(mockCandidates);
      expect(visible.length).toBe(2);
    });

    it('should return filtered candidates for specific team', () => {
      useHiringStore.setState({ candidates: mockCandidates, currentTeam: 'PEN' });

      const state = useHiringStore.getState();
      const visible = state.getVisibleCandidates();

      expect(visible.length).toBe(1);
      expect(visible[0].team).toBe('PEN');
    });

    it('should return empty array for team with no candidates', () => {
      useHiringStore.setState({ candidates: mockCandidates, currentTeam: 'PRO' });

      const state = useHiringStore.getState();
      const visible = state.getVisibleCandidates();

      expect(visible).toEqual([]);
    });

    it('should handle empty candidates array', () => {
      useHiringStore.setState({ candidates: [], currentTeam: 'PEN' });

      const state = useHiringStore.getState();
      const visible = state.getVisibleCandidates();

      expect(visible).toEqual([]);
    });
  });

  describe('State Isolation', () => {
    it('should not affect positions when setting candidates', () => {
      useHiringStore.setState({ positions: mockPositions });
      useHiringStore.setState({ candidates: mockCandidates });

      const state = useHiringStore.getState();
      expect(state.positions).toEqual(mockPositions);
    });

    it('should not affect candidates when setting positions', () => {
      useHiringStore.setState({ candidates: mockCandidates });
      useHiringStore.setState({ positions: mockPositions });

      const state = useHiringStore.getState();
      expect(state.candidates).toEqual(mockCandidates);
    });

    it('should not affect team when setting positions', () => {
      useHiringStore.setState({ currentTeam: 'PEN' });
      useHiringStore.setState({ positions: mockPositions });

      const state = useHiringStore.getState();
      expect(state.currentTeam).toBe('PEN');
    });
  });

  describe('Filter Behavior', () => {
    it('should update filtered results when team changes', () => {
      useHiringStore.setState({ positions: mockPositions, currentTeam: 'All Teams' });
      let state = useHiringStore.getState();
      expect(state.getVisiblePositions().length).toBe(2);

      useHiringStore.setState({ currentTeam: 'PEN' });
      state = useHiringStore.getState();
      expect(state.getVisiblePositions().length).toBe(1);
    });

    it('should update filtered results when positions change', () => {
      useHiringStore.setState({ currentTeam: 'PEN' });
      useHiringStore.setState({ positions: mockPositions });

      let state = useHiringStore.getState();
      expect(state.getVisiblePositions().length).toBe(1);

      const newPositions = [
        { ...mockPositions[0], id: 'pos_3', team: 'PEN' },
        { ...mockPositions[1], team: 'PEN' },
      ];
      useHiringStore.setState({ positions: newPositions });

      state = useHiringStore.getState();
      expect(state.getVisiblePositions().length).toBe(2);
    });
  });
});
