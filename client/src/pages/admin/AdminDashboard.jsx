import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, getOtpSetting, toggleOtpSetting } from "../../store/slices/adminSlice";
import { formatINR } from "../../utils/formatINR";
import {
  Users,
  Trophy,
  Shield,
  DollarSign,
  UserCheck,
  TrendingUp,
  Settings,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import DashboardCardState from "../../components/ui/DashboardCardState";
import GridContainer from "../../components/ui/GridContainer";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dashboardStats, loading, otpVerificationRequired, otpSettingLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getOtpSetting());
  }, [dispatch]);

  const handleToggleOtp = () => {
    dispatch(toggleOtpSetting());
  };

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
          Admin Dashboard
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          Overview of platform statistics
        </p>
      </div>

      {/* Stats Grid */}
      <GridContainer cols={2}>
        <DashboardCardState
          Icon={Users}
          label="Total Users"
          value={dashboardStats?.users?.total || 0}
          gradientFrom="from-blue-500/10"
          gradientVia="via-blue-500/5"
          borderColor="border-blue-500/20"
          iconGradientFrom="from-blue-500"
          iconGradientTo="to-blue-600"
          onClick={() => navigate("/admin/users")}
        />
        <DashboardCardState
          Icon={Trophy}
          label="Tournaments"
          value={dashboardStats?.tournaments?.total || 0}
          gradientFrom="from-amber-500/10"
          gradientVia="via-amber-500/5"
          borderColor="border-amber-500/20"
          iconGradientFrom="from-amber-500"
          iconGradientTo="to-amber-600"
          onClick={() => navigate("/admin/tournaments")}
        />
        <DashboardCardState
          Icon={Shield}
          label="Teams"
          value={dashboardStats?.teams?.total || 0}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor="border-green-500/20"
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
          onClick={() => navigate("/admin/teams")}
        />
        <DashboardCardState
          Icon={DollarSign}
          label="Total Revenue"
          value={`₹${formatINR(dashboardStats?.revenue?.total || 0)}`}
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor="border-purple-500/20"
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
          onClick={() => navigate("/admin/payments")}
        />
      </GridContainer>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold">Platform Settings</h3>
          </div>
          <div className="flex items-center justify-between p-4 bg-base-dark dark:bg-base rounded-lg">
            <div>
              <p className="font-medium text-text-primary dark:text-text-primary-dark">
                OTP Email Verification
              </p>
              <p className="text-sm text-base dark:text-base-dark mt-1">
                {otpVerificationRequired
                  ? "Users must verify their email via OTP before account activation."
                  : "Users are registered and logged in directly without OTP verification."}
              </p>
            </div>
            <button
              onClick={handleToggleOtp}
              disabled={otpSettingLoading}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                otpVerificationRequired ? "bg-secondary" : "bg-gray-400 dark:bg-gray-600"
              }`}
              role="switch"
              aria-checked={otpVerificationRequired}
              aria-label="Toggle OTP verification"
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  otpVerificationRequired ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-bold">Pending Organizer Requests</h3>
          </div>
          <div className="text-4xl font-bold text-secondary">
            {dashboardStats?.pendingRequests || 0}
          </div>
          <p className="text-sm text-base dark:text-base-dark mt-2">
            Organizers waiting for authorization
          </p>
        </div>

        {/* Recent Payments */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold">Recent Payments</h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboardStats?.recentPayments?.slice(0, 5).map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between p-3 bg-base-dark dark:bg-base rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {payment.tournament?.name || "Unknown Tournament"}
                  </p>
                  <p className="text-sm text-base dark:text-base-dark">
                    {payment.team?.name || payment.player?.fullName || payment.payerName || "Unknown"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{formatINR(payment.amount)}</p>
                  <p className="text-xs text-base dark:text-base-dark">
                    {payment.status}
                  </p>
                </div>
              </div>
            ))}
            {(!dashboardStats?.recentPayments ||
              dashboardStats.recentPayments.length === 0) && (
              <p className="text-center text-base dark:text-base-dark py-4">
                No recent payments
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
