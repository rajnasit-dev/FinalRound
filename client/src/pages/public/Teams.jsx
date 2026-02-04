import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TeamCard from "../../components/ui/TeamCard";
import SearchBar from "../../components/ui/SearchBar";
import FilterDropdown from "../../components/ui/FilterDropdown";
import Spinner from "../../components/ui/Spinner";
import GridContainer from "../../components/ui/GridContainer";
import Pagination from "../../components/ui/Pagination";
import BackButton from "../../components/ui/BackButton";
import { fetchAllTeams } from "../../store/slices/teamSlice";
import { fetchAllSports } from "../../store/slices/sportSlice";

const Teams = () => {
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.team);
  const { sports, loading: sportsLoading } = useSelector((state) => state.sport);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchAllTeams());
    dispatch(fetchAllSports());
  }, [dispatch]);

  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sportOptions = [
    "All",
    ...(sports?.map(sport => sport.name) || [])
  ];

  const statuses = ["All", "Open to Join", "Full"];

  const genders = ["All", "Male", "Female", "Mixed"];

  // Filter teams
  const filteredTeams = (teams || []).filter((team) => {
    const matchesSport =
      selectedSport === "All" || team?.sport?.name === selectedSport;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Open to Join" && team?.openToJoin) ||
      (selectedStatus === "Full" && !team?.openToJoin);
    const matchesGender =
      selectedGender === "All" || team?.gender === selectedGender;
    const matchesSearch =
      team?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team?.sport?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesStatus && matchesGender && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTeams = filteredTeams.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSport, selectedStatus, selectedGender, searchQuery]);

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
    <section className="container mx-auto px-6 py-4">
      <BackButton className="mb-6" />
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
              options={sportOptions.map((sport) => ({
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

            {/* Gender Filter Dropdown */}
            <FilterDropdown
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              options={genders.map((gender) => ({
                value: gender,
                label: gender === "All" ? "All Genders" : gender,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="mb-6 text-base dark:text-base-dark">
        Showing <span className="font-num">{startIndex + 1}</span> to <span className="font-num">{Math.min(startIndex + itemsPerPage, filteredTeams.length)}</span> of <span className="font-num">{filteredTeams.length}</span> teams
      </p>

      {/* Teams Grid */}
      {filteredTeams.length > 0 ? (
        <>
          <GridContainer cols={3}>
            {paginatedTeams.map((team) => (
              <TeamCard key={team._id} team={team} />
            ))}
          </GridContainer>
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredTeams.length}
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-center py-16 text-lg mb-2">No teams found</p>
      )}
    </section>
  );
};

export default Teams;
