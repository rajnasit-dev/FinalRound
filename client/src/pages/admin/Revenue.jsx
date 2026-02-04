import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRevenue } from "../../store/slices/adminSlice";
import {
  DollarSign,
  TrendingUp,
  Users,
  Trophy,
  CreditCard,
} from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import Spinner from "../../components/ui/Spinner";
import DashboardCardState from "../../components/ui/DashboardCardState";
import Pagination from "../../components/ui/Pagination";
import useDateFormat from "../../hooks/useDateFormat";

const Revenue = () => {
  const dispatch = useDispatch();
  const { formatDate, formatTime } = useDateFormat();
  const { revenue, loading } = useSelector((state) => state.admin);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("all"); // "all", "admin", "organizer"
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(getRevenue({ type: selectedFilter }));
  }, [dispatch, selectedFilter]);

  // Filter transactions based on selected card
  const getFilteredTransactions = () => {
    if (!revenue?.transactions) return [];
    return revenue.transactions;
  };

  const filteredTransactions = getFilteredTransactions();

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

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
          value={`₹${revenue?.adminRevenue || 0}`}
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
          value={`₹${revenue?.organizerRevenue || 0}`}
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
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base overflow-hidden">
        <div className="p-6 border-b border-base-dark dark:border-base">
          <h3 className="text-xl font-bold">
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
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-base-dark dark:bg-base">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      Tournament
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      {selectedFilter === "admin" ? "Organizer" : "Details"}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-dark dark:divide-base">
                  {filteredTransactions
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="hover:bg-base-dark dark:hover:bg-base transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.type === "Platform Fee"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : transaction.type === "Team Registration"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <p className="font-medium text-text-primary dark:text-text-primary-dark">
                            {transaction.tournament?.name || "Unknown"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-text-primary dark:text-text-primary-dark">
                          {transaction.type === "Platform Fee" 
                            ? transaction.organizer?.fullName || transaction.organizer?.orgName || "Unknown"
                            : transaction.team?.name || transaction.player?.fullName || "Unknown"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-text-primary dark:text-text-primary-dark">
                            {formatDate(transaction.createdAt)}
                          </p>
                          <p className="text-xs text-base dark:text-base-dark">
                            {formatTime(transaction.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                          ₹{transaction.amount}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.paymentType === "Admin Revenue"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}>
                          {transaction.paymentType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {Math.ceil(filteredTransactions.length / itemsPerPage) > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredTransactions.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredTransactions.length}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Revenue;
