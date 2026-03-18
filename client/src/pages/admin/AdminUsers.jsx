import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../store/slices/adminSlice";
import { fetchAllSports } from "../../store/slices/sportSlice";
import { Users, ShieldBan, ShieldCheck, MapPin, Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";
import BackButton from "../../components/ui/BackButton";
import Spinner from "../../components/ui/Spinner";
import SearchBar from "../../components/ui/SearchBar";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import defaultAvatar from "../../assets/defaultAvatar.png";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const AdminUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.admin);
  const { sports } = useSelector((state) => state.sport);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [genderFilter, setGenderFilter] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [blockingId, setBlockingId] = useState(null);

  useEffect(() => {
    dispatch(getAllUsers({ role: "", search: "", page: 1, limit: 100 }));
    dispatch(fetchAllSports());
  }, [dispatch]);

  useEffect(() => {
    if (!users) {
      setFilteredUsers([]);
      return;
    }

    let filtered = [...users];

    // Filter by active tab
    if (activeTab && activeTab !== "All") {
      filtered = filtered.filter((u) => u.role === activeTab);
    }

    // Additional filters for Players only
    if (activeTab === "Player") {
      if (genderFilter) {
        filtered = filtered.filter((u) => u.gender === genderFilter);
      }
      if (sportFilter) {
        filtered = filtered.filter((u) => u.sport?._id === sportFilter || u.sport === sportFilter);
      }
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        (u) =>
          (u.fullName && u.fullName.toLowerCase().includes(searchLower)) ||
          (u.email && u.email.toLowerCase().includes(searchLower))
      );
    }

    setFilteredUsers(filtered);
  }, [users, search, activeTab, genderFilter, sportFilter]);

  const getRoleColor = (role) => {
    const colors = {
      Player: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      TeamManager:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      TournamentOrganizer:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
      Admin: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    };
    return colors[role] || "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300";
  };

  const handleToggleBlock = async (e, user) => {
    e.stopPropagation();
    const action = user.isBlocked ? "unblock" : "block";
    
    if (!window.confirm(`Are you sure you want to ${action} ${user.fullName}?`)) return;

    setBlockingId(user._id);
    try {
      await axios.patch(`${API_BASE_URL}/admin/users/${user._id}/toggle-block`, {}, {
        withCredentials: true,
      });
      toast.success(`User ${user.fullName} ${action}ed successfully`);
      dispatch(getAllUsers({ role: "", search: "", page: 1, limit: 100 }));
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setBlockingId(null);
    }
  };

  const handleRowClick = (user) => {
    // Only allow navigation for Players
    if (user.role === "Player") {
      navigate(`/players/${user._id}`);
    }
  };

  const columns = [
    {
      header: "User",
      width: "30%",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <img
              src={user.avatar || defaultAvatar}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-text-primary dark:text-text-primary-dark truncate">
              {user.fullName}
            </p>
            <div className="flex items-center gap-1 text-xs text-base dark:text-base-dark">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{user.city || "N/A"}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      width: "20%",
      render: (user) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
          {user.role}
        </span>
      ),
    },
    {
      header: "Contact Details",
      width: "30%",
      render: (user) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
            <Mail className="w-4 h-4 shrink-0" />
            <span className="truncate">{user.email || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-base dark:text-base-dark">
            <Phone className="w-4 h-4 shrink-0" />
            <span className="truncate">{user.phone || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      width: "10%",
      render: (user) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          user.isBlocked
            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
        }`}>
          {user.isBlocked ? "Blocked" : "Active"}
        </span>
      ),
    },
    {
      header: "Actions",
      width: "20%",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (user) => (
        <Button
          onClick={(e) => handleToggleBlock(e, user)}
          disabled={blockingId === user._id}
          loading={blockingId === user._id}
          variant={user.isBlocked ? "primary" : "danger"}
          size="sm"
        >
          {user.isBlocked ? (
            <><ShieldCheck className="w-4 h-4" /><span className="ml-2">Unblock</span></>
          ) : (
            <><ShieldBan className="w-4 h-4" /><span className="ml-2">Block</span></>
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
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          User Management
        </h1>
        
      </div>

      {/* Tabs */}
      <div>
        <div className="flex items-center gap-2 border-b border-base-dark dark:border-base mb-4">
          {["All", "Player", "TeamManager", "TournamentOrganizer"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearch("");
                setGenderFilter("");
                setSportFilter("");
              }}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-secondary text-secondary dark:border-secondary dark:text-secondary"
                  : "border-transparent text-base dark:text-base-dark hover:text-text-primary dark:hover:text-text-primary-dark"
              }`}
            >
              {tab === "All" ? "All Users" : tab === "TeamManager" ? "Team Managers" : tab === "TournamentOrganizer" ? "Organizers" : "Players"}
            </button>
          ))}
        </div>

        {/* Search and filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchBar
            placeholder="Search by name or email..."
            searchQuery={search}
            setSearchQuery={setSearch}
          />
          {activeTab === "Player" ? (
            <>
              <Select
                options={[
                  { value: "", label: "All Genders" },
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
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
            </>
          ) : (
            <>
              <div></div>
              <div></div>
            </>
          )}
          <div className="flex items-center justify-end">
            <span className="text-sm text-base dark:text-base-dark font-medium">
              Total: {filteredUsers.length}
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Users Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No users match your search criteria.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          onRowClick={activeTab === "Player" || activeTab === "All" ? handleRowClick : undefined}
          itemsPerPage={10}
          emptyMessage="No users found"
        />
      )}
    </div>
  );
};

export default AdminUsers;
