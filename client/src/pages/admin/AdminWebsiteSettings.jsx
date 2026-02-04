import { useState, useEffect } from "react";
import { Settings, DollarSign, Video, Upload, Trash2, Save } from "lucide-react";
import axios from "axios";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const AdminWebsiteSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [formData, setFormData] = useState({
    platformFee: 500,
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/website-settings`, {
        withCredentials: true,
      });
      setSettings(response.data.data);
      setFormData({
        platformFee: response.data.data.platformFee || 500,
        siteName: response.data.data.siteName || "",
        siteDescription: response.data.data.siteDescription || "",
        contactEmail: response.data.data.contactEmail || "",
        contactPhone: response.data.data.contactPhone || "",
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Platform Fee validation
    if (!formData.platformFee || formData.platformFee < 0) {
      errors.platformFee = "Platform fee must be a positive number";
    } else if (formData.platformFee > 10000) {
      errors.platformFee = "Platform fee cannot exceed ₹10,000";
    }

    // Site Name validation
    if (!formData.siteName || formData.siteName.trim() === "") {
      errors.siteName = "Site name is required";
    } else if (formData.siteName.length < 3) {
      errors.siteName = "Site name must be at least 3 characters";
    } else if (formData.siteName.length > 50) {
      errors.siteName = "Site name must not exceed 50 characters";
    }

    // Contact Email validation
    if (!formData.contactEmail || formData.contactEmail.trim() === "") {
      errors.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = "Please enter a valid email address";
    }

    // Contact Phone validation
    if (!formData.contactPhone || formData.contactPhone.trim() === "") {
      errors.contactPhone = "Contact phone is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.contactPhone)) {
      errors.contactPhone = "Please enter a valid phone number";
    } else if (formData.contactPhone.replace(/[^\d]/g, "").length < 10) {
      errors.contactPhone = "Phone number must be at least 10 digits";
    }

    // Site Description validation (optional but has max length)
    if (formData.siteDescription && formData.siteDescription.length > 500) {
      errors.siteDescription = "Site description must not exceed 500 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSettings = async () => {
    // Validate form before saving
    if (!validateForm()) {
      toast.error("Please fix all validation errors");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.put(
        `${API_BASE_URL}/admin/website-settings`,
        formData,
        { withCredentials: true }
      );
      setSettings(response.data.data);
      toast.success("Settings updated successfully!");
      setError(null);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(err.response?.data?.message || "Failed to save settings");
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (video)
      if (!file.type.startsWith("video/")) {
        toast.error("Please upload a video file");
        return;
      }
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video file size should not exceed 100MB");
        return;
      }
      setVideoFile(file);
    }
  };

  const handleUploadVideo = async () => {
    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("video", videoFile);

      const response = await axios.post(
        `${API_BASE_URL}/admin/website-settings/hero-video`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSettings(response.data.data);
      setVideoFile(null);
      toast.success("Hero video uploaded successfully!");
      setError(null);
    } catch (err) {
      console.error("Error uploading video:", err);
      setError(err.response?.data?.message || "Failed to upload video");
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!window.confirm("Are you sure you want to delete the hero video?")) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/admin/website-settings/hero-video`,
        { withCredentials: true }
      );
      setSettings(response.data.data);
      toast.success("Hero video deleted successfully!");
      setError(null);
    } catch (err) {
      console.error("Error deleting video:", err);
      setError(err.response?.data?.message || "Failed to delete video");
      toast.error("Failed to delete video");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          Website Settings
        </h1>
        <p className="text-base dark:text-base-dark">
          Configure platform fees, hero video, and other website settings
        </p>
      </div>

      {error && <ErrorMessage message={error} type="error" />}

      {/* Platform Fee Section */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
        <div className="flex items-center gap-3 mb-6">
          
          <div>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
              Platform Details
            </h2>
            <p className="text-sm text-base dark:text-base-dark">
              Fee charged to organizers for creating tournaments
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
              Tournament Platform Fee (₹)
            </label>
            <input
              type="number"
              name="platformFee"
              value={formData.platformFee}
              onChange={handleInputChange}
              min="0"
              step="1"
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 ${
                validationErrors.platformFee
                  ? "border-red-500 focus:ring-red-500"
                  : "border-base-dark dark:border-base focus:ring-secondary"
              }`}
            />
            {validationErrors.platformFee && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.platformFee}</p>
            )}
            <p className="mt-2 text-sm text-base dark:text-base-dark">
              Current fee: ₹{settings?.platformFee || 0} per tournament
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Site Name
              </label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleInputChange}
                placeholder="e.g., SportsHub"
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 ${
                  validationErrors.siteName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-base-dark dark:border-base focus:ring-secondary"
                }`}
              />
              {validationErrors.siteName && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.siteName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="contact@sportshub.com"
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 ${
                  validationErrors.contactEmail
                    ? "border-red-500 focus:ring-red-500"
                    : "border-base-dark dark:border-base focus:ring-secondary"
                }`}
              />
              {validationErrors.contactEmail && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.contactEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="+91-9876543210"
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 ${
                  validationErrors.contactPhone
                    ? "border-red-500 focus:ring-red-500"
                    : "border-base-dark dark:border-base focus:ring-secondary"
                }`}
              />
              {validationErrors.contactPhone && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.contactPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Site Description
              </label>
              <textarea
                name="siteDescription"
                value={formData.siteDescription}
                onChange={handleInputChange}
                rows="3"
                placeholder="Brief description of your sports platform..."
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 resize-none ${
                  validationErrors.siteDescription
                    ? "border-red-500 focus:ring-red-500"
                    : "border-base-dark dark:border-base focus:ring-secondary"
                }`}
              />
              {validationErrors.siteDescription && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.siteDescription}</p>
              )}
              <p className="mt-1 text-xs text-base dark:text-base-dark">
                {formData.siteDescription.length}/500 characters
              </p>
            </div>
          </div>

          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="!w-auto px-6 bg-secondary dark:bg-secondary-dark hover:opacity-90"
          >
            {saving ? (
              <>
                <Spinner size="sm" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hero Video Section */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
              Hero Section Video
            </h2>
            <p className="text-sm text-base dark:text-base-dark">
              Upload a video for the home page hero section
            </p>
          </div>
        </div>

        {settings?.heroVideoUrl && (
          <div className="mb-6 p-4 bg-primary/50 dark:bg-primary-dark/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                Current Hero Video
              </p>
              <Button
                onClick={handleDeleteVideo}
                className="!w-auto px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
            <video
              src={settings.heroVideoUrl}
              controls
              className="w-full max-w-2xl rounded-lg"
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
              Upload New Video
            </label>
            <div className="border-2 border-dashed border-base-dark dark:border-base rounded-lg p-6 text-center">
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                onChange={handleVideoFileChange}
                className="hidden"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <p className="text-text-primary dark:text-text-primary-dark font-semibold mb-1">
                    Click to upload video
                  </p>
                  <p className="text-sm text-base dark:text-base-dark">
                    MP4, WebM (Max 100MB)
                  </p>
                </div>
              </label>
            </div>

            {videoFile && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-400">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <Button
            onClick={handleUploadVideo}
            disabled={!videoFile || uploading}
            className="!w-auto px-6 bg-secondary dark:bg-secondary-dark hover:opacity-90"
          >
            {uploading ? (
              <>
                <Spinner size="sm" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Video
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminWebsiteSettings;
