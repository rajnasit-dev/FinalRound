import { useNavigate } from "react-router-dom";
import { Users, MapPin, Trophy, Edit, UserPlus, UserCog, Trash2, Users2 } from "lucide-react";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";
import defaultTeamCoverImage from "../../assets/defaultTeamCoverImage.png";
import CardStat from "./CardStat";

const TeamCard = ({ team, showEditButton = false, onEdit, onManagePlayers, onAddPlayer, onDeleteTeam }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/teams/${team._id}`);
  };
  return (
    <div className="group">
      <div className="relative bg-card-background dark:bg-card-background-dark rounded-xl overflow-hidden border border-base-dark dark:border-base transition-all duration-300 hover:shadow-2xl hover:border-secondary dark:hover:border-secondary hover:-translate-y-1 cursor-pointer" onClick={handleCardClick}>
        {/* Card Header Banner-Avatar */}
        <div className="relative h-32">
          {/* Team Banner */}
          <img
            src={team.bannerUrl || defaultTeamCoverImage}
            alt={team.name}
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>

          {/* Team Avatar */}
          <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <img
              src={team.logoUrl || defaultTeamAvatar}
              alt={team.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Status Badge */}
          {team.openToJoin && (
            <div className="absolute top-4 right-4">
              <p className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-lg">
                Open to Join
              </p>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="pt-12 px-6 pb-5">
          {/* Team Name & Sport */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-secondary transition-colors">
              {team.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Trophy className="w-4 h-4" />
              <p>{team.sport?.name || team.sport}</p>
              <p className="text-gray-400 dark:text-gray-600">•</p>
              <MapPin className="w-4 h-4" />
              <p>{team.city}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <CardStat
              Icon={Users}
              iconColor="text-blue-600 dark:text-blue-400"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
              label="Players"
              value={team.players?.length || 0}
            />
            <CardStat
              Icon={Users2}
              iconColor="text-purple-600 dark:text-purple-400"
              bgColor="bg-purple-50 dark:bg-purple-900/20"
              label="Gender"
              value={team.gender || "Mixed"}
            />
          </div>

          {/* Description */}
          {team.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
              {team.description}
            </p>
          )}

          {/* Buttons */}
          {showEditButton ? (
            <div className="grid grid-cols-2 gap-2 pt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(team._id);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/90 dark:bg-secondary-dark dark:hover:bg-secondary-dark/90 text-white rounded-lg transition-colors font-semibold text-sm"
                title="Edit Team"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManagePlayers && onManagePlayers(team._id);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold text-sm"
                title="Manage Players"
              >
                <UserCog className="w-4 h-4" />
                Manage
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddPlayer && onAddPlayer(team._id);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors font-semibold text-sm"
                title="Add Player"
              >
                <UserPlus className="w-4 h-4" />
                Add Player
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTeam && onDeleteTeam(team._id);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors font-semibold text-sm"
                title="Delete Team"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-3 text-secondary font-semibold group-hover:translate-x-2 transition-transform">
              <p>View Team</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
