import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPendingOrganizerRequests,
  authorizeOrganizer,
  rejectOrganizer,
} from "../../store/slices/adminSlice";
import { CheckCircle, XCircle, FileText, Calendar, Mail } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

const OrganizerRequests = () => {
  const dispatch = useDispatch();
  const { pendingOrganizers, loading, error } = useSelector((state) => state.admin);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState(""); // 'approve' or 'reject'

  useEffect(() => {
    dispatch(getPendingOrganizerRequests());
  }, [dispatch]);

  const handleApprove = (organizer) => {
    setSelectedOrganizer(organizer);
    setActionType("approve");
    setShowModal(true);
  };

  const handleReject = (organizer) => {
    setSelectedOrganizer(organizer);
    setActionType("reject");
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (actionType === "approve") {
      await dispatch(authorizeOrganizer(selectedOrganizer._id));
    } else {
      await dispatch(
        rejectOrganizer({ organizerId: selectedOrganizer._id, reason: rejectionReason })
      );
    }
    setShowModal(false);
    setSelectedOrganizer(null);
    setRejectionReason("");
    dispatch(getPendingOrganizerRequests());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Organizer Authorization Requests
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          Review and authorize tournament organizers
        </p>
      </div>

      {pendingOrganizers?.length === 0 ? (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-8 text-center">
          <p className="text-base dark:text-base-dark">No pending organizer requests</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingOrganizers?.map((organizer) => (
            <div
              key={organizer._id}
              className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{organizer.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-base dark:text-base-dark" />
                    <p className="text-sm text-base dark:text-base-dark">
                      {organizer.email}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium">
                  Pending
                </span>
              </div>

              {/* Request Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-base dark:text-base-dark" />
                <p className="text-sm text-base dark:text-base-dark">
                  Requested:{" "}
                  {new Date(
                    organizer.authorizationRequestDate
                  ).toLocaleDateString()}
                </p>
              </div>

              {/* Document */}
              {organizer.verificationDocumentUrl && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-base dark:text-base-dark" />
                  <a
                    href={organizer.verificationDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-secondary hover:underline"
                  >
                    View Verification Document
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-base-dark dark:border-base">
                <Button
                  variant="primary"
                  leftIcon={CheckCircle}
                  onClick={() => handleApprove(organizer)}
                  className="flex-1"
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  leftIcon={XCircle}
                  onClick={() => handleReject(organizer)}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">
              {actionType === "approve" ? "Approve Organizer" : "Reject Organizer"}
            </h2>
            <p className="text-base dark:text-base-dark">
              {actionType === "approve"
                ? `Are you sure you want to approve ${selectedOrganizer?.fullName} as an authorized tournament organizer?`
                : `Are you sure you want to reject ${selectedOrganizer?.fullName}'s request?`}
            </p>

            {actionType === "reject" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-base-dark dark:border-base rounded-lg bg-base-dark dark:bg-base focus:outline-none focus:ring-2 focus:ring-secondary"
                  rows="4"
                  placeholder="Enter reason for rejection..."
                  required
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={actionType === "approve" ? "primary" : "danger"}
                onClick={confirmAction}
                className="flex-1"
                disabled={actionType === "reject" && !rejectionReason.trim()}
              >
                {actionType === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrganizerRequests;
