import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import TeamCard from "../../components/ui/TeamCard";
import SearchBar from "../../components/ui/SearchBar";
import { fetchManagerTeams } from "../../store/slices/teamSlice";

const ManagerTeams = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { managerTeams, loading } = useSelector((state) => state.team);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchManagerTeams(user._id));
    }
  }, [dispatch, user]);

  const handleEditTeam = (teamId) => {
    navigate(`/manager/teams/${teamId}/edit`);
  };
  const filteredTeams = (managerTeams || []).filter((team) =>
    team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.sport?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" text="Loading teams..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            My Teams
          </h1>
          <p className="text-base dark:text-base-dark">
            Manage your teams and roster
          </p>
        </div>
        <Link
          to="/manager/teams/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create New Team
        </Link>
      </div>

      {/* Search Bar */}
      {managerTeams && managerTeams.length > 0 && (
        <div className="max-w-md">
          <SearchBar
            placeholder="Search teams by name, sport, or city..."
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
      )}

      {/* Results Count */}
      {managerTeams && managerTeams.length > 0 && (
        <p className="text-base dark:text-base-dark">
          Showing {filteredTeams.length} of {managerTeams.length} teams
        </p>
      )}

      {/* Teams Grid */}
      {filteredTeams.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard 
              key={team._id} 
              team={team} 
              showEditButton={true}
              onEdit={handleEditTeam}
            />
          ))}
        </div>
      ) : managerTeams && managerTeams.length > 0 ? (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-base dark:text-base-dark" />
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            No teams found
          </h3>
          <p className="text-base dark:text-base-dark">
            Try adjusting your search query
          </p>
        </div>
      ) : (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            No teams yet
          </h3>
          <p className="text-base dark:text-base-dark mb-6">
            Create your first team to get started
          </p>
          <Link
            to="/manager/teams/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Team
          </Link>
        </div>
      )}
    </div>
  );
};

export default ManagerTeams;
