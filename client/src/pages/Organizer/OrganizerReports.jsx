import { useEffect, useState, useRef } from "react";
import {
  IndianRupee,
  Trophy,
  X,
  Download,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
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
import axios from "axios";
import { formatINR } from "../../utils/formatINR";
import { chartThemeOptions, barChartThemeOptions, doughnutThemeOptions, getTournamentStatusColor, toMonthLabels } from "../../utils/chartConfig";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import logo from "../../assets/logo.png";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#0ea5e9", "#7c3aed"];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const chartOptions = barChartThemeOptions;

const REPORT_META = {
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
  RevenuePayment: {
    label: "Revenue / Payment",
    title: "Revenue and Payment Report",
    description: "Registration revenue, listing cost, profit, and pending payments.",
    icon: IndianRupee,
    btnText: "Generate Revenue and Payment Report",
    btnColor: "bg-emerald-600 hover:bg-emerald-700",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
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
const RevenuePaymentReportView = ({ report }) => {
  const { summary, data } = report;
  const paymentRows = data.payments || data.pendingPayments || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Registration Revenue" value={`₹${formatINR(summary.registrationRevenue ?? summary.totalRevenue ?? 0)}`} colorClass="text-emerald-600" />
        <SummaryCard label="Listing Cost" value={`₹${formatINR(summary.listingCost || 0)}`} colorClass="text-orange-600" />
        <SummaryCard
          label="Profit"
          value={`₹${formatINR(summary.profit || 0)}`}
          colorClass={(summary.profit || 0) >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

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

      {data.revenueByTournament?.length > 0 && (
        <SectionCard title="Registration Revenue by Tournament" icon={Trophy}>
          <div className="h-80">
            <Bar
              data={{
                labels: data.revenueByTournament.map((item) => item.tournamentName),
                datasets: [{
                  label: "Registration Revenue (INR)",
                  data: data.revenueByTournament.map((item) => item.revenue),
                  backgroundColor: data.revenueByTournament.map((_, index) => COLORS[index % COLORS.length]),
                  borderRadius: 6,
                }],
              }}
              options={{
                ...chartOptions,
                scales: {
                  ...(chartOptions.scales || {}),
                  x: {
                    ...((chartOptions.scales || {}).x || {}),
                    ticks: {
                      ...(((chartOptions.scales || {}).x || {}).ticks || {}),
                      maxRotation: 40,
                      minRotation: 20,
                    },
                  },
                },
              }}
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
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Registration Type</th>
                  <th className="text-right py-3 px-3 text-base dark:text-base-dark font-semibold">Teams Registered</th>
                  <th className="text-left py-3 px-3 text-base dark:text-base-dark font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.tournamentsTable.map((row) => (
                  <tr key={row._id} className="border-b border-base-dark/50 dark:border-base/50">
                    <td className="py-3 px-3 font-medium text-text-primary dark:text-text-primary-dark">{row.tournamentName}</td>
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

const ReportModal = ({ isOpen, onClose, reportType, onGenerate, generating, tournaments = [] }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tournamentId, setTournamentId] = useState("all");

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isOpen) {
      const to = new Date();
      const from = new Date(to.getFullYear(), 0, 1);
      setFromDate(formatDateForInput(from));
      setToDate(formatDateForInput(to));
      setTournamentId("all");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (!fromDate || !toDate) {
      toast.error("Please select a valid date range");
      return;
    }

    onGenerate({
      type: reportType,
      from: fromDate,
      to: toDate,
      filters: {
        tournamentId,
      },
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

          <div>
            <label className="text-xs text-base dark:text-base-dark font-medium mb-1 block">
              Tournament Scope
            </label>
            <select
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-sm focus:outline-none focus:border-secondary"
            >
              <option value="all">All Tournaments</option>
              {tournaments.map((tournament) => (
                <option key={tournament._id} value={tournament._id}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </div>
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

const OrganizerReports = () => {
  const [currentReport, setCurrentReport] = useState(null);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [organizerTournaments, setOrganizerTournaments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("Tournament");
  const printRef = useRef(null);

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

      // Capture the element as canvas
      console.log("Capturing with html2canvas...");
      const canvas = await html2canvas(printRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
      });

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
    const fetchOrganizerAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/tournament-organizers/analytics/dashboard`,
          { withCredentials: true }
        );
        setAnalytics(response.data?.data || null);

        const tournamentsResponse = await axios.get(
          `${API_BASE_URL}/tournament-organizers/tournaments/my-tournaments`,
          { withCredentials: true }
        );
        setOrganizerTournaments(tournamentsResponse.data?.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load organizer analytics");
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchOrganizerAnalytics();
  }, []);

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

  const revenueLineOptions = {
    ...chartThemeOptions,
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

  const handleGenerate = async (reportData) => {
    setReportGenerating(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/organizer/reports/generate`,
        reportData,
        { withCredentials: true }
      );
      setCurrentReport(response.data.data);
      toast.success("Report generated successfully");
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate report");
    } finally {
      setReportGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Reports
        </h1>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                {currentReport.type === "RevenuePayment"
                  ? "Revenue and Payment Report"
                  : currentReport.type === "Tournament"
                    ? "Tournament Report"
                    : currentReport.title}
              </h2>
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
                {currentReport.type === "Tournament" && <TournamentReportView report={currentReport} />}
                {currentReport.type === "RevenuePayment" && <RevenuePaymentReportView report={currentReport} />}
              </PrintableReportWrapper>
            </div>
          </div>

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
            <div className="flex justify-center py-12 bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                      Registration Revenue
                    </h3>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{formatINR(analytics?.totalRevenue || 0)}
                    </div>
                  </div>
                  <div className="h-80">
                    <Line data={revenueTrendData} options={revenueLineOptions} />
                  </div>
                </div>

                <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
                  <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark mb-4">
                    Tournament Status
                  </h3>
                  <div className="h-80 flex items-center justify-center">
                    <Doughnut data={tournamentStatusData} options={doughnutThemeOptions} />
                  </div>
                </div>
              </div>

              <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
                <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark mb-4">
                  Tournament by Sport
                </h3>
                <div className="h-80">
                  <Bar data={sportDistributionData} options={chartOptions} />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <ReportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        reportType={modalType}
        onGenerate={handleGenerate}
        generating={reportGenerating}
        tournaments={organizerTournaments}
      />
    </div>
  );
};

export default OrganizerReports;

