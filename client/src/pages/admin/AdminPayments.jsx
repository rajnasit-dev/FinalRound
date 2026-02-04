import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRevenue } from "../../store/slices/adminSlice";
import {
  DollarSign,
  Trophy,
  CreditCard,
  Filter,
  Users,
  Building2,
} from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import Spinner from "../../components/ui/Spinner";
import DashboardCardState from "../../components/ui/DashboardCardState";
import DataTable from "../../components/ui/DataTable";
import useDateFormat from "../../hooks/useDateFormat";

const AdminPayments = () => {
  const dispatch = useDispatch();
  const { formatDate, formatTime } = useDateFormat();
  const { revenue, loading } = useSelector((state) => state.admin);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");

  useEffect(() => {
    dispatch(getRevenue({ type: "all" }));
  }, [dispatch]);

  // Get filtered transactions based on selected filters
  const getFilteredTransactions = () => {
    if (!revenue?.transactions) return [];
    
    let filtered = [...revenue.transactions];

    // Filter by payment category (Admin Revenue vs Organizer Revenue)
    if (selectedFilter !== "all") {
      filtered = filtered.filter((t) => {
        if (selectedFilter === "admin") {
          return t.paymentType === "Admin Revenue";
        } else if (selectedFilter === "organizer") {
          return t.paymentType === "Organizer Revenue";
        }
        return true;
      });
    }

    // Filter by specific payment type (Platform Fee, Team Registration, Player Registration)
    if (paymentTypeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === paymentTypeFilter);
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Define table columns
  const columns = [
    {
      header: "Payment Type",
      accessor: "type",
      render: (item) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.type === "Platform Fee"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              : item.type === "Team Registration"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
          }`}
        >
          {item.type}
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
          {item.type === "Platform Fee" ? (
            <>
              <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                  {item.organizer?.fullName || item.organizer?.orgName || "Unknown"}
                </p>
                <p className="text-xs text-base dark:text-base-dark">Organizer</p>
              </div>
            </>
          ) : (
            <>
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                  {item.team?.name || item.player?.fullName || "Unknown"}
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
      header: "Receiver",
      accessor: "receiver",
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.paymentType === "Admin Revenue" ? (
            <>
              <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                Platform (Admin)
              </span>
            </>
          ) : (
            <>
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                {item.organizer?.fullName || item.organizer?.orgName || "Unknown"}
              </span>
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
      header: "Category",
      accessor: "paymentType",
      render: (item) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.paymentType === "Admin Revenue"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          }`}
        >
          {item.paymentType}
        </span>
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
          value={`₹${revenue?.adminRevenue?.toLocaleString() || 0}`}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor={
            selectedFilter === "admin" ? "border-green-500" : "border-green-500/20"
          }
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
          onClick={() => setSelectedFilter(selectedFilter === "admin" ? "all" : "admin")}
          className="cursor-pointer transform transition-all hover:scale-105"
        />
        <DashboardCardState
          Icon={Trophy}
          label="Organizer Revenue"
          value={`₹${revenue?.organizerRevenue?.toLocaleString() || 0}`}
          gradientFrom="from-blue-500/10"
          gradientVia="via-blue-500/5"
          borderColor={
            selectedFilter === "organizer"
              ? "border-blue-500"
              : "border-blue-500/20"
          }
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
          onClick={() =>
            setSelectedFilter(selectedFilter === "organizer" ? "all" : "organizer")
          }
          className="cursor-pointer transform transition-all hover:scale-105"
        />
        <DashboardCardState
          Icon={CreditCard}
          label="Total Transactions"
          value={revenue?.totalTransactions || 0}
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor={
            selectedFilter === "all" ? "border-purple-500" : "border-purple-500/20"
          }
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
          onClick={() => setSelectedFilter("all")}
          className="cursor-pointer transform transition-all hover:scale-105"
        />
      </div>

      {/* Filter Section */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-text-primary dark:text-text-primary-dark" />
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
              Filter Payments
            </h3>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Payment Category
              </label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-base-dark dark:border-base rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="all">All Categories</option>
                <option value="admin">Admin Revenue (Platform Fees)</option>
                <option value="organizer">Organizer Revenue (Registration Fees)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                Payment Type
              </label>
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="px-4 py-2 border border-base-dark dark:border-base rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="all">All Types</option>
                <option value="Platform Fee">Platform Fee</option>
                <option value="Team Registration">Team Registration</option>
                <option value="Player Registration">Player Registration</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base overflow-hidden">
        <div className="p-6 border-b border-base-dark dark:border-base">
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
            {selectedFilter === "all"
              ? "All Transactions"
              : selectedFilter === "admin"
              ? "Admin Revenue (Platform Fees)"
              : "Organizer Revenue (Registration Fees)"}
          </h3>
          <p className="text-sm text-base dark:text-base-dark mt-1">
            {selectedFilter === "all"
              ? "Complete transaction history"
              : selectedFilter === "admin"
              ? "Platform fees from tournament organizers"
              : "Registration fees from players and managers"}
          </p>
        </div>
        <DataTable
          columns={columns}
          data={filteredTransactions}
          itemsPerPage={10}
          emptyMessage={
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedFilter !== "all" || paymentTypeFilter !== "all"
                  ? "No transactions match your filters."
                  : "No transactions recorded yet."}
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default AdminPayments;
