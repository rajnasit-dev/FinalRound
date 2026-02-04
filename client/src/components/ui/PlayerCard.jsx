import { Link } from "react-router-dom";
import {
  User,
  Trophy,
  ArrowRight,
  Target,
  Activity,
  MapPin,
  Ruler,
  Weight,
} from "lucide-react";
import defaultAvatar from "../../assets/defaultAvatar.png";
import defaultCoverImage from "../../assets/defaultCoverImage.png";
import CardStat from "./CardStat";
import useAge from "../../hooks/useAge";

const PlayerCard = ({ player }) => {
  const firstSport = player?.sports?.[0];
  const firstSportName =
    typeof firstSport === "string"
      ? firstSport
      : firstSport?.sport?.name ||
        firstSport?.sport?.sportsName ||
        firstSport?.name ||
        firstSport?.sportsName ||
        null;

  const displayRole =
    player?.playingRole ||
    firstSport?.role ||
    (player?.sports || []).find((sport) => sport?.role)?.role ||
    "Player";

  const coverImage = player?.coverImageUrl || player?.banner || player?.coverImage || defaultCoverImage;
  const avatarImage = player?.avatarUrl || player?.avatar || defaultAvatar;
  const age = useAge(player?.dateOfBirth);

  return (
    <Link to={`/players/${player._id}`} className="group">
      <div className="relative bg-card-background dark:bg-card-background-dark rounded-xl overflow-hidden border border-base-dark dark:border-base transition-all duration-300 hover:shadow-2xl hover:border-secondary dark:hover:border-secondary hover:-translate-y-1">
        {/* Card Header Banner-Avatar */}
        <div className="relative h-32">
          {/* Player Banner */}
          <img
            src={coverImage}
            alt={player?.fullName || "Player"}
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>

          {/* Player Avatar */}
          <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <img
              src={avatarImage}
              alt={player?.fullName || "Player"}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Gender Badge */}
          {player.gender && (
            <div className="absolute top-4 right-4">
              <p className="inline-flex items-center px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded-full shadow-lg">
                {player.gender}
              </p>
            </div>
          )}
          
        </div>

        {/* Content Section */}
        <div className="pt-12 px-6 pb-5">
          {/* Player Name & Role */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-secondary transition-colors">
              {player.fullName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Target className="w-4 h-4" />
              <p>{displayRole}</p>
              {firstSportName && (
                <>
                  <p className="text-gray-400 dark:text-gray-600">•</p>
                  <Activity className="w-4 h-4" />
                  <p>{firstSportName}</p>
                </>
              )}
            </div>
          </div>

          {/* Player Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            {age && (
              <CardStat
                Icon={User}
                iconColor="text-blue-600 dark:text-blue-400"
                bgColor="bg-blue-50 dark:bg-blue-900/20"
                label="Age"
                value={`${age} yrs`}
              />
            )}

            {player.height && (
              <CardStat
                Icon={Ruler}
                iconColor="text-green-600 dark:text-green-400"
                bgColor="bg-green-50 dark:bg-green-900/20"
                label="Height"
                value={`${player.height} cm`}
              />
            )}

            {player.weight && (
              <CardStat
                Icon={Weight}
                iconColor="text-amber-600 dark:text-amber-400"
                bgColor="bg-amber-50 dark:bg-amber-900/20"
                label="Weight"
                value={`${player.weight} kg`}
              />
            )}

            {player.city && (
              <CardStat
                Icon={MapPin}
                iconColor="text-purple-600 dark:text-purple-400"
                bgColor="bg-purple-50 dark:bg-purple-900/20"
                label="Location"
                value={player.city}
              />
            )}
          </div>

          {/* Bio */}
          {player.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
              {player.bio}
            </p>
          )}

          {/* View Details Button */}
          <div className="flex items-center justify-between pt-3 text-secondary font-semibold group-hover:translate-x-2 transition-transform">
            <p>View Profile</p>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlayerCard;
