import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAnalyticsData, getRevenue } from "../../store/slices/adminSlice";
import { formatINR } from "../../utils/formatINR";
import {
  TrendingUp,
  Users,
  Trophy,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  MessageSquare,
  CalendarRange,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
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
  LineChart,
  Line,
  ComposedChart,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base rounded-lg shadow-xl px-4 py-3">
        <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {prefix}
            {typeof entry.value === "number"
              ? entry.value.toLocaleString("en-IN")
              : entry.value}
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

const StatBox = ({ label, value, color, subtext }) => (
  <div className="text-center p-4 bg-base-dark dark:bg-base rounded-xl">
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mt-1">
      {label}
    </p>
    {subtext && (
      <p className="text-xs text-base dark:text-base-dark mt-0.5">{subtext}</p>
    )}
  </div>
);

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { analytics, analyticsLoading, revenue } = useSelector(
    (state) => state.admin
  );
  const [revenueFilter, setRevenueFilter] = useState("all");

  useEffect(() => {
    dispatch(getAnalyticsData());
    dispatch(getRevenue({ type: "all" }));
  }, [dispatch]);

  const handleRevenueFilter = (type) => {
    setRevenueFilter(type);
    dispatch(getRevenue({ type }));
  };

  if (analyticsLoading && !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  // Build combined user+revenue chart data
  const combinedGrowthData =
    analytics?.userGrowth?.map((item, i) => ({
      month: item.month,
      users: item.users,
      revenue: analytics.revenueGrowth?.[i]?.revenue || 0,
    })) || [];

  // Revenue breakdown for pie
  const revenueBreakdown =
    revenue?.adminRevenue != null && revenue?.organizerRevenue != null
      ? [
          { name: "Admin Revenue", value: revenue.adminRevenue },
          { name: "Organizer Revenue", value: revenue.organizerRevenue },
        ]
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Analytics
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          Detailed platform analytics and insights
        </p>
      </div>

      {analytics && (
        <>
          {/* Growth Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-base dark:text-base-dark font-semibold">
                    User Growth
                  </p>
                  <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                    {analytics.growth.users > 0 ? "+" : ""}
                    {analytics.growth.users}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-base dark:text-base-dark">
                vs last month
              </p>
            </div>

            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-base dark:text-base-dark font-semibold">
                    Tournament Growth
                  </p>
                  <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                    {analytics.growth.tournaments > 0 ? "+" : ""}
                    {analytics.growth.tournaments}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-base dark:text-base-dark">
                vs last month
              </p>
            </div>

            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-base dark:text-base-dark font-semibold">
                    Revenue Growth
                  </p>
                  <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                    {analytics.growth.revenue > 0 ? "+" : ""}
                    {analytics.growth.revenue}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-base dark:text-base-dark">
                vs last month
              </p>
            </div>
          </div>

          {/* Combined Growth Chart */}
          <ChartCard title="Users & Revenue Trend (12 Months)" icon={TrendingUp}>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedGrowthData}>
                  <defs>
                    <linearGradient
                      id="anaUserGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#6366f1"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="users"
                    name="New Users"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#anaUserGrad)"
                    dot={{ r: 3, fill: "#6366f1" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (₹)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#10b981" }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Middle Row: Role Distribution + Revenue Breakdown + Sport Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Role Distribution */}
            <ChartCard title="Users by Role" icon={Users}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {analytics.roleDistribution.map((_, index) => (
                        <Cell
                          key={`role-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Revenue Breakdown */}
            <ChartCard title="Revenue Breakdown" icon={PieChartIcon}>
              {revenueBreakdown.length > 0 ? (
                <>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                          nameKey="name"
                        >
                          <Cell fill="#6366f1" />
                          <Cell fill="#10b981" />
                        </Pie>
                        <Tooltip
                          formatter={(value) => `₹${formatINR(value)}`}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: "11px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <StatBox
                      label="Admin"
                      value={`₹${formatINR(revenue?.adminRevenue || 0)}`}
                      color="text-indigo-500"
                    />
                    <StatBox
                      label="Organizer"
                      value={`₹${formatINR(revenue?.organizerRevenue || 0)}`}
                      color="text-emerald-500"
                    />
                  </div>
                </>
              ) : (
                <p className="text-center text-base dark:text-base-dark py-8">
                  No revenue data
                </p>
              )}
            </ChartCard>

            {/* Payment Status */}
            <ChartCard title="Payment Status" icon={DollarSign}>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.paymentStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="name"
                    >
                      {analytics.paymentStatus.map((entry, index) => (
                        <Cell
                          key={`ps-${index}`}
                          fill={
                            entry.name === "Success"
                              ? "#10b981"
                              : entry.name === "Pending"
                              ? "#f59e0b"
                              : entry.name === "Failed"
                              ? "#ef4444"
                              : COLORS[index]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {analytics.paymentStatus.map((item) => (
                  <div
                    key={item.name}
                    className="text-center p-2 bg-base-dark dark:bg-base rounded-lg"
                  >
                    <p className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                      {item.count}
                    </p>
                    <p className="text-xs text-base dark:text-base-dark">
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Sport-wise Tournaments */}
          {analytics.sportWiseTournaments.length > 0 && (
            <ChartCard title="Tournaments by Sport" icon={BarChart3}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.sportWiseTournaments}
                    barSize={45}
                    layout="vertical"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      opacity={0.3}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="tournaments"
                      name="Tournaments"
                      radius={[0, 6, 6, 0]}
                    >
                      {analytics.sportWiseTournaments.map((_, index) => (
                        <Cell
                          key={`sb-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}

          {/* Bottom Row: Tournament Formats + Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tournament Format Distribution */}
            {analytics.tournamentFormats.length > 0 && (
              <ChartCard title="Tournament Formats" icon={Trophy}>
                <div className="flex items-center gap-8">
                  <div className="h-56 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.tournamentFormats}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {analytics.tournamentFormats.map((_, index) => (
                            <Cell
                              key={`tf-${index}`}
                              fill={COLORS[(index + 2) % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {analytics.tournamentFormats.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[(i + 2) % COLORS.length],
                          }}
                        />
                        <span className="text-sm text-text-primary dark:text-text-primary-dark font-medium">
                          {item.name}
                        </span>
                        <span className="text-sm text-base dark:text-base-dark ml-auto">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            )}

            {/* Feedback Ratings */}
            {analytics.feedbackDistribution.length > 0 && (
              <ChartCard title="Feedback Ratings" icon={MessageSquare}>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.feedbackDistribution}
                      barSize={40}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        opacity={0.3}
                      />
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
                      <Bar
                        dataKey="count"
                        name="Reviews"
                        radius={[6, 6, 0, 0]}
                      >
                        {analytics.feedbackDistribution.map((_, index) => (
                          <Cell
                            key={`fba-${index}`}
                            fill={
                              [
                                "#ef4444",
                                "#f97316",
                                "#f59e0b",
                                "#84cc16",
                                "#10b981",
                              ][index] || COLORS[index]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}
          </div>

          {/* Revenue Transactions Summary */}
          {revenue?.transactions?.length > 0 && (
            <ChartCard title="Recent Revenue Transactions" icon={CalendarRange}>
              <div className="flex gap-2 mb-4">
                {["all", "admin", "organizer"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleRevenueFilter(type)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      revenueFilter === type
                        ? "bg-secondary text-white"
                        : "bg-base-dark dark:bg-base text-text-primary dark:text-text-primary-dark hover:bg-secondary/20"
                    }`}
                  >
                    {type === "all"
                      ? "All"
                      : type === "admin"
                      ? "Platform Fees"
                      : "Registrations"}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-base-dark dark:border-base">
                      <th className="text-left py-3 px-2 text-base dark:text-base-dark font-semibold">
                        Type
                      </th>
                      <th className="text-left py-3 px-2 text-base dark:text-base-dark font-semibold">
                        Tournament
                      </th>
                      <th className="text-left py-3 px-2 text-base dark:text-base-dark font-semibold">
                        Amount
                      </th>
                      <th className="text-left py-3 px-2 text-base dark:text-base-dark font-semibold">
                        Category
                      </th>
                      <th className="text-left py-3 px-2 text-base dark:text-base-dark font-semibold">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenue.transactions.slice(0, 10).map((tx) => (
                      <tr
                        key={tx._id}
                        className="border-b border-base-dark/50 dark:border-base/50 hover:bg-base-dark/50 dark:hover:bg-base/50 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              tx.type === "Platform Fee"
                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                : tx.type === "Team Registration"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-text-primary dark:text-text-primary-dark">
                          {tx.tournament?.name || "-"}
                        </td>
                        <td className="py-3 px-2 font-semibold text-green-600">
                          ₹{formatINR(tx.amount)}
                        </td>
                        <td className="py-3 px-2 text-base dark:text-base-dark">
                          {tx.paymentType}
                        </td>
                        <td className="py-3 px-2 text-base dark:text-base-dark">
                          {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
