import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Calendar } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import TournamentCard from "../../components/ui/TournamentCard";
import SearchBar from "../../components/ui/SearchBar";
import FilterDropdown from "../../components/ui/FilterDropdown";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";

const OrganizerTournaments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { tournaments, loading } = useSelector((state) => state.tournament);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    dispatch(fetchAllTournaments({}));
  }, [dispatch]);

  // Filter tournaments organized by this user
  const myTournaments = tournaments?.filter((t) => t.organizer?._id === user?._id) || [];

  // Apply search and status filters
  const filteredTournaments = myTournaments.filter((tournament) => {
    const matchesSearch =
      searchQuery === "" ||
      tournament.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.sport?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.ground?.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" || tournament.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Upcoming", label: "Upcoming" },
    { value: "Live", label: "Live" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BackButton className="mb-6" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            My Tournaments
          </h1>
          <p className="text-base dark:text-base-dark">
            Manage and organize your tournaments
          </p>
        </div>
        <Link
          to="/organizer/tournaments/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create Tournament
        </Link>
      </div>

      {/* Search and Filter */}
      {myTournaments.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search tournaments by name, sport, or city..."
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
          <FilterDropdown
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={statusOptions}
          />
        </div>
      )}

      {/* Results Count */}
      {myTournaments.length > 0 && (
        <p className="text-base dark:text-base-dark">
          Showing {filteredTournaments.length} of {myTournaments.length} tournaments
        </p>
      )}

      {/* Tournaments Grid */}
      {filteredTournaments.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard 
              key={tournament._id} 
              tournament={tournament} 
              showOrganizerButtons={true}
              onView={(id) => navigate(`/organizer/tournaments/${id}/fixtures`)}
              onEdit={(id) => navigate(`/organizer/tournaments/${id}/edit`)}
              onManage={(id) => navigate(`/organizer/tournaments/${id}`)}
              onDelete={(id) => {
                if (window.confirm('Are you sure you want to delete this tournament?')) {
                  // Add delete handler here
                  console.log('Delete tournament:', id);
                }
              }}
            />
          ))}
        </div>
      ) : myTournaments.length > 0 ? (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-base dark:text-base-dark" />
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            No tournaments found
          </h3>
          <p className="text-base dark:text-base-dark">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            No tournaments yet
          </h3>
          <p className="text-base dark:text-base-dark mb-6">
            Create your first tournament to get started
          </p>
          <Link
            to="/organizer/tournaments/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Tournament
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrganizerTournaments;
