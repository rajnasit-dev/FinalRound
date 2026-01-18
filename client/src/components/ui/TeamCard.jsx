import { Link } from "react-router-dom";
import { Users, MapPin, Trophy, ArrowRight, Star, Edit } from "lucide-react";
import defaultTeamAvatar from "../../assets/defaultTeamAvatar.png";
import defaultTeamCoverImage from "../../assets/defaultTeamCoverImage.png";
import CardStat from "./CardStat";

const TeamCard = ({ team, showEditButton = false, onEdit }) => {
  return (
    <Link to={`/teams/${team._id}`} className="group">
      <div className="relative bg-card-background dark:bg-card-background-dark rounded-xl overflow-hidden border border-base-dark dark:border-base transition-all duration-300 hover:shadow-2xl hover:border-secondary dark:hover:border-secondary hover:-translate-y-1">
        {/* Card Header Banner-Avatar */}
        <div className="relative h-32">
          {/* Team Banner */}
          <img
            src={team.banner || defaultTeamCoverImage}
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
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <CardStat
              Icon={Users}
              iconColor="text-blue-600 dark:text-blue-400"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
              label="Players"
              value={team.players?.length || 0}
            />

            {team.captain && (
              <CardStat
                Icon={Star}
                iconColor="text-amber-600 dark:text-amber-400"
                bgColor="bg-amber-50 dark:bg-amber-900/20"
                label="Captain"
                value={team.captain.fullName.split(" ")[0]}
              />
            )}
          </div>

          {/* Description */}
          {team.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
              {team.description}
            </p>
          )}

          {/* View Details / Edit Button */}
          <div className="flex items-center justify-between pt-3 text-secondary font-semibold group-hover:translate-x-2 transition-transform">
            <p>View Team</p>
            <div className="flex gap-2">
              {showEditButton && onEdit && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit(team._id);
                  }}
                  className="p-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 dark:bg-secondary-dark/10 dark:hover:bg-secondary-dark/20 text-secondary dark:text-secondary-dark transition-colors"
                  title="Edit Team"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TeamCard;
