import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  generateReport,
  getReports,
  deleteReport,
} from "../../store/slices/adminSlice";
import { fetchAllSports } from "../../store/slices/sportSlice";
import {
  IndianRupee,
  Trophy,
  Users,
  Swords,
  Ticket,
  FileText,
  Eye,
  Trash2,
  X,
  Search,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";

// ─── Report Generation Modal ────────────────────────────────────────────

const ReportModal = ({ isOpen, onClose, reportType, onGenerate, generating, sports = [] }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    sport: "all",
    payerType: "all",
    format: "all",
    role: "all",
    registrationType: "all",
  });

  useEffect(() => {
    if (isOpen) {
      // Default to last 30 days
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);
      setFromDate(from.toISOString().split("T")[0]);
      setToDate(to.toISOString().split("T")[0]);
      setFilters({ status: "all", sport: "all", payerType: "all", format: "all", role: "all", registrationType: "all" });
    }
  }, [isOpen]);

  const clearFilters = () => {
    setFilters({ status: "all", sport: "all", payerType: "all", format: "all", role: "all", registrationType: "all" });
  };

  const handleSubmit = () => {
    if (!fromDate || !toDate) return toast.error("Please select date range");
    onGenerate({
      type: reportType,
      from: fromDate,
      to: toDate,
      filters,
    });
  };

  if (!isOpen) return null;

  const typeLabels = {
    Revenue: "Revenue Report",
    Tournament: "Tournament Report",
    User: "User Report",
    Match: "Match Report",
    Booking: "Booking Report",
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card-background dark:bg-card-background-dark rounded-2xl shadow-2xl w-full max-w-lg border border-base-dark dark:border-base">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-dark dark:border-base">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
            Select Date Range for {typeLabels[reportType]}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-base-dark dark:hover:bg-base transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date Range */}
          <div>
            <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-3">
              Date Range
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary"
                />
              </div>
              <div>
                <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                Filter By
              </p>
              <button
                onClick={clearFilters}
                className="text-xs text-secondary hover:underline font-medium"
              >
                Clear Filters
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(reportType === "Revenue" || reportType === "Match") && (
                <div>
                  <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                    Sport
                  </label>
                  <select
                    value={filters.sport}
                    onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary cursor-pointer"
                  >
                    <option value="all">All Sports</option>
                    {sports.map((s) => (
                      <option key={s._id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {reportType === "Tournament" && (
                <>
                  <div>
                    <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                      Format
                    </label>
                    <select
                      value={filters.format}
                      onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary cursor-pointer"
                    >
                      <option value="all">All Formats</option>
                      <option value="League">League</option>
                      <option value="Knockout">Knockout</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                      Sport
                    </label>
                    <select
                      value={filters.sport}
                      onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary cursor-pointer"
                    >
                      <option value="all">All Sports</option>
                      {sports.map((s) => (
                        <option key={s._id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {reportType === "User" && (
                <div>
                  <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                    Role
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="Player">Player</option>
                    <option value="TeamManager">Team Manager</option>
                    <option value="TournamentOrganizer">Tournament Organizer</option>
                  </select>
                </div>
              )}

              {reportType === "Booking" && (
                <>
                  <div>
                    <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                      Registration Type
                    </label>
                    <select
                      value={filters.registrationType}
                      onChange={(e) => setFilters({ ...filters, registrationType: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary cursor-pointer"
                    >
                      <option value="all">All Types</option>
                      <option value="Team">Team</option>
                      <option value="Player">Player</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-base-dark dark:border-base">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-base-dark dark:border-base text-sm font-medium hover:bg-base-dark dark:hover:bg-base transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={generating}
            className="px-6 py-2.5 rounded-lg bg-secondary hover:bg-secondary/90 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Report"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────

const AdminReports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reports, reportsPagination, reportLoading, reportGenerating } =
    useSelector((state) => state.admin);
  const { sports } = useSelector((state) => state.sport);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("Revenue");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    dispatch(getReports({}));
    dispatch(fetchAllSports());
  }, [dispatch]);

  const filteredReports = useMemo(() => {
    let filtered = reports || [];
    if (typeFilter !== "all") {
      filtered = filtered.filter((r) => r.type === typeFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.type.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [reports, typeFilter, searchTerm]);

  const displayedReports = showAll ? filteredReports : filteredReports.slice(0, 5);

  const openModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleGenerate = async (reportData) => {
    const result = await dispatch(generateReport(reportData));
    if (generateReport.fulfilled.match(result)) {
      toast.success(`${reportData.type} report generated!`);
      setModalOpen(false);
      navigate(`/admin/reports/${result.payload._id}`);
    } else {
      toast.error(result.payload || "Failed to generate report");
    }
  };

  const handleDelete = async (reportId) => {
    const result = await dispatch(deleteReport(reportId));
    if (deleteReport.fulfilled.match(result)) {
      toast.success("Report deleted");
    } else {
      toast.error("Failed to delete report");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getFilterSummary = (report) => {
    const parts = [];
    if (report.filters) {
      Object.entries(report.filters).forEach(([key, val]) => {
        if (val && val !== "all") parts.push(`${key}: ${val}`);
      });
    }
    return parts.length > 0 ? parts.join(" | ") : "No filters";
  };

  const reportCards = [
    {
      type: "Revenue",
      icon: IndianRupee,
      title: "Revenue Report",
      description: "Analyze platform revenue, payment trends, and financial breakdowns by sport and tournament",
      btnText: "Generate Revenue Report",
      btnColor: "bg-emerald-500 hover:bg-emerald-600",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      type: "Tournament",
      icon: Trophy,
      title: "Tournament Report",
      description: "View tournament statistics, format and sport distribution, registration fill rates, and trends",
      btnText: "Generate Tournament Report",
      btnColor: "bg-blue-500 hover:bg-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      type: "User",
      icon: Users,
      title: "User Report",
      description: "Track user registrations, role distribution, player demographics, and city-wise engagement",
      btnText: "Generate User Report",
      btnColor: "bg-purple-500 hover:bg-purple-600",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      type: "Match",
      icon: Swords,
      title: "Match Report",
      description: "Analyze match scheduling, cancellation rates, sport-wise breakdowns, and venue utilization",
      btnText: "Generate Match Report",
      btnColor: "bg-orange-500 hover:bg-orange-600",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      type: "Booking",
      icon: Ticket,
      title: "Booking Report",
      description: "Track tournament bookings, registration trends, popular tournaments, and payment success rates",
      btnText: "Generate Booking Report",
      btnColor: "bg-teal-500 hover:bg-teal-600",
      iconBg: "bg-teal-100 dark:bg-teal-900/30",
      iconColor: "text-teal-600 dark:text-teal-400",
      borderColor: "border-teal-200 dark:border-teal-800",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            Analytics & Reports
          </h1>
          <p className="text-base dark:text-base-dark mt-1">
            Generate and manage platform reports
          </p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportCards.map((card) => (
          <div
            key={card.type}
            className={`bg-card-background dark:bg-card-background-dark rounded-xl border-2 ${card.borderColor} p-6 flex flex-col`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}
              >
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                {card.title}
              </h3>
            </div>
            <p className="text-sm text-base dark:text-base-dark mb-5 flex-1">
              {card.description}
            </p>
            <button
              onClick={() => openModal(card.type)}
              className={`w-full py-3 rounded-lg text-white text-sm font-semibold transition-colors ${card.btnColor} cursor-pointer`}
            >
              {card.btnText}
            </button>
          </div>
        ))}
      </div>

      {/* Recent Reports History */}
      <div>
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
          Recent Reports History
        </h2>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="Revenue">Revenue</option>
            <option value="Tournament">Tournament</option>
            <option value="User">User</option>
            <option value="Match">Match</option>
            <option value="Booking">Booking</option>
          </select>
        </div>

        {/* Reports List */}
        {reportLoading && (!reports || reports.length === 0) ? (
          <div className="flex justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base">
            <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
              No reports generated yet
            </p>
            <p className="text-sm text-base dark:text-base-dark mt-1">
              Generate your first report using the cards above
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedReports.map((report) => {
              const typeColors = {
                Revenue: "text-emerald-600 dark:text-emerald-400",
                Tournament: "text-blue-600 dark:text-blue-400",
                User: "text-purple-600 dark:text-purple-400",
                Match: "text-orange-600 dark:text-orange-400",
                Booking: "text-teal-600 dark:text-teal-400",
              };
              return (
                <div
                  key={report._id}
                  className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold ${typeColors[report.type]}`}>
                        {report.type}
                      </span>
                      <span className="font-bold text-text-primary dark:text-text-primary-dark">
                        {report.title}
                      </span>
                    </div>
                    <p className="text-xs text-base dark:text-base-dark">
                      {formatDate(report.dateRange?.from)} to{" "}
                      {formatDate(report.dateRange?.to)} &bull;{" "}
                      {getFilterSummary(report)} &bull; {formatDate(report.createdAt)}{" "}
                      {formatTime(report.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/admin/reports/${report._id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(report._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Toggle */}
        {filteredReports.length > 5 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-medium text-secondary hover:underline"
            >
              {showAll
                ? "Show Less"
                : `View all (${filteredReports.length})`}
            </button>
          </div>
        )}
      </div>

      {/* Report Generation Modal */}
      <ReportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        reportType={modalType}
        onGenerate={handleGenerate}
        generating={reportGenerating}
        sports={sports}
      />
    </div>
  );
};

export default AdminReports;
