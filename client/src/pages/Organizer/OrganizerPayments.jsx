import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DollarSign, Calendar, Trophy, CheckCircle, Clock, ArrowUpCircle, ArrowDownCircle, Users, Download } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import DashboardCardState from "../../components/ui/DashboardCardState";
import DataTable from "../../components/ui/DataTable";
import useDateFormat from "../../hooks/useDateFormat";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const OrganizerPayments = () => {
  const { user } = useSelector((state) => state.auth);
  const { formatDate, formatTime } = useDateFormat();
  const [receivedPayments, setReceivedPayments] = useState([]);
  const [platformFees, setPlatformFees] = useState([]);
  const [activeTab, setActiveTab] = useState("received"); // "received" or "platformFees"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      // Fetch payments received from players/managers
      const receivedResponse = await axios.get(`${API_BASE_URL}/payments/user/me`, {
        withCredentials: true,
      });
      setReceivedPayments(receivedResponse.data.data || []);

      // Fetch all tournaments and filter by organizer
      const feesResponse = await axios.get(`${API_BASE_URL}/tournaments`, {
        withCredentials: true,
      });

      // Extract platform fee payments from tournaments organized by this user
      const allTournaments = feesResponse.data.data || [];
      const myTournaments = allTournaments.filter(t => t.organizer?._id === user?._id);

      const feePayments = myTournaments
        .filter(t => t.platformFeePaid)
        .map(t => ({
          _id: t._id,
          tournament: { name: t.name },
          amount: t.platformFee || 0,
          status: t.platformFeePaid ? "completed" : "pending",
          createdAt: t.createdAt,
          type: "platform_fee"
        }));

      setPlatformFees(feePayments);
      setError(null);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const totalReceived = receivedPayments.filter(p => p.status?.toLowerCase() === "success").reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalPaidToAdmin = platformFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const netRevenue = totalReceived - totalPaidToAdmin;

  const currentPayments = activeTab === "received" ? receivedPayments : platformFees;

  // Define columns for received payments
  const receivedColumns = [
    {
      header: "Transaction ID",
      accessor: "transactionId",
      render: (payment) => (
        <span className="text-sm font-mono text-text-primary dark:text-text-primary-dark">
          {payment.transactionId || payment._id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: "Tournament",
      accessor: "tournament",
      render: (payment) => (
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-secondary dark:text-secondary" />
          <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
            {payment.tournament?.name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Participant",
      accessor: "participant",
      render: (payment) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-text-primary dark:text-text-primary-dark">
            {payment.team?.name || payment.player?.fullName || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      render: (payment) => (
        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
          +₹{payment.amount?.toLocaleString() || "0"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      render: (payment) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-base dark:text-base-dark" />
          <span className="text-sm text-text-primary dark:text-text-primary-dark">
            {formatDate(payment.createdAt)}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (payment) => {
        const status = payment.status?.toLowerCase();
        const statusClass = 
          status === "completed" || status === "success"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            : status === "pending"
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
        
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
            {(status === "completed" || status === "success") && <CheckCircle className="w-3.5 h-3.5" />}
            {status === "pending" && <Clock className="w-3.5 h-3.5" />}
            {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
          </span>
        );
      },
    },
  ];

  // Define columns for platform fees
  const platformFeesColumns = [
    {
      header: "Tournament",
      accessor: "tournament",
      render: (payment) => (
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-secondary dark:text-secondary" />
          <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
            {payment.tournament?.name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      render: (payment) => (
        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
          -₹{payment.amount?.toLocaleString() || "0"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      render: (payment) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-base dark:text-base-dark" />
          <span className="text-sm text-text-primary dark:text-text-primary-dark">
            {formatDate(payment.createdAt)}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (payment) => {
        const status = payment.status?.toLowerCase();
        const statusClass = 
          status === "completed" || status === "success"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
        
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
            {(status === "completed" || status === "success") && <CheckCircle className="w-3.5 h-3.5" />}
            {status === "pending" && <Clock className="w-3.5 h-3.5" />}
            {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
          </span>
        );
      },
    },
  ];

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
          Payment History
        </h1>
        <p className="text-base dark:text-base-dark">
          Track payments received from registrations and platform fees paid to admin
        </p>
      </div>

      {error && <ErrorMessage message={error} type="error" />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCardState
          Icon={ArrowDownCircle}
          label="Received"
          value={`₹${totalReceived.toLocaleString()}`}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor="border-green-500/20"
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
        />

        <DashboardCardState
          Icon={ArrowUpCircle}
          label="Paid to Admin"
          value={`₹${totalPaidToAdmin.toLocaleString()}`}
          gradientFrom="from-red-500/10"
          gradientVia="via-red-500/5"
          borderColor="border-red-500/20"
          iconGradientFrom="from-red-500"
          iconGradientTo="to-red-600"
        />

        <DashboardCardState
          Icon={DollarSign}
          label="Net Revenue"
          value={`₹${netRevenue.toLocaleString()}`}
          gradientFrom="from-blue-500/10"
          gradientVia="via-blue-500/5"
          borderColor="border-blue-500/20"
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
        />

        <DashboardCardState
          Icon={Trophy}
          label="Transactions"
          value={receivedPayments.length + platformFees.length}
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor="border-purple-500/20"
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border dark:border-border-dark">
        <button
          onClick={() => setActiveTab("received")}
          className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === "received"
              ? "text-secondary dark:text-secondary"
              : "text-text-primary dark:text-text-dark hover:text-secondary dark:hover:bg-secondary"
            }`}
        >
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="w-4 h-4" />
            Payments Received
            <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-semibold rounded-full">
              {receivedPayments.length}
            </span>
          </div>
          {activeTab === "received" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary-dark"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("platformFees")}
          className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === "platformFees"
              ? "text-secondary dark:text-secondary"
              : "text-text-primary dark:text-text-dark hover:text-secondary dark:hover:bg-secondary"
            }`}
        >
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4" />
            Platform Fees Paid
            <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-semibold rounded-full">
              {platformFees.length}
            </span>
          </div>
          {activeTab === "platformFees" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary-dark"></div>
          )}
        </button>
      </div>

      {/* Payments Table */}
      <DataTable
        columns={activeTab === "received" ? receivedColumns : platformFeesColumns}
        data={currentPayments}
        itemsPerPage={10}
        emptyMessage={
          <div className="flex flex-col items-center gap-3 py-8">
            <DollarSign className="w-12 h-12 text-base dark:text-base-dark" />
            <p className="text-text-primary dark:text-text-primary-dark">
              {activeTab === "received"
                ? "No payments received yet. Payments from tournament registrations will appear here."
                : "No platform fees paid yet. Platform fees for tournament creation will appear here."}
            </p>
          </div>
        }
      />
    </div>
  );
};

export default OrganizerPayments;
