// src/utils/exportUtils.js
// CSV and Excel export — field names match normalised record keys.

import * as XLSX from "xlsx";

// Sheet column headers (match Google Sheet exactly for round-trip clarity)
const HEADERS = [
  "Timestamp", "Branch User", "Field Agent User", "Branch Employee Name",
  "Mobile Number", "Visit Date",
  "Project Awareness", "Burn Methods Awareness", "Live Email Received",
  "Support Number Awareness", "Comments"
];

// Map normalised record → ordered values
const toRow = r => [
  r.timestamp    || "",
  r.branchUser   || "",
  r.agentUser    || "",
  r.employeeName || "",
  r.mobile       || "",
  r.visitDate    || "",
  r.q1           || "",
  r.q2           || "",
  r.q3           || "",
  r.q4           || "",
  r.comments     || ""
];

export function exportCSV(records, filename = "qvt-records.csv") {
  const csv = [HEADERS, ...records.map(toRow)]
    .map(row => row.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  // BOM prefix ensures Arabic / unicode characters render correctly in Excel
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(URL.createObjectURL(blob), filename);
}

export function exportExcel(records, filename = "qvt-records.xlsx") {
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...records.map(toRow)]);
  ws["!cols"] = [20, 18, 18, 22, 14, 12, 18, 20, 16, 22, 30].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "QVT Records");
  XLSX.writeFile(wb, filename);
}

function triggerDownload(url, filename) {
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
