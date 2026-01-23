import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTournaments } from "../../store/slices/adminSlice";
import { Trophy, Calendar, Users, Trash2, Edit2 } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import SearchBar from "../../components/ui/SearchBar";
import Select from "../../components/ui/Select";

const AdminTournaments = () => {
  const dispatch = useDispatch();
  const { tournaments, loading, error } = useSelector((state) => state.admin);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredTournaments, setFilteredTournaments] = useState([]);

  useEffect(() => {
    dispatch(getAllTournaments({ status: "", search: "", page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    let filtered = tournaments || [];

    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (search) {
      filtered = filtered.filter((t) =>
        t.name?.toLowerCase().includes(search.toLowerCase())
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Tournament Management
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          View and manage all tournaments
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="flex items-center justify-start">
            <span className="text-sm text-base dark:text-base-dark font-medium">
              Total: {filteredTournaments.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tournaments Table */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base overflow-hidden">
        {filteredTournaments.length === 0 ? (
          <div className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto text-base dark:text-base-dark opacity-50 mb-4" />
            <p className="text-base dark:text-base-dark">No tournaments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-base-dark dark:bg-base">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Tournament Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Sport</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Dates</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Teams</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Format</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-dark dark:divide-base">
                {filteredTournaments.map((tournament) => (
                  <tr
                    key={tournament._id}
                    className="hover:bg-base-dark/50 dark:hover:bg-base/50 transition"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium">{tournament.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {tournament.sport?.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                        {tournament.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(tournament.startDate)} -{" "}
                          {formatDate(tournament.endDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {tournament.approvedTeams?.length || 0} /{" "}
                          {tournament.teamLimit}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-secondary/20 text-secondary px-2 py-1 rounded text-xs font-medium">
                        {tournament.format}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-secondary hover:bg-base-dark/20 dark:hover:bg-base/20 rounded-lg transition">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100/20 dark:hover:bg-red-900/20 rounded-lg transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTournaments;
