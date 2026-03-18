import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  getDashboardStats,
  getOtpSetting,
  toggleOtpSetting,
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
  BarChart3,
  Dumbbell,
  MessageSquare,
  Swords,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import Spinner from "../../components/ui/Spinner";
import { chartThemeOptions, doughnutThemeOptions, toMonthLabels } from "../../utils/chartConfig";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];
const FEEDBACK_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981"];

const baseChartOptions = chartThemeOptions;

const lineChartOptions = {
  ...baseChartOptions,
  interaction: {
    mode: "index",
    intersect: false,
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
      border: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, font: { size: 11 } },
      grid: { color: "rgba(148, 163, 184, 0.15)" },
      border: { display: false },
    },
  },
};

const revenueLineOptions = {
  ...lineChartOptions,
  scales: {
    ...lineChartOptions.scales,
    y: {
      ...lineChartOptions.scales.y,
      ticks: {
        font: { size: 11 },
        callback: (value) => `₹${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`,
      },
    },
  },
};

const doughnutChartOptions = {
  ...doughnutThemeOptions,
};

const barChartOptions = {
  ...baseChartOptions,
  plugins: {
    ...baseChartOptions.plugins,
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
      border: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, font: { size: 11 } },
      grid: { color: "rgba(148, 163, 184, 0.15)" },
      border: { display: false },
    },
  },
};

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

const ChartCard = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6 ${className}`}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-linear-to-br from-secondary to-indigo-600 rounded-lg flex items-center justify-center">
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
    analytics,
    analyticsLoading,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getOtpSetting());
    dispatch(getAnalyticsData());
  }, [dispatch]);

  const handleToggleOtp = () => {
    dispatch(toggleOtpSetting());
  };

  const userGrowthData = {
    labels: toMonthLabels(analytics?.userGrowth?.map((item) => item.month) || []),
    datasets: [
      {
        label: "New Users",
        data: analytics?.userGrowth?.map((item) => item.users) || [],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.18)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const revenueGrowthData = {
    labels: toMonthLabels(analytics?.revenueGrowth?.map((item) => item.month) || []),
    datasets: [
      {
        label: "Revenue",
        data: analytics?.revenueGrowth?.map((item) => item.revenue) || [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.18)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const roleDistributionData = {
    labels: analytics?.roleDistribution?.map((item) => item.name) || [],
    datasets: [
      {
        data: analytics?.roleDistribution?.map((item) => item.value) || [],
        backgroundColor: analytics?.roleDistribution?.map((_, index) => COLORS[index % COLORS.length]) || [],
        borderColor: "#ffffff",
        borderWidth: 3,
      },
    ],
  };

  const adminRevenueData = {
    labels: ["Successful Revenue", "Pending Revenue", "Failed Payments"],
    datasets: [
      {
        data: [
          analytics?.paymentStatus?.find((item) => item.name === "Success")?.amount || 0,
          analytics?.paymentStatus?.find((item) => item.name === "Pending")?.amount || 0,
          analytics?.paymentStatus?.find((item) => item.name === "Failed")?.amount || 0,
        ],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderColor: "#ffffff",
        borderWidth: 3,
      },
    ],
  };

  const sportWiseTournamentsData = {
    labels: analytics?.sportWiseTournaments?.map((item) => item.name) || [],
    datasets: [
      {
        label: "Tournaments",
        data: analytics?.sportWiseTournaments?.map((item) => item.tournaments) || [],
        backgroundColor: analytics?.sportWiseTournaments?.map((_, index) => COLORS[index % COLORS.length]) || [],
        borderRadius: 8,
        maxBarThickness: 42,
      },
    ],
  };

  const feedbackDistributionData = {
    labels: analytics?.feedbackDistribution?.map((item) => `${item.rating} Star`) || [],
    datasets: [
      {
        label: "Reviews",
        data: analytics?.feedbackDistribution?.map((item) => item.count) || [],
        backgroundColor: analytics?.feedbackDistribution?.map((_, index) => FEEDBACK_COLORS[index] || COLORS[index % COLORS.length]) || [],
        borderRadius: 8,
        maxBarThickness: 52,
      },
    ],
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
        
      </div>

      {/* Stats Grid with Growth Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div
          onClick={() => navigate("/admin/users")}
          className="group relative bg-card-background dark:bg-card-background-dark border-2 border-blue-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        >
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-blue-500/5 to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
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
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-linear-to-br from-blue-500 to-blue-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        <div
          onClick={() => navigate("/admin/tournaments")}
          className="group relative bg-card-background dark:bg-card-background-dark border-2 border-amber-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        >
          <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
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
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-linear-to-br from-amber-500 to-amber-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        <div
          onClick={() => navigate("/admin/teams")}
          className="group relative bg-card-background dark:bg-card-background-dark border-2 border-green-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        >
          <div className="absolute inset-0 bg-linear-to-br from-green-500/10 via-green-500/5 to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-linear-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
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
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-linear-to-br from-green-500 to-green-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        <div
          onClick={() => navigate("/admin/payments")}
          className="group relative bg-card-background dark:bg-card-background-dark border-2 border-purple-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        >
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-purple-500/5 to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
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
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-linear-to-br from-purple-500 to-purple-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
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
                  <Line data={userGrowthData} options={lineChartOptions} />
                </div>
              </ChartCard>

              <ChartCard title="Revenue Trend" icon={DollarSign}>
                <div className="h-72">
                  <Line data={revenueGrowthData} options={revenueLineOptions} />
                </div>
              </ChartCard>
            </div>

            {/* Pie Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Users by Role" icon={Users}>
                <div className="h-64">
                  <Doughnut data={roleDistributionData} options={doughnutChartOptions} />
                </div>
              </ChartCard>

              <ChartCard title="Admin Revenue" icon={DollarSign}>
                <div className="h-64">
                  <Doughnut data={adminRevenueData} options={doughnutChartOptions} />
                </div>
              </ChartCard>
            </div>

            {/* Sport-wise Tournaments Bar Chart */}
            {analytics.sportWiseTournaments.length > 0 && (
              <ChartCard title="Sport-wise Tournaments" icon={BarChart3}>
                <div className="h-72">
                  <Bar data={sportWiseTournamentsData} options={barChartOptions} />
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
        </div>
      </div>

      {/* Feedback Distribution */}
      {analytics?.feedbackDistribution?.length > 0 && (
        <ChartCard title="Feedback Ratings" icon={MessageSquare}>
          <div className="h-64">
            <Bar data={feedbackDistributionData} options={barChartOptions} />
          </div>
        </ChartCard>
      )}
    </div>
  );
};

export default AdminDashboard;

