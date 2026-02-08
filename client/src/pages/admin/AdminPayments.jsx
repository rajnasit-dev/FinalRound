import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPayments } from "../../store/slices/adminSlice";
import {
  DollarSign,
  Trophy,
  CreditCard,
  Users,
  Building2,
  Search,
} from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import Spinner from "../../components/ui/Spinner";
import DashboardCardState from "../../components/ui/DashboardCardState";
import DataTable from "../../components/ui/DataTable";
import useDateFormat from "../../hooks/useDateFormat";

const AdminPayments = () => {
  const dispatch = useDispatch();
  const { formatDate, formatTime } = useDateFormat();
  const { payments, paymentsPagination, paymentsStats, loading } = useSelector(
    (state) => state.admin
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [payerTypeFilter, setPayerTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch payments whenever filters or pagination changes
  useEffect(() => {
    dispatch(
      getAllPayments({
        page: currentPage,
        limit: 10,
        payerType: payerTypeFilter,
        status: statusFilter,
        searchTerm: searchTerm || undefined,
      })
    );
  }, [dispatch, currentPage, payerTypeFilter, statusFilter, searchTerm]);

  // Define table columns
  const columns = [
    {
      header: "Payment Type",
      accessor: "payerType",
      render: (item) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.payerType === "Organizer"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              : item.payerType === "Team"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
          }`}
        >
          {item.payerType === "Organizer"
            ? "Platform Fee"
            : item.payerType === "Team"
            ? "Team Registration"
            : "Player Registration"}
        </span>
      ),
    },
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
                  {item.organizer?.orgName || item.organizer?.fullName || "Unknown"}
                </p>
                <p className="text-xs text-base dark:text-base-dark">Organizer</p>
              </div>
            </>
          ) : (
            <>
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                  {item.team?.teamName || item.player?.fullName || "Unknown"}
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
      header: "Date & Time",
      accessor: "createdAt",
      render: (item) => (
        <div className="text-sm">
          <p className="text-text-primary dark:text-text-primary-dark">
            {formatDate(item.createdAt)}
          </p>
          <p className="text-xs text-base dark:text-base-dark">
            {formatTime(item.createdAt)}
          </p>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      render: (item) => (
        <p className="font-bold text-green-600 dark:text-green-400 text-lg">
          ₹{item.amount.toLocaleString()}
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
    <div className="space-y-8">
      <BackButton className="mb-6" />
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
          label="Admin Revenue"
          value={`₹${(paymentsStats?.adminRevenue || 0).toLocaleString("en-IN")}`}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor="border-green-500/20"
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
        />
        <DashboardCardState
          Icon={Trophy}
          label="Platform Fees Collected"
          value={`₹${(paymentsStats?.platformFeesCollected || 0).toLocaleString("en-IN")}`}
          gradientFrom="from-blue-500/10"
          gradientVia="via-blue-500/5"
          borderColor="border-blue-500/20"
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
        />
        <DashboardCardState
          Icon={CreditCard}
          label="Total Transactions"
          value={paymentsPagination?.total || paymentsStats?.totalTransactions || 0}
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor="border-purple-500/20"
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-end gap-4 flex-wrap bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
        {/* Search Bar - Left Side */}
        <div className="flex-1 min-w-xs">
          <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tournament, organizer, or player..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-base-dark dark:border-base rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>

        {/* Dropdowns - Right Side */}
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
              Payer Type
            </label>
            <select
              value={payerTypeFilter}
              onChange={(e) => {
                setPayerTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-base-dark dark:border-base rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="all">All Types</option>
              <option value="Organizer">Platform Fees</option>
              <option value="Team">Team Registration</option>
              <option value="Player">Player Registration</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-base-dark dark:border-base rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="all">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base overflow-hidden">
        <div className="p-6 border-b border-base-dark dark:border-base">
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
            All Transactions
          </h3>
          <p className="text-sm text-base dark:text-base-dark mt-1">
            Complete transaction history with detailed payment information
          </p>
        </div>
        <DataTable
          columns={columns}
          data={payments}
          itemsPerPage={10}
          emptyMessage={
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No transactions match your filters.
              </p>
            </div>
          }
        />

        {/* Pagination */}
        {paymentsPagination && paymentsPagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-6 border-t border-base-dark dark:border-base">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-primary dark:text-text-primary-dark">
                Page{" "}
                <span className="font-bold">
                  {paymentsPagination.page || 1}
                </span>{" "}
                of{" "}
                <span className="font-bold">
                  {paymentsPagination.totalPages}
                </span>
              </span>
            </div>
            <button
              onClick={() =>
                setCurrentPage(
                  Math.min(paymentsPagination.totalPages, currentPage + 1)
                )
              }
              disabled={currentPage === paymentsPagination.totalPages}
              className="px-4 py-2 border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
