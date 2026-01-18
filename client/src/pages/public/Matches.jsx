import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MatchCard from "../../components/ui/MatchCard";
import SearchBar from "../../components/ui/SearchBar";
import FilterDropdown from "../../components/ui/FilterDropdown";
import Spinner from "../../components/ui/Spinner";
import { fetchAllMatches, fetchLiveMatches, fetchUpcomingMatches } from "../../store/slices/matchSlice";

const Matches = () => {
  const dispatch = useDispatch();
  const { matches, liveMatches, upcomingMatches, loading } = useSelector((state) => state.match);

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchAllMatches());
    dispatch(fetchLiveMatches());
    dispatch(fetchUpcomingMatches());
  }, [dispatch]);

  const statuses = ["All", "Live", "Scheduled", "Completed", "Cancelled"];

  // Filter matches
  const filteredMatches = (matches || []).filter((match) => {
    const matchesStatus =
      selectedStatus === "All" || match?.status === selectedStatus;
    const matchesSearch =
      searchQuery === "" ||
      match?.team1?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match?.team2?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match?.tournament?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match?.venue?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <section className="container mx-auto px-6 py-16">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" text="Loading matches..." />
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold my-5 text-text-primary dark:text-text-primary-dark">
          Live & Upcoming Matches
        </h1>
        <p className="text-base dark:text-base-dark">
          Follow live matches and check upcoming fixtures
        </p>
      </div>

      {/* Live Matches Section */}
      {liveMatches && liveMatches.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
              🔴 Live Now
            </h2>
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
              {liveMatches.length}
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {liveMatches.slice(0, 6).map((match) => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>
        </div>
      )}

      {/* Upcoming Matches Preview */}
      {upcomingMatches && upcomingMatches.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-text-primary dark:text-text-primary-dark">
            ⏰ Coming Up Next
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {upcomingMatches.slice(0, 3).map((match) => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          All Matches
        </h2>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {/* Search Bar */}
          <div className="flex-1">
            <SearchBar
              placeholder="Search by team name, tournament, or venue..."
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter Dropdown */}
            <FilterDropdown
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statuses.map((status) => ({
                value: status,
                label: status === "All" ? "All Matches" : status,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="mb-6 text-base dark:text-base-dark">
        Showing {filteredMatches.length} matches
      </p>

      {/* Matches Grid */}
      {filteredMatches.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      ) : (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-16 text-center">
          <p className="text-xl text-base dark:text-base-dark">
            No matches found
          </p>
        </div>
      )}
    </section>
  );
};

export default Matches;
