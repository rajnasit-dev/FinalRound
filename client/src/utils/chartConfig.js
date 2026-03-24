import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS } from "chart.js";

// Register the datalabels plugin globally
ChartJS.register(ChartDataLabels);

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
    datalabels: {
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

// Doughnut/Pie chart options - show percentage without hover, number on hover
export const doughnutThemeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  backgroundColor: "rgba(255, 255, 255, 1)",
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
      callbacks: {
        label: (context) => {
          const value = context.raw || 0;
          return ` ${context.label}: ${value.toLocaleString("en-IN")}`;
        },
      },
    },
    datalabels: {
      display: true,
      color: "#ffffff",
      font: {
        weight: "bold",
        size: 12,
      },
      formatter: (value, context) => {
        // Don't show label if value is 0
        if (value === 0) return "";

        const dataset = context.dataset.data;
        const total = dataset.reduce((acc, val) => acc + val, 0);
        if (total === 0) return "";
        const percentage = ((value / total) * 100).toFixed(1);
        return `${percentage}%`;
      },
      anchor: "center",
      align: "center",
    },
  },
};

// Bar chart options - show numbers on bars without hover
export const barChartThemeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 20,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(17, 24, 39, 0.92)",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
    },
    datalabels: {
      display: true,
      color: "#374151",
      font: {
        weight: "bold",
        size: 11,
      },
      anchor: "end",
      align: "end",
      offset: 4,
      formatter: (value) => {
        if (value === 0) return "";
        return value.toLocaleString("en-IN");
      },
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
