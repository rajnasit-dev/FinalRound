import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatINR } from "../../utils/formatINR";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Trophy,
  Users,
  DollarSign,
  AlertCircle,
  FileText,
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
import Button from "../../components/ui/Button";
import DashboardCardState from "../../components/ui/DashboardCardState";
import GridContainer from "../../components/ui/GridContainer";
import { fetchOrganizerTournaments } from "../../store/slices/tournamentSlice";
import { getOrganizerAnalytics } from "../../store/slices/organizerSlice";
import { chartThemeOptions, doughnutThemeOptions, getTournamentStatusColor, toMonthLabels } from "../../utils/chartConfig";

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

const OrganizerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { organizerTournaments, loading: tournamentsLoading } = useSelector((state) => state.tournament);
  const { analytics, analyticsLoading } = useSelector((state) => state.organizer);

  useEffect(() => {
    dispatch(fetchOrganizerTournaments());
    dispatch(getOrganizerAnalytics());
  }, [dispatch]);

  const myTournaments = organizerTournaments || [];

  const totalTournaments = myTournaments.length;

  // Total registrations across all tournaments (teams + players)
  const totalRegistrations = myTournaments.reduce((acc, t) => {
    return acc + (t.registeredTeams?.length || 0) + (t.registeredPlayers?.length || 0);
  }, 0);

  // Chart data configurations
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

  const revenueTrendData = {
    labels: toMonthLabels(analytics?.revenueTrend?.map((item) => item.month) || []),
    datasets: [
      {
        label: "Registration Revenue",
        data: analytics?.revenueTrend?.map((item) => item.revenue) || [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.18)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const tournamentStatusData = {
    labels: analytics?.tournamentStatus?.map((item) => item.name) || [],
    datasets: [
      {
        data: analytics?.tournamentStatus?.map((item) => item.value) || [],
        backgroundColor: analytics?.tournamentStatus?.map((item) => getTournamentStatusColor(item.name)) || [],
        borderColor: "#ffffff",
        borderWidth: 3,
      },
    ],
  };

  const sportDistributionData = {
    labels: analytics?.sportDistribution?.map((item) => item.name) || [],
    datasets: [
      {
        label: "Tournaments",
        data: analytics?.sportDistribution?.map((item) => item.value) || [],
        backgroundColor: analytics?.sportDistribution?.map((_, index) => COLORS[index % COLORS.length]) || [],
        borderColor: "rgba(0, 0, 0, 0)",
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    ...chartThemeOptions,
    maintainAspectRatio: true,
  };

  const revenueLineOptions = {
    ...chartOptions,
    maintainAspectRatio: false,
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
        ticks: {
          font: { size: 11 },
          callback: (value) => `₹${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`,
        },
        grid: { color: "rgba(148, 163, 184, 0.15)" },
        border: { display: false },
      },
    },
  };

  const statusChartOptions = {
    ...doughnutThemeOptions,
    maintainAspectRatio: true,
  };

  if (tournamentsLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authorization Warning Banner */}
      {!user?.isAuthorized && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400 mb-2">
                Authorization Required
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
                Your organization needs to be authorized before you can create tournaments. 
                Submit your verification documents to get started.
              </p>
              <Button
                onClick={() => navigate("/organizer/authorization")}
                className="!w-auto px-6 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
              >
                Apply for Authorization
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          Welcome back, {user?.fullName}!
        </h1>
        
      </div>

      {/* Stats Cards */}
      <GridContainer cols={2}>
        <DashboardCardState
          Icon={Trophy}
          label="Total Tournaments"
          value={totalTournaments}
          gradientFrom="from-amber-500/10"
          gradientVia="via-amber-500/5"
          borderColor="border-amber-500/30"
          iconGradientFrom="from-amber-500"
          iconGradientTo="to-amber-600"
          onClick={() => navigate("/organizer/tournaments")}
        />
        <DashboardCardState
          Icon={DollarSign}
          label="Registration Revenue"
          value={`₹${formatINR(analytics?.totalRevenue || 0)}`}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor="border-green-500/30"
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
          onClick={() => navigate("/organizer/payments")}
        />
        <DashboardCardState
          Icon={Users}
          label="Total Registrations"
          value={totalRegistrations}
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor="border-purple-500/30"
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
          onClick={() => navigate("/organizer/tournaments")}
        />
        <DashboardCardState
          Icon={FileText}
          label="Reports"
          value="Create & View"
          gradientFrom="from-amber-500/10"
          gradientVia="via-amber-500/5"
          borderColor="border-amber-500/30"
          iconGradientFrom="from-amber-500"
          iconGradientTo="to-amber-600"
          onClick={() => navigate("/organizer/reports")}
        />
      </GridContainer>

      {/* Analytics Charts */}
      <div className="space-y-6">
        {/* Top Row: Registration Revenue + Tournament Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                  Registration Revenue
                </h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ₹{formatINR(analytics?.totalRevenue || 0)}
                </div>
              </div>
            </div>
            <div style={{ height: "360px" }}>
              <Line
                data={revenueTrendData}
                options={revenueLineOptions}
              />
            </div>
          </div>

          <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
            <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark mb-4">
              Tournament Status
            </h3>
            <div style={{ height: "360px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Doughnut data={tournamentStatusData} options={statusChartOptions} />
            </div>
          </div>
        </div>

        {/* Bottom Row: Sport Distribution */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Tournament by Sport
          </h3>
          <div style={{ height: "300px" }}>
            <Bar data={sportDistributionData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;

