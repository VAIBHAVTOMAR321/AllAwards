const DISTRICTS = [
  "Udham Singh Nagar",
  "Haridwar",
  "Almora",
  "Nainital",
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

const normalizeDistrict = (value) =>
  String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

const districtByNormalizedName = new Map(
  DISTRICTS.flatMap((district) => [[normalizeDistrict(district), district]])
);
districtByNormalizedName.set("baggeshvar", "Bageshwar");
districtByNormalizedName.set("baggeshwar", "Bageshwar");
districtByNormalizedName.set("usnagar", "Udham Singh Nagar");

const resolveDistrict = (value) => {
  const normalized = normalizeDistrict(value);
  const exactMatch = districtByNormalizedName.get(normalized);
  if (exactMatch) return exactMatch;

  return DISTRICTS.find((district) => {
    const canonical = normalizeDistrict(district);
    return canonical.length >= 5 && normalized.startsWith(canonical);
  });
};

const REPORT_COLUMNS = [
  "District",
  "Total Count",
  "Fullname",
  "Mobile No",
  "InProgress/FinalSubmitted",
];

export const buildApplicantStatusRows = (applications = [], districts) => {
  const grouped = new Map(
    DISTRICTS.map((district) => [normalizeDistrict(district), { district, applicants: [] }])
  );

  applications.forEach((application) => {
    const rawDistrict = String(application.district || "").trim();
    const district = resolveDistrict(rawDistrict) || rawDistrict || "Data Not Available";
    const key = normalizeDistrict(district);
    if (!grouped.has(key)) grouped.set(key, { district, applicants: [] });
    grouped.get(key).applicants.push(application);
  });

  const allowedDistricts = Array.isArray(districts)
    ? new Set(districts.map((district) => normalizeDistrict(district)))
    : null;

  const showEmptyDistricts = !allowedDistricts;

  const orderedGroups = Array.from(grouped.values()).sort((left, right) => {
    const leftHasApplicants = left.applicants.length > 0;
    const rightHasApplicants = right.applicants.length > 0;
    return Number(rightHasApplicants) - Number(leftHasApplicants);
  });

  return orderedGroups
    .filter(({ district }) => {
      if (!allowedDistricts) return true;
      return allowedDistricts.has(normalizeDistrict(district));
    })
    .map(({ district, applicants }) => {
      if (!applicants.length) {
        if (!showEmptyDistricts) return [];
        return [[district, 0, "Data Not Available", "", ""]];
      }

      return applicants.map((applicant, index) => [
        index === 0 ? district : "",
        index === 0 ? applicants.length : "",
        applicant.full_name || "Data Not Available",
        applicant.phone || "",
        String(applicant.step_status || "").toLowerCase() === "final submitted"
          ? "FinalSubmitted"
          : "InProgress",
      ]);
    })
    .flat();
};

export const exportApplicantStatusPdf = async ({ applications = [], districts } = {}) => {
  const previewWindow = window.open("", "_blank");
  const { default: html2pdf } = await import("html2pdf.js");
  const reportDocument = previewWindow?.document || document;
  const content = reportDocument.createElement("div");
  content.style.cssText = "width:1120px;padding:8px;background:#fff;color:#111;font-family:Arial,sans-serif";
  if (!previewWindow) {
    content.style.cssText += ";position:fixed;left:0;top:0;z-index:2147483647";
  }

  const table = reportDocument.createElement("table");
  table.style.cssText = "width:100%;border-collapse:collapse;font-size:12px";
  const head = table.createTHead().insertRow();
  REPORT_COLUMNS.forEach((label) => {
    const cell = reportDocument.createElement("th");
    cell.textContent = label;
    cell.style.cssText = "border:1px solid #8a8a8a;padding:7px 8px;background:#24547a;color:#fff;text-align:left";
    head.appendChild(cell);
  });

  const body = table.createTBody();
  buildApplicantStatusRows(applications, districts).forEach((row) => {
    const tableRow = body.insertRow();
    tableRow.style.pageBreakInside = "avoid";
    row.forEach((value) => {
      const cell = tableRow.insertCell();
      cell.textContent = value;
      cell.style.cssText = "border:1px solid #8a8a8a;padding:6px 8px;text-align:left";
    });
  });
  content.appendChild(table);
  reportDocument.body.appendChild(content);

  try {
    const pdfBlob = await html2pdf()
      .set({
        margin: 0.35,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: "#ffffff" },
        jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(content)
      .outputPdf("blob");

    const url = URL.createObjectURL(pdfBlob);
    if (previewWindow) previewWindow.location.href = url;

    const link = document.createElement("a");
    link.href = url;
    link.download = `applicant-status-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    previewWindow?.close();
    throw error;
  } finally {
    content.remove();
  }
};

export const exportApplicantStatusExcel = async ({ applications = [], districts } = {}) => {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Applicant Status");
  sheet.addRow(REPORT_COLUMNS);
  buildApplicantStatusRows(applications, districts).forEach((row) => sheet.addRow(row));

  [24, 16, 32, 20, 30].forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });
  const header = sheet.getRow(1);
  header.height = 24;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF24547A" } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
  sheet.autoFilter = { from: "A1", to: `E${sheet.rowCount}` };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `applicant-status-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};