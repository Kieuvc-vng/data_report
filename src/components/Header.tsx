import { useAuthStore } from '../stores/authStore';

export function Header() {
  const { userRole, userTeam } = useAuthStore();

  const displayName = userRole === 'head_of_ta'
    ? 'Head of TA'
    : `HRBP - ${userTeam}`;

  const handleLogout = () => {
    // MVP: Just log (actual logout in Phase 2)
    console.log('Logout clicked');
  };

  return (
    <header className="bg-gray-900 text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center font-bold">
            HD
          </div>
          <h1 className="text-xl font-bold">Hiring Dashboard</h1>
        </div>

        {/* Right: User Info */}
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p className="font-medium">{displayName}</p>
            <p className="text-gray-300 text-xs">
              {userRole === 'head_of_ta' ? 'All Teams' : userTeam}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
