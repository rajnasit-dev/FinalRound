import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Users,
  User,
  Swords,
} from "lucide-react";
import useDateFormat from "../../hooks/useDateFormat";
import useStatusColor from "../../hooks/useStatusColor";

const MatchDetailModal = ({ match, onClose }) => {
  const { formatDate, formatTime } = useDateFormat();
  const { getStatusColor } = useStatusColor();
  const modalRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!match) return null;

  const isTeamMatch = match.teamA && match.teamB;
  const isPlayerMatch = match.playerA && match.playerB;

  const participantA = isTeamMatch
    ? match.teamA
    : isPlayerMatch
    ? match.playerA
    : null;

  const participantB = isTeamMatch
    ? match.teamB
    : isPlayerMatch
    ? match.playerB
    : null;

  const nameA = isTeamMatch
    ? participantA?.name
    : participantA?.fullName || "TBD";

  const nameB = isTeamMatch
    ? participantB?.name
    : participantB?.fullName || "TBD";

  const linkA = isTeamMatch
    ? `/teams/${participantA?._id}`
    : `/players/${participantA?._id}`;

  const linkB = isTeamMatch
    ? `/teams/${participantB?._id}`
    : `/players/${participantB?._id}`;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-card-background dark:bg-card-background-dark rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border-light dark:border-border-dark shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark sticky top-0 bg-card-background dark:bg-card-background-dark z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
              Match Detail
            </h2>
            {match.tournament && (
              <p className="text-sm text-base dark:text-base-dark mt-1">
                {match.tournament.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg cursor-pointer hover:bg-primary dark:hover:bg-primary-dark transition-colors"
          >
            <X className="w-5 h-5 text-text-primary dark:text-text-primary-dark" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Status & Score Hero */}
          <div className="bg-primary dark:bg-primary-dark rounded-xl p-6">
            <div className="flex flex-col items-center gap-4">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold text-white ${getStatusColor(match.status)}`}
              >
                {match.status === "Live" && (
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                )}
                {match.status}
              </span>

              {/* Participants VS Display */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 w-full">
                {/* Participant A */}
                <div className="flex-1 text-center">
                  {participantA ? (
                    <Link
                      to={linkA}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-primary-dark hover:text-secondary dark:hover:text-accent transition-colors"
                    >
                      {nameA}
                    </Link>
                  ) : (
                    <span className="text-lg font-bold text-base dark:text-base-dark">
                      TBD
                    </span>
                  )}
                </div>

                {/* VS Divider */}
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary/10 dark:bg-accent/10 flex items-center justify-center">
                    <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-secondary dark:text-accent" />
                  </div>
                </div>

                {/* Participant B */}
                <div className="flex-1 text-center">
                  {participantB ? (
                    <Link
                      to={linkB}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-primary-dark hover:text-secondary dark:hover:text-accent transition-colors"
                    >
                      {nameB}
                    </Link>
                  ) : (
                    <span className="text-lg font-bold text-base dark:text-base-dark">
                      TBD
                    </span>
                  )}
                </div>
              </div>

              {/* Match Type */}
              <span className="text-xs font-medium text-base dark:text-base-dark">
                {isTeamMatch ? "Team Match" : isPlayerMatch ? "Individual Match" : "Match"}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Schedule */}
            <div className="bg-primary dark:bg-primary-dark rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                  Schedule
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-base dark:text-base-dark shrink-0" />
                  <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                    {formatDate(match.scheduledAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-base dark:text-base-dark shrink-0" />
                  <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                    {formatTime(match.scheduledAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tournament */}
            {match.tournament && (
              <div className="bg-primary dark:bg-primary-dark rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                    Tournament
                  </h3>
                </div>
                <p className="font-medium text-text-primary dark:text-text-primary-dark">
                  {match.tournament.name}
                </p>
                {match.sport && (
                  <p className="text-xs text-base dark:text-base-dark mt-1">
                    {match.sport.name}
                  </p>
                )}
                {!match.sport && match.tournament.sport && (
                  <p className="text-xs text-base dark:text-base-dark mt-1">
                    {typeof match.tournament.sport === "object"
                      ? match.tournament.sport.name
                      : ""}
                  </p>
                )}
              </div>
            )}

            {/* Venue */}
            {match.ground && (match.ground.name || match.ground.city || match.ground.address) && (
              <div className="bg-primary dark:bg-primary-dark rounded-xl p-4 sm:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                    Venue
                  </h3>
                </div>
                <div className="space-y-1">
                  {match.ground.name && (
                    <p className="font-medium text-text-primary dark:text-text-primary-dark">
                      {match.ground.name}
                    </p>
                  )}
                  {match.ground.address && (
                    <p className="text-sm text-base dark:text-base-dark">
                      {match.ground.address}
                    </p>
                  )}
                  {match.ground.city && (
                    <p className="text-sm text-base dark:text-base-dark">
                      {match.ground.city}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Participants Detail */}
            {participantA && (
              <div className="bg-primary dark:bg-primary-dark rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  {isTeamMatch ? (
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                  <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                    {isTeamMatch ? "Team A" : "Player A"}
                  </h3>
                </div>
                <Link
                  to={linkA}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="font-medium text-text-primary dark:text-text-primary-dark hover:text-secondary dark:hover:text-accent transition-colors"
                >
                  {nameA}
                </Link>
                {isTeamMatch && participantA.city && (
                  <p className="text-xs text-base dark:text-base-dark mt-1">
                    {participantA.city}
                  </p>
                )}
                {isPlayerMatch && participantA.email && (
                  <p className="text-xs text-base dark:text-base-dark mt-1">
                    {participantA.email}
                  </p>
                )}
              </div>
            )}

            {participantB && (
              <div className="bg-primary dark:bg-primary-dark rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  {isTeamMatch ? (
                    <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  ) : (
                    <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  )}
                  <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                    {isTeamMatch ? "Team B" : "Player B"}
                  </h3>
                </div>
                <Link
                  to={linkB}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="font-medium text-text-primary dark:text-text-primary-dark hover:text-secondary dark:hover:text-accent transition-colors"
                >
                  {nameB}
                </Link>
                {isTeamMatch && participantB.city && (
                  <p className="text-xs text-base dark:text-base-dark mt-1">
                    {participantB.city}
                  </p>
                )}
                {isPlayerMatch && participantB.email && (
                  <p className="text-xs text-base dark:text-base-dark mt-1">
                    {participantB.email}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailModal;
