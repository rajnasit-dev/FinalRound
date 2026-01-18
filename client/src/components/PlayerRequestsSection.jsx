import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
} from "../store/slices/requestSlice";
import Container from "./container/Container";
import RequestCard from "./ui/RequestCard";
import Spinner from "../components/ui/Spinner";
import { Inbox, Send } from "lucide-react";

const PlayerRequestsSection = () => {
  const dispatch = useDispatch();
  const { receivedRequests, sentRequests, loading, error } = useSelector(
    (state) => state.request
  );
  const [activeTab, setActiveTab] = useState("received");

  useEffect(() => {
    dispatch(getReceivedRequests());
    dispatch(getSentRequests());
  }, [dispatch]);

  const handleAccept = async (requestId) => {
    await dispatch(acceptRequest(requestId));
    // Refresh the list
    dispatch(getReceivedRequests());
  };

  const handleReject = async (requestId) => {
    await dispatch(rejectRequest(requestId));
    // Refresh the list
    dispatch(getReceivedRequests());
  };

  const handleCancel = async (requestId) => {
    await dispatch(cancelRequest(requestId));
    // Refresh the list
    dispatch(getSentRequests());
  };

  if (loading && receivedRequests.length === 0 && sentRequests.length === 0) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </Container>
    );
  }

  const hasRequests = receivedRequests.length > 0 || sentRequests.length > 0;

  if (!hasRequests) {
    return (
      <Container>
        <div className="text-center py-12">
          <Inbox className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Requests
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have any team requests at the moment.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="text-2xl font-bold mb-6">Team Requests</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

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
          Received ({receivedRequests.length})
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
          Sent ({sentRequests.length})
        </button>
      </div>

      {/* Received Requests */}
      {activeTab === "received" && (
        <div className="space-y-3">
          {receivedRequests.length === 0 ? (
            <div className="text-center py-8">
              <Inbox className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No received requests
              </p>
            </div>
          ) : (
            receivedRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                type="received"
                onAccept={handleAccept}
                onReject={handleReject}
                loading={loading}
              />
            ))
          )}
        </div>
      )}

      {/* Sent Requests */}
      {activeTab === "sent" && (
        <div className="space-y-3">
          {sentRequests.length === 0 ? (
            <div className="text-center py-8">
              <Send className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No sent requests
              </p>
            </div>
          ) : (
            sentRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                type="sent"
                onCancel={handleCancel}
                loading={loading}
              />
            ))
          )}
        </div>
      )}
    </Container>
  );
};

export default PlayerRequestsSection;
