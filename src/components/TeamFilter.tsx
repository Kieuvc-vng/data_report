import clsx from 'clsx';

const TEAMS = ['All Teams', 'PEN', 'GDS', 'GIO', 'PRO', 'PIN'];

interface TeamFilterProps {
  activeTeam: string;
  onTeamChange: (team: string) => void;
}

export function TeamFilter({ activeTeam, onTeamChange }: TeamFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <label className="block text-sm font-semibold text-gray-600 uppercase mb-4">
        Team Filter
      </label>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {TEAMS.map((team) => (
          <button
            key={team}
            onClick={() => onTeamChange(team)}
            className={clsx(
              'px-3 sm:px-4 py-3 sm:py-2 rounded-md font-medium text-sm transition-all whitespace-nowrap min-h-[44px] sm:min-h-fit flex items-center justify-center',
              activeTeam === team
                ? 'bg-blue-500 text-white border-2 border-blue-600'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
            )}
          >
            {team}
          </button>
        ))}
      </div>
    </div>
  );
}
