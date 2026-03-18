const MONTH_MAP = {
  jan: "Jan",
  feb: "Feb",
  mar: "Mar",
  apr: "Apr",
  may: "May",
  jun: "Jun",
  jul: "Jul",
  aug: "Aug",
  sep: "Sep",
  oct: "Oct",
  nov: "Nov",
  dec: "Dec",
};

export const formatChartMonthLabel = (label) => {
  if (label === null || label === undefined) return "";

  const value = String(label).trim();
  if (!value) return "";

  const firstToken = value.split(/\s+/)[0]?.toLowerCase();
  if (MONTH_MAP[firstToken]) {
    return MONTH_MAP[firstToken];
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", { month: "short" });
  }

  const monthNumberMatch = value.match(/^(\d{4})[-/](\d{1,2})/);
  if (monthNumberMatch) {
    const monthIndex = Number(monthNumberMatch[2]) - 1;
    if (monthIndex >= 0 && monthIndex <= 11) {
      return new Date(2000, monthIndex, 1).toLocaleDateString("en-US", { month: "short" });
    }
  }

  return value;
};

export const toMonthLabels = (labels = []) => labels.map((label) => formatChartMonthLabel(label));

export const chartThemeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 16,
        font: { size: 12 },
      },
    },
    tooltip: {
      backgroundColor: "rgba(17, 24, 39, 0.92)",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
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

export const doughnutThemeOptions = {
  ...chartThemeOptions,
  cutout: "68%",
  scales: undefined,
};

const TOURNAMENT_STATUS_COLOR_MAP = {
  cancelled: "#f59e0b",
  live: "#ef4444",
  ongoing: "#ef4444",
  upcoming: "#2563eb",
  completed: "#6b7280",
};

export const getTournamentStatusColor = (status) => {
  const key = String(status || "").trim().toLowerCase();
  return TOURNAMENT_STATUS_COLOR_MAP[key] || "#94a3b8";
};
