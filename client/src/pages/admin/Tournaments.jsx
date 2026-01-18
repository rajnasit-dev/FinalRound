import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTournaments } from "../../store/slices/adminSlice";
import { Search, Trophy, Calendar, MapPin } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import Table from "../../components/ui/Table";

const Tournaments = () => {
  const dispatch = useDispatch();
  const { allTournaments, loading } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    dispatch(getAllTournaments());
  }, [dispatch]);

  const filteredTournaments = allTournaments?.filter((tournament) => {
    const matchesSearch =
      tournament.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.sport?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || tournament.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: "Tournament",
      accessor: "name",
      Cell: ({ row }) => (
        <div className="flex items-start gap-3">
          {row.banner && (
            <img
              src={row.banner}
              alt={row.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div>
            <p className="font-medium">{row.name}</p>
            <div className="flex items-center gap-1 mt-1">
              <Trophy className="w-3 h-3 text-base dark:text-base-dark" />
              <p className="text-sm text-base dark:text-base-dark">
                {row.sport?.name || "Unknown Sport"}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Organizer",
      accessor: "organizer",
      Cell: ({ value }) => (
        <div>
          <p className="font-medium">{value?.fullName || "Unknown"}</p>
          <p className="text-sm text-base dark:text-base-dark">
            {value?.email || "N/A"}
          </p>
        </div>
      ),
    },
    {
      header: "Location",
      accessor: "location",
      Cell: ({ value }) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-base dark:text-base-dark" />
          <p className="text-sm">{value || "N/A"}</p>
        </div>
      ),
    },
    {
      header: "Start Date",
      accessor: "startDate",
      Cell: ({ value }) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-base dark:text-base-dark" />
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      header: "Teams",
      accessor: "maxTeams",
      Cell: ({ row }) => (
        <p className="text-sm">
          {row.teams?.length || 0} / {row.maxTeams}
        </p>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      Cell: ({ value }) => {
        const colors = {
          Upcoming:
            "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
          Ongoing:
            "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
          Completed:
            "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
          Cancelled:
            "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
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
          Tournaments Management
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          View and manage all tournaments
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
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-base-dark dark:border-base rounded-lg bg-base-dark dark:bg-base focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-base-dark dark:border-base rounded-lg bg-base-dark dark:bg-base focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="All">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-base-dark dark:border-base">
          <div>
            <p className="text-sm text-base dark:text-base-dark">
              Total Tournaments
            </p>
            <p className="text-2xl font-bold">{allTournaments?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-base dark:text-base-dark">
              Filtered Results
            </p>
            <p className="text-2xl font-bold">
              {filteredTournaments?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-base dark:text-base-dark">Active</p>
            <p className="text-2xl font-bold">
              {allTournaments?.filter((t) => t.status === "Ongoing").length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Tournaments Table */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base overflow-hidden">
        {filteredTournaments?.length === 0 ? (
          <div className="p-8 text-center text-base dark:text-base-dark">
            No tournaments found
          </div>
        ) : (
          <Table columns={columns} data={filteredTournaments || []} />
        )}
      </div>
    </div>
  );
};

export default Tournaments;
