import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTeams } from "../../store/slices/adminSlice";
import { Search, Users, Trophy } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import Table from "../../components/ui/Table";

const Teams = () => {
  const dispatch = useDispatch();
  const { allTeams, loading } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllTeams());
  }, [dispatch]);

  const filteredTeams = allTeams?.filter((team) => {
    return (
      team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.sport?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.manager?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = [
    {
      header: "Team",
      accessor: "name",
      Cell: ({ row }) => (
        <div className="flex items-start gap-3">
          {row.logo && (
            <img
              src={row.logo}
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
      header: "Manager",
      accessor: "manager",
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
      header: "Players",
      accessor: "players",
      Cell: ({ value }) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-base dark:text-base-dark" />
          <p className="text-sm">{value?.length || 0}</p>
        </div>
      ),
    },
    {
      header: "Tournaments",
      accessor: "tournaments",
      Cell: ({ value }) => (
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-base dark:text-base-dark" />
          <p className="text-sm">{value?.length || 0}</p>
        </div>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
      Cell: ({ value }) => (
        <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Teams Management
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          View and manage all teams
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
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-base-dark dark:border-base rounded-lg bg-base-dark dark:bg-base focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-base-dark dark:border-base">
          <div>
            <p className="text-sm text-base dark:text-base-dark">Total Teams</p>
            <p className="text-2xl font-bold">{allTeams?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-base dark:text-base-dark">
              Filtered Results
            </p>
            <p className="text-2xl font-bold">{filteredTeams?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-base dark:text-base-dark">
              Total Players
            </p>
            <p className="text-2xl font-bold">
              {allTeams?.reduce((acc, team) => acc + (team.players?.length || 0), 0) || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base overflow-hidden">
        {filteredTeams?.length === 0 ? (
          <div className="p-8 text-center text-base dark:text-base-dark">
            No teams found
          </div>
        ) : (
          <Table columns={columns} data={filteredTeams || []} />
        )}
      </div>
    </div>
  );
};

export default Teams;
