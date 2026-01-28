import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllTeams } from "../../store/slices/adminSlice";
import { fetchAllSports } from "../../store/slices/sportSlice";
import { Users, Trash2, Mail, Phone } from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import Spinner from "../../components/ui/Spinner";
import SearchBar from "../../components/ui/SearchBar";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";
import axios from "axios";
import { toast } from "react-hot-toast";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Pagination logic
  const totalPages = Math.ceil((filteredTeams?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTeams = filteredTeams?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sportFilter, genderFilter]);

  const handleDelete = async (e, team) => {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete team "${team.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(team._id);
    try {
      await axios.delete(`${API_BASE_URL}/teams/${team._id}`, {
        withCredentials: true,
      });
      toast.success(`Team ${team.name} deleted successfully`);
      dispatch(getAllTeams({ search: "", page: 1, limit: 100 }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete team");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRowClick = (e, team) => {
    // Don't navigate if clicking on the delete button
    if (e.target.closest('button')) {
      return;
    }
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
      accessor: "name",
      Cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
            <img
              src={row.logo || defaultTeamAvatar}
              alt={row.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-text-primary dark:text-text-primary-dark truncate">
              {row.name}
            </p>
            <p className="text-xs text-base dark:text-base-dark truncate">
              {row.sport?.name || "Unknown Sport"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Gender",
      accessor: "gender",
      Cell: ({ value }) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
          value === "Male"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            : value === "Female"
            ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: "Manager",
      accessor: "manager",
      Cell: ({ value }) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate">
            {value?.fullName || "Unknown"}
          </p>
          <p className="text-xs text-base dark:text-base-dark truncate">
            {value?.email || "N/A"}
          </p>
        </div>
      ),
    },
    {
      header: "Players",
      accessor: "players",
      Cell: ({ value }) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-base dark:text-base-dark" />
          <span className="text-sm text-base dark:text-base-dark">
            {value?.length || 0}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      Cell: ({ value }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        }`}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "_id",
      Cell: ({ row }) => (
        <Button
          onClick={(e) => handleDelete(e, row)}
          disabled={deletingId === row._id}
          className="!bg-red-600 hover:!bg-red-700 !text-white !px-4 !py-2 text-sm flex items-center justify-center gap-2"
        >
          {deletingId === row._id ? (
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

  return (
    <div className="min-h-screen pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <BackButton className="mb-6" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Teams Management
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          View and manage all teams
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base overflow-hidden">
        {filteredTeams.length === 0 ? (
          <div className="text-center py-12 bg-card-background dark:bg-card-background-dark">
            <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Teams Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No teams match your search criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-base-dark dark:bg-base">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark"
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-dark dark:divide-base">
                  {paginatedTeams.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      onClick={(e) => handleRowClick(e, row)}
                      className="hover:bg-base-dark dark:hover:bg-base transition-colors cursor-pointer"
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 text-sm text-text-primary dark:text-text-primary-dark"
                        >
                          {column.Cell ? column.Cell({ row, value: row[column.accessor] }) : row[column.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredTeams?.length || 0}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminTeams;
