import { useState, useEffect } from "react";
import PlayerCard from "../../components/ui/PlayerCard";
import SearchBar from "../../components/ui/SearchBar";
import FilterDropdown from "../../components/ui/FilterDropdown";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const Players = () => {
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [players, setPlayers] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [playersRes, sportsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/players`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/sports`, { withCredentials: true })
      ]);

      setPlayers(playersRes.data.data || []);
      setSports(sportsRes.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || err.message || "Failed to load players");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" text="Loading players..." />
      </div>
    );
  }

  return (
    <section className="container mx-auto px-6 py-16">
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
          <ErrorMessage message={error} type="error" />
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
      <p className="mb-6 text-base dark:text-base-dark">
        Showing {filteredPlayers.length} players
      </p>

      {/* Players Grid */}
      {filteredPlayers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => {
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
        </div>
      ) : (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-16 text-center">
          <p className="text-xl text-base dark:text-base-dark">
            No players found
          </p>
        </div>
      )}
    </section>
  );
};

export default Players;
