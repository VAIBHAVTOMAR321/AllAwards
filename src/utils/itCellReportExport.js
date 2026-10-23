export const DISTRICTS = [
  "Haridwar",
  "Almora",
  "Rudraprayag",
  "Chamoli",
  "Champawat",
  "Dehradun",
  "Pauri Garhwal",
  "Uttarkashi",
  "Bageshwar",
  "Pithoragarh",
  "Tehri Garhwal",
];

export const REPORT_COLUMNS = [
  "District",
  "Total Count",
  "Fullname",
  "Mobile No",
  "InProgress/FinalSubmitted",
];

const NOT_AVAILABLE = "Data Not Available";

const normalizeDistrict = (value) => String(value || "").toLowerCase().replace(/[^a-z]/g, "");

const districtAliases = new Map(
  DISTRICTS.flatMap((district) => [[normalizeDistrict(district), district]])
);
districtAliases.set("baggeshvar", "Bageshwar");

export const formatText = (value) => {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  return text;
};

const resolveStepStatus = (stepStatus) =>
  String(stepStatus || "").toLowerCase() === "final submitted" ? "FinalSubmitted" : "InProgress";

// Resolves any spelling variant to the canonical district name used by the
// report, so callers can match the signed-in officer's district against the
// value stored on an application.
export const resolveDistrictName = (value) =>
  districtAliases.get(normalizeDistrict(value)) || formatText(value) || NOT_AVAILABLE;

/**
 * Builds the district-wise applicant status rows.
 * District name and total count are only written on the first row of each
 * district group, the remaining rows of the group stay blank.
 * Districts that have applicants are listed first (in DISTRICTS order);
 * districts with zero applicants are moved to the last rows.
 * Passing `districts` limits the report to those districts only, so a
 * single-district dashboard never lists any other district.
 */
export const buildReportData = ({ applications = [], districts } = {}) => {
  const grouped = new Map(DISTRICTS.map((district) => [district, []]));

  applications.forEach((application) => {
    const district = resolveDistrictName(application.district);
    if (!grouped.has(district)) grouped.set(district, []);
    grouped.get(district).push(application);
  });

  const allowedDistricts = Array.isArray(districts)
    ? new Set(districts.map((district) => resolveDistrictName(district)))
    : null;

  const withApplicants = [];
  const withoutApplicants = [];

  grouped.forEach((applicants, district) => {
    if (allowedDistricts && !allowedDistricts.has(district)) return;
    if (applicants.length) withApplicants.push([district, applicants]);
    else withoutApplicants.push([district, applicants]);
  });

  // When a district filter is applied, only show districts that actually have
  // applicants — don't emit rows full of "Data Not Available" for every other
  // district. Without a filter, all districts are listed so the user sees the
  // full picture (including zero-applicant districts).
  const showEmptyDistricts = !allowedDistricts;

  const rows = [...withApplicants, ...(showEmptyDistricts ? withoutApplicants : [])]
    .map(([district, applicants]) => {
      if (!applicants.length) {
        return [[district, 0, NOT_AVAILABLE, "", ""]];
      }

      return applicants.map((applicant, index) => [
        index === 0 ? district : "",
        index === 0 ? applicants.length : "",
        formatText(applicant.full_name) || NOT_AVAILABLE,
        formatText(applicant.phone),
        resolveStepStatus(applicant.step_status),
      ]);
    })
    .flat();

  return { rows };
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildPrintHtml = (rows) => {
  const header = REPORT_COLUMNS.map((column) => `<th>${escapeHtml(column)}</th>`).join("");

  const body = rows
    .map(
      (row) =>
        `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>District Applicant Status Report</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  body { margin: 0; font-family: Arial, sans-serif; color: #111; }
  table { width: 100%; border-collapse: collapse; font-size: 11pt; }
  th, td { border: 1px solid #8a8a8a; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #24547a; color: #fff; font-weight: 700; }
  tr { break-inside: avoid; page-break-inside: avoid; }
  thead { display: table-header-group; }
</style>
</head>
<body>
<table>
  <thead><tr>${header}</tr></thead>
  <tbody>${body}</tbody>
</table>
</body>
</html>`;
};

export const exportDashboardPdf = async ({ applications, districts } = {}) => {
  const { rows } = buildReportData({ applications, districts });
  const html = buildPrintHtml(rows);

  // Write to a Blob URL instead of document.write() into an about:blank popup.
  // Chrome's print preview renders the frame by its URL; an about:blank document
  // gives it nothing to load, so the preview fails and the Destination list
  // (Save as PDF) never becomes available.
  const blobUrl = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const printWindow = window.open(blobUrl, "_blank", "width=1280,height=900");

  if (!printWindow) {
    URL.revokeObjectURL(blobUrl);
    throw new Error("Popup blocked. Please allow popups to export the PDF report.");
  }

  let printed = false;
  const triggerPrint = () => {
    if (printed || printWindow.closed) return;
    printed = true;
    printWindow.focus();
    printWindow.print();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  };

  if (printWindow.document.readyState === "complete") {
    setTimeout(triggerPrint, 300);
  } else {
    printWindow.addEventListener("load", triggerPrint, { once: true });
  }

  // Safety net in case the load event never fires.
  setTimeout(triggerPrint, 2500);
};

const applyBorder = (cell) => {
  cell.border = {
    top: { style: "thin", color: { argb: "FFB6C0CD" } },
    left: { style: "thin", color: { argb: "FFB6C0CD" } },
    bottom: { style: "thin", color: { argb: "FFB6C0CD" } },
    right: { style: "thin", color: { argb: "FFB6C0CD" } },
  };
};

const COLUMN_WIDTHS = [22, 13, 28, 16, 30];

export const exportDashboardExcel = async ({ applications, districts } = {}) => {
  const { default: ExcelJS } = await import("exceljs");
  const { rows } = buildReportData({ applications, districts });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "IT Cell Dashboard";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Applicant Status");
  sheet.addRow(REPORT_COLUMNS);
  rows.forEach((row) => sheet.addRow(row));

  REPORT_COLUMNS.forEach((_, index) => {
    sheet.getColumn(index + 1).width = COLUMN_WIDTHS[index];
  });

  const headerRow = sheet.getRow(1);
  headerRow.eachCell({ includeEmpty: false }, (cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF24547A" } };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    applyBorder(cell);
  });
  headerRow.height = 24;

  rows.forEach((rowValues, rowIndex) => {
    const row = sheet.getRow(rowIndex + 2);
    rowValues.forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.value = value;
      cell.alignment = { vertical: "middle", horizontal: "left" };
      applyBorder(cell);
      if (rowIndex % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }
    });
  });

  sheet.autoFilter = { from: "A1", to: `E${sheet.rowCount}` };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${getReportFileBaseName()}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const getReportFileBaseName = () =>
  `it-cell-dashboard-report-${new Date().toISOString().slice(0, 10)}`;
