import { useEffect, useMemo, useState } from "react";
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
import SearchBar from "../../components/ui/SearchBar";
import Select from "../../components/ui/Select";
import useDateFormat from "../../hooks/useDateFormat";

const Revenue = () => {
  const dispatch = useDispatch();
  const { formatDate, formatTime } = useDateFormat();
  const { revenue, loading } = useSelector((state) => state.admin);
  const [selectedFilter, setSelectedFilter] = useState("all"); // "all", "admin", "organizer"
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  useEffect(() => {
    dispatch(getRevenue({ type: selectedFilter }));
  }, [dispatch, selectedFilter]);

  const transactions = revenue?.transactions || [];

  const availableYears = useMemo(() => {
    if (!transactions.length) return [];
    const years = [...new Set(transactions.map((t) => new Date(t.createdAt).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [transactions]);

  const uniqueTransactionTypes = useMemo(() => {
    return [...new Set(transactions.map((t) => t.type).filter(Boolean))];
  }, [transactions]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(transactions.map((t) => t.paymentType).filter(Boolean))];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        if (selectedFilter === "admin") {
          return transaction.paymentType === "Admin Revenue" || transaction.type === "Platform Fee";
        }
        if (selectedFilter === "organizer") {
          return !(transaction.paymentType === "Admin Revenue" || transaction.type === "Platform Fee");
        }
        return true;
      })
      .filter((transaction) => {
        if (transactionTypeFilter === "all") return true;
        return transaction.type === transactionTypeFilter;
      })
      .filter((transaction) => {
        if (categoryFilter === "all") return true;
        return transaction.paymentType === categoryFilter;
      })
      .filter((transaction) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase().trim();
        return (
          (transaction.tournament?.name || "").toLowerCase().includes(q) ||
          (transaction.organizer?.orgName || transaction.organizer?.fullName || "").toLowerCase().includes(q) ||
          (transaction.team?.name || "").toLowerCase().includes(q) ||
          (transaction.player?.fullName || "").toLowerCase().includes(q) ||
          (transaction.payerName || "").toLowerCase().includes(q)
        );
      })
      .filter((transaction) => {
        const date = new Date(transaction.createdAt);
        if (monthFilter !== "all" && date.getMonth() !== parseInt(monthFilter, 10)) return false;
        if (yearFilter !== "all" && date.getFullYear() !== parseInt(yearFilter, 10)) return false;
        return true;
      });
  }, [transactions, selectedFilter, transactionTypeFilter, categoryFilter, searchTerm, monthFilter, yearFilter]);

  if (loading) {
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
          Revenue Management
        </h1>
        
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

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SearchBar
          placeholder="Search tournament, organizer, player..."
          searchQuery={searchTerm}
          setSearchQuery={setSearchTerm}
        />
        <Select
          options={[
            { value: "all", label: "All Types" },
            ...uniqueTransactionTypes.map((type) => ({ value: type, label: type })),
          ]}
          value={transactionTypeFilter}
          onChange={(e) => setTransactionTypeFilter(e.target.value)}
        />
        <Select
          options={[
            { value: "all", label: "All Categories" },
            ...uniqueCategories.map((category) => ({ value: category, label: category })),
          ]}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />
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
            ...availableYears.map((year) => ({ value: String(year), label: String(year) })),
          ]}
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        />
        <div className="flex items-center justify-end">
          <span className="text-sm text-base dark:text-base-dark font-medium">
            Total: {filteredTransactions.length}
          </span>
        </div>
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
                    ? transaction.organizer?.orgName || transaction.organizer?.fullName || transaction.payerName || "Unknown"
                    : transaction.team?.name || transaction.player?.fullName || transaction.payerName || "Unknown"}
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

