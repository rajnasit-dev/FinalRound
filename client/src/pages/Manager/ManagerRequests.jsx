import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  clearError,
  clearRequests,
} from "../../store/slices/requestSlice";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import BackButton from "../../components/ui/BackButton";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import { Inbox, Send, CheckCircle2, XCircle, User } from "lucide-react";
import { toast } from "react-hot-toast";
import defaultAvatar from "../../assets/defaultAvatar.png";

const ManagerRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { receivedRequests, sentRequests, loading, error } = useSelector(
    (state) => state.request
  );
  const [activeTab, setActiveTab] = useState("received");

  useEffect(() => {
    dispatch(getReceivedRequests());
    dispatch(getSentRequests());
  }, [dispatch]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearRequests());
    };
  }, [dispatch]);

  const handleAccept = async (e, requestId) => {
    e.stopPropagation(); // Prevent row click
    try {
      await dispatch(acceptRequest(requestId)).unwrap();
      toast.success("Player request accepted! Player added to your team.");
      dispatch(getReceivedRequests());
    } catch (error) {
      toast.error(error?.message || "Failed to accept request");
    }
  };

  const handleReject = async (e, requestId) => {
    e.stopPropagation(); // Prevent row click
    try {
      await dispatch(rejectRequest(requestId)).unwrap();
      toast.success("Player request rejected");
      dispatch(getReceivedRequests());
    } catch (error) {
      toast.error(error?.message || "Failed to reject request");
    }
  };

  const handleCancel = async (e, requestId) => {
    e.stopPropagation(); // Prevent row click
    try {
      await dispatch(cancelRequest(requestId)).unwrap();
      toast.success("Invitation cancelled");
      dispatch(getSentRequests());
    } catch (error) {
      toast.error(error?.message || "Failed to cancel invitation");
    }
  };

  const handleRowClick = (request) => {
    // Navigate to player profile if needed
    if (request.sender?._id) {
      // You can add navigation to player profile here if you have that route
      // navigate(`/players/${request.sender._id}`);
    }
  };

  // Columns for Received Requests (Join Requests from Players)
  const receivedColumns = [
    {
      header: "Player",
      width: "40%",
      render: (request) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <img
              src={request.sender?.avatarUrl || defaultAvatar}
              alt={request.sender?.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-text-primary dark:text-text-primary-dark truncate">
              {request.sender?.fullName}
            </p>
            <p className="text-xs text-base dark:text-base-dark truncate">
              {request.sender?.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Team",
      width: "30%",
      render: (request) => (
        <div className="min-w-0">
          <p className="text-sm text-text-primary dark:text-text-primary-dark truncate">
            {request.team?.name}
          </p>
        </div>
      ),
    },
    {
      header: "Actions",
      width: "30%",
      render: (request) => (
        <div className="flex gap-2">
          <Button
            onClick={(e) => handleAccept(e, request._id)}
            disabled={loading}
            className="!bg-green-600 hover:!bg-green-700 !text-white px-4 py-2 flex items-center gap-2 text-sm w-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            Accept
          </Button>
          <Button
            onClick={(e) => handleReject(e, request._id)}
            disabled={loading}
            className="!bg-red-600 hover:!bg-red-700 !text-white px-4 py-2 flex items-center gap-2 text-sm w-auto"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  // Columns for Sent Requests (Invitations sent to Players)
  const sentColumns = [
    {
      header: "Player",
      width: "40%",
      render: (request) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <img
              src={request.receiver?.avatarUrl || defaultAvatar}
              alt={request.receiver?.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-text-primary dark:text-text-primary-dark truncate">
              {request.receiver?.fullName}
            </p>
            <p className="text-xs text-base dark:text-base-dark truncate">
              {request.receiver?.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Team",
      width: "30%",
      render: (request) => (
        <div className="min-w-0">
          <p className="text-sm text-text-primary dark:text-text-primary-dark truncate">
            {request.team?.name}
          </p>
        </div>
      ),
    },
    {
      header: "Actions",
      width: "30%",
      render: (request) => (
        <Button
          onClick={(e) => handleCancel(e, request._id)}
          disabled={loading}
          variant="outline"
          className="w-auto px-4 py-2 text-sm"
        >
          <XCircle className="w-4 h-4" />
          Cancel Invitation
        </Button>
      ),
    },
  ];

  if (loading && receivedRequests.length === 0 && sentRequests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <BackButton className="mb-4" />
      <h1 className="text-3xl font-bold mb-6">Player Requests</h1>

      {error && <ErrorMessage message={error} type="error" onDismiss={() => dispatch(clearError())} />}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-base-dark dark:border-base">
        <button
          onClick={() => setActiveTab("received")}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "received"
              ? "border-secondary text-secondary"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          <Inbox className="w-5 h-5" />
          Join Requests ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "sent"
              ? "border-secondary text-secondary"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          <Send className="w-5 h-5" />
          Sent Invitations ({sentRequests.length})
        </button>
      </div>

      {/* Received Requests */}
      {activeTab === "received" && (
        <>
          {receivedRequests.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Join Requests
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No players have requested to join your teams yet.
              </p>
            </div>
          ) : (
            <DataTable
              columns={receivedColumns}
              data={receivedRequests}
              onRowClick={handleRowClick}
              itemsPerPage={receivedRequests.length}
              emptyMessage="No join requests"
            />
          )}
        </>
      )}

      {/* Sent Requests */}
      {activeTab === "sent" && (
        <>
          {sentRequests.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Sent Invitations
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't invited any players to your teams yet.
              </p>
            </div>
          ) : (
            <DataTable
              columns={sentColumns}
              data={sentRequests}
              onRowClick={handleRowClick}
              itemsPerPage={sentRequests.length}
              emptyMessage="No sent invitations"
            />
          )}
        </>
      )}
    </div>
  );
};

export default ManagerRequests;
