import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../store/slices/adminSlice";
import { Search, Filter } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import Table from "../../components/ui/Table";

const Users = () => {
  const dispatch = useDispatch();
  const { allUsers, loading } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const filteredUsers = allUsers?.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      header: "Name",
      accessor: "fullName",
      Cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.fullName}</p>
          <p className="text-sm text-base dark:text-base-dark">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: "role",
      Cell: ({ value }) => {
        const colors = {
          Player: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
          "Team Manager":
            "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
          "Tournament Organizer":
            "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
          Admin: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              colors[value] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: "isVerified",
      Cell: ({ value }) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            value
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
          }`}
        >
          {value ? "Verified" : "Unverified"}
        </span>
      ),
    },
    {
      header: "Phone",
      accessor: "phoneNumber",
      Cell: ({ value }) => value || "N/A",
    },
    {
      header: "Joined",
      accessor: "createdAt",
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
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
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base dark:text-base-dark" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-base-dark dark:border-base rounded-lg bg-base-dark dark:bg-base focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-base dark:text-base-dark" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-base-dark dark:border-base rounded-lg bg-base-dark dark:bg-base focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="All">All Roles</option>
              <option value="Player">Player</option>
              <option value="Team Manager">Team Manager</option>
              <option value="Tournament Organizer">Tournament Organizer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-base-dark dark:border-base">
          <div>
            <p className="text-sm text-base dark:text-base-dark">Total Users</p>
            <p className="text-2xl font-bold">{allUsers?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-base dark:text-base-dark">Filtered Results</p>
            <p className="text-2xl font-bold">{filteredUsers?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base overflow-hidden">
        {filteredUsers?.length === 0 ? (
          <div className="p-8 text-center text-base dark:text-base-dark">
            No users found
          </div>
        ) : (
          <Table columns={columns} data={filteredUsers || []} />
        )}
      </div>
    </div>
  );
};

export default Users;
