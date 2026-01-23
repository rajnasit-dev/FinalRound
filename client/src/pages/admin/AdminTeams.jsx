import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTeams } from "../../store/slices/adminSlice";
import { Users, Trophy, Trash2, Edit2 } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import SearchBar from "../../components/ui/SearchBar";

const AdminTeams = () => {
  const dispatch = useDispatch();
  const { teams, loading, error } = useSelector((state) => state.admin);
  const [search, setSearch] = useState("");
  const [filteredTeams, setFilteredTeams] = useState([]);

  useEffect(() => {
    dispatch(getAllTeams({ search: "", page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    let filtered = teams || [];

    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.name?.toLowerCase().includes(search.toLowerCase()) ||
          t.city?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredTeams(filtered);
  }, [teams, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Error</p>
          <p className="text-text-primary dark:text-text-primary-dark">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Team Management
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          View and manage all teams
        </p>
      </div>

      {/* Search Filter */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar
            placeholder="Search by team name or city..."
            searchQuery={search}
            setSearchQuery={setSearch}
          />
          <div className="flex items-center justify-start">
            <span className="text-sm text-base dark:text-base-dark font-medium">
              Total Teams: {filteredTeams.length}
            </span>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.length === 0 ? (
          <div className="col-span-full bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto text-base dark:text-base-dark opacity-50 mb-4" />
            <p className="text-base dark:text-base-dark">No teams found</p>
          </div>
        ) : (
          filteredTeams.map((team) => (
            <div
              key={team._id}
              className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6 space-y-4 hover:shadow-lg transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                    {team.name}
                  </h3>
                  <p className="text-sm text-base dark:text-base-dark mt-1">
                    {team.sport?.name || "Unknown Sport"}
                  </p>
                </div>
                {team.logoUrl && (
                  <img
                    src={team.logoUrl}
                    alt={team.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
              </div>

              {/* City and Status */}
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                  {team.city || "N/A"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  team.isActive
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                }`}>
                  {team.isActive ? "Active" : "Inactive"}
                </span>
                {team.openToJoin && (
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                    Open to Join
                  </span>
                )}
              </div>

              {/* Players Count */}
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                <span>
                  {team.players?.length || 0} Players
                </span>
              </div>

              {/* Description */}
              {team.description && (
                <p className="text-sm text-base dark:text-base-dark line-clamp-2">
                  {team.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-base-dark dark:border-base">
                <button className="flex-1 px-3 py-2 text-secondary hover:bg-secondary hover:text-white dark:hover:bg-secondary rounded-lg transition text-sm font-medium border border-secondary">
                  <Edit2 className="w-4 h-4 inline mr-2" />
                  Edit
                </button>
                <button className="flex-1 px-3 py-2 text-red-600 hover:bg-red-100/20 dark:hover:bg-red-900/20 rounded-lg transition text-sm font-medium border border-red-600/30">
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTeams;
