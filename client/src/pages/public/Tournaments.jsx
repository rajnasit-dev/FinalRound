import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TournamentCard from "../../components/ui/TournamentCard";
import SearchBar from "../../components/ui/SearchBar";
import FilterDropdown from "../../components/ui/FilterDropdown";
import Spinner from "../../components/ui/Spinner";
import GridContainer from "../../components/ui/GridContainer";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";

const Tournaments = () => {
  const dispatch = useDispatch();
  const { tournaments, loading } = useSelector((state) => state.tournament);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchAllTournaments({}));
  }, [dispatch]);

  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedRegistrationType, setSelectedRegistrationType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const sports = [
    "All",
    "Cricket",
    "Football",
    "Basketball",
    "Badminton",
    "Tennis",
    "Volleyball",
  ];

  const registrationTypes = ["All", "Team", "Player"];

  // Filter tournaments by sport, registration type, and search
  const filterTournaments = (tournamentList) => {
    return (tournamentList || []).filter((tournament) => {
      const matchesSport =
        selectedSport === "All" || tournament?.sport?.name === selectedSport || tournament?.sport === selectedSport;
      const matchesRegistrationType =
        selectedRegistrationType === "All" || tournament?.registrationType === selectedRegistrationType;
      const matchesSearch =
        tournament?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament?.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSport && matchesRegistrationType && matchesSearch;
    });
  };

  // Organize tournaments by status
  const liveTournaments = filterTournaments(tournaments.filter(t => t.status === "Live"));
  const upcomingTournaments = filterTournaments(tournaments.filter(t => t.status === "Upcoming"));
  const completedTournaments = filterTournaments(tournaments.filter(t => t.status === "Completed"));
  const cancelledTournaments = filterTournaments(tournaments.filter(t => t.status === "Cancelled"));

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
              options={sports.map((sport) => ({
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
          </div>
        </div>
      </div>

      {/* Live Tournaments Section */}
      {liveTournaments.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            Live Tournaments ({liveTournaments.length})
          </h2>
          <GridContainer cols={3}>
            {liveTournaments.map((tournament) => (
              <TournamentCard key={tournament._id || tournament.id} tournament={tournament} />
            ))}
          </GridContainer>
        </div>
      )}

      {/* Upcoming Tournaments Section */}
      {upcomingTournaments.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Upcoming Tournaments ({upcomingTournaments.length})
          </h2>
          <GridContainer cols={3}>
            {upcomingTournaments.map((tournament) => (
              <TournamentCard key={tournament._id || tournament.id} tournament={tournament} />
            ))}
          </GridContainer>
        </div>
      )}

      {/* Completed Tournaments Section */}
      {completedTournaments.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Completed Tournaments ({completedTournaments.length})
          </h2>
          <GridContainer cols={3}>
            {completedTournaments.map((tournament) => (
              <TournamentCard key={tournament._id || tournament.id} tournament={tournament} />
            ))}
          </GridContainer>
        </div>
      )}

      {/* Cancelled Tournaments Section */}
      {cancelledTournaments.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-500 dark:text-gray-400">
            Cancelled Tournaments ({cancelledTournaments.length})
          </h2>
          <GridContainer cols={3}>
            {cancelledTournaments.map((tournament) => (
              <TournamentCard key={tournament._id || tournament.id} tournament={tournament} />
            ))}
          </GridContainer>
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
