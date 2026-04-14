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

const downloadRecordCsv = (record, recordType) => {
  const headers = Object.keys(record);
  const headerRow = headers.map((h) => escapeCsvValue(h)).join(",");
  const dataRow = headers.map((h) => escapeCsvValue(record[h])).join(",");

  const csvContent = `${headerRow}\n${dataRow}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const recordName = record.tournamentName || record.fullName || record.payerName || "record";
  const fileName = `${recordType}-${recordName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.csv`;

  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const downloadAllUsersCsv = (users) => {
  if (!users || users.length === 0) {
    toast.error("No users to export");
    return;
  }

  const headers = Object.keys(users[0]);
  const headerRow = headers.map((h) => escapeCsvValue(h)).join(",");
  const dataRows = users.map((user) =>
    headers.map((h) => escapeCsvValue(user[h])).join(",")
  ).join("\n");

  const csvContent = `${headerRow}\n${dataRows}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const fileName = `user-report-${new Date().toISOString().split("T")[0]}.csv`;

  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success(`Exported ${users.length} users`);
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
    label: "Revenue Report",
    title: "Revenue Report",
    description: "Registration revenue, listing cost, profit, and pending payments for the website or a specific organizer.",
    icon: IndianRupee,
    btnText: "Generate Revenue Report",
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
  <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-5">
    <p className="text-xs text-base dark:text-base-dark font-semibold uppercase tracking-wide">{label}</p>
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

    // Extract ALL columns from all records in this section
    const headers = Array.from(
      sectionData.reduce((set, item) => {
        if (item && typeof item === "object") {
          Object.keys(item).forEach((key) => set.add(key));
        }
        return set;
      }, new Set())
    ).sort(); // Sort headers alphabetically for consistent column order

    console.log(`[CSV Export] Section "${sectionName}" has ${headers.length} columns:`, headers);

    if (headers.length === 0) {
      rows.push(["value"]);
      sectionData.forEach((item) => rows.push([item]));
    } else {
      rows.push(headers);
      sectionData.forEach((item) => {
        rows.push(headers.map((header) => {
          const value = item?.[header];
          // Handle nested objects and arrays - convert to JSON string
          if (typeof value === "object" && value !== null) {
            return JSON.stringify(value);
          }
          return value;
        }));
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

const waitForRenderFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

const waitForFontsReady = async () => {
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch (error) {
      console.warn("Failed waiting for fonts:", error);
    }
  }
};

const waitForImagesReady = async (rootElement) => {
  const images = Array.from(rootElement.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const done = () => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    })
  );
};

const waitForChartCanvasesReady = async (rootElement) => {
  const canvasHasPaintedPixels = (canvas) => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return false;
    }

    const sampleRows = 6;
    const sampleCols = 6;
    for (let row = 0; row < sampleRows; row++) {
      for (let col = 0; col < sampleCols; col++) {
        const x = Math.floor(((col + 0.5) / sampleCols) * (canvas.width - 1));
        const y = Math.floor(((row + 0.5) / sampleRows) * (canvas.height - 1));
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        if (pixel[3] > 0) {
          return true;
        }
      }
    }

    return false;
  };

  const canvases = Array.from(rootElement.querySelectorAll("canvas"));
  if (canvases.length === 0) {
    return;
  }

  const timeoutMs = 3000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const allReady = canvases.every((canvas) => {
      if (canvas.width === 0 || canvas.height === 0) {
        return false;
      }

      return canvasHasPaintedPixels(canvas);
    });

    if (allReady) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
  }
};

const forceChartRedraw = () => {
  const instances = Object.values(ChartJS.instances || {});
  instances.forEach((chart) => {
    try {
      chart.stop();
      chart.update("none");
    } catch (error) {
      console.warn("Chart redraw failed:", error);
    }
  });
};

const formatDateLabel = (value) => {
  if (!value) {
    return "-";
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return "-";
  }

  const parsed = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return normalized;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

      <SectionCard title="User Data" icon={Users} className="hide-in-pdf">
        {data.usersTable?.length > 0 ? (
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div>
              <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                Total Users: {data.usersTable.length}
              </p>
              <p className="text-xs text-base dark:text-base-dark mt-1">
                Click the button below to download all user data as CSV
              </p>
            </div>
            <button
              onClick={() => downloadAllUsersCsv(data.usersTable)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/90 text-white text-sm font-medium transition-colors"
              title="Download all users as CSV"
            >
              <Download className="w-4 h-4" />
              Export All Users
            </button>
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

      <SectionCard title="Payment Records" icon={Clock} className="hide-in-pdf">
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
                      <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{payment.organizationName || "N/A"}</td>
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
  const isWebsiteScope = !summary.scopeLabel || summary.scopeLabel === "All Tournaments";

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

      {data.tournamentsBySport?.length > 0 && (
        <SectionCard title="Tournaments by Sport" icon={Trophy}>
          <div className="h-72">
            <Bar
              data={{
                labels: data.tournamentsBySport.map((item) => item.sport),
                datasets: [{
                  label: "Number of Tournaments",
                  data: data.tournamentsBySport.map((item) => item.count),
                  backgroundColor: data.tournamentsBySport.map((_, index) => COLORS[index % COLORS.length]),
                  borderRadius: 4,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </SectionCard>
      )}

      {!isWebsiteScope && data.tournamentParticipation?.length > 0 && (
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

      {isWebsiteScope && data.organizerTournamentCounts?.length > 0 && (
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

      <SectionCard title="Tournament Data Table" icon={Trophy} className="hide-in-pdf">
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
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{row.sport || row.sportName || "N/A"}</td>
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

const PrintableReportWrapper = ({ report, children, dateRange }) => {
  // Create a simple SVG watermark pattern
  const watermarkSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Ctext x='300' y='300' font-size='200' font-weight='bold' text-anchor='middle' fill='%23000000' opacity='0.05' font-family='Arial'%3E%3C/text%3E%3C/svg%3E`;

  // Format date range for display
  const formatDateRangeDisplay = () => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return "-";
    }

    const fromFormatted = formatDateLabel(dateRange.from);
    const toFormatted = formatDateLabel(dateRange.to);
    return `${fromFormatted} to ${toFormatted}`;
  };

  const dateRangeText = formatDateRangeDisplay();

  return (
    <div className="pdf-wrapper" style={{
      backgroundColor: "white",
      color: "black",
      padding: "16px",
      position: "relative",
      overflow: "visible",
      width: "1200px",
      maxWidth: "1200px",
      backgroundImage: `linear-gradient(white, white), url("${logo}")`,
      backgroundRepeat: "no-repeat, repeat",
      backgroundSize: "100% 100%, 600px 600px",
      backgroundPosition: "center, center",
      backgroundAttachment: "scroll, scroll"
    }}>
      <style>{`
        .pdf-wrapper * {
          color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .pdf-wrapper body { background-color: white !important; }

        /* Text colors */
        .pdf-wrapper .text-black { color: #000000 !important; }
        .pdf-wrapper .text-white { color: #ffffff !important; }
        .pdf-wrapper .text-gray-50 { color: #f9fafb !important; }
        .pdf-wrapper .text-gray-100 { color: #f3f4f6 !important; }
        .pdf-wrapper .text-gray-200 { color: #e5e7eb !important; }
        .pdf-wrapper .text-gray-300 { color: #d1d5db !important; }
        .pdf-wrapper .text-gray-400 { color: #9ca3af !important; }
        .pdf-wrapper .text-gray-500 { color: #6b7280 !important; }
        .pdf-wrapper .text-gray-600 { color: #4b5563 !important; }
        .pdf-wrapper .text-gray-700 { color: #374151 !important; }
        .pdf-wrapper .text-gray-800 { color: #1f2937 !important; }
        .pdf-wrapper .text-gray-900 { color: #111827 !important; }
        .pdf-wrapper .text-blue-600 { color: #2563eb !important; }
        .pdf-wrapper .text-blue-700 { color: #1d4ed8 !important; }
        .pdf-wrapper .text-emerald-600 { color: #059669 !important; }
        .pdf-wrapper .text-amber-600 { color: #d97706 !important; }
        .pdf-wrapper .text-red-600 { color: #dc2626 !important; }
        .pdf-wrapper .text-green-600 { color: #16a34a !important; }
        .pdf-wrapper .text-primary { color: #1f2937 !important; }
        .pdf-wrapper .text-secondary { color: #6366f1 !important; }
        .pdf-wrapper .text-base { color: #4b5563 !important; }
        .pdf-wrapper .text-base-dark { color: #9ca3af !important; }
        .pdf-wrapper .text-text-primary { color: #1f2937 !important; }
        .pdf-wrapper .text-text-primary-dark { color: #f3f4f6 !important; }

        /* Background colors */
        .pdf-wrapper .bg-white { background-color: #ffffff !important; }
        .pdf-wrapper .bg-black { background-color: #000000 !important; }
        .pdf-wrapper .bg-gray-50 { background-color: #f9fafb !important; }
        .pdf-wrapper .bg-gray-100 { background-color: #f3f4f6 !important; }
        .pdf-wrapper .bg-gray-200 { background-color: #e5e7eb !important; }
        .pdf-wrapper .bg-gray-300 { background-color: #d1d5db !important; }
        .pdf-wrapper .bg-blue-50 { background-color: #eff6ff !important; }
        .pdf-wrapper .bg-blue-100 { background-color: #dbeafe !important; }
        .pdf-wrapper .bg-blue-600 { background-color: #2563eb !important; }
        .pdf-wrapper .bg-emerald-50 { background-color: #f0fdf4 !important; }
        .pdf-wrapper .bg-emerald-100 { background-color: #d1fae5 !important; }
        .pdf-wrapper .bg-emerald-600 { background-color: #059669 !important; }
        .pdf-wrapper .bg-amber-50 { background-color: #fffbeb !important; }
        .pdf-wrapper .bg-amber-100 { background-color: #fef3c7 !important; }
        .pdf-wrapper .bg-amber-600 { background-color: #d97706 !important; }
        .pdf-wrapper .bg-amber-200 { background-color: #fcd34d !important; }
        .pdf-wrapper .bg-amber-800 { background-color: #92400e !important; }
        .pdf-wrapper .bg-red-50 { background-color: #fef2f2 !important; }
        .pdf-wrapper .bg-red-600 { background-color: #dc2626 !important; }
        .pdf-wrapper .bg-green-50 { background-color: #f0fdf4 !important; }
        .pdf-wrapper .bg-green-600 { background-color: #16a34a !important; }
        .pdf-wrapper .bg-card-background { background-color: #ffffff !important; }
        .pdf-wrapper .bg-card-background-dark { background-color: #1f2937 !important; }

        /* Border colors */
        .pdf-wrapper .border-gray-200 { border-color: #e5e7eb !important; }
        .pdf-wrapper .border-gray-300 { border-color: #d1d5db !important; }
        .pdf-wrapper .border-red-200 { border-color: #fecaca !important; }
        .pdf-wrapper .border-green-200 { border-color: #bbf7d0 !important; }
        .pdf-wrapper .border-amber-200 { border-color: #fcd34d !important; }
        .pdf-wrapper .border-amber-800 { border-color: #92400e !important; }
        .pdf-wrapper .border-base { border-color: #e5e7eb !important; }
        .pdf-wrapper .border-base-dark { border-color: #374151 !important; }

        /* Extra coverage for dark mode that might leak */
        .pdf-wrapper .dark { display: none !important; }
        .pdf-wrapper .dark\:bg-card-background-dark { display: none !important; }
        .pdf-wrapper .dark\:text-text-primary-dark { color: #f3f4f6 !important; }

        /* Hide color functions by removing offending elements' backgrounds/colors */
        .pdf-wrapper [style*="oklab"] { background: transparent !important; color: inherit !important; }
        .pdf-wrapper [style*="oklch"] { background: transparent !important; color: inherit !important; }

        /* PDF-specific styling for summary cards */
        .pdf-wrapper .bg-card-background {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          text-align: left !important;
          padding: 16px !important;
          background-color: #f9fafb !important;
          flex-direction: row !important;
          gap: 16px !important;
        }

        .pdf-wrapper .bg-card-background p:first-child {
          text-align: left !important;
          margin: 0 !important;
          flex: 1 !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          color: #4b5563 !important;
        }

        .pdf-wrapper .bg-card-background p:last-child {
          text-align: right !important;
          white-space: nowrap !important;
          margin: 0 !important;
          font-size: 20px !important;
          font-weight: bold !important;
          color: #1f2937 !important;
        }

        /* Hide section header icons only - target the specific flex container with gap-2 */
        .pdf-wrapper .flex.items-center.gap-2 svg {
          display: none !important;
        }

        .pdf-wrapper .flex.items-center.gap-2 h3 {
          margin-left: 0 !important;
        }

        /* Hide User Data section in PDF */
        .pdf-wrapper .hide-in-pdf {
          display: none !important;
        }

        /* Prevent charts and sections from breaking across pages */
        .pdf-wrapper > div > div {
          page-break-inside: avoid !important;
        }

        .pdf-wrapper .h-64,
        .pdf-wrapper .h-72,
        .pdf-wrapper .h-80 {
          page-break-inside: avoid !important;
        }

        /* Reduce spacing in PDF for single-page layout */
        .pdf-wrapper .bg-card-background.rounded-xl {
          padding: 12px !important;
          margin-bottom: 8px !important;
        }

        .pdf-wrapper .bg-card-background.rounded-xl h3 {
          font-size: 14px !important;
          margin-bottom: 8px !important;
        }

        .pdf-wrapper .grid {
          gap: 8px !important;
          display: grid !important;
        }

        .pdf-wrapper .grid-cols-1 {
          grid-template-columns: 1fr !important;
        }

        .pdf-wrapper .space-y-6 {
          gap: 8px !important;
        }

        /* Ensure charts render in grid */
        .pdf-wrapper .grid .h-64 {
          width: 100% !important;
          display: block !important;
        }

        /* Reduce chart heights in PDF */
        .pdf-wrapper .h-64 {
          height: 240px !important;
        }

        .pdf-wrapper .h-72 {
          height: 240px !important;
        }

        .pdf-wrapper .h-80 {
          height: 240px !important;
        }

      `}</style>

      {/* Header with Logo and Title */}
      <div style={{ position: "relative", zIndex: 10, borderBottom: "2px solid #e5e7eb", paddingBottom: "12px", marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src={logo} alt="FinalRound" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", fontFamily: "'Syne', sans-serif", margin: 0 }}>
                FinalRound
              </h1>
              <p style={{ fontSize: "12px", color: "#4b5563", margin: 0 }}>www.finalround.com</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "12px", color: "#4b5563", margin: 0 }}>Report Date</p>
            <p style={{ fontWeight: "600", color: "#1f2937", fontSize: "12px", margin: 0 }}>{new Date().toLocaleDateString("en-IN")}</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
          <div>
            <p style={{ fontSize: "11px", color: "#4b5563", margin: "0 0 1px 0" }}>Selected Timeframe</p>
            <p style={{ fontWeight: "600", color: "#1f2937", fontSize: "12px", margin: 0 }}>{dateRangeText}</p>
          </div>
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "12px" }}>
        {children}
      </div>

      {/* Footer */}
      <div style={{ position: "relative", zIndex: 10, borderTop: "2px solid #e5e7eb", marginTop: "12px", paddingTop: "12px", textAlign: "center" }}>
        <p style={{ fontSize: "11px", color: "#4b5563", margin: 0 }}>
          This report is generated automatically by FinalRound and is valid for administrative purposes.
        </p>
        <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px", margin: "2px 0 0 0" }}>
          For any queries, please contact finalround.support@gmail.com
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
  const [reportDateRange, setReportDateRange] = useState(null);

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

      // Ensure fonts, images, and chart canvases are fully painted before capture.
      console.log("Waiting for print content to fully render...");
      await waitForFontsReady();
      await waitForRenderFrame();
      await waitForRenderFrame();
      await waitForImagesReady(printRef.current);
      forceChartRedraw();
      await waitForRenderFrame();
      await waitForChartCanvasesReady(printRef.current);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Replace problematic oklab/oklch colors in computed styles
      console.log("Replacing oklab/oklch colors in computed styles...");
      const elementsWithStyles = [];
      const allElements = printRef.current.querySelectorAll("*");
      let replacedCount = 0;

      allElements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const currentStyle = el.getAttribute("style") || "";

        // Store original style for restoration
        if (currentStyle) {
          elementsWithStyles.push({ element: el, originalStyle: currentStyle });
        }

        // Check all style properties for oklab/oklch
        let newStyle = currentStyle;
        let hasProblematic = false;

        if (computed.color && (computed.color.includes("oklab") || computed.color.includes("oklch"))) {
          hasProblematic = true;
          newStyle += "; color: #1f2937";
        }
        if (computed.backgroundColor && (computed.backgroundColor.includes("oklab") || computed.backgroundColor.includes("oklch"))) {
          hasProblematic = true;
          newStyle += "; background-color: transparent";
        }
        if (computed.borderColor && (computed.borderColor.includes("oklab") || computed.borderColor.includes("oklch"))) {
          hasProblematic = true;
          newStyle += "; border-color: #e5e7eb";
        }

        // If we found problematic colors, add the new style
        if (hasProblematic) {
          if (!elementsWithStyles.find(e => e.element === el)) {
            elementsWithStyles.push({ element: el, originalStyle: currentStyle });
          }
          el.setAttribute("style", newStyle);
          replacedCount++;
        }
      });
      console.log(`Replaced problematic colors in ${replacedCount} element computed styles`);

      try {
        // Capture the element as canvas with support for canvas elements
        console.log("Capturing with html2canvas...");
        const captureWidth = Math.ceil(printRef.current.scrollWidth || printRef.current.offsetWidth || 1200);
        const captureHeight = Math.ceil(printRef.current.scrollHeight || printRef.current.offsetHeight || 1600);

        const canvas = await html2canvas(printRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 15000,
          width: captureWidth,
          height: captureHeight,
          windowWidth: captureWidth,
          windowHeight: captureHeight,
          scrollX: 0,
          scrollY: 0,
          canvas: null,
        });

        console.log("Canvas captured successfully, dimensions:", canvas.width, "x", canvas.height);

        // Create PDF page sized to the rendered report content to avoid chart/page splits.
        const pxToMm = 0.264583;
        const marginMm = 6;
        const contentWidthMm = Math.max(120, canvas.width * pxToMm);
        const contentHeightMm = Math.max(120, canvas.height * pxToMm);
        const pageWidthMm = contentWidthMm + marginMm * 2;
        const pageHeightMm = contentHeightMm + marginMm * 2;
        const pageOrientation = pageWidthMm > pageHeightMm ? "landscape" : "portrait";

        const pdf = new jsPDF({
          orientation: pageOrientation,
          unit: "mm",
          format: [pageWidthMm, pageHeightMm],
          compress: true,
        });

        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(
          imgData,
          "PNG",
          marginMm,
          marginMm,
          contentWidthMm,
          contentHeightMm,
          undefined,
          "FAST"
        );

        // Generate filename
        const dateStamp = new Date().toISOString().split("T")[0];
        const safeTitle = (currentReport?.title || "report").replace(/[^a-z0-9- ]/gi, "").trim().replace(/\s+/g, "-");
        const timeframeSlug = reportDateRange?.from && reportDateRange?.to
          ? `${reportDateRange.from}_to_${reportDateRange.to}`
          : "timeframe-not-set";
        const fileName = `${safeTitle || "report"}-${timeframeSlug}-${dateStamp}.pdf`;

        // Download PDF
        pdf.save(fileName);

        console.log("PDF downloaded successfully");
        toast.dismiss(toastId);
        toast.success("PDF downloaded successfully!");
      } catch (canvasError) {
        console.error("Canvas generation error:", canvasError);
        throw canvasError;
      } finally {
        // Restore original styles
        elementsWithStyles.forEach(({ element, originalStyle }) => {
          element.setAttribute("style", originalStyle);
        });
      }
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
    // Capture the date range from the report data
    setReportDateRange({
      from: reportData.from,
      to: reportData.to,
    });

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
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "1200px",
              opacity: 0,
              pointerEvents: "none",
              zIndex: -1,
            }}
          >
            <div ref={printRef}>
              <PrintableReportWrapper report={currentReport} dateRange={reportDateRange}>
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


