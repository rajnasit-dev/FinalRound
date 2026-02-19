import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPayments } from "../../store/slices/adminSlice";
import { formatINR } from "../../utils/formatINR";
import {
  DollarSign,
  Trophy,
  CreditCard,
  Users,
  Building2,
  FileDown,
} from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import Spinner from "../../components/ui/Spinner";
import DashboardCardState from "../../components/ui/DashboardCardState";
import DataTable from "../../components/ui/DataTable";
import SearchBar from "../../components/ui/SearchBar";
import Select from "../../components/ui/Select";
import useDateFormat from "../../hooks/useDateFormat";
import { generatePaymentPDF } from "../../utils/generatePaymentPDF";
import toast from "react-hot-toast";
import PaymentDetailModal from "../../components/ui/PaymentDetailModal";

const AdminPayments = () => {
  const dispatch = useDispatch();
  const { formatDate, formatTime } = useDateFormat();
  const { payments, paymentsPagination, paymentsStats, loading } = useSelector(
    (state) => state.admin
  );
  const { user } = useSelector((state) => state.auth);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const [payerTypeFilter, setPayerTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Fetch payments whenever filters change
  useEffect(() => {
    dispatch(
      getAllPayments({
        page: 1,
        limit: 100,
        payerType: payerTypeFilter,
        status: statusFilter,
        searchTerm: searchTerm || undefined,
      })
    );
  }, [dispatch, payerTypeFilter, statusFilter, searchTerm]);

  // Get available years from payment data
  const availableYears = useMemo(() => {
    if (!payments || payments.length === 0) return [];
    const years = [...new Set(payments.map((p) => new Date(p.createdAt).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [payments]);

  // Filter by month/year on top of server filters
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const date = new Date(p.createdAt);
      if (monthFilter !== "all" && date.getMonth() !== parseInt(monthFilter)) return false;
      if (yearFilter !== "all" && date.getFullYear() !== parseInt(yearFilter)) return false;
      return true;
    });
  }, [payments, monthFilter, yearFilter]);

  // Filtered stats
  const filteredStats = useMemo(() => {
    const successful = filteredPayments.filter((p) => p.status === "Success");
    const platformFees = successful
      .filter((p) => p.payerType === "Organizer")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const registrationPayments = successful
      .filter((p) => p.payerType !== "Organizer")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    return {
      platformFees,
      registrationPayments,
      totalTransactions: filteredPayments.length,
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
    if (payerTypeFilter !== "all") parts.push(`Type: ${payerTypeFilter === "Organizer" ? "Platform Fees" : payerTypeFilter + " Registration"}`);
    if (statusFilter !== "all") parts.push(`Status: ${statusFilter}`);
    return parts.length ? `Filtered by: ${parts.join(" | ")}` : "All Payments";
  };

  const handleGenerateReport = async () => {
    if (filteredPayments.length === 0) {
      return toast.error("No payment data to generate report");
    }
    await generatePaymentPDF(filteredPayments, {
      title: "Admin Payments Report",
      subtitle: getFilterSubtitle(),
      summary: {
        "Total Transactions": filteredPayments.length,
        "Platform Fees": `Rs.${filteredStats.platformFees.toLocaleString("en-IN")}`,
        "Registration Payments": `Rs.${filteredStats.registrationPayments.toLocaleString("en-IN")}`,
        "Success": filteredPayments.filter((p) => p.status === "Success").length,
        "Pending": filteredPayments.filter((p) => p.status === "Pending").length,
      },
    });
    toast.success("Payment report downloaded!");
  };

  // Define table columns
  const columns = [
    {
      header: "Tournament",
      accessor: "tournament",
      render: (item) => (
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <p className="font-medium text-text-primary dark:text-text-primary-dark">
            {item.tournament?.name || "Unknown"}
          </p>
        </div>
      ),
    },
    {
      header: "Payer",
      accessor: "payer",
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.payerType === "Organizer" ? (
            <>
              <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                  {item.organizer?.orgName || item.organizer?.fullName || item.payerName || "Unknown"}
                </p>
                <p className="text-xs text-base dark:text-base-dark">Organizer</p>
              </div>
            </>
          ) : (
            <>
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                  {item.team?.name || item.team?.teamName || item.player?.fullName || item.payerName || "Unknown"}
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
      render: (item) => (
        <p className="font-bold text-green-600 dark:text-green-400 text-lg">
          ₹{formatINR(item.amount)}
        </p>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (item) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.status === "Success"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : item.status === "Pending"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
              : item.status === "Failed"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  if (loading && payments.length === 0) {
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
          Payments Management
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          Track all platform payments and revenue streams
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCardState
          Icon={DollarSign}
          label="Platform Fees (Admin Revenue)"
          value={`₹${(filteredStats.platformFees || 0).toLocaleString("en-IN")}`}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor="border-green-500/20"
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
        />
        <DashboardCardState
          Icon={Trophy}
          label="Registration Payments"
          value={`₹${(filteredStats.registrationPayments || 0).toLocaleString("en-IN")}`}
          gradientFrom="from-blue-500/10"
          gradientVia="via-blue-500/5"
          borderColor="border-blue-500/20"
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
        />
        <DashboardCardState
          Icon={CreditCard}
          label="Total Transactions"
          value={filteredStats.totalTransactions || 0}
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
            placeholder="Tournament, organizer, or player..."
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
            value={payerTypeFilter}
            onChange={(e) => setPayerTypeFilter(e.target.value)}
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

export default AdminPayments;
