import { Link } from "react-router-dom";
import { formatINR } from "../../utils/formatINR";
import {
  ArrowRight,
  CalendarClock,
  IndianRupee,
  MapPin,
  Trophy,
  Edit,
  Trash2,
  Settings,
  Eye,
  Ban,
  RotateCcw,
} from "lucide-react";
import useStatusColor from "../../hooks/useStatusColor";
import useDateFormat from "../../hooks/useDateFormat";
import defaultTournamentCoverImage from "../../assets/defaultTournamentCoverImage.png";
import CardStat from "./CardStat";

const TournamentCard = ({ 
  tournament, 
  isManager = false, 
  registrationStatusBadge = null,
  showOrganizerButtons = false,
  onEdit,
  onDelete,
  onCancel,
  onManage,
  onView,
}) => {
  const { getStatusColor } = useStatusColor();
  const { formatDate } = useDateFormat();

  // Check if registration is open
  const isRegistrationOpen = () => {
    if (!tournament.registrationStart || !tournament.registrationEnd) {
      return false;
    }
    const currentDate = new Date();
    const startDate = new Date(tournament.registrationStart);
    const endDate = new Date(tournament.registrationEnd);
    return currentDate >= startDate && currentDate <= endDate;
  };

  const registrationOpen = isRegistrationOpen();

  return (
    <Link to={`/tournaments/${tournament._id || tournament.id}`} className="group">
      <div className="relative bg-card-background dark:bg-card-background-dark rounded-xl overflow-hidden border border-base-dark dark:border-base transition-all duration-300 hover:shadow-2xl hover:border-secondary dark:hover:border-secondary hover:-translate-y-1">
        {/* Card Header Banner-Avatar */}
        <div className="relative h-32">
          {/* Tournament Banner */}
          <img
            src={tournament.bannerUrl || defaultTournamentCoverImage}
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>

          {/* Type Badge - Top Left */}
          {tournament.registrationType && (
            <div className="absolute top-4 left-4">
              <p className="inline-flex items-center px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                {tournament.registrationType}
              </p>
            </div>
          )}

          {/* Status Badge - Top Right */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            <p
              className={`inline-flex items-center gap-1 px-3 py-1 ${getStatusColor(
                tournament.status
              )} text-white text-xs font-semibold rounded-full shadow-lg`}
            >
              {tournament.status === "Live" && (
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              )}
              {tournament.status}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-6 px-6 pb-5">
          

          {/* Tournament Name & Sport */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-secondary transition-colors">
              {tournament.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Trophy className="w-4 h-4" />
              <p>{tournament.sport?.name || tournament.sport}</p>
              <p className="text-gray-400 dark:text-gray-600">•</p>
              <MapPin className="w-4 h-4" />
              <p>{tournament.ground?.city || tournament.city || 'TBA'}</p>
            </div>
          </div>

          {/* Tournament Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <CardStat
              Icon={CalendarClock}
              iconColor="text-blue-600 dark:text-blue-400"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
              label="Reg. Start"
              value={tournament.registrationStart ? formatDate(tournament.registrationStart) : "TBA"}
            />

            <CardStat
              Icon={CalendarClock}
              iconColor="text-purple-600 dark:text-purple-400"
              bgColor="bg-purple-50 dark:bg-purple-900/20"
              label="Reg. End"
              value={tournament.registrationEnd ? formatDate(tournament.registrationEnd) : "TBA"}
            />

            <CardStat
              Icon={CalendarClock}
              iconColor="text-green-600 dark:text-green-400"
              bgColor="bg-green-50 dark:bg-green-900/20"
              label="Start Date"
              value={formatDate(tournament.startDate)}
            />

            <CardStat
              Icon={CalendarClock}
              iconColor="text-amber-600 dark:text-amber-400"
              bgColor="bg-amber-50 dark:bg-amber-900/20"
              label="End Date"
              value={formatDate(tournament.endDate)}
            />

            <CardStat
              Icon={IndianRupee}
              iconColor="text-cyan-600 dark:text-cyan-400"
              bgColor="bg-cyan-50 dark:bg-cyan-900/20"
              label="Entry Fee"
              value={tournament.entryFee ? `₹${formatINR(tournament.entryFee)}` : "Free"}
            />

            <CardStat
              Icon={IndianRupee}
              iconColor="text-emerald-600 dark:text-emerald-400"
              bgColor="bg-emerald-50 dark:bg-emerald-900/20"
              label="Prize Pool"
              value={`₹${formatINR(tournament.prizePool || 0)}`}
            />
          </div>

          {/* Organizer Actions */}
          {showOrganizerButtons ? (
            <>
              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit && onEdit(tournament._id);
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold text-sm"
                  title="Edit Tournament"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onManage && onManage(tournament._id);
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors font-semibold text-sm"
                  title="Manage Participants"
                >
                  <Settings className="w-4 h-4" />
                  Participants
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onView && onView(tournament._id);
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold text-sm"
                  title="Manage Fixtures"
                >
                  <Trophy className="w-4 h-4" />
                  Fixtures
                </button>
                {tournament.status !== "Cancelled" ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCancel && onCancel(tournament._id, false);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg transition-colors font-semibold text-sm"
                    title="Cancel Tournament"
                  >
                    <Ban className="w-4 h-4" />
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCancel && onCancel(tournament._id, true);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors font-semibold text-sm"
                    title="Reinstate Tournament"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reinstate
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete && onDelete(tournament._id);
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors font-semibold text-sm"
                  title="Delete Tournament"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          ) : isManager ? (
            <div className="flex items-center justify-between pt-3 font-semibold text-secondary group-hover:translate-x-2 transition-transform">
              <p>View Tournament</p>
              <ArrowRight className="w-5 h-5" />
            </div>
          ) : (
            <div className="flex items-center justify-between pt-3 font-semibold text-secondary group-hover:translate-x-2 transition-transform">
              <p>View Tournament</p>
              <ArrowRight className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TournamentCard;
