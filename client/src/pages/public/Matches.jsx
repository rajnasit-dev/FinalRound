import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FixturesTable from "../../components/ui/FixturesTable";
import SearchBar from "../../components/ui/SearchBar";
import FilterDropdown from "../../components/ui/FilterDropdown";
import Spinner from "../../components/ui/Spinner";
import { fetchAllMatches } from "../../store/slices/matchSlice";

const Matches = () => {
  const dispatch = useDispatch();
  const { matches, loading } = useSelector((state) => state.match);

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchAllMatches());
  }, [dispatch]);

  const statuses = ["All", "Live", "Scheduled", "Completed", "Cancelled"];

  // Derive live and upcoming from all matches
  const liveMatches = (matches || []).filter((m) => m?.status === "Live");
  const upcomingMatches = (matches || []).filter((m) => m?.status === "Scheduled");

  // Filter matches
  const filteredMatches = (matches || []).filter((match) => {
    const matchesStatus =
      selectedStatus === "All" || match?.status === selectedStatus;
    const matchesSearch =
      searchQuery === "" ||
      match?.teamA?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match?.teamB?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match?.tournament?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match?.venue?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <section className="container mx-auto px-6 py-16">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold my-5 text-text-primary dark:text-text-primary-dark">
          All Matches
        </h1>
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
        <FixturesTable matches={filteredMatches} />
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

