import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const OrganizerAuthorization = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAuthorizationStatus();
  }, []);

  const fetchAuthorizationStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tournament-organizers/authorization-status`, {
        withCredentials: true,
      });
      setAuthStatus(response.data.data);
    } catch (err) {
      console.error("Error fetching authorization status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type (PDF, images)
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Please upload a PDF or image file (JPG, PNG)");
        return;
      }
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size should not exceed 5MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please upload a verification document");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("document", file);

      const response = await axios.post(
        `${API_BASE_URL}/tournament-organizers/request-authorization`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Authorization request submitted successfully!");
      setFile(null);
      fetchAuthorizationStatus();

      setTimeout(() => {
        navigate("/organizer/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error submitting authorization request:", err);
      setError(err.response?.data?.message || "Failed to submit request. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // If already authorized
  if (user?.isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-8 border border-green-500/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                Authorization Approved
              </h2>
              <p className="text-green-600 dark:text-green-400">
                Your organization is verified and authorized
              </p>
            </div>
          </div>
          <p className="text-base dark:text-base-dark">
            You can now create and manage tournaments on the platform.
          </p>
          <Button
            onClick={() => navigate("/organizer/dashboard")}
            className="mt-6 !w-auto px-6"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // If request is pending
  if (authStatus?.status === "pending") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-8 border border-amber-500/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                Authorization Pending
              </h2>
              <p className="text-amber-600 dark:text-amber-400">
                Your request is under review
              </p>
            </div>
          </div>
          <p className="text-base dark:text-base-dark mb-4">
            Your authorization request has been submitted and is currently being reviewed by our admin team.
            You will be notified once a decision has been made.
          </p>
          {authStatus?.verificationDocumentUrl && (
            <div className="mt-4 p-4 bg-primary/50 dark:bg-primary-dark/50 rounded-lg">
              <p className="text-sm text-base dark:text-base-dark mb-2">Submitted Document:</p>
              <a
                href={authStatus.verificationDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:underline inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View Document
              </a>
            </div>
          )}
          <Button
            onClick={() => navigate("/organizer/dashboard")}
            className="mt-6 !w-auto px-6"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // If request was rejected
  if (authStatus?.status === "rejected") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-8 border border-red-500/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                Authorization Rejected
              </h2>
              <p className="text-red-600 dark:text-red-400">
                Your request was not approved
              </p>
            </div>
          </div>

          <p className="text-base dark:text-base-dark mb-6">
            You can submit a new request with updated documentation.
          </p>
          <Button
            onClick={() => {
              setAuthStatus(null);
              fetchAuthorizationStatus();
            }}
            className="!w-auto px-6"
          >
            Submit New Request
          </Button>
        </div>
      </div>
    );
  }

  // Authorization request form
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          Organization Authorization
        </h1>
        <p className="text-base dark:text-base-dark">
          Submit verification documents to get authorized for creating tournaments
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-1">
              Why do I need authorization?
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              To maintain the quality and credibility of tournaments on our platform, all organizers must
              be verified. This helps protect participants and ensures professional tournament management.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-8 border border-base-dark dark:border-base">
        {error && <ErrorMessage message={error} type="error" className="mb-6" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
              Upload Verification Document <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-base dark:text-base-dark mb-4">
              Please upload official documents proving your organization's legitimacy (business license, registration certificate, tax documents, etc.)
            </p>
            
            <div className="border-2 border-dashed border-base-dark dark:border-base rounded-lg p-8 text-center">
              <input
                type="file"
                id="document-upload"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <p className="text-text-primary dark:text-text-primary-dark font-semibold mb-1">
                    Click to upload document
                  </p>
                  <p className="text-sm text-base dark:text-base-dark">
                    PDF, JPG, PNG (Max 5MB)
                  </p>
                </div>
              </label>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-400">
                      {file.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={() => navigate("/organizer/dashboard")}
              className="flex-1 bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-secondary dark:bg-secondary-dark hover:opacity-90"
              disabled={!file || uploading}
              loading={uploading}
            >
              <CheckCircle className="w-5 h-5" />
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizerAuthorization;
