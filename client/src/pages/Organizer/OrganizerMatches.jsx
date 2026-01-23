import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Edit } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import MatchCard from "../../components/ui/MatchCard";
import SearchBar from "../../components/ui/SearchBar";
import FilterDropdown from "../../components/ui/FilterDropdown";
import Button from "../../components/ui/Button";
import { fetchAllMatches } from "../../store/slices/matchSlice";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";

const OrganizerMatches = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { matches, loading: matchesLoading } = useSelector((state) => state.match);
  const { tournaments } = useSelector((state) => state.tournament);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    dispatch(fetchAllMatches());
    dispatch(fetchAllTournaments({}));
  }, [dispatch]);

  // Filter tournaments organized by this user
  const myTournaments = tournaments?.filter((t) => t.organizer?._id === user?._id) || [];
  const myTournamentIds = myTournaments.map((t) => t._id);

  // Filter matches for organizer's tournaments
  const myMatches = matches?.filter((m) => myTournamentIds.includes(m.tournament?._id)) || [];

  // Apply search and status filters
  const filteredMatches = myMatches.filter((match) => {
    const matchesSearch =
      searchQuery === "" ||
      match.team1?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.team2?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.tournament?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.venue?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" || match.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Scheduled", label: "Scheduled" },
    { value: "Live", label: "Live" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  if (matchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" text="Loading matches..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            Tournament Matches
          </h1>
          <p className="text-base dark:text-base-dark">
            Manage matches for your tournaments
          </p>
        </div>
        <Link
          to="/organizer/matches/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Schedule Match
        </Link>
      </div>

      {/* Search and Filter */}
      {myMatches.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search matches by team, tournament, or venue..."
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
      {myMatches.length > 0 && (
        <p className="text-base dark:text-base-dark">
          Showing {filteredMatches.length} of {myMatches.length} matches
        </p>
      )}

      {/* Matches Grid */}
      {filteredMatches.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <div key={match._id}>
              <MatchCard match={match} />
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={() => navigate(`/organizer/matches/${match._id}/edit`)}
                  className="flex-1 bg-secondary hover:bg-secondary/90"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : myMatches.length > 0 ? (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-base dark:text-base-dark" />
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
            No matches found
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
            No matches scheduled yet
          </h3>
          <p className="text-base dark:text-base-dark mb-6">
            Create a tournament first, then schedule matches
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

export default OrganizerMatches;
