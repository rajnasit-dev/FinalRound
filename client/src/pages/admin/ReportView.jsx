import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getReportById } from "../../store/slices/adminSlice";
import { formatINR } from "../../utils/formatINR";
import {
  ArrowLeft,
  IndianRupee,
  TrendingUp,
  Tag,
  Calendar,
  Trophy,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Users,
  MapPin,
  Swords,
  Ticket,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const barOptions = (yTickPrefix = "") => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", padding: 16, font: { size: 12 } } } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#9ca3af" } },
    y: { grid: { color: "rgba(229,231,235,0.3)" }, ticks: { font: { size: 11 }, color: "#9ca3af", callback: (v) => `${yTickPrefix}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` }, beginAtZero: true },
  },
});

const horizontalBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y",
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: "rgba(229,231,235,0.3)" }, ticks: { font: { size: 11 }, color: "#9ca3af", precision: 0 }, beginAtZero: true },
    y: { grid: { display: false }, ticks: { font: { size: 12 }, color: "#9ca3af" } },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "right", labels: { usePointStyle: true, pointStyle: "circle", padding: 14, font: { size: 12 } } } },
};

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
    <div className="flex items-center gap-3 mb-5">
      <Icon className="w-5 h-5 text-secondary" />
      <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">{title}</h3>
    </div>
    {children}
  </div>
);

const SummaryCard = ({ label, value, color = "text-text-primary dark:text-text-primary-dark", prefix = "" }) => (
  <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-5 text-center">
    <p className="text-xs text-base dark:text-base-dark font-semibold uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{prefix}{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
  </div>
);

// ─── Revenue Report View ────────────────────────────────────────────────

const RevenueReportView = ({ report }) => {
  const { summary, data } = report;

  const statusColors = { Success: "#10b981", Pending: "#f59e0b", Failed: "#ef4444", Refunded: "#6b7280" };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <SummaryCard label="Total Revenue" value={formatINR(summary.totalRevenue)} color="text-emerald-600" prefix="₹" />
        <SummaryCard label="Total Payments" value={summary.totalPayments} />
        <SummaryCard label="Failed" value={summary.failedCount} color="text-red-500" />
      </div>

      {/* Revenue Trend */}
      {data.revenueTrend?.length > 0 && (
        <SectionCard title="Revenue Trend" icon={TrendingUp}>
          <div className="h-72">
            <Bar
              data={{
                labels: data.revenueTrend.map((d) => d.date),
                datasets: [{ label: "Revenue (₹)", data: data.revenueTrend.map((d) => d.revenue), backgroundColor: "#10b981", borderRadius: 4 }],
              }}
              options={barOptions("₹")}
            />
          </div>
        </SectionCard>
      )}

      {/* Payment Status Breakdown */}
      {data.statusBreakdown?.length > 0 && (
        <SectionCard title="Payment Status Breakdown" icon={BarChart3}>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="h-64 flex-1">
              <Doughnut
                data={{
                  labels: data.statusBreakdown.map((s) => s.name),
                  datasets: [{ data: data.statusBreakdown.map((s) => s.count), backgroundColor: data.statusBreakdown.map((s) => statusColors[s.name] || COLORS[0]), borderWidth: 0 }],
                }}
                options={pieOptions}
              />
            </div>
            <div className="space-y-3 lg:min-w-[200px]">
              {data.statusBreakdown.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[s.name] || COLORS[0] }} />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{s.count} (₹{formatINR(s.amount)})</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Revenue by Sport */}
      {data.revenueBySport?.length > 0 && (
        <SectionCard title="Revenue by Sport" icon={Tag}>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="h-64 flex-1">
              <Pie
                data={{
                  labels: data.revenueBySport.map((s) => s.name),
                  datasets: [{ data: data.revenueBySport.map((s) => s.revenue), backgroundColor: data.revenueBySport.map((_, i) => COLORS[i % COLORS.length]), borderWidth: 0 }],
                }}
                options={pieOptions}
              />
            </div>
            <div className="space-y-3 lg:min-w-[200px]">
              {data.revenueBySport.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{s.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">₹{formatINR(s.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Top Tournaments by Revenue */}
      {data.topTournaments?.length > 0 && (
        <SectionCard title="Top Tournaments by Revenue" icon={Trophy}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Tournament</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Registrations</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Revenue</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {data.topTournaments.map((t) => (
                  <tr key={t.name} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3 font-medium text-text-primary dark:text-text-primary-dark">{t.name}</td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">{t.registrations}</td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-600">₹{formatINR(t.revenue)}</td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">{t.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

// ─── Tournament Report View ─────────────────────────────────────────────

const TournamentReportView = ({ report }) => {
  const { summary, data } = report;

  const statusColors = { Draft: "#6b7280", Published: "#3b82f6", Cancelled: "#ef4444" };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Total Tournaments" value={summary.totalTournaments} color="text-blue-600" />
        <SummaryCard label="Total Revenue" value={formatINR(summary.totalRevenue)} color="text-emerald-600" prefix="₹" />
        <SummaryCard label="Avg Entry Fee" value={formatINR(summary.avgEntryFee)} prefix="₹" />
        <SummaryCard label="Total Prize Pool" value={formatINR(summary.totalPrizePool)} color="text-amber-500" prefix="₹" />
      </div>

      {/* Status Breakdown */}
      {data.statusBreakdown?.length > 0 && (
        <SectionCard title="Status Distribution" icon={BarChart3}>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="h-64 flex-1">
              <Pie
                data={{
                  labels: data.statusBreakdown.map((s) => s.name),
                  datasets: [{ data: data.statusBreakdown.map((s) => s.count), backgroundColor: data.statusBreakdown.map((s) => statusColors[s.name] || COLORS[0]), borderWidth: 0 }],
                }}
                options={pieOptions}
              />
            </div>
            <div className="space-y-3 lg:min-w-[160px]">
              {data.statusBreakdown.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[s.name] || COLORS[0] }} />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Sport Breakdown */}
      {data.sportBreakdown?.length > 0 && (
        <SectionCard title="Tournaments by Sport" icon={Trophy}>
          <div className="h-64">
            <Bar
              data={{
                labels: data.sportBreakdown.map((s) => s.name),
                datasets: [{ label: "Tournaments", data: data.sportBreakdown.map((s) => s.count), backgroundColor: data.sportBreakdown.map((_, i) => COLORS[i % COLORS.length]), borderRadius: 4 }],
              }}
              options={horizontalBarOptions}
            />
          </div>
        </SectionCard>
      )}

      {/* Tournament Trend */}
      {data.tournamentTrend?.length > 0 && (
        <SectionCard title="Tournament Trend" icon={TrendingUp}>
          <div className="h-64">
            <Bar
              data={{
                labels: data.tournamentTrend.map((d) => d.month),
                datasets: [{ label: "Tournaments", data: data.tournamentTrend.map((d) => d.count), backgroundColor: "#3b82f6", borderRadius: 4 }],
              }}
              options={barOptions()}
            />
          </div>
        </SectionCard>
      )}

      {/* Registration Fill Rate */}
      {data.registrationFillRate?.length > 0 && (
        <SectionCard title="Registration Fill Rate (Top 10)" icon={Users}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Tournament</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Registered</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Limit</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Fill Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.registrationFillRate.map((r) => (
                  <tr key={r.name} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3 font-medium text-text-primary dark:text-text-primary-dark">{r.name}</td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">{r.registered}</td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">{r.limit}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.fillRate >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : r.fillRate >= 50 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {r.fillRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Tournament Details Table */}
      {data.tournaments?.length > 0 && (
        <SectionCard title={`Tournament Details (${data.tournaments.length})`} icon={Trophy}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Name</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Sport</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Format</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Registered</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Entry Fee</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.tournaments.map((t) => (
                  <tr key={t._id} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3 font-medium text-text-primary dark:text-text-primary-dark">{t.name}</td>
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{t.sport}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{t.format}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">{t.registered}/{t.teamLimit}</td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">₹{formatINR(t.entryFee)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-600">₹{formatINR(t.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

// ─── User Report View ───────────────────────────────────────────────────

const UserReportView = ({ report }) => {
  const { summary, data } = report;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Total Users" value={summary.totalUsers} color="text-purple-600" />
        <SummaryCard label="Active Users" value={summary.activeUsers} color="text-emerald-600" />
        <SummaryCard label="Blocked Users" value={summary.blockedUsers} color="text-red-500" />
        <SummaryCard label="Teams Created" value={summary.totalTeams} color="text-blue-600" />
      </div>

      {/* Role Distribution */}
      {data.roleBreakdown?.length > 0 && (
        <SectionCard title="Role Distribution" icon={Users}>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="h-64 flex-1">
              <Pie
                data={{
                  labels: data.roleBreakdown.map((r) => r.name),
                  datasets: [{ data: data.roleBreakdown.map((r) => r.count), backgroundColor: data.roleBreakdown.map((_, i) => COLORS[i % COLORS.length]), borderWidth: 0 }],
                }}
                options={pieOptions}
              />
            </div>
            <div className="space-y-3 lg:min-w-[200px]">
              {data.roleBreakdown.map((r, i) => (
                <div key={r.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-medium">{r.name}</span>
                  </div>
                  <span className="text-sm font-bold">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Registration Trend */}
      {data.registrationTrend?.length > 0 && (
        <SectionCard title="Registration Trend" icon={TrendingUp}>
          <div className="h-64">
            <Bar
              data={{
                labels: data.registrationTrend.map((d) => d.month),
                datasets: [{ label: "Registrations", data: data.registrationTrend.map((d) => d.count), backgroundColor: "#8b5cf6", borderRadius: 4 }],
              }}
              options={barOptions()}
            />
          </div>
        </SectionCard>
      )}

      {/* Gender Distribution */}
      {data.genderDistribution?.length > 0 && (
        <SectionCard title="Player Gender Distribution" icon={Users}>
          <div className="h-64">
            <Pie
              data={{
                labels: data.genderDistribution.map((g) => g.name),
                datasets: [{ data: data.genderDistribution.map((g) => g.count), backgroundColor: data.genderDistribution.map((_, i) => COLORS[i % COLORS.length]), borderWidth: 0 }],
              }}
              options={pieOptions}
            />
          </div>
        </SectionCard>
      )}

      {/* Top Sports Among Players */}
      {data.topSports?.length > 0 && (
        <SectionCard title="Top Sports Among Players" icon={Trophy}>
          <div className="h-64">
            <Bar
              data={{
                labels: data.topSports.map((s) => s.name),
                datasets: [{ label: "Players", data: data.topSports.map((s) => s.count), backgroundColor: data.topSports.map((_, i) => COLORS[i % COLORS.length]), borderRadius: 4 }],
              }}
              options={horizontalBarOptions}
            />
          </div>
        </SectionCard>
      )}

      {/* City Distribution */}
      {data.cityDistribution?.length > 0 && (
        <SectionCard title="Top Cities" icon={MapPin}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">City</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Users</th>
                </tr>
              </thead>
              <tbody>
                {data.cityDistribution.map((c) => (
                  <tr key={c.name} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3 font-medium text-text-primary dark:text-text-primary-dark">{c.name}</td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

// ─── Match Report View ──────────────────────────────────────────────────

const MatchReportView = ({ report }) => {
  const { summary, data } = report;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Total Matches" value={summary.totalMatches} color="text-orange-600" />
        <SummaryCard label="Scheduled" value={summary.scheduledMatches} color="text-blue-600" />
        <SummaryCard label="Cancelled" value={summary.cancelledMatches} color="text-red-500" />
        <SummaryCard label="Cancellation Rate" value={`${summary.cancellationRate}%`} color={summary.cancellationRate > 20 ? "text-red-500" : "text-emerald-600"} />
      </div>

      {/* Matches by Sport */}
      {data.matchesBySport?.length > 0 && (
        <SectionCard title="Matches by Sport" icon={Swords}>
          <div className="h-64">
            <Bar
              data={{
                labels: data.matchesBySport.map((s) => s.name),
                datasets: [
                  { label: "Total", data: data.matchesBySport.map((s) => s.total), backgroundColor: "#f97316", borderRadius: 4 },
                  { label: "Cancelled", data: data.matchesBySport.map((s) => s.cancelled), backgroundColor: "#ef4444", borderRadius: 4 },
                ],
              }}
              options={{ ...horizontalBarOptions, plugins: { legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", padding: 16, font: { size: 12 } } } } }}
            />
          </div>
        </SectionCard>
      )}

      {/* Match Trend */}
      {data.matchTrend?.length > 0 && (
        <SectionCard title="Match Scheduling Trend" icon={TrendingUp}>
          <div className="h-64">
            <Bar
              data={{
                labels: data.matchTrend.map((d) => d.month),
                datasets: [
                  { label: "Scheduled", data: data.matchTrend.map((d) => d.total), backgroundColor: "#f97316", borderRadius: 4 },
                  { label: "Cancelled", data: data.matchTrend.map((d) => d.cancelled), backgroundColor: "#ef4444", borderRadius: 4 },
                ],
              }}
              options={barOptions()}
            />
          </div>
        </SectionCard>
      )}

      {/* Ground/Venue Usage */}
      {data.groundUsage?.length > 0 && (
        <SectionCard title="Venue Utilization (Top 10)" icon={MapPin}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Venue</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">City</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Matches</th>
                </tr>
              </thead>
              <tbody>
                {data.groundUsage.map((g, i) => (
                  <tr key={i} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3 font-medium text-text-primary dark:text-text-primary-dark">{g.name}</td>
                    <td className="py-3 px-3 text-text-primary dark:text-text-primary-dark">{g.city}</td>
                    <td className="py-3 px-3 text-right font-semibold text-orange-600">{g.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Matches by Tournament */}
      {data.matchesByTournament?.length > 0 && (
        <SectionCard title="Matches by Tournament (Top 10)" icon={Trophy}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Tournament</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Total</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Cancelled</th>
                </tr>
              </thead>
              <tbody>
                {data.matchesByTournament.map((t) => (
                  <tr key={t.name} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3 font-medium text-text-primary dark:text-text-primary-dark">{t.name}</td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">{t.total}</td>
                    <td className="py-3 px-3 text-right text-red-500 font-semibold">{t.cancelled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

// ─── Booking Report View ────────────────────────────────────────────────

const BookingReportView = ({ report }) => {
  const { summary, data } = report;

  const statusColors = { Confirmed: "#10b981", Pending: "#f59e0b", Cancelled: "#ef4444" };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Total Bookings" value={summary.totalBookings} color="text-teal-600" />
        <SummaryCard label="Confirmed" value={summary.confirmedCount} color="text-emerald-600" />
        <SummaryCard label="Pending" value={summary.pendingCount} color="text-amber-500" />
        <SummaryCard label="Total Amount" value={formatINR(summary.totalAmount)} color="text-blue-600" prefix="₹" />
      </div>

      {/* Booking Status Breakdown */}
      {data.statusBreakdown?.length > 0 && (
        <SectionCard title="Booking Status Distribution" icon={BarChart3}>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="h-64 flex-1">
              <Doughnut
                data={{
                  labels: data.statusBreakdown.map((s) => s.name),
                  datasets: [{ data: data.statusBreakdown.map((s) => s.count), backgroundColor: data.statusBreakdown.map((s) => statusColors[s.name] || COLORS[0]), borderWidth: 0 }],
                }}
                options={pieOptions}
              />
            </div>
            <div className="space-y-3 lg:min-w-[200px]">
              {data.statusBreakdown.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[s.name] || COLORS[0] }} />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{s.count} (₹{formatINR(s.amount)})</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Booking Trend */}
      {data.bookingTrend?.length > 0 && (
        <SectionCard title="Booking Trend" icon={TrendingUp}>
          <div className="h-64">
            <Bar
              data={{
                labels: data.bookingTrend.map((d) => d.month),
                datasets: [{ label: "Bookings", data: data.bookingTrend.map((d) => d.count), backgroundColor: "#14b8a6", borderRadius: 4 }],
              }}
              options={barOptions()}
            />
          </div>
        </SectionCard>
      )}

      {/* Registration Type Split */}
      {data.registrationTypeSplit?.length > 0 && (
        <SectionCard title="Registration Type Split" icon={Ticket}>
          <div className="h-64">
            <Pie
              data={{
                labels: data.registrationTypeSplit.map((r) => r.name),
                datasets: [{ data: data.registrationTypeSplit.map((r) => r.count), backgroundColor: data.registrationTypeSplit.map((_, i) => COLORS[i % COLORS.length]), borderWidth: 0 }],
              }}
              options={pieOptions}
            />
          </div>
        </SectionCard>
      )}

      {/* Payment Status for Bookings */}
      {data.paymentStatusSplit?.length > 0 && (
        <SectionCard title="Payment Status for Bookings" icon={IndianRupee}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Payment Status</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.paymentStatusSplit.map((p) => (
                  <tr key={p.name} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.name === "Success" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : p.name === "Pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {p.name === "Success" ? <CheckCircle className="w-3 h-3" /> : p.name === "Pending" ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {p.name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-text-primary dark:text-text-primary-dark">{p.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Popular Tournaments */}
      {data.popularTournaments?.length > 0 && (
        <SectionCard title="Most Popular Tournaments" icon={Trophy}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-dark dark:border-base">
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Tournament</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Bookings</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.popularTournaments.map((t) => (
                  <tr key={t.name} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3 font-medium text-text-primary dark:text-text-primary-dark">{t.name}</td>
                    <td className="py-3 px-3 text-right text-text-primary dark:text-text-primary-dark">{t.bookings}</td>
                    <td className="py-3 px-3 text-right font-semibold text-teal-600">₹{formatINR(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

// ─── Main Report View Page ──────────────────────────────────────────────

const ReportView = () => {
  const { reportId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentReport, reportLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    if (reportId) dispatch(getReportById(reportId));
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/admin/reports")}
            className="flex items-center gap-2 text-sm text-secondary hover:underline font-medium mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </button>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            {currentReport.title}
          </h1>
          <p className="text-sm text-base dark:text-base-dark mt-1">
            Period: {formatDate(currentReport.dateRange?.from)} to{" "}
            {formatDate(currentReport.dateRange?.to)}
          </p>
        </div>
      </div>

      {/* Report Content */}
      {currentReport.type === "Revenue" && <RevenueReportView report={currentReport} />}
      {currentReport.type === "Tournament" && <TournamentReportView report={currentReport} />}
      {currentReport.type === "User" && <UserReportView report={currentReport} />}
      {currentReport.type === "Match" && <MatchReportView report={currentReport} />}
      {currentReport.type === "Booking" && <BookingReportView report={currentReport} />}
    </div>
  );
};

export default ReportView;
