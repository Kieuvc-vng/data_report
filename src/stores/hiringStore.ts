import { create } from 'zustand';
import type { Position, Candidate } from '../types';

interface HiringState {
  positions: Position[];
  candidates: Candidate[];
  currentDept: string;
  setPositions(positions: Position[]): void;
  setCandidates(candidates: Candidate[]): void;
  setcurrentDept(team: string): void;
  getVisiblePositions(): Position[];
  getVisibleCandidates(): Candidate[];
}

export const useHiringStore = create<HiringState>((set, get) => ({
  positions: [],
  candidates: [],
  currentDept: 'All Teams',
  setPositions: (positions) => set({ positions }),
  setCandidates: (candidates) => set({ candidates }),
  setcurrentDept: (team) => set({ currentDept: team }),
  getVisiblePositions: () => {
    const { positions, currentDept } = get();
    if (currentDept === 'All Teams') return positions;
    return positions.filter((p) => p.department === currentDept);
  },
  getVisibleCandidates: () => {
    const { candidates, currentDept } = get();
    if (currentDept === 'All Teams') return candidates;
    return candidates.filter((c) => c.department === currentDept);
  },
}));

