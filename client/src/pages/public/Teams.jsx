import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TeamCard from "../../components/ui/TeamCard";
import SearchBar from "../../components/ui/SearchBar";
import FilterDropdown from "../../components/ui/FilterDropdown";
import Spinner from "../../components/ui/Spinner";
import GridContainer from "../../components/ui/GridContainer";
import { fetchAllTeams } from "../../store/slices/teamSlice";

const Teams = () => {
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.team);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchAllTeams());
  }, [dispatch]);

  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const sports = [
    "All",
    "Cricket",
    "Football",
    "Basketball",
    "Badminton",
    "Volleyball",
  ];

  const statuses = ["All", "Open to Join", "Full"];

  // Filter teams
  const filteredTeams = (teams || []).filter((team) => {
    const matchesSport =
      selectedSport === "All" || team?.sport?.name === selectedSport;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Open to Join" && team?.openToJoin) ||
      (selectedStatus === "Full" && !team?.openToJoin);
    const matchesSearch =
      team?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team?.sport?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesStatus && matchesSearch;
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
        <h1 className="text-4xl font-bold my-5">Explore Teams</h1>
        <p>Find and join competitive sports teams in your area</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {/* Search Bar */}
          <div className="flex-1">
            <SearchBar
              placeholder="Search teams by name, city, or sport..."
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Sport Filter Dropdown */}
            <FilterDropdown
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              options={sports.map((sport) => ({
                value: sport,
                label: sport === "All" ? "All Sports" : sport,
              }))}
            />

            {/* Status Filter Dropdown */}
            <FilterDropdown
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statuses.map((status) => ({
                value: status,
                label: status === "All" ? "All Teams" : status,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="mb-6">Showing {filteredTeams.length} teams</p>

      {/* Teams Grid */}
      {filteredTeams.length > 0 ? (
        <GridContainer cols={3}>
          {filteredTeams.map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </GridContainer>
      ) : (
        <p className="text-center py-16 text-lg mb-2">No teams found</p>
      )}
    </section>
  );
};

export default Teams;
