import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRevenue } from "../../store/slices/adminSlice";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Trophy,
  CreditCard,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import DashboardCardState from "../../components/ui/DashboardCardState";

const Revenue = () => {
  const dispatch = useDispatch();
  const { revenue, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getRevenue());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  // Group payments by month
  const paymentsByMonth = revenue?.payments?.reduce((acc, payment) => {
    const month = new Date(payment.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(payment);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Revenue Management
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          Track platform earnings and payments
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCardState
          Icon={DollarSign}
          label="Total Revenue"
          value={`₹${revenue?.totalRevenue || 0}`}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor="border-green-500/20"
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
        />
        <DashboardCardState
          Icon={Trophy}
          label="Tournament Revenue"
          value={`₹${revenue?.tournamentRevenue || 0}`}
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor="border-purple-500/20"
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
        />
        <DashboardCardState
          Icon={CreditCard}
          label="Total Payments"
          value={revenue?.totalPayments || 0}
          gradientFrom="from-blue-500/10"
          gradientVia="via-blue-500/5"
          borderColor="border-blue-500/20"
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
        />
        <DashboardCardState
          Icon={TrendingUp}
          label="This Month"
          value={`₹${revenue?.monthlyRevenue || 0}`}
          gradientFrom="from-orange-500/10"
          gradientVia="via-orange-500/5"
          borderColor="border-orange-500/20"
          iconGradientFrom="from-orange-500"
          iconGradientTo="to-orange-600"
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h3 className="text-xl font-bold mb-4">Recent Payments</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {revenue?.payments?.slice(0, 10).map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between p-4 bg-base-dark dark:bg-base rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {payment.tournament?.name || "Unknown Tournament"}
                  </p>
                  <p className="text-sm text-base dark:text-base-dark">
                    {payment.team?.name || "Unknown Team"}
                  </p>
                  <p className="text-xs text-base dark:text-base-dark mt-1">
                    {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 text-lg">
                    ₹{payment.amount}
                  </p>
                  <p
                    className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === "Success"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : payment.status === "Pending"
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {payment.status}
                  </p>
                </div>
              </div>
            ))}
            {(!revenue?.payments || revenue.payments.length === 0) && (
              <p className="text-center text-base dark:text-base-dark py-8">
                No payments recorded
              </p>
            )}
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h3 className="text-xl font-bold mb-4">Monthly Breakdown</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {paymentsByMonth &&
              Object.entries(paymentsByMonth).map(([month, payments]) => {
                const total = payments.reduce(
                  (sum, p) => sum + (p.amount || 0),
                  0
                );
                return (
                  <div
                    key={month}
                    className="flex items-center justify-between p-4 bg-base-dark dark:bg-base rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-base dark:text-base-dark" />
                      <div>
                        <p className="font-medium">{month}</p>
                        <p className="text-sm text-base dark:text-base-dark">
                          {payments.length} payment{payments.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600 text-lg">₹{total}</p>
                  </div>
                );
              })}
            {(!paymentsByMonth || Object.keys(paymentsByMonth).length === 0) && (
              <p className="text-center text-base dark:text-base-dark py-8">
                No monthly data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
        <h3 className="text-xl font-bold mb-4">Payment Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              Successful
            </p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
              {revenue?.payments?.filter((p) => p.status === "Success").length ||
                0}
            </p>
          </div>
          <div className="text-center p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Pending
            </p>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-2">
              {revenue?.payments?.filter((p) => p.status === "Pending").length ||
                0}
            </p>
          </div>
          <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">Failed</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-300 mt-2">
              {revenue?.payments?.filter((p) => p.status === "Failed").length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
