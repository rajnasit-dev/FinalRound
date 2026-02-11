import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRevenue } from "../../store/slices/adminSlice";
import { formatINR } from "../../utils/formatINR";
import {
  DollarSign,
  Trophy,
  CreditCard,
} from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import Spinner from "../../components/ui/Spinner";
import DashboardCardState from "../../components/ui/DashboardCardState";
import DataTable from "../../components/ui/DataTable";
import useDateFormat from "../../hooks/useDateFormat";

const Revenue = () => {
  const dispatch = useDispatch();
  const { formatDate, formatTime } = useDateFormat();
  const { revenue, loading } = useSelector((state) => state.admin);
  const [selectedFilter, setSelectedFilter] = useState("all"); // "all", "admin", "organizer"

  useEffect(() => {
    dispatch(getRevenue({ type: selectedFilter }));
  }, [dispatch, selectedFilter]);

  // Filter transactions based on selected card
  const getFilteredTransactions = () => {
    if (!revenue?.transactions) return [];
    return revenue.transactions;
  };

  const filteredTransactions = getFilteredTransactions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BackButton />
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Revenue Management
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          Track platform earnings and payments
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCardState
          Icon={DollarSign}
          label="Admin Revenue"
          value={`₹${formatINR(revenue?.adminRevenue || 0)}`}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor={selectedFilter === "admin" ? "border-green-500" : "border-green-500/20"}
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
          onClick={() => setSelectedFilter("admin")}
          className="cursor-pointer transform transition-all hover:scale-105"
        />
        <DashboardCardState
          Icon={Trophy}
          label="Organizer Revenue"
          value={`₹${formatINR(revenue?.organizerRevenue || 0)}`}
          gradientFrom="from-blue-500/10"
          gradientVia="via-blue-500/5"
          borderColor={selectedFilter === "organizer" ? "border-blue-500" : "border-blue-500/20"}
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
          onClick={() => setSelectedFilter("organizer")}
          className="cursor-pointer transform transition-all hover:scale-105"
        />
        <DashboardCardState
          Icon={CreditCard}
          label="Total Transactions"
          value={revenue?.totalTransactions || 0}
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor={selectedFilter === "all" ? "border-purple-500" : "border-purple-500/20"}
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
          onClick={() => setSelectedFilter("all")}
          className="cursor-pointer transform transition-all hover:scale-105"
        />
      </div>

      {/* Transactions Table */}
      {(!filteredTransactions || filteredTransactions.length === 0) ? (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Transactions Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No transactions recorded yet.
          </p>
        </div>
      ) : (
        <DataTable
          columns={[
            {
              header: "Type",
              width: "15%",
              render: (transaction) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  transaction.type === "Platform Fee"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : transaction.type === "Team Registration"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                }`}>
                  {transaction.type}
                </span>
              ),
            },
            {
              header: "Tournament",
              width: "20%",
              render: (transaction) => (
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <p className="font-medium text-text-primary dark:text-text-primary-dark">
                    {transaction.tournament?.name || "Unknown"}
                  </p>
                </div>
              ),
            },
            {
              header: selectedFilter === "admin" ? "Organizer" : "Details",
              width: "20%",
              render: (transaction) => (
                <p className="text-sm text-text-primary dark:text-text-primary-dark">
                  {transaction.type === "Platform Fee" 
                    ? transaction.organizer?.fullName || transaction.organizer?.orgName || "Unknown"
                    : transaction.team?.name || transaction.player?.fullName || "Unknown"}
                </p>
              ),
            },
            {
              header: "Date & Time",
              width: "15%",
              render: (transaction) => (
                <div className="text-sm">
                  <p className="text-text-primary dark:text-text-primary-dark">
                    {formatDate(transaction.createdAt)}
                  </p>
                  <p className="text-xs text-base dark:text-base-dark">
                    {formatTime(transaction.createdAt)}
                  </p>
                </div>
              ),
            },
            {
              header: "Amount",
              width: "15%",
              render: (transaction) => (
                <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                  ₹{formatINR(transaction.amount)}
                </p>
              ),
            },
            {
              header: "Category",
              width: "15%",
              render: (transaction) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  transaction.paymentType === "Admin Revenue"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                }`}>
                  {transaction.paymentType}
                </span>
              ),
            },
          ]}
          data={filteredTransactions}
          itemsPerPage={10}
          emptyMessage="No transactions found"
        />
      )}
    </div>
  );
};

export default Revenue;
