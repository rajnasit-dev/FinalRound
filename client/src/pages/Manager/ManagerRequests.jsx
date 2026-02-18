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
    // For received requests, the player is the sender; for sent, the receiver
    const playerId = request.sender?._id || request.receiver?._id;
    if (playerId) {
      navigate(`/players/${playerId}`);
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
              src={request.sender?.avatar || defaultAvatar}
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
            variant="success"
            size="sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Accept
          </Button>
          <Button
            onClick={(e) => handleReject(e, request._id)}
            disabled={loading}
            variant="danger"
            size="sm"
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
              src={request.receiver?.avatar || defaultAvatar}
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
          variant="danger"
          size="sm"
        >
          <XCircle className="w-4 h-4" />
          Cancel Invitation
        </Button>
      ),
    },
  ];

  if (loading && receivedRequests.length === 0 && sentRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">Player Requests</h1>
        <p className="text-base dark:text-base-dark">Manage join requests and invitations for your teams</p>
      </div>

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
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Inbox className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
                No Join Requests
              </h3>
              <p className="text-base dark:text-base-dark">
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
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Send className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
                No Sent Invitations
              </h3>
              <p className="text-base dark:text-base-dark">
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
