import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generate a PDF report for payment data
 * @param {Array} payments - Array of payment objects
 * @param {Object} options - Report options
 * @param {string} options.title - Report title
 * @param {string} options.subtitle - Report subtitle (filter info)
 * @param {Object} options.summary - Summary stats object
 */
export const generatePaymentPDF = (payments, options = {}) => {
  const { title = "Payment Report", subtitle = "", summary = {} } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // ── Header ──
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(title, pageWidth / 2, y, { align: "center" });
  y += 8;

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, pageWidth / 2, y, { align: "center" });
    y += 6;
  }

  // Generated date
  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, pageWidth / 2, y, { align: "center" });
  y += 4;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // ── Summary Cards ──
  if (Object.keys(summary).length > 0) {
    const entries = Object.entries(summary);
    const cardWidth = (pageWidth - 28 - (entries.length - 1) * 6) / entries.length;

    entries.forEach(([label, value], i) => {
      const x = 14 + i * (cardWidth + 6);

      // Card background
      doc.setFillColor(245, 247, 250);
      doc.setDrawColor(220, 225, 230);
      doc.roundedRect(x, y, cardWidth, 22, 3, 3, "FD");

      // Value
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(String(value), x + cardWidth / 2, y + 10, { align: "center" });

      // Label
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(label, x + cardWidth / 2, y + 17, { align: "center" });
    });

    y += 30;
  }

  // ── Table ──
  const tableData = payments.map((p) => {
    const date = new Date(p.createdAt);
    return [
      p.payerType === "Organizer"
        ? "Platform Fee"
        : p.payerType === "Team"
        ? "Team Registration"
        : "Player Registration",
      p.tournament?.name || "Unknown",
      p.payerType === "Organizer"
        ? p.organizer?.orgName || p.organizer?.fullName || "—"
        : p.team?.teamName || p.team?.name || p.player?.fullName || "—",
      date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      `Rs.${(p.amount || 0).toLocaleString("en-IN")}`,
      p.status,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["Type", "Tournament", "Payer", "Date", "Amount", "Status"]],
    body: tableData,
    foot: [[
      { content: "Total", colSpan: 4, styles: { halign: "right", fontStyle: "bold", fillColor: [45, 55, 72], textColor: [255, 255, 255], fontSize: 9 } },
      { content: `Rs.${payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString("en-IN")}`, styles: { halign: "right", fontStyle: "bold", fillColor: [45, 55, 72], textColor: [255, 255, 255], fontSize: 9 } },
      { content: `${payments.length} records`, styles: { halign: "center", fontStyle: "bold", fillColor: [45, 55, 72], textColor: [255, 255, 255], fontSize: 9 } },
    ]],
    showFoot: "lastPage",
    theme: "grid",
    headStyles: {
      fillColor: [45, 55, 72],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [50, 50, 50],
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 38 },
      2: { cellWidth: 35 },
      3: { cellWidth: 28, halign: "center" },
      4: { cellWidth: 25, halign: "right", fontStyle: "bold" },
      5: { cellWidth: 22, halign: "center" },
    },
    styles: {
      overflow: "linebreak",
      lineColor: [220, 225, 230],
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      // Color status cells
      if (data.section === "body" && data.column.index === 5) {
        const status = data.cell.raw;
        if (status === "Success") {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = "bold";
        } else if (status === "Pending") {
          data.cell.styles.textColor = [202, 138, 4];
          data.cell.styles.fontStyle = "bold";
        } else if (status === "Failed") {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // ── Footer ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "SportsHub",
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // ── Save ──
  const fileName = title.replace(/\s+/g, "_").toLowerCase();
  doc.save(`${fileName}.pdf`);
};
