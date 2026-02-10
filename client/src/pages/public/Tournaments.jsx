import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TournamentCard from "../../components/ui/TournamentCard";
import SearchBar from "../../components/ui/SearchBar";
import FilterDropdown from "../../components/ui/FilterDropdown";
import Spinner from "../../components/ui/Spinner";
import GridContainer from "../../components/ui/GridContainer";
import Pagination from "../../components/ui/Pagination";
import BackButton from "../../components/ui/BackButton";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";
import { fetchAllSports } from "../../store/slices/sportSlice";

const Tournaments = () => {
  const dispatch = useDispatch();
  const { tournaments, loading } = useSelector((state) => state.tournament);
  const { sports, loading: sportsLoading } = useSelector((state) => state.sport);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchAllTournaments({}));
    dispatch(fetchAllSports());
  }, [dispatch]);

  // Debug: Log tournaments data
  useEffect(() => {
    console.log('Tournaments from Redux:', tournaments);
    console.log('Tournaments length:', tournaments?.length || 0);
  }, [tournaments]);

  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedRegistrationType, setSelectedRegistrationType] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [registrationOpenOnly, setRegistrationOpenOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveCurrentPage, setLiveCurrentPage] = useState(1);
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const [cancelledCurrentPage, setCancelledCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sportOptions = [
    "All",
    ...(sports?.map(sport => sport.name) || [])
  ];

  const registrationTypes = ["All", "Team", "Player"];

  const genders = ["All", "Male", "Female", "Mixed"];

  // Filter tournaments by sport, registration type, and search
  const filterTournaments = (tournamentList) => {
    return (tournamentList || []).filter((tournament) => {
      const matchesSport =
        selectedSport === "All" || tournament?.sport?.name === selectedSport || tournament?.sport === selectedSport;
      const matchesRegistrationType =
        selectedRegistrationType === "All" || tournament?.registrationType === selectedRegistrationType;
      const matchesGender =
        selectedGender === "All" || tournament?.gender === selectedGender;
      const matchesSearch =
        tournament?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament?.ground?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament?.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegistrationOpen = !registrationOpenOnly || (() => {
        if (!tournament?.registrationStart || !tournament?.registrationEnd) return false;
        const now = new Date();
        return now >= new Date(tournament.registrationStart) && now <= new Date(tournament.registrationEnd);
      })();
      return matchesSport && matchesRegistrationType && matchesGender && matchesSearch && matchesRegistrationOpen;
    });
  };

  // Organize tournaments by status
  const liveTournaments = filterTournaments(tournaments.filter(t => t.status === "Live"));
  const upcomingTournaments = filterTournaments(tournaments.filter(t => t.status === "Upcoming"));
  const completedTournaments = filterTournaments(tournaments.filter(t => t.status === "Completed"));
  const cancelledTournaments = filterTournaments(tournaments.filter(t => t.status === "Cancelled"));

  // Pagination logic for each section
  const liveTotalPages = Math.ceil(liveTournaments.length / itemsPerPage);
  const liveStartIndex = (liveCurrentPage - 1) * itemsPerPage;
  const paginatedLiveTournaments = liveTournaments.slice(liveStartIndex, liveStartIndex + itemsPerPage);

  const upcomingTotalPages = Math.ceil(upcomingTournaments.length / itemsPerPage);
  const upcomingStartIndex = (upcomingCurrentPage - 1) * itemsPerPage;
  const paginatedUpcomingTournaments = upcomingTournaments.slice(upcomingStartIndex, upcomingStartIndex + itemsPerPage);

  const completedTotalPages = Math.ceil(completedTournaments.length / itemsPerPage);
  const completedStartIndex = (completedCurrentPage - 1) * itemsPerPage;
  const paginatedCompletedTournaments = completedTournaments.slice(completedStartIndex, completedStartIndex + itemsPerPage);

  const cancelledTotalPages = Math.ceil(cancelledTournaments.length / itemsPerPage);
  const cancelledStartIndex = (cancelledCurrentPage - 1) * itemsPerPage;
  const paginatedCancelledTournaments = cancelledTournaments.slice(cancelledStartIndex, cancelledStartIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setLiveCurrentPage(1);
    setUpcomingCurrentPage(1);
    setCompletedCurrentPage(1);
    setCancelledCurrentPage(1);
  }, [selectedSport, selectedRegistrationType, selectedGender, searchQuery, registrationOpenOnly]);

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
        <h1 className="text-4xl font-bold my-5">Explore Tournaments</h1>
        <p>Find and join tournaments happening near you</p>
      </div>



      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {/* Search Bar */}
          <div className="flex-1">
            <SearchBar
              placeholder="Search tournaments by name or city..."
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

            {/* Registration Type Filter Dropdown */}
            <FilterDropdown
              value={selectedRegistrationType}
              onChange={(e) => setSelectedRegistrationType(e.target.value)}
              options={registrationTypes.map((type) => ({
                value: type,
                label: type === "All" ? "All Types" : type,
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

            {/* Registration Open Toggle */}
            <label
              className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap"
              onClick={() => setRegistrationOpenOnly((prev) => !prev)}
            >
              <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                Open Registrations
              </span>
              <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                registrationOpenOnly
                  ? "bg-blue-500 dark:bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  registrationOpenOnly ? "translate-x-5" : "translate-x-0"
                }`} />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Live Tournaments Section */}
      {liveTournaments.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            Live Tournaments (<span className="font-num">{liveTournaments.length}</span>)
          </h2>
          <GridContainer cols={3}>
            {paginatedLiveTournaments.map((tournament) => (
              <TournamentCard key={tournament._id || tournament.id} tournament={tournament} />
            ))}
          </GridContainer>
          {liveTotalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={liveCurrentPage}
                totalPages={liveTotalPages}
                onPageChange={setLiveCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={liveTournaments.length}
              />
            </div>
          )}
        </div>
      )}

      {/* Upcoming Tournaments Section */}
      {upcomingTournaments.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Upcoming Tournaments (<span className="font-num">{upcomingTournaments.length}</span>)
          </h2>
          <GridContainer cols={3}>
            {paginatedUpcomingTournaments.map((tournament) => (
              <TournamentCard key={tournament._id || tournament.id} tournament={tournament} />
            ))}
          </GridContainer>
          {upcomingTotalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={upcomingCurrentPage}
                totalPages={upcomingTotalPages}
                onPageChange={setUpcomingCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={upcomingTournaments.length}
              />
            </div>
          )}
        </div>
      )}

      {/* Completed Tournaments Section */}
      {completedTournaments.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Completed Tournaments (<span className="font-num">{completedTournaments.length}</span>)
          </h2>
          <GridContainer cols={3}>
            {paginatedCompletedTournaments.map((tournament) => (
              <TournamentCard key={tournament._id || tournament.id} tournament={tournament} />
            ))}
          </GridContainer>
          {completedTotalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={completedCurrentPage}
                totalPages={completedTotalPages}
                onPageChange={setCompletedCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={completedTournaments.length}
              />
            </div>
          )}
        </div>
      )}

      {/* Cancelled Tournaments Section */}
      {cancelledTournaments.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-500 dark:text-gray-400">
            Cancelled Tournaments (<span className="font-num">{cancelledTournaments.length}</span>)
          </h2>
          <GridContainer cols={3}>
            {paginatedCancelledTournaments.map((tournament) => (
              <TournamentCard key={tournament._id || tournament.id} tournament={tournament} />
            ))}
          </GridContainer>
          {cancelledTotalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={cancelledCurrentPage}
                totalPages={cancelledTotalPages}
                onPageChange={setCancelledCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={cancelledTournaments.length}
              />
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {liveTournaments.length === 0 && 
       upcomingTournaments.length === 0 && 
       completedTournaments.length === 0 && 
       cancelledTournaments.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg mb-2">No tournaments found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
        </div>
      )}
    </section>
  );
};

export default Tournaments;
