import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPendingOrganizerRequests,
  authorizeOrganizer,
  rejectOrganizer,
} from "../../store/slices/adminSlice";
import BackButton from "../../components/ui/BackButton";
import { CheckCircle, XCircle, FileText, Trash2, Mail, Phone, User } from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";
import defaultAvatar from "../../assets/defaultAvatar.png";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const OrganizerRequests = () => {
  const dispatch = useDispatch();
  const { pendingOrganizers, loading, error } = useSelector((state) => state.admin);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState(""); // 'approve' or 'reject'
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(getPendingOrganizerRequests());
  }, [dispatch]);

  const filteredOrganizers = pendingOrganizers?.filter((organizer) =>
    organizer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    organizer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleDelete = async (e, organizer) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete ${organizer.fullName}? This action cannot be undone.`)) return;

    setDeletingId(organizer._id);
    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${organizer._id}`, {
        withCredentials: true,
      });
      toast.success(`Organizer ${organizer.fullName} deleted successfully`);
      dispatch(getPendingOrganizerRequests());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete organizer");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRowClick = (organizer) => {
    // Can navigate to organizer detail if needed
  };

  const columns = [
    {
      header: "Organizer",
      width: "35%",
      render: (organizer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <img
              src={organizer.avatarUrl || defaultAvatar}
              alt={organizer.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary dark:text-text-primary-dark truncate">
              {organizer.fullName}
            </p>
            <div className="space-y-1 mt-1">
              <div className="flex items-center gap-1 text-xs text-base dark:text-base-dark">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{organizer.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-base dark:text-base-dark">
                <Phone className="w-3 h-3 shrink-0" />
                <span className="truncate">{organizer.phone || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Organization",
      width: "20%",
      render: (organizer) => (
        <p className="text-sm text-text-primary dark:text-text-primary-dark truncate">
          {organizer.orgName || "N/A"}
        </p>
      ),
    },
    {
      header: "Request Date",
      width: "15%",
      render: (organizer) => (
        <p className="text-sm text-base dark:text-base-dark">
          {new Date(organizer.authorizationRequestDate).toLocaleDateString()}
        </p>
      ),
    },
    {
      header: "Document",
      width: "10%",
      render: (organizer) => (
        organizer.verificationDocumentUrl ? (
          <a
            href={organizer.verificationDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-sm text-secondary hover:underline"
          >
            <FileText className="w-4 h-4" />
            View
          </a>
        ) : (
          <span className="text-sm text-base dark:text-base-dark">N/A</span>
        )
      ),
    },
    {
      header: "Actions",
      width: "20%",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (organizer) => (
        <div className="flex gap-2 justify-end">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(organizer);
            }}
            className="!bg-green-600 hover:!bg-green-700 !text-white px-3 py-2 text-sm"
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleReject(organizer);
            }}
            className="!bg-red-600 hover:!bg-red-700 !text-white px-3 py-2 text-sm"
          >
            <XCircle className="w-4 h-4" />
          </Button>
          <Button
            onClick={(e) => handleDelete(e, organizer)}
            disabled={deletingId === organizer._id}
            className="!bg-gray-600 hover:!bg-gray-700 !text-white px-3 py-2 text-sm"
          >
            {deletingId === organizer._id ? (
              <Spinner size="sm" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <BackButton className="mb-6" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Organizer Authorization Requests
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          Review and authorize tournament organizers
        </p>
      </div>

      {pendingOrganizers?.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Pending Requests
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No pending organizer requests at the moment.
          </p>
        </div>
      ) : (
        <>
          <SearchBar
            placeholder="Search by name or email..."
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            className="mb-8"
          />

          <DataTable
            columns={columns}
            data={filteredOrganizers}
            onRowClick={handleRowClick}
            itemsPerPage={10}
            emptyMessage="No organizer requests found"
          />
        </>
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
