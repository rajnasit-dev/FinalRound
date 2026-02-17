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
        <h1 className="text-4xl font-bold my-5 text-text-primary dark:text-text-primary-dark">Explore Teams</h1>
        <p className="text-base dark:text-base-dark">Find and join competitive sports teams in your area</p>
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
      {filteredTeams.length > 0 && (
        <p className="mb-6 text-base dark:text-base-dark">
          Showing <span className="font-num">{startIndex + 1}</span> to <span className="font-num">{Math.min(startIndex + itemsPerPage, filteredTeams.length)}</span> of <span className="font-num">{filteredTeams.length}</span> teams
        </p>
      )}

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
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">No teams found</h3>
          <p className="text-base dark:text-base-dark">Try adjusting your search or filters</p>
        </div>
      )}
    </section>
  );
};

export default Teams;
