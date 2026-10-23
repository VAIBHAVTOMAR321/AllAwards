const TIMESTAMP_KEYS = [
  "submission_date",
  "submissionDate",
  "submitted_at",
  "submittedAt",
  "final_submitted_at",
  "finalSubmittedAt",
  "updated_at",
  "updatedAt",
  "created_at",
  "createdAt",
];

const SENTINEL_VALUES = new Set([
  "system generated",
  "none",
  "null",
  "undefined",
  "-",
]);

export const NOT_SUBMITTED_LABEL = "लागू नहीं";

// File fields that only the `nominator-part5` (documents) record carries, used
// to recognise that row inside the dashboard form status payload.
const DOCUMENTS_FIELDS = [
  "nominator_id_proof",
  "child_aadhaar_identity",
  "bank_detail",
  "child_birth_age_certificate",
];

const readTimestamp = (record) => {
  if (!record || typeof record !== "object") return "";
  for (const key of TIMESTAMP_KEYS) {
    const value = record[key];
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (!text || SENTINEL_VALUES.has(text.toLowerCase())) continue;
    return text;
  }
  return "";
};

/**
 * Reads the final submission timestamp the step 5 (declaration) API returned.
 * Accepts the raw record, an API envelope, or a list response so the same
 * helper works for the GET in the form and the PUT response after submitting.
 * `updated_at` wins over `created_at` because the declaration row is written
 * again on every final submit.
 */
export const extractSubmissionTimestamp = (payload) => {
  const direct = readTimestamp(payload);
  if (direct) return direct;

  const data = payload?.data;
  const fromData = readTimestamp(Array.isArray(data) ? data[0] : data);
  if (fromData) return fromData;

  const declaration = payload?.declaration || payload?.declaration_record;
  return readTimestamp(declaration);
};

/**
 * The submission time shown everywhere is the `updated_at` of the
 * `nominator-part5` API row, not of the step 5 declaration row. In the
 * dashboard form status payload that documents row is normally `step-4`, so it
 * is located by its file fields and step 5 is only used as a fallback.
 */
export const resolveSubmissionTimestampFromSteps = ({
  s1,
  s4,
  s5,
} = {}) => {
  const hasDocuments = (step) =>
    DOCUMENTS_FIELDS.some((field) => String(step?.[field] || "").trim() !== "");

  let documentsStep = s4;
  if (!hasDocuments(documentsStep) && hasDocuments(s5)) {
    documentsStep = s5;
  }

  return (
    readTimestamp(documentsStep) || readTimestamp(s5) || readTimestamp(s1) || ""
  );
};

/**
 * Formats an API timestamp in IST. Anything unparsable is shown as received
 * instead of being replaced by the browser clock, so the screen never shows a
 * running time in place of the recorded submission time.
 */
export const formatSubmissionDateTime = (
  value,
  fallback = NOT_SUBMITTED_LABEL,
) => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  if (!text || SENTINEL_VALUES.has(text.toLowerCase())) return fallback;

  try {
    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return text;
    return parsed
      .toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(/ /g, " ");
  } catch {
    return text;
  }
};