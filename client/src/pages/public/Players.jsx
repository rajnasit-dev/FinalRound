import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PlayerCard from "../../components/ui/PlayerCard";
import SearchBar from "../../components/ui/SearchBar";
import FilterDropdown from "../../components/ui/FilterDropdown";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Pagination from "../../components/ui/Pagination";
import GridContainer from "../../components/ui/GridContainer";
import BackButton from "../../components/ui/BackButton";
import { fetchAllPlayers } from "../../store/slices/playerSlice";
import { fetchAllSports } from "../../store/slices/sportSlice";

const Players = () => {
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const {
    players,
    loading: playersLoading,
    error: playersError,
  } = useSelector((state) => state.player);
  const {
    sports,
    loading: sportsLoading,
    error: sportsError,
  } = useSelector((state) => state.sport);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loading = playersLoading || sportsLoading;
  const error = playersError || sportsError;

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchAllPlayers());
    dispatch(fetchAllSports());
  }, [dispatch]);

  // Get sports and roles for filters from backend
  const sportOptions = [
    "All",
    ...sports.map((sport) => sport.name)
  ];

  const selectedSportObj =
    selectedSport !== "All"
      ? sports.find((s) => s.name === selectedSport)
      : null;

  const roles = (() => {
    // If a specific sport is selected, use its role list from backend
    if (selectedSportObj && Array.isArray(selectedSportObj.roles)) {
      return ["All", ...selectedSportObj.roles];
    }
    // Otherwise aggregate roles across all sports from backend
    const allRoles = new Set(
      sports.flatMap((s) => (Array.isArray(s.roles) ? s.roles : []))
    );
    return ["All", ...Array.from(allRoles)];
  })();

  // Filter players based on selections
  const filteredPlayers = players.filter((player) => {
    const matchesSport =
      selectedSport === "All" ||
      player.sports?.some((sport) => sport.sport?.name === selectedSport);
    
    const matchesRole =
      selectedRole === "All" ||
      player.sports?.some((sport) => sport.role === selectedRole);
    
    const matchesSearch =
      searchQuery === "" ||
      player.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.sports?.some((sport) =>
        sport.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesSport && matchesRole && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPlayers = filteredPlayers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSport, selectedRole, searchQuery]);

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
        <h1 className="text-4xl font-bold my-5 text-text-primary dark:text-text-primary-dark">
          Explore Players
        </h1>
        <p className="text-base dark:text-base-dark">
          Discover talented athletes and connect with players in your area
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={typeof error === 'string' ? error : error?.message || 'An error occurred'} type="error" />
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {/* Search Bar */}
          <div className="flex-1">
            <SearchBar
              placeholder="Search players by name or city..."
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

            {/* Role Filter Dropdown */}
            <FilterDropdown
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              options={roles.map((role) => ({
                value: role,
                label: role === "All" ? "All Roles" : role,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      {filteredPlayers.length > 0 && (
        <p className="mb-6 text-base dark:text-base-dark">
          Showing <span className="font-num">{startIndex + 1}</span> to <span className="font-num">{Math.min(startIndex + itemsPerPage, filteredPlayers.length)}</span> of <span className="font-num">{filteredPlayers.length}</span> players
        </p>
      )}

      {/* Players Grid */}
      {filteredPlayers.length > 0 ? (
        <>
          <GridContainer cols={3}>
            {paginatedPlayers.map((player) => {
              // Map backend data structure to PlayerCard expected format
              const playerData = {
                ...player,
                playingRole: player.sports?.[0]?.role || "Player",
                sports: player.sports?.map(s => ({
                  _id: s.sport?._id || s._id,
                  name: s.sport?.name || s.name
                })) || []
              };
              return <PlayerCard key={player._id} player={playerData} />;
            })}
          </GridContainer>
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredPlayers.length}
              />
            </div>
          )}
        </>
      ) : (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">No players found</h3>
          <p className="text-base dark:text-base-dark">Try adjusting your search or filters</p>
        </div>
      )}
    </section>
  );
};

export default Players;
