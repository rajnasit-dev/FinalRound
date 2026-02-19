import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { formatINR } from "../../utils/formatINR";
import {
  DollarSign,
  Trophy,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  FileDown,
} from "lucide-react";
import axios from "axios";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import DashboardCardState from "../../components/ui/DashboardCardState";
import DataTable from "../../components/ui/DataTable";
import SearchBar from "../../components/ui/SearchBar";
import Select from "../../components/ui/Select";
import useDateFormat from "../../hooks/useDateFormat";
import { generatePaymentPDF } from "../../utils/generatePaymentPDF";
import toast from "react-hot-toast";
import PaymentDetailModal from "../../components/ui/PaymentDetailModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const OrganizerPayments = () => {
  const { user } = useSelector((state) => state.auth);
  const { formatDate, formatTime } = useDateFormat();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/payments/user/me`, {
        withCredentials: true,
      });
      setPayments(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  // Compute stats
  const platformFees = payments.filter((p) => p.payerType === "Organizer");
  const registrationPayments = payments.filter((p) => p.payerType !== "Organizer");

  // Get available years from payment data
  const availableYears = useMemo(() => {
    if (!payments || payments.length === 0) return [];
    const years = [...new Set(payments.map((p) => new Date(p.createdAt).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (typeFilter !== "all" && p.payerType !== typeFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      const date = new Date(p.createdAt);
      if (monthFilter !== "all" && date.getMonth() !== parseInt(monthFilter)) return false;
      if (yearFilter !== "all" && date.getFullYear() !== parseInt(yearFilter)) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const tournamentName = p.tournament?.name?.toLowerCase() || "";
        const teamName = p.team?.name?.toLowerCase() || "";
        const playerName = p.player?.fullName?.toLowerCase() || "";
        if (
          !tournamentName.includes(term) &&
          !teamName.includes(term) &&
          !playerName.includes(term)
        )
          return false;
      }
      return true;
    });
  }, [payments, typeFilter, statusFilter, monthFilter, yearFilter, searchTerm]);

  // Filtered stats
  const filteredStats = useMemo(() => {
    const filtered = filteredPayments;
    const successful = filtered.filter((p) => p.status === "Success");
    const totalReceived = successful
      .filter((p) => p.payerType !== "Organizer")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPlatformFees = successful
      .filter((p) => p.payerType === "Organizer")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    return {
      totalReceived,
      totalPlatformFees,
      netRevenue: totalReceived - totalPlatformFees,
      totalTransactions: filtered.length,
    };
  }, [filteredPayments]);

  // Build filter subtitle for PDF
  const getFilterSubtitle = () => {
    const parts = [];
    if (monthFilter !== "all") {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      parts.push(monthNames[parseInt(monthFilter)]);
    }
    if (yearFilter !== "all") parts.push(yearFilter);
    if (typeFilter !== "all") parts.push(`Type: ${typeFilter === "Organizer" ? "Platform Fees" : typeFilter + " Registration"}`);
    if (statusFilter !== "all") parts.push(`Status: ${statusFilter}`);
    return parts.length ? `Filtered by: ${parts.join(" | ")}` : "All Payments";
  };

  const handleGenerateReport = async () => {
    if (filteredPayments.length === 0) {
      return toast.error("No payment data to generate report");
    }
    await generatePaymentPDF(filteredPayments, {
      title: "Organizer Payments Report",
      subtitle: getFilterSubtitle(),
      summary: {
        "Registration Revenue": `Rs.${filteredStats.totalReceived.toLocaleString("en-IN")}`,
        "Platform Fees Paid": `Rs.${filteredStats.totalPlatformFees.toLocaleString("en-IN")}`,
        "Net Revenue": `Rs.${filteredStats.netRevenue.toLocaleString("en-IN")}`,
        "Total Transactions": filteredStats.totalTransactions,
      },
    });
    toast.success("Payment report downloaded!");
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    const config = {
      Success: {
        icon: CheckCircle,
        bg: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      },
      Pending: {
        icon: Clock,
        bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      Failed: {
        icon: XCircle,
        bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      },
      Refunded: {
        icon: XCircle,
        bg: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
      },
    };
    const c = config[status] || config.Pending;
    const Icon = c.icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${c.bg}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  // Table columns
  const columns = [
    {
      header: "Tournament",
      accessor: "tournament",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
            {item.tournament?.name || "Unknown"}
          </span>
        </div>
      ),
    },
    {
      header: "Payer",
      accessor: "payer",
      width: "15%",
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.payerType === "Organizer" ? (
            <>
              <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                  {user?.orgName || user?.fullName || "You"}
                </p>
                <p className="text-xs text-base dark:text-base-dark">
                  Platform Fee
                </p>
              </div>
            </>
          ) : (
            <>
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                  {item.team?.name || item.player?.fullName || item.payerName || "Unknown"}
                </p>
                <p className="text-xs text-base dark:text-base-dark">
                  {item.team ? "Team" : "Player"}
                </p>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      width: "18%",
      render: (item) => (
        <p
          className={`font-bold text-lg ${
            item.payerType === "Organizer"
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          }`}
        >
          {item.payerType === "Organizer" ? "-" : "+"}₹
          {formatINR(item.amount)}
        </p>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (item) => getStatusBadge(item.status),
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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Payments Management
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          Track registration payments received and platform fees paid
        </p>
      </div>

      {error && <ErrorMessage message={error} type="error" />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCardState
          Icon={ArrowDownCircle}
          label="Registration Revenue"
          value={`₹${filteredStats.totalReceived.toLocaleString("en-IN")}`}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor="border-green-500/20"
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
        />
        <DashboardCardState
          Icon={ArrowUpCircle}
          label="Platform Fees Paid"
          value={`₹${filteredStats.totalPlatformFees.toLocaleString("en-IN")}`}
          gradientFrom="from-red-500/10"
          gradientVia="via-red-500/5"
          borderColor="border-red-500/20"
          iconGradientFrom="from-red-500"
          iconGradientTo="to-red-600"
        />
        <DashboardCardState
          Icon={DollarSign}
          label="Net Revenue"
          value={`₹${filteredStats.netRevenue.toLocaleString("en-IN")}`}
          gradientFrom="from-blue-500/10"
          gradientVia="via-blue-500/5"
          borderColor="border-blue-500/20"
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
        />
        <DashboardCardState
          Icon={CreditCard}
          label="Total Transactions"
          value={filteredStats.totalTransactions}
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor="border-purple-500/20"
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar
            placeholder="Tournament, team, or player..."
            searchQuery={searchTerm}
            setSearchQuery={setSearchTerm}
          />
          <Select
            options={[
              { value: "all", label: "All Types" },
              { value: "Organizer", label: "Platform Fees" },
              { value: "Team", label: "Team Registration" },
              { value: "Player", label: "Player Registration" },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
          <Select
            options={[
              { value: "all", label: "All Statuses" },
              { value: "Success", label: "Success" },
              { value: "Pending", label: "Pending" },
              { value: "Failed", label: "Failed" },
              { value: "Refunded", label: "Refunded" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Select
            options={[
              { value: "all", label: "All Months" },
              { value: "0", label: "January" },
              { value: "1", label: "February" },
              { value: "2", label: "March" },
              { value: "3", label: "April" },
              { value: "4", label: "May" },
              { value: "5", label: "June" },
              { value: "6", label: "July" },
              { value: "7", label: "August" },
              { value: "8", label: "September" },
              { value: "9", label: "October" },
              { value: "10", label: "November" },
              { value: "11", label: "December" },
            ]}
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
          <Select
            options={[
              { value: "all", label: "All Years" },
              ...availableYears.map((y) => ({ value: String(y), label: String(y) })),
            ]}
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          />
          <button
            onClick={handleGenerateReport}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Transactions Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No transactions match your filters.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredPayments}
          onRowClick={(payment) => setSelectedPaymentId(payment._id)}
          itemsPerPage={10}
          emptyMessage="No transactions found"
        />
      )}

      {/* Payment Detail Modal */}
      {selectedPaymentId && (
        <PaymentDetailModal
          paymentId={selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
          currentUserId={user?._id}
        />
      )}
    </div>
  );
};

export default OrganizerPayments;
