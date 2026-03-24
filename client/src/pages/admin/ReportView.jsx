import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { ArrowLeft, Users, IndianRupee, TrendingUp, Clock, Download, Trophy } from "lucide-react";
import { getReportById } from "../../store/slices/adminSlice";
import { formatINR } from "../../utils/formatINR";
import Spinner from "../../components/ui/Spinner";
import { chartThemeOptions, barChartThemeOptions, doughnutThemeOptions, getTournamentStatusColor, toMonthLabels } from "../../utils/chartConfig";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#0ea5e9", "#7c3aed"];

const chartOptions = barChartThemeOptions;

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const formatted = typeof value === "object"
    ? JSON.stringify(value)
    : String(value);

  const escaped = formatted.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const buildCsvRows = (report) => {
  const rows = [];
  const recordSectionKeys = new Set([
    "usersTable",
    "teamsByManager",
    "payments",
    "pendingPayments",
    "tournamentsTable",
  ]);

  Object.entries(report.data || {}).forEach(([sectionName, sectionData]) => {
    if (!recordSectionKeys.has(sectionName) || !Array.isArray(sectionData)) {
      return;
    }

    if (sectionData.length === 0) {
      return;
    }

    rows.push([sectionName]);

    const headers = Array.from(
      sectionData.reduce((set, item) => {
        if (item && typeof item === "object") {
          Object.keys(item).forEach((key) => set.add(key));
        }
        return set;
      }, new Set())
    );

    if (headers.length === 0) {
      rows.push(["value"]);
      sectionData.forEach((item) => rows.push([item]));
    } else {
      rows.push(headers);
      sectionData.forEach((item) => {
        rows.push(headers.map((header) => item?.[header]));
      });
    }

    rows.push([]);
  });

  if (rows.length === 0) {
    rows.push(["No records found"]);
  }

  return rows;
};

const downloadReportCsv = (report) => {
  const rows = buildCsvRows(report);
  const csvContent = rows
    .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeTitle = (report.title || "report").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  link.href = url;
  link.setAttribute("download", `${safeTitle || "report"}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const SummaryCard = ({ label, value, colorClass = "text-text-primary dark:text-text-primary-dark" }) => (
  <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-5 text-center">
    <p className="text-xs text-base dark:text-base-dark font-semibold uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
  </div>
);

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-secondary" />
      <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">{title}</h3>
    </div>
    {children}
  </div>
);

const UserPlayerReportView = ({ report }) => {
  const { summary, data } = report;
  const reportTypeLabel = summary.scopeLabel || "All Users and Players";
  const isPlayerReport = summary.scope === "player";
  const isManagerScope = summary.scope === "manager" || summary.scope === "teamManager";
  const teamsLabel = summary.scope === "manager" ? "Registered Teams" : "Managed Teams";

  return (
    <div className="space-y-6">
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-4">
        <p className="text-sm text-base dark:text-base-dark">Selected Report</p>
        <p className="font-semibold text-text-primary dark:text-text-primary-dark">{reportTypeLabel}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label={isPlayerReport ? "Total Players" : "Total Users"} value={(summary.totalRegisteredUsers || 0).toLocaleString("en-IN")} colorClass="text-blue-600" />
        <SummaryCard label="Active Users" value={(summary.activeUsers || 0).toLocaleString("en-IN")} colorClass="text-emerald-600" />
        <SummaryCard label="Inactive Users" value={(summary.inactiveUsers || 0).toLocaleString("en-IN")} colorClass="text-red-600" />
      </div>

      {isManagerScope && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SummaryCard
            label={teamsLabel}
            value={(summary.totalTeams || 0).toLocaleString("en-IN")}
            colorClass="text-amber-600"
          />
        </div>
      )}

      {data.activeInactiveBreakdown?.length > 0 && (
        <SectionCard title="Active vs Inactive Users" icon={Users}>
          <div className="h-64">
            <Doughnut
              data={{
                labels: data.activeInactiveBreakdown.map((item) => item.name),
                datasets: [{
                  data: data.activeInactiveBreakdown.map((item) => item.count),
                  backgroundColor: ["#16a34a", "#dc2626"],
                  borderWidth: 0,
                }],
              }}
              options={{
                ...doughnutThemeOptions,
                maintainAspectRatio: false,
                plugins: {
                  ...doughnutThemeOptions.plugins,
                  legend: {
                    ...doughnutThemeOptions.plugins.legend,
                    position: "right",
                  },
                },
              }}
            />
          </div>
        </SectionCard>
      )}

      {data.newUsersPerMonth?.length > 0 && (
        <SectionCard title="New Users Per Month" icon={TrendingUp}>
          <div className="h-72">
            <Bar
              data={{
                labels: toMonthLabels(data.newUsersPerMonth.map((item) => item.month)),
                datasets: [{
                  label: "New Users",
                  data: data.newUsersPerMonth.map((item) => item.count),
                  backgroundColor: "#2563eb",
                  borderRadius: 4,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </SectionCard>
      )}

      {data.playersBySport?.length > 0 && (
        <SectionCard title="Players by Sport" icon={Users}>
          <div className="h-72">
            <Bar
              data={{
                labels: data.playersBySport.map((item) => item.sport),
                datasets: [{
                  label: "Players",
                  data: data.playersBySport.map((item) => item.count),
                  backgroundColor: data.playersBySport.map((_, index) => COLORS[index % COLORS.length]),
                  borderRadius: 4,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </SectionCard>
      )}

      {data.cityDistribution?.length > 0 && (
        <SectionCard title="Top Cities" icon={Users}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">City</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Users</th>
                </tr>
              </thead>
              <tbody>
                {data.cityDistribution.map((item) => (
                  <tr key={item.city} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3 font-medium text-text-primary dark:text-text-primary-dark">{item.city}</td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {isManagerScope && data.teamsByManager?.length > 0 && (
        <SectionCard title={`Team Distribution (${teamsLabel})`} icon={Users}>
          <div className="h-72">
            <Bar
              data={{
                labels: data.teamsByManager.map((item) => item.manager),
                datasets: [{
                  label: teamsLabel,
                  data: data.teamsByManager.map((item) => item.count),
                  backgroundColor: "#f59e0b",
                  borderRadius: 4,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </SectionCard>
      )}

      <SectionCard title="User Data Table" icon={Users}>
        {data.usersTable?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Name</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Email</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">City</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Status</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.usersTable.map((row) => (
                  <tr key={row._id} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3 font-medium text-text-primary dark:text-text-primary-dark">{row.fullName}</td>
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{row.email}</td>
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{row.city}</td>
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{row.status}</td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">
                      {new Date(row.joinedAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-base dark:text-base-dark">No records found for this report.</p>
        )}
      </SectionCard>
    </div>
  );
};

const RevenuePaymentReportView = ({ report }) => {
  const { summary, data } = report;
  const paymentRows = data.payments || data.pendingPayments || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Report For" value={summary.scope === "organizer" ? "Organizer" : "Website"} colorClass="text-blue-600" />
        <SummaryCard label="Registration Revenue" value={`₹${formatINR(summary.registrationRevenue ?? summary.totalRevenue ?? 0)}`} colorClass="text-emerald-600" />
        <SummaryCard label="Listing Cost" value={`₹${formatINR(summary.listingCost || 0)}`} colorClass="text-orange-600" />
        <SummaryCard
          label="Profit"
          value={`₹${formatINR(summary.profit || 0)}`}
          colorClass={(summary.profit || 0) >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      {summary.organizer?.name && (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-4">
          <p className="text-sm text-base dark:text-base-dark">Organizer</p>
          <p className="font-semibold text-text-primary dark:text-text-primary-dark">{summary.organizer.name}</p>
          {summary.organizer.email && (
            <p className="text-xs text-base dark:text-base-dark">{summary.organizer.email}</p>
          )}
        </div>
      )}

      {data.revenuePerMonth?.length > 0 && (
        <SectionCard title="Registration Revenue Per Month" icon={TrendingUp}>
          <div className="h-72">
            <Bar
              data={{
                labels: toMonthLabels(data.revenuePerMonth.map((item) => item.month)),
                datasets: [{
                  label: "Registration Revenue (INR)",
                  data: data.revenuePerMonth.map((item) => item.revenue),
                  backgroundColor: "#16a34a",
                  borderRadius: 4,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </SectionCard>
      )}

      {data.revenueBySport?.length > 0 && (
        <SectionCard title="Revenue by Sport" icon={IndianRupee}>
          <div className="h-72">
            <Bar
              data={{
                labels: data.revenueBySport.map((item) => item.sport),
                datasets: [{
                  label: "Registration Revenue (INR)",
                  data: data.revenueBySport.map((item) => item.revenue),
                  backgroundColor: data.revenueBySport.map((_, index) => COLORS[index % COLORS.length]),
                  borderRadius: 4,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </SectionCard>
      )}

      <SectionCard title="Payment Records" icon={Clock}>
        {paymentRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Payer</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Type</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Tournament</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Status</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Amount</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentRows.map((payment) => (
                  <tr key={payment._id} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3 font-medium text-text-primary dark:text-text-primary-dark">{payment.payerName || "N/A"}</td>
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{payment.payerType}</td>
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{payment.tournamentName}</td>
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{payment.status}</td>
                    <td className="py-3 px-3 text-right font-semibold text-text-primary dark:text-text-primary-dark">₹{formatINR(payment.amount)}</td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">
                      {new Date(payment.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-base dark:text-base-dark">No payment records found for this report period.</p>
        )}
      </SectionCard>
    </div>
  );
};

const TournamentReportView = ({ report }) => {
  const { summary, data } = report;
  const topTournamentParticipation = [...(data.tournamentParticipation || [])]
    .sort((a, b) => b.teamsRegistered - a.teamsRegistered)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Total Tournaments" value={(summary.totalTournamentsOrganized || 0).toLocaleString("en-IN")} colorClass="text-amber-600" />
        <SummaryCard label="Participation" value={(summary.totalTournamentParticipation || 0).toLocaleString("en-IN")} colorClass="text-blue-600" />
        <SummaryCard label="Ongoing" value={(summary.ongoingTournaments || 0).toLocaleString("en-IN")} colorClass="text-emerald-600" />
        <SummaryCard label="Completed" value={(summary.completedTournaments || 0).toLocaleString("en-IN")} colorClass="text-indigo-600" />
      </div>

      {topTournamentParticipation.length > 0 && (
        <SectionCard title="Tournament Participation (Top 10)" icon={Users}>
          <div className="h-72">
            <Bar
              data={{
                labels: topTournamentParticipation.map((item) => item.tournamentName),
                datasets: [{
                  label: "Teams Registered",
                  data: topTournamentParticipation.map((item) => item.teamsRegistered),
                  backgroundColor: "#2563eb",
                  borderRadius: 4,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </SectionCard>
      )}

      {data.statusBreakdown?.length > 0 && (
        <SectionCard title="Tournament Status" icon={TrendingUp}>
          <div className="h-72">
            <Bar
              data={{
                labels: data.statusBreakdown.map((item) => item.status),
                datasets: [{
                  label: "Tournaments",
                  data: data.statusBreakdown.map((item) => item.count),
                  backgroundColor: data.statusBreakdown.map((item) => getTournamentStatusColor(item.status)),
                  borderRadius: 4,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </SectionCard>
      )}

      <SectionCard title="Tournament Data Table" icon={Trophy}>
        {data.tournamentsTable?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Tournament Name</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Organizer</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Registration Type</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Teams Registered</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.tournamentsTable.map((row) => (
                  <tr key={row._id} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3 font-medium text-text-primary dark:text-text-primary-dark">{row.tournamentName}</td>
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{row.organizerName}</td>
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{row.registrationType}</td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">{row.teamsRegistered}</td>
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-base dark:text-base-dark">No tournament records found for this report.</p>
        )}
      </SectionCard>
    </div>
  );
};

const ReportView = () => {
  const { reportId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentReport, reportLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    if (reportId) {
      dispatch(getReportById(reportId));
    }
  }, [dispatch, reportId]);

  if (reportLoading || !currentReport) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/admin/reports")}
            className="flex items-center gap-2 text-sm text-secondary hover:underline font-medium mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </button>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">{currentReport.title}</h1>
          
        </div>

        <button
          onClick={() => downloadReportCsv(currentReport)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {currentReport.type === "UserPlayer" && <UserPlayerReportView report={currentReport} />}
      {currentReport.type === "Tournament" && <TournamentReportView report={currentReport} />}
      {currentReport.type === "RevenuePayment" && <RevenuePaymentReportView report={currentReport} />}
    </div>
  );
};

export default ReportView;

