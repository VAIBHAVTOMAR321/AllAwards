import devanagariFontUrl from "@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2?url";

const TABLE_COLUMNS = [
  { header: "Nominator Full Name", key: "nominator_name", width: 28 },
  { header: "Child Full Name / Applicant ID", key: "child_name", width: 34 },
  { header: "Father's Name", key: "father_name", width: 26 },
  { header: "Mobile No", key: "phone", width: 18 },
  { header: "Age", key: "age", width: 10 },
  { header: "Class", key: "class_name", width: 16 },
  { header: "Type of Bravery", key: "incident_title", width: 36 },
  { header: "Step Status", key: "step_status", width: 20 },
  {
    header: "Recommended by District Committee",
    key: "recommendation",
    width: 32,
  },
  {
    header: "Comment by District Committee",
    key: "dpo_comment",
    width: 36,
  },
];

const formatChildName = (application) => {
  const childName = application.child_name || "-";
  const applicantId = application.applicant_id;
  return applicantId ? `${childName}\nApplicant ID: ${applicantId}` : childName;
};

const formatCellValue = (application, key) => {
  if (key === "child_name") return formatChildName(application);
  return application[key] ?? "-";
};

const getFileBaseName = (extension) =>
  `dpo-application-table-${new Date().toISOString().slice(0, 10)}.${extension}`;

const PDF_PAGE_WIDTH = 3360;
const PDF_PAGE_HEIGHT = 2376;
const PDF_MARGIN = 64;
const PDF_BODY_FONT = '20px "DpoNotoSansDevanagari", Arial, sans-serif';
const PDF_HEADER_FONT = 'bold 19px "DpoNotoSansDevanagari", Arial, sans-serif';
const PDF_LINE_HEIGHT = 27;
const PDF_CELL_PADDING = 12;

const splitIntoGraphemes = (text) => {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(
      new Intl.Segmenter("hi", { granularity: "grapheme" }).segment(text),
      ({ segment }) => segment,
    );
  }
  return Array.from(text);
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const wrapCanvasText = (context, value, maxWidth) => {
  const lines = [];
  String(value ?? "-")
    .split(/\r?\n/)
    .forEach((paragraph) => {
      if (!paragraph) {
        lines.push("");
        return;
      }

      let line = "";
      paragraph.split(/\s+/).forEach((word) => {
        if (context.measureText(word).width > maxWidth) {
          if (line) {
            lines.push(line);
            line = "";
          }
          let part = "";
          for (const character of splitIntoGraphemes(word)) {
            const candidate = part + character;
            if (part && context.measureText(candidate).width > maxWidth) {
              lines.push(part);
              part = character;
            } else {
              part = candidate;
            }
          }
          line = part;
          return;
        }

        const candidate = line ? `${line} ${word}` : word;
        if (line && context.measureText(candidate).width > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      });
      if (line) lines.push(line);
    });
  return lines.length ? lines : [""];
};

const createPdfPage = (columnWidths, headers) => {
  const canvas = document.createElement("canvas");
  canvas.width = PDF_PAGE_WIDTH;
  canvas.height = PDF_PAGE_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create a canvas for the PDF export.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#111111";
  context.font = 'bold 34px "DpoNotoSansDevanagari", Arial, sans-serif';
  context.textBaseline = "top";
  context.fillText("DPO Application Table", PDF_MARGIN, 28);

  context.font = PDF_HEADER_FONT;
  const headerLines = headers.map((header, index) =>
    wrapCanvasText(context, header, columnWidths[index] - PDF_CELL_PADDING * 2),
  );
  const headerHeight =
    Math.max(...headerLines.map((lines) => lines.length)) * PDF_LINE_HEIGHT +
    PDF_CELL_PADDING * 2;
  drawCanvasRow(context, {
    linesByCell: headerLines,
    columnWidths,
    y: 78,
    height: headerHeight,
    header: true,
  });

  return { canvas, context, y: 78 + headerHeight, rowIndex: 0 };
};

const drawCanvasRow = (
  context,
  { linesByCell, columnWidths, y, height, header = false, rowIndex = 0 },
) => {
  let x = PDF_MARGIN;
  linesByCell.forEach((lines, columnIndex) => {
    const width = columnWidths[columnIndex];
    context.fillStyle = header
      ? "#24547a"
      : rowIndex % 2 === 1
        ? "#f8fafc"
        : "#ffffff";
    context.fillRect(x, y, width, height);
    context.strokeStyle = "#8a8a8a";
    context.lineWidth = 1;
    context.strokeRect(x, y, width, height);

    context.fillStyle = header ? "#ffffff" : "#111111";
    context.font = header ? PDF_HEADER_FONT : PDF_BODY_FONT;
    context.textBaseline = "top";
    lines.forEach((line, lineIndex) => {
      context.fillText(
        line,
        x + PDF_CELL_PADDING,
        y + PDF_CELL_PADDING + lineIndex * PDF_LINE_HEIGHT,
        width - PDF_CELL_PADDING * 2,
      );
    });
    x += width;
  });
};

const buildPdfPageImages = async (applications) => {
  const font = new FontFace(
    "DpoNotoSansDevanagari",
    `url("${devanagariFontUrl}")`,
  );
  await font.load();
  document.fonts.add(font);

  const headers = TABLE_COLUMNS.map((column) => column.header);
  const totalWeight = TABLE_COLUMNS.reduce((total, column) => total + column.width, 0);
  const availableWidth = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
  const columnWidths = TABLE_COLUMNS.map(
    (column) => (column.width / totalWeight) * availableWidth,
  );
  const pages = [];
  let page = createPdfPage(columnWidths, headers);

  applications.forEach((application) => {
    const values = TABLE_COLUMNS.map((column) =>
      formatCellValue(application, column.key),
    );
    page.context.font = PDF_BODY_FONT;
    const linesByCell = values.map((value, index) =>
      wrapCanvasText(
        page.context,
        value,
        columnWidths[index] - PDF_CELL_PADDING * 2,
      ),
    );
    const height =
      Math.max(...linesByCell.map((lines) => lines.length)) * PDF_LINE_HEIGHT +
      PDF_CELL_PADDING * 2;
    if (page.y + height > PDF_PAGE_HEIGHT - PDF_MARGIN) {
      pages.push(page.canvas);
      page = createPdfPage(columnWidths, headers);
    }
    drawCanvasRow(page.context, {
      linesByCell,
      columnWidths,
      y: page.y,
      height,
      rowIndex: page.rowIndex,
    });
    page.y += height;
    page.rowIndex += 1;
  });

  pages.push(page.canvas);
  return pages;
};

export const exportDpoTablePdf = async (applications) => {
  const [{ jsPDF }, pageImages] = await Promise.all([
    import("jspdf"),
    buildPdfPageImages(applications),
  ]);
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
  pageImages.forEach((pageImage, index) => {
    if (index > 0) pdf.addPage("a3", "landscape");
    pdf.addImage(
      pageImage.toDataURL("image/jpeg", 0.94),
      "JPEG",
      0,
      0,
      420,
      297,
    );
  });

  pdf.save(getFileBaseName("pdf"));
};

export const exportDpoTableExcel = async (applications) => {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "DPO Dashboard";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Applications");
  sheet.addRow(TABLE_COLUMNS.map((column) => column.header));
  applications.forEach((application) => {
    sheet.addRow(
      TABLE_COLUMNS.map((column) => formatCellValue(application, column.key)),
    );
  });

  TABLE_COLUMNS.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width;
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: "A1",
    to: `${String.fromCharCode(64 + TABLE_COLUMNS.length)}${sheet.rowCount}`,
  };

  const header = sheet.getRow(1);
  header.height = 30;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF24547A" } };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  });
  for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
    const row = sheet.getRow(rowIndex);
    row.height = 30;
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      if (rowIndex % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    getFileBaseName("xlsx"),
  );
};
