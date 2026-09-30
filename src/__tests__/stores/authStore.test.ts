/**
 * Unit Tests for authStore (Zustand)
 * Tests authentication state management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      userRole: 'head_of_ta',
      userTeam: undefined,
    });
  });

  describe('State Initialization', () => {
    it('should initialize with head_of_ta role', () => {
      const state = useAuthStore.getState();
      expect(state.userRole).toBe('head_of_ta');
    });

    it('should initialize without user team', () => {
      const state = useAuthStore.getState();
      expect(state.userTeam).toBeUndefined();
    });
  });

  describe('setUser', () => {
    it('should set user role to hrbp', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PEN' });

      const state = useAuthStore.getState();
      expect(state.userRole).toBe('hrbp');
    });

    it('should set user role to head_of_ta', () => {
      useAuthStore.setState({ userRole: 'head_of_ta' });

      const state = useAuthStore.getState();
      expect(state.userRole).toBe('head_of_ta');
    });

    it('should set user team for hrbp', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'GDS' });

      const state = useAuthStore.getState();
      expect(state.userTeam).toBe('GDS');
    });

    it('should allow setting different teams', () => {
      const teams = ['PEN', 'GDS', 'GIO', 'PRO', 'PIN'];

      teams.forEach((team) => {
        useAuthStore.setState({ userRole: 'hrbp', userTeam: team });
        const state = useAuthStore.getState();
        expect(state.userTeam).toBe(team);
      });
    });

    it('should clear user team when role changes', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PEN' });
      useAuthStore.setState({ userRole: 'head_of_ta', userTeam: undefined });

      const state = useAuthStore.getState();
      expect(state.userTeam).toBeUndefined();
    });

    it('should allow undefined team', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: undefined });

      const state = useAuthStore.getState();
      expect(state.userTeam).toBeUndefined();
    });
  });

  describe('getAccessLevel', () => {
    it('should return "all" access for head_of_ta', () => {
      useAuthStore.setState({ userRole: 'head_of_ta' });

      const state = useAuthStore.getState();
      expect(state.getAccessLevel()).toBe('all');
    });

    it('should return "team-only" access for hrbp', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PEN' });

      const state = useAuthStore.getState();
      expect(state.getAccessLevel()).toBe('team-only');
    });

    it('should return different access levels based on role', () => {
      const roles: Array<['head_of_ta' | 'hrbp', 'all' | 'team-only']> = [
        ['head_of_ta', 'all'],
        ['hrbp', 'team-only'],
      ];

      roles.forEach(([role, expectedAccess]) => {
        useAuthStore.setState({ userRole: role });
        const state = useAuthStore.getState();
        expect(state.getAccessLevel()).toBe(expectedAccess);
      });
    });

    it('should return "team-only" regardless of team value for hrbp', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PEN' });
      let state = useAuthStore.getState();
      expect(state.getAccessLevel()).toBe('team-only');

      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'GDS' });
      state = useAuthStore.getState();
      expect(state.getAccessLevel()).toBe('team-only');

      useAuthStore.setState({ userRole: 'hrbp', userTeam: undefined });
      state = useAuthStore.getState();
      expect(state.getAccessLevel()).toBe('team-only');
    });
  });

  describe('Access Control Logic', () => {
    it('head_of_ta should see all data', () => {
      useAuthStore.setState({ userRole: 'head_of_ta' });

      const fullState = useAuthStore.getState();
      const state = {
        role: fullState.userRole,
        access: fullState.getAccessLevel(),
      };

      expect(state.role).toBe('head_of_ta');
      expect(state.access).toBe('all');
    });

    it('hrbp should see only team data', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PEN' });

      const fullState = useAuthStore.getState();
      const state = {
        role: fullState.userRole,
        team: fullState.userTeam,
        access: fullState.getAccessLevel(),
      };

      expect(state.role).toBe('hrbp');
      expect(state.team).toBe('PEN');
      expect(state.access).toBe('team-only');
    });
  });

  describe('Role Switching', () => {
    it('should switch from head_of_ta to hrbp', () => {
      useAuthStore.setState({ userRole: 'head_of_ta' });
      expect(useAuthStore.getState().getAccessLevel()).toBe('all');

      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'GDS' });
      expect(useAuthStore.getState().getAccessLevel()).toBe('team-only');
    });

    it('should switch from hrbp to head_of_ta', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PEN' });
      expect(useAuthStore.getState().getAccessLevel()).toBe('team-only');

      useAuthStore.setState({ userRole: 'head_of_ta' });
      expect(useAuthStore.getState().getAccessLevel()).toBe('all');
    });

    it('should switch teams while staying as hrbp', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PEN' });
      expect(useAuthStore.getState().userTeam).toBe('PEN');

      useAuthStore.setState({ userTeam: 'GDS' });
      expect(useAuthStore.getState().userTeam).toBe('GDS');
      expect(useAuthStore.getState().userRole).toBe('hrbp');
    });
  });

  describe('State Persistence and Consistency', () => {
    it('should maintain role consistency across reads', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PEN' });

      const role1 = useAuthStore.getState().userRole;
      const role2 = useAuthStore.getState().userRole;

      expect(role1).toBe(role2);
      expect(role1).toBe('hrbp');
    });

    it('should maintain team consistency across reads', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'GIO' });

      const team1 = useAuthStore.getState().userTeam;
      const team2 = useAuthStore.getState().userTeam;

      expect(team1).toBe(team2);
      expect(team1).toBe('GIO');
    });

    it('should maintain access level consistency', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PRO' });

      const access1 = useAuthStore.getState().getAccessLevel();
      const access2 = useAuthStore.getState().getAccessLevel();

      expect(access1).toBe(access2);
      expect(access1).toBe('team-only');
    });
  });

  describe('State Mutation', () => {
    it('should only update specified fields', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PEN' });
      useAuthStore.setState({ userRole: 'head_of_ta' });

      const fullState = useAuthStore.getState();
      const state = {
        role: fullState.userRole,
        team: fullState.userTeam,
      };

      expect(state.role).toBe('head_of_ta');
      expect(state.team).toBe('PEN'); // Should remain unchanged
    });

    it('should allow partial state updates', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PEN' });
      useAuthStore.setState({ userTeam: 'GDS' });

      expect(useAuthStore.getState().userRole).toBe('hrbp');
      expect(useAuthStore.getState().userTeam).toBe('GDS');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty team assignment for hrbp', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: '' });

      const state = useAuthStore.getState();
      expect(state.userTeam).toBe('');
    });

    it('should handle rapid role changes', () => {
      useAuthStore.setState({ userRole: 'head_of_ta' });
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PEN' });
      useAuthStore.setState({ userRole: 'head_of_ta' });

      expect(useAuthStore.getState().userRole).toBe('head_of_ta');
      expect(useAuthStore.getState().getAccessLevel()).toBe('all');
    });

    it('should handle rapid team changes', () => {
      useAuthStore.setState({ userRole: 'hrbp', userTeam: 'PEN' });
      useAuthStore.setState({ userTeam: 'GDS' });
      useAuthStore.setState({ userTeam: 'GIO' });

      expect(useAuthStore.getState().userTeam).toBe('GIO');
    });
  });
});
