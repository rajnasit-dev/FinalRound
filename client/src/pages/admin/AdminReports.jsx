import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateReport, getAllOrganizers, getAnalyticsData } from "../../store/slices/adminSlice";
import {
  Users,
  IndianRupee,
  Trophy,
  X,
  Download,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";
import { formatINR } from "../../utils/formatINR";
import { chartThemeOptions, doughnutThemeOptions, barChartThemeOptions, getTournamentStatusColor, toMonthLabels } from "../../utils/chartConfig";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import logo from "../../assets/logo.png";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#0ea5e9", "#7c3aed"];
const FEEDBACK_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981"];

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const chartOptions = barChartThemeOptions;

const overviewBaseChartOptions = chartThemeOptions;

const overviewLineChartOptions = {
  ...overviewBaseChartOptions,
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

const overviewRevenueLineOptions = {
  ...overviewLineChartOptions,
  scales: {
    ...overviewLineChartOptions.scales,
    y: {
      ...overviewLineChartOptions.scales.y,
      ticks: {
        font: { size: 11 },
        callback: (value) => `₹${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`,
      },
    },
  },
};

const overviewDoughnutChartOptions = {
  ...doughnutThemeOptions,
};

const overviewBarChartOptions = barChartThemeOptions;

const OverviewChartCard = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6 ${className}`}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-linear-to-br from-secondary to-indigo-600 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">{title}</h3>
    </div>
    {children}
  </div>
);

const REPORT_META = {
  UserPlayer: {
    label: "User Report",
    title: "User Report",
    description: "Total users, active vs inactive users, new users per month, and players by sport.",
    icon: Users,
    btnText: "Generate User Report",
    btnColor: "bg-blue-600 hover:bg-blue-700",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  RevenuePayment: {
    label: "Revenue / Payment",
    title: "Revenue and Payment Report",
    description: "Registration revenue, listing cost, profit, and pending payments for the website or a specific organizer.",
    icon: IndianRupee,
    btnText: "Generate Revenue and Payment Report",
    btnColor: "bg-emerald-600 hover:bg-emerald-700",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  Tournament: {
    label: "Tournament Report",
    title: "Tournament Report",
    description: "Total tournaments organized, participation, registration type, and tournament status.",
    icon: Trophy,
    btnText: "Generate Tournament Report",
    btnColor: "bg-amber-600 hover:bg-amber-700",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
};

const SummaryCard = ({ label, value, colorClass = "text-text-primary dark:text-text-primary-dark" }) => (
  <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-5 text-center">
    <p className="text-xs text-base dark:text-base-dark font-semibold uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
  </div>
);

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6 ${className}`}>
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-secondary" />
      <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">{title}</h3>
    </div>
    {children}
  </div>
);

const ScopeInfo = ({ label, value }) => (
  <div className="px-3 py-1.5 rounded-lg bg-base-dark/50 dark:bg-base/50 inline-block text-sm">
    {label && <span className="text-base dark:text-base-dark">{label}: </span>}
    <span className="font-semibold text-text-primary dark:text-text-primary-dark">{value}</span>
  </div>
);

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

// Report viewer components
const UserPlayerReportView = ({ report }) => {
  const { summary, data } = report;
  const scopeLabel = summary.scopeLabel || "All Users and Players";
  const isPlayerReport = summary.scope === "player";
  const isTeamManagerScope = summary.scope === "manager" || summary.scope === "teamManager";
  const isOrganizerScope = summary.scope === "organizer";
  const isIndividualScope = ["player", "manager", "teamManager", "organizer"].includes(summary.scope);
  const hasTeamInsights = isTeamManagerScope || isOrganizerScope;
  const insightsLabel = isOrganizerScope ? "Tournaments Organized" : "Managed Teams";
  const hasOrganizerAuthorization = isOrganizerScope && data.organizerAuthorizationStatus?.length > 0;
  const hasMonthlyGenderBreakdown = isPlayerReport && data.newUsersPerMonth?.some(
    (item) => item.maleCount !== undefined || item.femaleCount !== undefined || item.totalCount !== undefined
  );
  const hasGenderRatio = isPlayerReport && data.genderRatio?.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <ScopeInfo label="" value={scopeLabel} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label={isPlayerReport ? "Total Players" : "Total Users"} value={(summary.totalRegisteredUsers || 0).toLocaleString("en-IN")} colorClass="text-blue-600" />
        <SummaryCard label="Active Users" value={(summary.activeUsers || 0).toLocaleString("en-IN")} colorClass="text-emerald-600" />
        <SummaryCard label="Inactive Users" value={(summary.inactiveUsers || 0).toLocaleString("en-IN")} colorClass="text-red-600" />
      </div>

      {hasTeamInsights && (
        <div className={`grid grid-cols-1 ${isOrganizerScope ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-4`}>
          <SummaryCard
            label={insightsLabel}
            value={(summary.totalTeams || 0).toLocaleString("en-IN")}
            colorClass="text-amber-600"
          />
          {isOrganizerScope && (
            <SummaryCard
              label="Authorized Organizers"
              value={(summary.authorizedOrganizers || 0).toLocaleString("en-IN")}
              colorClass="text-emerald-600"
            />
          )}
          {isOrganizerScope && (
            <SummaryCard
              label="Not Authorized"
              value={(summary.unauthorizedOrganizers || 0).toLocaleString("en-IN")}
              colorClass="text-red-600"
            />
          )}
        </div>
      )}

      {hasOrganizerAuthorization && (
        <SectionCard title="Organizer Authorization Status" icon={Users}>
          <div className="h-64">
            <Doughnut
              data={(() => {
                // Sort so "Authorized" comes first, then "Not Authorized"
                const sorted = [...data.organizerAuthorizationStatus].sort((a, b) => {
                  if (a.name?.toLowerCase() === "authorized") return -1;
                  if (b.name?.toLowerCase() === "authorized") return 1;
                  return 0;
                });
                return {
                  labels: sorted.map((item) => item.name),
                  datasets: [{
                    data: sorted.map((item) => item.count),
                    backgroundColor: sorted.map((item) =>
                      item.name?.toLowerCase() === "authorized" ? "#16a34a" : "#ef4444"
                    ),
                    borderWidth: 0,
                  }],
                };
              })()}
              options={{
                ...doughnutThemeOptions,
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

      {(data.activeInactiveBreakdown?.length > 0 || data.newUsersPerMonth?.length > 0) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
              <div className="h-64">
                <Bar
                  data={{
                    labels: toMonthLabels(data.newUsersPerMonth.map((item) => item.month)),
                    datasets: hasMonthlyGenderBreakdown
                      ? [
                          {
                            label: "Male",
                            data: data.newUsersPerMonth.map((item) => item.maleCount ?? 0),
                            backgroundColor: "#2563eb",
                            borderRadius: 4,
                          },
                          {
                            label: "Female",
                            data: data.newUsersPerMonth.map((item) => item.femaleCount ?? 0),
                            backgroundColor: "#ec4899",
                            borderRadius: 4,
                          },
                          {
                            label: "Total",
                            data: data.newUsersPerMonth.map((item) => item.totalCount ?? item.count ?? 0),
                            backgroundColor: "#14b8a6",
                            borderRadius: 4,
                          },
                        ]
                      : [{
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
        </div>
      )}

      {(hasGenderRatio || (!isIndividualScope && data.usersByRole?.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hasGenderRatio && (
            <SectionCard title="Male vs Female Ratio" icon={Users}>
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: data.genderRatio.map((item) => item.gender),
                    datasets: [{
                      data: data.genderRatio.map((item) => item.count),
                      backgroundColor: ["#2563eb", "#ec4899"],
                      borderWidth: 0,
                    }],
                  }}
                  options={{
                    ...doughnutThemeOptions,
                    plugins: {
                      ...doughnutThemeOptions.plugins,
                      legend: {
                        ...doughnutThemeOptions.plugins.legend,
                        position: "right",
                      },
                      tooltip: {
                        ...doughnutThemeOptions.plugins.tooltip,
                        callbacks: {
                          label: (tooltipItem) => {
                            const ratioItem = data.genderRatio[tooltipItem.dataIndex];
                            return `${ratioItem.gender}: ${ratioItem.count} (${ratioItem.percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </SectionCard>
          )}

          {!isIndividualScope && data.usersByRole?.length > 0 && (
            <SectionCard title="Users by Role" icon={Users}>
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: data.usersByRole.map((item) => item.role),
                    datasets: [{
                      data: data.usersByRole.map((item) => item.count),
                      backgroundColor: data.usersByRole.map((_, index) => COLORS[index % COLORS.length]),
                      borderWidth: 0,
                    }],
                  }}
                  options={{
                    ...doughnutThemeOptions,
                    plugins: {
                      ...doughnutThemeOptions.plugins,
                      legend: {
                        position: "right",
                        labels: { usePointStyle: true, pointStyle: "circle", padding: 16, font: { size: 12 } },
                      },
                    },
                  }}
                />
              </div>
            </SectionCard>
          )}
        </div>
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

      {hasTeamInsights && !isOrganizerScope && data.teamsByManager?.length > 0 && (
        <SectionCard title={`Team Distribution (${insightsLabel})`} icon={Users}>
          <div className="h-72">
            <Bar
              data={{
                labels: data.teamsByManager.map((item) => item.manager),
                datasets: [{
                  label: insightsLabel,
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
  const isWebsiteScope = summary.scope === "website";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {summary.organizer?.name && (
          <ScopeInfo label="Organizer" value={summary.organizer.name} />
        )}
        {!summary.organizer?.name && (
          <ScopeInfo label="" value="Website" />
        )}
      </div>

      <div className={`grid grid-cols-1 ${isWebsiteScope ? "sm:grid-cols-2" : "sm:grid-cols-4"} gap-4`}>
        <SummaryCard label={isWebsiteScope ? "Website Revenue" : "Registration Revenue"} value={`₹${formatINR((isWebsiteScope ? summary.websiteRevenue : summary.registrationRevenue) ?? summary.totalRevenue ?? 0)}`} colorClass="text-emerald-600" />
        <SummaryCard label="Total Transactions" value={(summary.totalTransactions || 0).toLocaleString("en-IN")} colorClass="text-blue-600" />
        {!isWebsiteScope && (
          <SummaryCard label="Listing Cost" value={`₹${formatINR(summary.listingCost || 0)}`} colorClass="text-orange-600" />
        )}
        {!isWebsiteScope && (
          <SummaryCard
            label="Profit"
            value={`₹${formatINR(summary.profit || 0)}`}
            colorClass={(summary.profit || 0) >= 0 ? "text-green-600" : "text-red-600"}
          />
        )}
      </div>

      {data.revenuePerMonth?.length > 0 && (
        <SectionCard
          title={isWebsiteScope ? "Website Revenue Per Month" : "Registration Revenue Per Month"}
          icon={TrendingUp}
        >
          <div className="h-72">
            <Bar
              data={{
                labels: toMonthLabels(data.revenuePerMonth.map((item) => item.month)),
                datasets: [{
                  label: isWebsiteScope ? "Website Revenue (INR)" : "Registration Revenue (INR)",
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

      {(data.revenueBySport?.length > 0 || (isWebsiteScope && data.topOrganizerRevenue?.length > 0)) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {data.revenueBySport?.length > 0 && (
            <SectionCard title={isWebsiteScope ? "Platform Fee Revenue by Sport" : "Revenue by Sport"} icon={IndianRupee}>
              <div className="h-72">
                <Bar
                  data={{
                    labels: data.revenueBySport.map((item) => item.sport),
                    datasets: [{
                      label: isWebsiteScope ? "Platform Fee Revenue (INR)" : "Registration Revenue (INR)",
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

          {isWebsiteScope && data.topOrganizerRevenue?.length > 0 && (
            <SectionCard title="Top 5 Organizations by Revenue" icon={BarChart3}>
              <div className="h-72">
                <Bar
                  data={{
                    labels: data.topOrganizerRevenue.map((item) => item.organizerName),
                    datasets: [{
                      label: "Revenue (INR)",
                      data: data.topOrganizerRevenue.map((item) => item.revenue),
                      backgroundColor: data.topOrganizerRevenue.map((_, index) => COLORS[index % COLORS.length]),
                      borderRadius: 4,
                    }],
                  }}
                  options={chartOptions}
                />
              </div>
            </SectionCard>
          )}
        </div>
      )}

      <SectionCard title="Payment Records" icon={Clock}>
        {paymentRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Payer</th>
                  {!isWebsiteScope && (
                    <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Organization</th>
                  )}
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
                    {!isWebsiteScope && (
                      <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{payment.organizationName || "-"}</td>
                    )}
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <ScopeInfo label="" value={summary.scopeLabel || "All Tournaments"} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Total Tournaments" value={(summary.totalTournamentsOrganized || 0).toLocaleString("en-IN")} colorClass="text-amber-600" />
        <SummaryCard label="Participation" value={(summary.totalTournamentParticipation || 0).toLocaleString("en-IN")} colorClass="text-blue-600" />
        <SummaryCard label="Ongoing" value={(summary.ongoingTournaments || 0).toLocaleString("en-IN")} colorClass="text-emerald-600" />
        <SummaryCard label="Completed" value={(summary.completedTournaments || 0).toLocaleString("en-IN")} colorClass="text-indigo-600" />
      </div>

      {data.statusBreakdown?.length > 0 && (
        <SectionCard title="Tournament Status" icon={TrendingUp}>
          <div className="h-72">
            <Pie
              data={{
                labels: data.statusBreakdown.map((item) => item.status),
                datasets: [{
                  label: "Tournaments",
                  data: data.statusBreakdown.map((item) => item.count),
                  backgroundColor: data.statusBreakdown.map((item) => getTournamentStatusColor(item.status)),
                  borderWidth: 0,
                }],
              }}
              options={overviewDoughnutChartOptions}
            />
          </div>
        </SectionCard>
      )}

      {data.tournamentParticipation?.length > 0 && (
        <SectionCard title="Registration by Tournament" icon={Users}>
          <div className="h-72">
            <Bar
              data={{
                labels: data.tournamentParticipation.map((item) => item.tournamentName),
                datasets: [{
                  label: "Registrations",
                  data: data.tournamentParticipation.map((item) => item.teamsRegistered),
                  backgroundColor: "#2563eb",
                  borderRadius: 4,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </SectionCard>
      )}

      {data.organizerTournamentCounts?.length > 0 && (
        <SectionCard title="Tournaments by Organizer" icon={BarChart3}>
          <div className="h-72">
            <Bar
              data={{
                labels: data.organizerTournamentCounts.map((item) => item.organizerName),
                datasets: [{
                  label: "Tournaments Created",
                  data: data.organizerTournamentCounts.map((item) => item.count),
                  backgroundColor: "#2563eb",
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
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Sport</th>
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
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{row.sport || "-"}</td>
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

const ReportModal = ({ isOpen, onClose, reportType, onGenerate, generating, organizers = [] }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filters, setFilters] = useState({
    organizerId: "all",
    tournamentOrganizerId: "all",
    tournamentStatus: "all",
    userPlayerScope: "users",
  });

  useEffect(() => {
    if (isOpen) {
      const to = new Date();
      const from = new Date(to.getFullYear(), 0, 1);
      setFromDate(formatDateForInput(from));
      setToDate(formatDateForInput(to));
      setFilters({
        organizerId: "all",
        tournamentOrganizerId: "all",
        tournamentStatus: "all",
        userPlayerScope: "users",
      });
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isUserPlayer = reportType === "UserPlayer";
  const isRevenuePayment = reportType === "RevenuePayment";
  const isTournament = reportType === "Tournament";

  const handleSubmit = () => {
    if (!fromDate || !toDate) {
      toast.error("Please select a valid date range");
      return;
    }

    onGenerate({
      type: reportType,
      from: fromDate,
      to: toDate,
      filters,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card-background dark:bg-card-background-dark rounded-2xl shadow-2xl w-full max-w-lg border border-base-dark dark:border-base">
        <div className="flex items-center justify-between p-6 border-b border-base-dark dark:border-base">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
            {REPORT_META[reportType].title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-base-dark dark:hover:bg-base transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {isUserPlayer && (
            <div>
              <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                User Type
              </label>
              <select
                value={filters.userPlayerScope}
                onChange={(e) => setFilters((prev) => ({ ...prev, userPlayerScope: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary cursor-pointer"
              >
                <option value="users">All Users</option>
                <option value="player">Player</option>
                <option value="manager">Manager</option>
                <option value="organizer">Organizer</option>
              </select>
            </div>
          )}

          {isRevenuePayment && (
            <>
              <div>
                <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                  Report For
                </label>
                <select
                  value={filters.organizerId === "all" ? "website" : "organizer"}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters((prev) => ({
                      ...prev,
                      organizerId: value === "website" ? "all" : (organizers[0]?._id || "all"),
                    }));
                  }}
                  className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary cursor-pointer"
                >
                  <option value="website">Website (All Organizers)</option>
                  <option value="organizer">Individual Organizer</option>
                </select>
              </div>

              {filters.organizerId !== "all" && (
                <div>
                  <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                    Organizer
                  </label>
                  <select
                    value={filters.organizerId}
                    onChange={(e) => setFilters((prev) => ({ ...prev, organizerId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary cursor-pointer"
                  >
                    {organizers.length === 0 ? (
                      <option value="all">No organizers available</option>
                    ) : (
                      organizers.map((organizer) => (
                        <option key={organizer._id} value={organizer._id}>
                          {organizer.orgName || "Unknown Organization"}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </>
          )}

          {isTournament && (
            <>
              <div>
                <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                  Organization
                </label>
                <select
                  value={filters.tournamentOrganizerId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, tournamentOrganizerId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary cursor-pointer"
                >
                  <option value="all">All Organizations</option>
                  {organizers.map((organizer) => (
                    <option key={organizer._id} value={organizer._id}>
                      {organizer.orgName || organizer.fullName || "Unknown Organization"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
                  Tournament Status
                </label>
                <select
                  value={filters.tournamentStatus}
                  onChange={(e) => setFilters((prev) => ({ ...prev, tournamentStatus: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-base-dark dark:border-base">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-base-dark dark:border-base text-sm font-medium hover:bg-base-dark dark:hover:bg-base transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={generating}
            className="px-6 py-2.5 rounded-lg bg-secondary hover:bg-secondary/90 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

const PrintableReportWrapper = ({ report, children }) => {
  return (
    <div style={{ backgroundColor: "white", color: "black", padding: "32px", position: "relative", overflow: "visible", width: "100%" }}>
      <style>{`
        * {
          color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body { background-color: white !important; }

        /* Text colors */
        .text-black { color: #000000 !important; }
        .text-white { color: #ffffff !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-800 { color: #1f2937 !important; }
        .text-blue-600 { color: #2563eb !important; }
        .text-blue-700 { color: #1d4ed8 !important; }
        .text-emerald-600 { color: #059669 !important; }
        .text-amber-600 { color: #d97706 !important; }
        .text-red-600 { color: #dc2626 !important; }
        .text-green-600 { color: #16a34a !important; }

        /* Background colors */
        .bg-white { background-color: #ffffff !important; }
        .bg-black { background-color: #000000 !important; }
        .bg-blue-50 { background-color: #eff6ff !important; }
        .bg-blue-100 { background-color: #dbeafe !important; }
        .bg-blue-600 { background-color: #2563eb !important; }
        .bg-emerald-50 { background-color: #f0fdf4 !important; }
        .bg-emerald-100 { background-color: #d1fae5 !important; }
        .bg-emerald-600 { background-color: #059669 !important; }
        .bg-amber-50 { background-color: #fffbeb !important; }
        .bg-amber-100 { background-color: #fef3c7 !important; }
        .bg-amber-600 { background-color: #d97706 !important; }
        .bg-amber-200 { background-color: #fcd34d !important; }
        .bg-amber-800 { background-color: #92400e !important; }
        .bg-red-50 { background-color: #fef2f2 !important; }
        .bg-red-600 { background-color: #dc2626 !important; }
        .bg-green-50 { background-color: #f0fdf4 !important; }
        .bg-green-600 { background-color: #16a34a !important; }
        .bg-gray-50 { background-color: #f9fafb !important; }
        .bg-gray-100 { background-color: #f3f4f6 !important; }
        .bg-gray-200 { background-color: #e5e7eb !important; }

        /* Border colors */
        .border-gray-200 { border-color: #e5e7eb !important; }
        .border-gray-300 { border-color: #d1d5db !important; }
        .border-red-200 { border-color: #fecaca !important; }
        .border-green-200 { border-color: #bbf7d0 !important; }
        .border-amber-200 { border-color: #fcd34d !important; }
        .border-amber-800 { border-color: #92400e !important; }

        /* Extra coverage for dark mode that might leak */
        .dark { display: none !important; }
      `}</style>

      {/* Watermark Logo */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <img
          src={logo}
          alt=""
          style={{ width: "384px", height: "384px", objectFit: "contain", opacity: 0.05 }}
        />
      </div>

      {/* Header with Logo and Title */}
      <div style={{ position: "relative", zIndex: 10, borderBottom: "2px solid #e5e7eb", paddingBottom: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src={logo} alt="SportsHub" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
            <div>
              <h1 style={{ fontSize: "30px", fontWeight: "bold", color: "#1f2937", fontFamily: "'Syne', sans-serif" }}>
                SportsHub
              </h1>
              <p style={{ fontSize: "14px", color: "#4b5563" }}>www.sportshub.com</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "14px", color: "#4b5563" }}>Report Date</p>
            <p style={{ fontWeight: "600", color: "#1f2937" }}>{new Date().toLocaleDateString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "24px" }}>
        {children}
      </div>

      {/* Footer */}
      <div style={{ position: "relative", zIndex: 10, borderTop: "2px solid #e5e7eb", marginTop: "32px", paddingTop: "24px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#4b5563" }}>
          This report is generated automatically by SportsHub and is valid for administrative purposes.
        </p>
        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
          For any queries, please contact support@sportshub.com
        </p>
      </div>
    </div>
  );
};

const AdminReports = () => {
  const dispatch = useDispatch();
  const { currentReport, reportGenerating, organizers, analytics, analyticsLoading } = useSelector((state) => state.admin);
  const printRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("UserPlayer");

  const handlePrint = async () => {
    try {
      if (!printRef.current) {
        console.error("Print ref not found");
        toast.error("Print content not found");
        return;
      }

      console.log("Starting PDF generation...");
      console.log("Print ref element:", printRef.current);

      // Show loading state
      const toastId = toast.loading("Generating PDF...");

      // Clone the element to avoid modifying the original
      const clonedElement = printRef.current.cloneNode(true);

      // Function to strip all Tailwind classes from all elements
      const stripTailwindClasses = (element) => {
        const allElements = element.querySelectorAll("*");
        allElements.forEach((el) => {
          el.removeAttribute("class");
          // Keep only inline styles
        });
        // Also remove the root element's classes
        element.removeAttribute("class");
      };

      stripTailwindClasses(clonedElement);

      // Create a temporary container to hold the cloned element
      const tempContainer = document.createElement("div");
      tempContainer.appendChild(clonedElement);
      tempContainer.style.position = "fixed";
      tempContainer.style.left = "-99999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "100%";
      document.body.appendChild(tempContainer);

      // Capture the element as canvas
      console.log("Capturing with html2canvas...");
      const canvas = await html2canvas(clonedElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
      });

      // Remove temp container
      document.body.removeChild(tempContainer);

      console.log("Canvas captured successfully, dimensions:", canvas.width, "x", canvas.height);

      // Create PDF from canvas with proper multi-page support
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 10; // 5mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 5; // 5mm top margin

      // Add first page
      pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 10;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 10;
      }

      // Generate filename
      const fileName = `${currentReport?.title || "report"}-${new Date().toLocaleDateString("en-IN")}.pdf`;

      // Download PDF
      pdf.save(fileName);

      console.log("PDF downloaded successfully");
      toast.dismiss(toastId);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      toast.dismiss();
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  const onDownloadPDF = () => {
    console.log("Download PDF clicked");
    if (!currentReport) {
      toast.error("No report to download");
      return;
    }
    handlePrint();
  };

  useEffect(() => {
    dispatch(getAllOrganizers("authorized"));
    dispatch(getAnalyticsData());
  }, [dispatch]);

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
        backgroundColor:
          analytics?.feedbackDistribution?.map((_, index) => FEEDBACK_COLORS[index] || COLORS[index % COLORS.length]) || [],
        borderRadius: 8,
        maxBarThickness: 52,
      },
    ],
  };

  const handleGenerate = async (reportData) => {
    const result = await dispatch(generateReport(reportData));
    if (generateReport.fulfilled.match(result)) {
      toast.success("Report generated successfully");
      setModalOpen(false);
      return;
    }

    toast.error(result.payload || "Failed to generate report");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Reports
        </h1>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(REPORT_META).map(([type, card]) => (
          <div
            key={type}
            className={`bg-card-background dark:bg-card-background-dark rounded-xl border-2 ${card.borderColor} p-6 flex flex-col`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                {card.title}
              </h3>
            </div>

            <p className="text-sm text-base dark:text-base-dark mb-5 flex-1">{card.description}</p>

            <button
              onClick={() => {
                setModalType(type);
                setModalOpen(true);
              }}
              className={`w-full py-3 rounded-lg text-white text-sm font-semibold transition-colors ${card.btnColor}`}
            >
              {card.btnText}
            </button>
          </div>
        ))}
      </div>

      {currentReport && reportGenerating === false && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">{currentReport.title}</h2>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onDownloadPDF}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => downloadReportCsv(currentReport)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Hidden Print Component */}
          <div style={{ position: "fixed", left: "-99999px", top: 0, width: "100%", zIndex: -1 }}>
            <div ref={printRef}>
              <PrintableReportWrapper report={currentReport}>
                {currentReport.type === "UserPlayer" && <UserPlayerReportView report={currentReport} />}
                {currentReport.type === "Tournament" && <TournamentReportView report={currentReport} />}
                {currentReport.type === "RevenuePayment" && <RevenuePaymentReportView report={currentReport} />}
              </PrintableReportWrapper>
            </div>
          </div>

          {/* Display version */}
          {currentReport.type === "UserPlayer" && <UserPlayerReportView report={currentReport} />}
          {currentReport.type === "Tournament" && <TournamentReportView report={currentReport} />}
          {currentReport.type === "RevenuePayment" && <RevenuePaymentReportView report={currentReport} />}
        </div>
      )}

      {reportGenerating && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!currentReport && !reportGenerating && (
        <div className="space-y-6">
          {analyticsLoading ? (
            <div className="flex items-center justify-center h-64 bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base">
              <Spinner size="lg" />
            </div>
          ) : (
            analytics && (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <OverviewChartCard title="User Growth" icon={TrendingUp}>
                    <div className="h-72">
                      <Line data={userGrowthData} options={overviewLineChartOptions} />
                    </div>
                  </OverviewChartCard>

                  <OverviewChartCard title="Revenue Trend" icon={DollarSign}>
                    <div className="h-72">
                      <Line data={revenueGrowthData} options={overviewRevenueLineOptions} />
                    </div>
                  </OverviewChartCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <OverviewChartCard title="Users by Role" icon={Users}>
                    <div className="h-64">
                      <Doughnut data={roleDistributionData} options={overviewDoughnutChartOptions} />
                    </div>
                  </OverviewChartCard>

                  <OverviewChartCard title="Admin Revenue" icon={DollarSign}>
                    <div className="h-64">
                      <Doughnut data={adminRevenueData} options={overviewDoughnutChartOptions} />
                    </div>
                  </OverviewChartCard>
                </div>

                {(analytics.sportWiseTournaments?.length > 0 || analytics.feedbackDistribution?.length > 0) && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {analytics.sportWiseTournaments?.length > 0 && (
                      <OverviewChartCard title="Sport-wise Tournaments" icon={BarChart3}>
                        <div className="h-72">
                          <Bar data={sportWiseTournamentsData} options={overviewBarChartOptions} />
                        </div>
                      </OverviewChartCard>
                    )}

                    {analytics.feedbackDistribution?.length > 0 && (
                      <OverviewChartCard title="Feedback Ratings" icon={MessageSquare}>
                        <div className="h-72">
                          <Bar data={feedbackDistributionData} options={overviewBarChartOptions} />
                        </div>
                      </OverviewChartCard>
                    )}
                  </div>
                )}
              </>
            )
          )}
        </div>
      )}

      <ReportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        reportType={modalType}
        onGenerate={handleGenerate}
        generating={reportGenerating}
        organizers={organizers}
      />
    </div>
  );
};

export default AdminReports;

