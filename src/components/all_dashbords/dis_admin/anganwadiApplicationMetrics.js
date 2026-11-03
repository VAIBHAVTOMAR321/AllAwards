const MERIT_FIELDS = [
  "merit",
  "merit_marks",
  "meritMarks",
  "total_marks",
  "totalMarks",
  "total_marks_obtained",
  "totalMarksObtained",
  "total_mark",
  "totalMark",
  "total_score",
  "totalScore",
  "marks_obtained",
  "marksObtained",
  "score",
];

const parseNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) ? parsed : null;
};

export const getAnganwadiApplicationMerit = (application) => {
  if (!application || typeof application !== "object") return null;

  const fields = new Map(
    Object.entries(application).map(([field, value]) => [
      field.toLowerCase().replaceAll("_", ""),
      value,
    ]),
  );
  for (const field of MERIT_FIELDS) {
    const value = parseNumber(fields.get(field.toLowerCase().replaceAll("_", "")));
    if (value !== null) return value;
  }
  return null;
};

export const normalizeAnganwadiApplication = (application) => {
  if (!application || typeof application !== "object") return application;
  const normalized = { ...application };
  const merit = getAnganwadiApplicationMerit(normalized);
  if (merit !== null) normalized.merit = merit;

  Object.keys(normalized).forEach((key) => {
    if (!key.endsWith("_marks") && !key.endsWith("_tot") && !key.endsWith("_obt")) return;
    const parsed = parseNumber(normalized[key]);
    if (parsed !== null) normalized[key] = parsed;
  });
  return normalized;
};
