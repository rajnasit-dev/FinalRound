import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Search, UserPlus } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import PlayerCard from "../../components/ui/PlayerCard";
import SearchBar from "../../components/ui/SearchBar";
import FilterDropdown from "../../components/ui/FilterDropdown";
import { fetchManagerTeams } from "../../store/slices/teamSlice";

const ManagerPlayers = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { managerTeams, loading } = useSelector((state) => state.team);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All");

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchManagerTeams(user._id));
    }
  }, [dispatch, user]);

  // Get all players from all teams
  const allPlayers = managerTeams?.flatMap((team) =>
    (team.players || []).map((player) => ({
      ...player,
      teamName: team.name,
      teamId: team._id,
    }))
  ) || [];

  // Filter players
  const filteredPlayers = allPlayers.filter((player) => {
    const matchesSearch =
      searchQuery === "" ||
      player.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.teamName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTeam =
      selectedTeam === "All" || player.teamId === selectedTeam;

    return matchesSearch && matchesTeam;
  });

  // Team options for filter
  const teamOptions = [
    { value: "All", label: "All Teams" },
    ...(managerTeams || []).map((team) => ({
      value: team._id,
      label: team.name,
    })),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" text="Loading players..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          Team Players
        </h1>
        <p className="text-base dark:text-base-dark">
          View and manage players across all your teams
        </p>
      </div>

      {/* Search and Filter */}
      {allPlayers.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search players by name, city, or team..."
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
          <FilterDropdown
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            options={teamOptions}
          />
        </div>
      )}

      {/* Results Count */}
      {allPlayers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-base dark:text-base-dark">
            Showing {filteredPlayers.length} of {allPlayers.length} players
          </p>
          <div className="flex items-center gap-2 text-base dark:text-base-dark">
            <Users className="w-5 h-5" />
            <span>
              {managerTeams?.length || 0} {managerTeams?.length === 1 ? "team" : "teams"}
            </span>
          </div>
        </div>
      )}

      {/* Players Grid */}
      {filteredPlayers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <div key={`${player._id}-${player.teamId}`}>
              <PlayerCard player={player} />
              <div className="mt-2 px-4 py-2 bg-card-background dark:bg-card-background-dark rounded-lg border border-base-dark dark:border-base">
                <p className="text-sm text-base dark:text-base-dark">
                  Team: <span className="font-semibold text-text-primary dark:text-text-primary-dark">{player.teamName}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : allPlayers.length > 0 ? (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-base dark:text-base-dark" />
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            No players found
          </h3>
          <p className="text-base dark:text-base-dark">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <UserPlus className="w-16 h-16 mx-auto mb-4 text-base dark:text-base-dark" />
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            No players yet
          </h3>
          <p className="text-base dark:text-base-dark mb-6">
            Add players to your teams to see them here
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagerPlayers;
