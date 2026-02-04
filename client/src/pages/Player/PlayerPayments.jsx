import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserPayments } from "../../store/slices/paymentSlice";
import { DollarSign, Calendar, Trophy, CheckCircle, Clock, XCircle, Download } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import DashboardCardState from "../../components/ui/DashboardCardState";
import DataTable from "../../components/ui/DataTable";
import useDateFormat from "../../hooks/useDateFormat";
import { Link } from "react-router-dom";

const PlayerPayments = () => {
  const dispatch = useDispatch();
  const { payments, loading, error } = useSelector((state) => state.payment);
  const { formatDate, formatTime } = useDateFormat();

  useEffect(() => {
    dispatch(fetchUserPayments());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: {
        icon: CheckCircle,
        text: "Completed",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        textColor: "text-green-800 dark:text-green-300",
        iconColor: "text-green-600 dark:text-green-400",
      },
      pending: {
        icon: Clock,
        text: "Pending",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        textColor: "text-yellow-800 dark:text-yellow-300",
        iconColor: "text-yellow-600 dark:text-yellow-400",
      },
      failed: {
        icon: XCircle,
        text: "Failed",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        textColor: "text-red-800 dark:text-red-300",
        iconColor: "text-red-600 dark:text-red-400",
      },
    };

    const normalizedStatus = status?.toLowerCase();
    const config = statusConfig[normalizedStatus] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
        {config.text}
      </span>
    );
  };

  const totalPaid = payments?.filter(p => p.status?.toLowerCase() === "success").reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const pendingAmount = payments?.filter(p => p.status?.toLowerCase() === "pending").reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  // Define table columns
  const columns = [
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
          <Trophy className="w-4 h-4 text-primary dark:text-primary-dark" />
          <span className="text-sm text-text-primary dark:text-text-primary-dark">
            {payment.tournament?.name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      render: (payment) => (
        <span className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
          ₹{payment.amount?.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      render: (payment) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-primary dark:text-text-primary-dark" />
          <span className="text-sm text-text-primary dark:text-text-primary-dark">
            {formatDate(payment.createdAt)}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (payment) => getStatusBadge(payment.status),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (payment) => (
        payment.status?.toLowerCase() === "success" && (
          <Link
            to={`/player/payments/${payment._id}/receipt`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary dark:bg-secondary-dark text-white text-sm font-medium rounded-lg hover:bg-secondary/90 dark:hover:bg-secondary-dark/90 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Receipt
          </Link>
        )
      ),
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Payment History
        </h1>
        <p className="text-text-primary dark:text-text-primary-dark mt-2">
          View all your tournament registration payments
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCardState
          Icon={DollarSign}
          label="Total Paid"
          value={`₹${totalPaid.toLocaleString()}`}
          gradientFrom="from-green-500/20"
          gradientVia="via-green-500/10"
          borderColor="border-green-500/30"
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
        />
        
        <DashboardCardState
          Icon={Clock}
          label="Pending"
          value={`₹${pendingAmount.toLocaleString()}`}
          gradientFrom="from-yellow-500/20"
          gradientVia="via-yellow-500/10"
          borderColor="border-yellow-500/30"
          iconGradientFrom="from-yellow-500"
          iconGradientTo="to-yellow-600"
        />
        
        <DashboardCardState
          Icon={Trophy}
          label="Total Payments"
          value={payments?.length || 0}
          gradientFrom="from-blue-500/20"
          gradientVia="via-blue-500/10"
          borderColor="border-blue-500/30"
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
        />
      </div>

      {/* Payments Table */}
      <DataTable
        columns={columns}
        data={payments || []}
        emptyMessage={
          <div className="flex flex-col items-center gap-3 py-8">
            <DollarSign className="w-12 h-12 text-base dark:text-base-dark" />
            <p className="text-text-primary dark:text-text-primary-dark">
              No payment history found
            </p>
            <Link
              to="/player/tournaments"
              className="text-primary dark:text-primary-dark hover:underline text-sm"
            >
              Browse Tournaments
            </Link>
          </div>
        }
      />
    </div>
  );
};

export default PlayerPayments;
