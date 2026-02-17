import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllTeams } from "../../store/slices/adminSlice";
import { fetchAllTeams } from "../../store/slices/teamSlice";
import { fetchAllSports } from "../../store/slices/sportSlice";
import { Users, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import BackButton from "../../components/ui/BackButton";
import Spinner from "../../components/ui/Spinner";
import SearchBar from "../../components/ui/SearchBar";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const AdminTeams = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { teams, loading } = useSelector((state) => state.admin);
  const { sports } = useSelector((state) => state.sport);
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(getAllTeams({ search: "", page: 1, limit: 100 }));
    dispatch(fetchAllSports());
  }, [dispatch]);

  useEffect(() => {
    if (!teams) {
      setFilteredTeams([]);
      return;
    }

    let filtered = [...teams];

    // Filter by sport
    if (sportFilter) {
      filtered = filtered.filter((t) => t.sport?._id === sportFilter || t.sport === sportFilter);
    }

    // Filter by gender
    if (genderFilter) {
      filtered = filtered.filter((t) => t.gender === genderFilter);
    }

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(searchLower)) ||
          (t.sport?.name && t.sport.name.toLowerCase().includes(searchLower)) ||
          (t.manager?.fullName && t.manager.fullName.toLowerCase().includes(searchLower))
      );
    }

    setFilteredTeams(filtered);
  }, [teams, search, sportFilter, genderFilter]);

  const handleDelete = async (e, team) => {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete team "${team.name}"? This action cannot be undone.`)) return;

    setDeletingId(team._id);
    try {
      await axios.delete(`${API_BASE_URL}/teams/${team._id}`, {
        withCredentials: true,
      });
      toast.success(`Team ${team.name} deleted successfully`);
      dispatch(getAllTeams({ search: "", page: 1, limit: 100 }));
      dispatch(fetchAllTeams());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete team");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRowClick = (team) => {
    navigate(`/teams/${team._id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const columns = [
    {
      header: "Team",
      width: "30%",
      render: (team) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
            <img
              src={team.logo || defaultTeamAvatar}
              alt={team.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-text-primary dark:text-text-primary-dark truncate">
              {team.name}
            </p>
            <p className="text-xs text-base dark:text-base-dark truncate">
              {team.sport?.name || "Unknown Sport"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Gender",
      width: "15%",
      render: (team) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
          team.gender === "Male"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            : team.gender === "Female"
            ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
        }`}>
          {team.gender}
        </span>
      ),
    },
    {
      header: "Manager",
      width: "25%",
      render: (team) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate">
            {team.manager?.fullName || "Unknown"}
          </p>
          <p className="text-xs text-base dark:text-base-dark truncate">
            {team.manager?.email || "N/A"}
          </p>
        </div>
      ),
    },
    {
      header: "Players",
      width: "10%",
      render: (team) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-base dark:text-base-dark" />
          <span className="text-sm text-base dark:text-base-dark">
            {team.players?.length || 0}
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      width: "20%",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (team) => (
        <Button
          onClick={(e) => handleDelete(e, team)}
          disabled={deletingId === team._id}
          loading={deletingId === team._id}
          variant="danger"
          size="sm"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Teams Management
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          View and manage all teams
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SearchBar
          placeholder="Search teams..."
          searchQuery={search}
          setSearchQuery={setSearch}
        />
        <Select
          options={[
            { value: "", label: "All Sports" },
            ...(sports || []).map((sport) => ({
              value: sport._id,
              label: sport.name,
            })),
          ]}
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
        />
        <Select
          options={[
            { value: "", label: "All Genders" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Mixed", label: "Mixed" },
          ]}
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
        />
        <div className="flex items-center justify-end">
          <span className="text-sm text-base dark:text-base-dark font-medium">
            Total: {filteredTeams.length}
          </span>
        </div>
      </div>

      {/* Teams Table */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Teams Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No teams match your search criteria.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTeams}
          onRowClick={handleRowClick}
          itemsPerPage={10}
          emptyMessage="No teams found"
        />
      )}
    </div>
  );
};

export default AdminTeams;
