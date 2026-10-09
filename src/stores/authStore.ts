import { create } from 'zustand';
import type { UserRole } from '../types';

interface AuthState {
  userRole: UserRole;
  userTeam?: string;
  setUser(role: UserRole, team?: string): void;
  getAccessLevel(): 'all' | 'team-only';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userRole: 'head_of_ta',
  userTeam: undefined,
  setUser: (role, team) => set({ userRole: role, userTeam: team }),
  getAccessLevel: () => {
    const { userRole } = get();
    return userRole === 'head_of_ta' ? 'all' : 'team-only';
  },
}));
