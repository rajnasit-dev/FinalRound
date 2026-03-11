import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getDashboardStats,
  getOtpSetting,
  toggleOtpSetting,
  getEmailNotificationSetting,
  toggleEmailNotificationSetting,
  getAnalyticsData,
} from "../../store/slices/adminSlice";
import { formatINR } from "../../utils/formatINR";
import {
  Users,
  Trophy,
  Shield,
  DollarSign,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Settings,
  Activity,
  BarChart3,
  Dumbbell,
  MessageSquare,
  Swords,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import DashboardCardState from "../../components/ui/DashboardCardState";
import GridContainer from "../../components/ui/GridContainer";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const GrowthBadge = ({ value }) => {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        isPositive
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isPositive ? "+" : ""}
      {value}%
    </span>
  );
};

const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base rounded-lg shadow-xl px-4 py-3">
        <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {prefix}
            {typeof entry.value === "number" ? entry.value.toLocaleString("en-IN") : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6 ${className}`}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gradient-to-br from-secondary to-indigo-600 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    dashboardStats,
    loading,
    otpVerificationRequired,
    otpSettingLoading,
    emailNotificationsEnabled,
    emailNotificationSettingLoading,
    analytics,
    analyticsLoading,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getOtpSetting());
    dispatch(getEmailNotificationSetting());
    dispatch(getAnalyticsData());
  }, [dispatch]);

  const handleToggleOtp = () => {
    dispatch(toggleOtpSetting());
  };

  const handleToggleEmailNotifications = () => {
    dispatch(toggleEmailNotificationSetting());
  };

  if (loading && !dashboardStats?.users?.total) {
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
          Overview of platform statistics and analytics
        </p>
      </div>

      {/* Stats Grid with Growth Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div
          onClick={() => navigate("/admin/users")}
          className="group relative bg-card-background dark:bg-card-background-dark border-2 border-blue-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-white" />
              </div>
              {analytics?.growth && <GrowthBadge value={analytics.growth.users} />}
            </div>
            <p className="text-sm font-semibold text-base dark:text-base-dark mb-2 uppercase tracking-wide">
              Total Users
            </p>
            <p className="text-4xl font-bold text-text-primary dark:text-text-primary-dark">
              {dashboardStats?.users?.total || 0}
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        <div
          onClick={() => navigate("/admin/tournaments")}
          className="group relative bg-card-background dark:bg-card-background-dark border-2 border-amber-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              {analytics?.growth && (
                <GrowthBadge value={analytics.growth.tournaments} />
              )}
            </div>
            <p className="text-sm font-semibold text-base dark:text-base-dark mb-2 uppercase tracking-wide">
              Tournaments
            </p>
            <p className="text-4xl font-bold text-text-primary dark:text-text-primary-dark">
              {dashboardStats?.tournaments?.total || 0}
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        <div
          onClick={() => navigate("/admin/teams")}
          className="group relative bg-card-background dark:bg-card-background-dark border-2 border-green-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-base dark:text-base-dark mb-2 uppercase tracking-wide">
              Teams
            </p>
            <p className="text-4xl font-bold text-text-primary dark:text-text-primary-dark">
              {dashboardStats?.teams?.total || 0}
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        <div
          onClick={() => navigate("/admin/payments")}
          className="group relative bg-card-background dark:bg-card-background-dark border-2 border-purple-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              {analytics?.growth && (
                <GrowthBadge value={analytics.growth.revenue} />
              )}
            </div>
            <p className="text-sm font-semibold text-base dark:text-base-dark mb-2 uppercase tracking-wide">
              Total Revenue
            </p>
            <p className="text-4xl font-bold text-text-primary dark:text-text-primary-dark">
              ₹{formatINR(dashboardStats?.revenue?.total || 0)}
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
              {analytics?.totals?.sports || 0}
            </p>
            <p className="text-xs text-base dark:text-base-dark uppercase tracking-wide">Sports</p>
          </div>
        </div>
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
            <Swords className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
              {analytics?.totals?.matches || 0}
            </p>
            <p className="text-xs text-base dark:text-base-dark uppercase tracking-wide">
              Matches
            </p>
          </div>
        </div>
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
              {analytics?.totals?.feedback || 0}
            </p>
            <p className="text-xs text-base dark:text-base-dark uppercase tracking-wide">
              Feedback
            </p>
          </div>
        </div>
        <div
          onClick={() => navigate("/admin/organizer-requests")}
          className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
              {dashboardStats?.pendingRequests || 0}
            </p>
            <p className="text-xs text-base dark:text-base-dark uppercase tracking-wide">
              Pending
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {analyticsLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        analytics && (
          <>
            {/* User Growth & Revenue Trend Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ChartCard title="User Growth" icon={TrendingUp}>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.userGrowth}>
                      <defs>
                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="users"
                        name="New Users"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fill="url(#userGradient)"
                        dot={{ r: 4, fill: "#6366f1" }}
                        activeDot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Revenue Trend" icon={DollarSign}>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.revenueGrowth}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                      />
                      <Tooltip content={<CustomTooltip prefix="₹" />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#revenueGradient)"
                        dot={{ r: 4, fill: "#10b981" }}
                        activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Pie Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard title="Users by Role" icon={Users}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                      >
                        {analytics.roleDistribution.map((_, index) => (
                          <Cell key={`role-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Tournament Formats" icon={Trophy}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.tournamentFormats}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                      >
                        {analytics.tournamentFormats.map((_, index) => (
                          <Cell key={`format-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Payment Status" icon={DollarSign}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.paymentStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="name"
                      >
                        {analytics.paymentStatus.map((entry, index) => (
                          <Cell
                            key={`payment-${index}`}
                            fill={
                              entry.name === "Success"
                                ? "#10b981"
                                : entry.name === "Pending"
                                ? "#f59e0b"
                                : entry.name === "Failed"
                                ? "#ef4444"
                                : COLORS[index % COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Sport-wise Tournaments Bar Chart */}
            {analytics.sportWiseTournaments.length > 0 && (
              <ChartCard title="Sport-wise Tournaments" icon={BarChart3}>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.sportWiseTournaments} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="tournaments" name="Tournaments" radius={[6, 6, 0, 0]}>
                        {analytics.sportWiseTournaments.map((_, index) => (
                          <Cell key={`sport-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}
          </>
        )
      )}

      {/* Bottom Section: Settings + Recent Payments */}
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
                otpVerificationRequired
                  ? "bg-secondary"
                  : "bg-gray-400 dark:bg-gray-600"
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
          <div className="flex items-center justify-between p-4 bg-base-dark dark:bg-base rounded-lg mt-3">
            <div>
              <p className="font-medium text-text-primary dark:text-text-primary-dark">
                Email Notifications
              </p>
              <p className="text-sm text-base dark:text-base-dark mt-1">
                {emailNotificationsEnabled
                  ? "Notification emails are sent for team joins, removals, organizer approvals, etc."
                  : "All notification emails are disabled. Critical emails (OTP, password reset) still work."}
              </p>
            </div>
            <button
              onClick={handleToggleEmailNotifications}
              disabled={emailNotificationSettingLoading}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                emailNotificationsEnabled
                  ? "bg-secondary"
                  : "bg-gray-400 dark:bg-gray-600"
              }`}
              role="switch"
              aria-checked={emailNotificationsEnabled}
              aria-label="Toggle email notifications"
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  emailNotificationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
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
                    {payment.team?.name ||
                      payment.player?.fullName ||
                      payment.payerName ||
                      "Unknown"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    ₹{formatINR(payment.amount)}
                  </p>
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

      {/* Feedback Distribution */}
      {analytics?.feedbackDistribution?.length > 0 && (
        <ChartCard title="Feedback Ratings" icon={MessageSquare}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.feedbackDistribution} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis
                  dataKey="rating"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Reviews" radius={[6, 6, 0, 0]}>
                  {analytics.feedbackDistribution.map((_, index) => (
                    <Cell
                      key={`fb-${index}`}
                      fill={["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981"][index] || COLORS[index]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}
    </div>
  );
};

export default AdminDashboard;
