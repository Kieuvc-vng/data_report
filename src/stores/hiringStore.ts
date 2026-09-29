import { create } from 'zustand';
import type { Position, Candidate } from '../types';

interface HiringState {
  positions: Position[];
  candidates: Candidate[];
  currentTeam: string;
  setPositions(positions: Position[]): void;
  setCandidates(candidates: Candidate[]): void;
  setCurrentTeam(team: string): void;
  getVisiblePositions(): Position[];
  getVisibleCandidates(): Candidate[];
}

export const useHiringStore = create<HiringState>((set, get) => ({
  positions: [],
  candidates: [],
  currentTeam: 'All Teams',
  setPositions: (positions) => set({ positions }),
  setCandidates: (candidates) => set({ candidates }),
  setCurrentTeam: (team) => set({ currentTeam: team }),
  getVisiblePositions: () => {
    const { positions, currentTeam } = get();
    if (currentTeam === 'All Teams') return positions;
    return positions.filter((p) => p.team === currentTeam);
  },
  getVisibleCandidates: () => {
    const { candidates, currentTeam } = get();
    if (currentTeam === 'All Teams') return candidates;
    return candidates.filter((c) => c.team === currentTeam);
  },
}));
