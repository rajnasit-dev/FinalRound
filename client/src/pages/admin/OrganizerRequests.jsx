import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPendingOrganizerRequests,
  authorizeOrganizer,
  rejectOrganizer,
} from "../../store/slices/adminSlice";
import BackButton from "../../components/ui/BackButton";
import { CheckCircle, XCircle, FileText, Mail, Phone, User } from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";
import defaultAvatar from "../../assets/defaultAvatar.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const OrganizerRequests = () => {
  const dispatch = useDispatch();
  const { pendingOrganizers, loading, error } = useSelector((state) => state.admin);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    dispatch(getPendingOrganizerRequests());
  }, [dispatch]);

  const filteredOrganizers = pendingOrganizers?.filter((organizer) =>
    organizer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    organizer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (e, organizer) => {
    e.stopPropagation();
    setProcessingId(organizer._id);
    try {
      await dispatch(authorizeOrganizer(organizer._id)).unwrap();
      toast.success(`${organizer.fullName} has been approved`);
      dispatch(getPendingOrganizerRequests());
    } catch (error) {
      toast.error(error?.message || "Failed to approve organizer");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (e, organizer) => {
    e.stopPropagation();
    setProcessingId(organizer._id);
    try {
      await dispatch(
        rejectOrganizer({ organizerId: organizer._id })
      ).unwrap();
      toast.success(`${organizer.fullName}'s request has been rejected`);
      dispatch(getPendingOrganizerRequests());
    } catch (error) {
      toast.error(error?.message || "Failed to reject organizer");
    } finally {
      setProcessingId(null);
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
              src={organizer.avatar || defaultAvatar}
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
            href={`${API_BASE_URL}/tournament-organizers/document/${organizer._id}`}
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
            onClick={(e) => handleApprove(e, organizer)}
            disabled={processingId === organizer._id}
            loading={processingId === organizer._id}
            variant="success"
            size="sm"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </Button>
          <Button
            onClick={(e) => handleReject(e, organizer)}
            disabled={processingId === organizer._id}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
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
    </div>
  );
};

export default OrganizerRequests;
