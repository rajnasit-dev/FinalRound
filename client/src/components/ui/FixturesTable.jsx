import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Edit, Swords } from "lucide-react";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";
import DataTable from "./DataTable";
import MatchDetailModal from "./MatchDetailModal";
import useDateFormat from "../../hooks/useDateFormat";
import useStatusColor from "../../hooks/useStatusColor";

const FixturesTable = ({ matches, showEditButton = false, onEdit }) => {
  const navigate = useNavigate();
  const { formatDate, formatTime } = useDateFormat();
  const { getStatusColor } = useStatusColor();
  const [selectedMatch, setSelectedMatch] = useState(null);

  const getTeamLogo = (team) => team?.logoUrl || team?.logo || defaultTeamAvatar;

  const columns = [
    {
      header: "Match",
      width: showEditButton ? "56%" : "62%",
      headerClassName: "tracking-wide",
      render: (match) => (
        <div className="text-sm">
          {match.teamA && match.teamB ? (
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to={`/teams/${match.teamA._id}`}
                onClick={(e) => e.stopPropagation()}
                className="group flex items-center gap-2.5 min-w-0 max-w-[42%] rounded-xl px-2.5 py-2 bg-card-background/80 dark:bg-card-background-dark/70 border border-base-dark/20 dark:border-base/30 hover:border-secondary/60 dark:hover:border-accent/50 transition-colors"
                title={match.teamA.name}
              >
                <img
                  src={getTeamLogo(match.teamA)}
                  alt={match.teamA.name}
                  className="w-11 h-11 rounded-full object-cover border border-border-light dark:border-border-dark shrink-0"
                />
                <span className="truncate font-semibold text-text-primary dark:text-text-primary-dark group-hover:text-secondary dark:group-hover:text-accent transition-colors">
                  {match.teamA.name}
                </span>
              </Link>

              <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-secondary/10 dark:bg-accent/10 text-secondary dark:text-accent shrink-0">
                <Swords className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wide">VS</span>
              </div>

              <Link
                to={`/teams/${match.teamB._id}`}
                onClick={(e) => e.stopPropagation()}
                className="group flex items-center gap-2.5 min-w-0 max-w-[42%] rounded-xl px-2.5 py-2 bg-card-background/80 dark:bg-card-background-dark/70 border border-base-dark/20 dark:border-base/30 hover:border-secondary/60 dark:hover:border-accent/50 transition-colors"
                title={match.teamB.name}
              >
                <img
                  src={getTeamLogo(match.teamB)}
                  alt={match.teamB.name}
                  className="w-11 h-11 rounded-full object-cover border border-border-light dark:border-border-dark shrink-0"
                />
                <span className="truncate font-semibold text-text-primary dark:text-text-primary-dark group-hover:text-secondary dark:group-hover:text-accent transition-colors">
                  {match.teamB.name}
                </span>
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
        </div>
      ),
    },
    {
      header: "Date & Time",
      width: showEditButton ? "22%" : "23%",
      headerClassName: "tracking-wide",
      render: (match) => (
        <div className="inline-flex items-start gap-2.5 rounded-xl px-3 py-2 bg-card-background/80 dark:bg-card-background-dark/70 border border-base-dark/20 dark:border-base/30">
          <div className="w-7 h-7 rounded-full bg-secondary/15 dark:bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-4 h-4 text-secondary dark:text-accent" />
          </div>
          <div className="text-sm font-num leading-tight">
            <div className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
              {formatDate(match.scheduledAt)}
            </div>
            <div className="text-xs mt-1 text-base dark:text-base-dark">
              {formatTime(match.scheduledAt)}
            </div>
          </div>
        </div>
      ),
    },
    ...(showEditButton ? [] : [{
      header: "",
      width: "15%",
      headerClassName: "tracking-wide",
      cellClassName: "align-middle",
      render: (match) => {
        if (match.status !== "Cancelled" && !match.isCancelled) return null;
        return (
          <span
            className={`text-white inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide shadow-sm ${getStatusColor(match.status)}`}
          >
            {match.status}
          </span>
        );
      },
    }]),
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
