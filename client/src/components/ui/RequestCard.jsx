import { CheckCircle2, XCircle, Clock, User, Trophy } from "lucide-react";

const RequestCard = ({
  request,
  type = "received", // "received" or "sent"
  onAccept,
  onReject,
  onCancel,
  loading = false,
}) => {
  const isTeamToPlayer = request.requestType === "TEAM_TO_PLAYER";
  const isSent = type === "sent";

  return (
    <div className="flex items-center justify-between p-4 bg-card-background dark:bg-card-background-dark rounded-lg border border-base-dark dark:border-base hover:shadow-md transition-shadow">
      {/* Left side - Player/Team info */}
      <div className="flex items-center gap-4 flex-1">
        {isTeamToPlayer ? (
          // Team to Player: show team and player
          <>
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
              {request.team?.logoUrl ? (
                <img
                  src={request.team.logoUrl}
                  alt={request.team?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Trophy className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isSent ? "You requested" : "Team requesting"}
              </p>
              <p className="font-semibold truncate">{request.team?.name}</p>
              {request.message && (
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                  "{request.message}"
                </p>
              )}
            </div>
          </>
        ) : (
          // Player to Team: show player and team
          <>
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
              {request.sender?.avatarUrl ? (
                <img
                  src={request.sender.avatarUrl}
                  alt={request.sender?.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isSent ? "Requested" : "Player requesting"}
              </p>
              <p className="font-semibold truncate">{request.sender?.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                {request.team?.name}
              </p>
              {request.message && (
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                  "{request.message}"
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right side - Status and Actions */}
      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
        <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-900/10 rounded-full">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Pending
          </span>
        </div>

        {/* Actions */}
        {!isSent && (
          <div className="flex gap-2">
            <button
              onClick={() => onAccept(request._id)}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
              title="Accept request"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => onReject(request._id)}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
              title="Reject request"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}

        {isSent && (
          <button
            onClick={() => onCancel(request._id)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
            title="Cancel request"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
