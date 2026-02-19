import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserPayments } from "../../store/slices/paymentSlice";
import { formatINR } from "../../utils/formatINR";
import {
  DollarSign,
  Trophy,
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  FileDown,
} from "lucide-react";
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

const ManagerPayments = () => {
  const dispatch = useDispatch();
  const { payments, loading, error } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.auth);
  const { formatDate, formatTime } = useDateFormat();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  useEffect(() => {
    dispatch(fetchUserPayments());
  }, [dispatch]);

  // Available years
  const availableYears = useMemo(() => {
    if (!payments || payments.length === 0) return [];
    const years = [...new Set(payments.map((p) => new Date(p.createdAt).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [payments]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return (payments || []).filter((p) => {
      if (statusFilter !== "all" && p.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
      const date = new Date(p.createdAt);
      if (monthFilter !== "all" && date.getMonth() !== parseInt(monthFilter)) return false;
      if (yearFilter !== "all" && date.getFullYear() !== parseInt(yearFilter)) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const tournamentName = p.tournament?.name?.toLowerCase() || "";
        const teamName = p.team?.name?.toLowerCase() || "";
        if (!tournamentName.includes(term) && !teamName.includes(term)) return false;
      }
      return true;
    });
  }, [payments, statusFilter, monthFilter, yearFilter, searchTerm]);

  // Filtered stats
  const filteredStats = useMemo(() => {
    const successful = filteredPayments.filter((p) => p.status?.toLowerCase() === "success");
    const totalPaid = successful.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pending = filteredPayments
      .filter((p) => p.status?.toLowerCase() === "pending")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    return { totalPaid, pending, totalTransactions: filteredPayments.length };
  }, [filteredPayments]);

  // PDF subtitle
  const getFilterSubtitle = () => {
    const parts = [];
    if (monthFilter !== "all") {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      parts.push(monthNames[parseInt(monthFilter)]);
    }
    if (yearFilter !== "all") parts.push(yearFilter);
    if (statusFilter !== "all") parts.push(`Status: ${statusFilter}`);
    return parts.length ? `Filtered by: ${parts.join(" | ")}` : "All Payments";
  };

  const handleGenerateReport = async () => {
    if (filteredPayments.length === 0) return toast.error("No payment data to generate report");
    await generatePaymentPDF(filteredPayments, {
      title: "Manager Payments Report",
      subtitle: getFilterSubtitle(),
      summary: {
        "Total Paid": `Rs.${filteredStats.totalPaid.toLocaleString("en-IN")}`,
        "Pending": `Rs.${filteredStats.pending.toLocaleString("en-IN")}`,
        "Transactions": filteredStats.totalTransactions,
      },
    });
    toast.success("Payment report downloaded!");
  };

  // Status badge
  const getStatusBadge = (status) => {
    const config = {
      Success: { icon: CheckCircle, bg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
      Pending: { icon: Clock, bg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
      Failed: { icon: XCircle, bg: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
      Refunded: { icon: XCircle, bg: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300" },
    };
    const c = config[status] || config.Pending;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${c.bg}`}>
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
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <p className="font-medium text-text-primary dark:text-text-primary-dark">
            {item.tournament?.name || "Unknown"}
          </p>
        </div>
      ),
    },
    {
      header: "Team",
      accessor: "team",
      render: (item) => (
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <p className="font-medium text-text-primary dark:text-text-primary-dark">
            {item.team?.name || item.player?.fullName || item.payerName || "Unknown"}
          </p>
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
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Payment History
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          View all your team tournament registration payments
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {!payments || payments.length === 0 ? (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            No Payments Yet
          </h3>
          <p className="text-base dark:text-base-dark">
            You haven't made any team tournament registration payments yet. Register a team for a tournament to get started.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardCardState
              Icon={DollarSign}
              label="Total Paid"
              value={`₹${(filteredStats.totalPaid || 0).toLocaleString("en-IN")}`}
              gradientFrom="from-green-500/10"
              gradientVia="via-green-500/5"
              borderColor="border-green-500/20"
              iconGradientFrom="from-green-500"
              iconGradientTo="to-green-600"
            />
            <DashboardCardState
              Icon={Clock}
              label="Pending Amount"
              value={`₹${(filteredStats.pending || 0).toLocaleString("en-IN")}`}
              gradientFrom="from-yellow-500/10"
              gradientVia="via-yellow-500/5"
              borderColor="border-yellow-500/20"
              iconGradientFrom="from-yellow-500"
              iconGradientTo="to-yellow-600"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchBar
                placeholder="Search by tournament or team..."
                searchQuery={searchTerm}
                setSearchQuery={setSearchTerm}
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
              emptyMessage="No payment history found"
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
        </>
      )}
    </div>
  );
};

export default ManagerPayments;
