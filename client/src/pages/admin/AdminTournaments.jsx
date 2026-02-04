import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllTournaments } from "../../store/slices/adminSlice";
import { Trophy, Trash2, Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";
import BackButton from "../../components/ui/BackButton";
import Spinner from "../../components/ui/Spinner";
import SearchBar from "../../components/ui/SearchBar";
import Select from "../../components/ui/Select";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const AdminTournaments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tournaments, loading, error } = useSelector((state) => state.admin);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(getAllTournaments({ status: "", search: "", page: 1, limit: 100 }));
  }, [dispatch]);

  // Helper function to calculate tournament status (not a hook)
  const calculateTournamentStatus = (tournament) => {
    if (!tournament) return "Upcoming";
    
    if (tournament.isCancelled) {
      return "Cancelled";
    }

    const now = new Date();
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);

    if (now > endDate) {
      return "Completed";
    }

    if (now >= startDate && now <= endDate) {
      return "Live";
    }

    return "Upcoming";
  };

  useEffect(() => {
    if (!tournaments) {
      setFilteredTournaments([]);
      return;
    }

    let filtered = [...tournaments];

    // Filter by calculated status
    if (statusFilter) {
      filtered = filtered.filter((t) => {
        const calculatedStatus = calculateTournamentStatus(t);
        return calculatedStatus === statusFilter;
      });
    }

    if (search.trim()) {
      filtered = filtered.filter((t) =>
        t.name?.toLowerCase().includes(search.toLowerCase().trim())
      );
    }

    setFilteredTournaments(filtered);
  }, [tournaments, search, statusFilter]);

  const getStatusColor = (status) => {
    const colors = {
      Upcoming: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      Live: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
      Completed:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
      Cancelled:
        "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300",
    };
    return colors[status] || "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRowClick = (tournament) => {
    navigate(`/tournaments/${tournament._id}`);
  };

  const handleDelete = async (e, tournament) => {
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete ${tournament.name}? This action cannot be undone.`)) return;

    setDeletingId(tournament._id);
    try {
      await axios.delete(`${API_BASE_URL}/tournaments/${tournament._id}`, {
        withCredentials: true,
      });
      toast.success(`Tournament ${tournament.name} deleted successfully`);
      dispatch(getAllTournaments({ status: "", search: "", page: 1, limit: 100 }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete tournament");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      header: "Tournament",
      width: "30%",
      render: (tournament) => (
        <div>
          <p className="font-semibold text-text-primary dark:text-text-primary-dark">
            {tournament.name}
          </p>
          <p className="text-sm text-base dark:text-base-dark mt-1">
            {tournament.sport?.name || "N/A"}
          </p>
        </div>
      ),
    },
    {
      header: "Status",
      width: "15%",
      render: (tournament) => {
        const status = calculateTournamentStatus(tournament);
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        );
      },
    },
    {
      header: "Dates",
      width: "25%",
      render: (tournament) => (
        <div className="text-sm text-base dark:text-base-dark">
          {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
        </div>
      ),
    },
    {
      header: "Organizer",
      width: "25%",
      render: (tournament) => (
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate">
            {tournament.organizer?.fullName || tournament.organizer?.orgName || "N/A"}
          </p>
          <div className="flex items-center gap-2 text-xs text-base dark:text-base-dark">
            <Mail className="w-4 h-4 shrink-0" />
            <span className="truncate">{tournament.organizer?.email || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-base dark:text-base-dark">
            <Phone className="w-4 h-4 shrink-0" />
            <span className="truncate">{tournament.organizer?.phone || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Actions",
      width: "15%",
      render: (tournament) => (
        <Button
          onClick={(e) => handleDelete(e, tournament)}
          disabled={deletingId === tournament._id}
          className="!bg-red-600 hover:!bg-red-700 !text-white !px-4 !py-2 text-sm flex items-center justify-center gap-2"
        >
          {deletingId === tournament._id ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </>
          )}
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Error</p>
          <p className="text-text-primary dark:text-text-primary-dark">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <BackButton className="mb-6" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Tournament Management
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          View and manage all tournaments
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SearchBar
          placeholder="Search by tournament name..."
          searchQuery={search}
          setSearchQuery={setSearch}
        />
        <Select
          options={[
            { value: "", label: "All Status" },
            { value: "Upcoming", label: "Upcoming" },
            { value: "Live", label: "Live" },
            { value: "Completed", label: "Completed" },
            { value: "Cancelled", label: "Cancelled" },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
        <div className="flex items-center justify-end">
          <span className="text-sm text-base dark:text-base-dark font-medium">
            Total: {filteredTournaments.length}
          </span>
        </div>
      </div>

      {/* Tournaments Table */}
      {filteredTournaments.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Tournaments Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No tournaments match your search criteria.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTournaments}
          onRowClick={handleRowClick}
          itemsPerPage={10}
          emptyMessage="No tournaments found"
        />
      )}
    </div>
  );
};

export default AdminTournaments;
