import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../store/slices/adminSlice";
import { Users, Trash2, Edit2, Search } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    dispatch(getAllUsers({ role: "", search: "", page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    let filtered = users || [];

    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, search, roleFilter]);

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
          User Management
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          View and manage all platform users
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={20} />}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-base-dark dark:border-base rounded-lg bg-primary dark:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Player">Player</option>
            <option value="TeamManager">Team Manager</option>
            <option value="TournamentOrganizer">Tournament Organizer</option>
          </select>
          <div className="flex items-center justify-start">
            <span className="text-sm text-base dark:text-base-dark font-medium">
              Total: {filteredUsers.length}
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-base dark:text-base-dark opacity-50 mb-4" />
            <p className="text-base dark:text-base-dark">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-base-dark dark:bg-base">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">City</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Verified</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-dark dark:divide-base">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-base-dark/50 dark:hover:bg-base/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar && (
                          <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <span className="font-medium">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{user.city || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isVerified
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                      }`}>
                        {user.isVerified ? "Yes" : "No"}
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

export default AdminUsers;
