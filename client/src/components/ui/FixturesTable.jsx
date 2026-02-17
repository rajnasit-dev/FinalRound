import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Edit } from "lucide-react";
import DataTable from "./DataTable";
import MatchDetailModal from "./MatchDetailModal";
import useDateFormat from "../../hooks/useDateFormat";
import useStatusColor from "../../hooks/useStatusColor";

const FixturesTable = ({ matches, showEditButton = false, onEdit }) => {
  const navigate = useNavigate();
  const { formatDate, formatTime } = useDateFormat();
  const { getStatusColor } = useStatusColor();
  const [selectedMatch, setSelectedMatch] = useState(null);

  const columns = [
    {
      header: "Date & Time",
      width: "20%",
      render: (match) => (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-secondary dark:text-accent mt-0.5 shrink-0" />
          <div className="text-sm font-num">
            <div className="font-medium text-text-primary dark:text-text-primary-dark">
              {formatDate(match.scheduledAt)}
            </div>
            <div className="text-base dark:text-base-dark">
              {formatTime(match.scheduledAt)}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Match",
      width: "35%",
      render: (match) => (
        <div className="text-sm">
          {match.teamA && match.teamB ? (
            <div className="font-medium text-text-primary dark:text-text-primary-dark">
              <Link
                to={`/teams/${match.teamA._id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-secondary dark:hover:text-accent transition-colors"
              >
                {match.teamA.name}
              </Link>
              <span className="mx-2 text-base dark:text-base-dark">vs</span>
              <Link
                to={`/teams/${match.teamB._id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-secondary dark:hover:text-accent transition-colors"
              >
                {match.teamB.name}
              </Link>
            </div>
          ) : match.playerA && match.playerB ? (
            <div className="font-medium text-text-primary dark:text-text-primary-dark">
              <Link
                to={`/players/${match.playerA._id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-secondary dark:hover:text-accent transition-colors"
              >
                {match.playerA.fullName}
              </Link>
              <span className="mx-2 text-base dark:text-base-dark">vs</span>
              <Link
                to={`/players/${match.playerB._id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-secondary dark:hover:text-accent transition-colors"
              >
                {match.playerB.fullName}
              </Link>
            </div>
          ) : (
            <span className="text-base dark:text-base-dark">TBD</span>
          )}
          {match.tournament && (
            <div className="text-xs text-base dark:text-base-dark mt-1 truncate">
              {match.tournament.name}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Venue",
      width: "25%",
      render: (match) => (
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-secondary dark:text-accent mt-0.5 shrink-0" />
          <div className="text-sm min-w-0">
            <div className="font-medium text-text-primary dark:text-text-primary-dark truncate">
              {match.ground?.name || "TBD"}
            </div>
            <div className="text-base dark:text-base-dark truncate">
              {match.ground?.city || ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      width: showEditButton ? "10%" : "20%",
      render: (match) => (
        <span
          className={`text-white inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(match.status)}`}
        >
          {match.status === "Live" && (
            <span className="w-2 h-2 text-white bg-current rounded-full animate-pulse mr-2"></span>
          )}
          {match.status}
        </span>
      ),
    },
  ];

  if (showEditButton) {
    columns.push({
      header: "Actions",
      headerClassName: "text-center",
      cellClassName: "text-center",
      width: "10%",
      render: (match) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(match);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary dark:bg-accent hover:bg-secondary/90 dark:hover:bg-accent/90 text-white dark:text-black rounded-lg font-medium transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      ),
    });
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={matches || []}
        itemsPerPage={10}
        emptyMessage="No fixtures available"
        onRowClick={(match) => setSelectedMatch(match)}
      />

      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </>
  );
};

export default FixturesTable;
