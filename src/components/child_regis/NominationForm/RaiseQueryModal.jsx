import React, { useEffect, useState } from "react";
import { useAuth } from "../../login/AuthContext";
import { FaEye, FaFileAlt } from "react-icons/fa";

const queryEndpoint = "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/applicant/request/";
const mediaBaseUrl = "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/media";
const MAX_QUERY_FILE_SIZE = 1024 * 1024;

// A raised query always stores its print copy under this name for the applicant.
const getQueryPrintFileName = (applicantId) => {
  const id = String(applicantId || "").trim();
  return id ? `Print_-${id}.pdf` : "";
};

const getDocumentUrl = (value) => {
  if (!value) return "";

  const raw = String(value).trim();
  if (!raw) return "";

  let normalizedPath = raw;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      normalizedPath = url.pathname.replace(/^\/+/, "");
    } catch {
      normalizedPath = raw.replace(/^https?:\/\/[^/]+\//i, "");
    }
  } else {
    normalizedPath = raw.replace(/^\/+/, "");
  }

  // The value may arrive as a bare file name, a media relative path or a full
  // URL, and the host folders are not always in the same order.
  const cleanPath = normalizedPath
    .replace(/^\/+/, "")
    .replace(
      /^(?:media\/|applicant_requests\/|balvirtaawardproject\/|balvirtaawardproject_backend\/)+/i,
      "",
    );

  if (!cleanPath) return "";

  return `${mediaBaseUrl}/applicant_requests/${cleanPath}`;
};

// The API row may carry the stored path, but the printed copy of the query is
// always published as applicant_requests/Print_-<applicant id>.pdf.
const getQueryFileValue = (query, applicantId) =>
  String(query?.file || "").trim() || getQueryPrintFileName(applicantId);

const getFileName = (value) => {
  if (!value) return "";
  if (value instanceof File) return value.name;
  if (typeof value === "string") {
    const trimmed = String(value).trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const url = new URL(trimmed);
        const parts = url.pathname.split("/").filter(Boolean);
        return parts.pop() || trimmed;
      } catch {
        const parts = trimmed.split("/").filter(Boolean);
        return parts.pop() || trimmed;
      }
    }
    const parts = trimmed.split("/").filter(Boolean);
    return parts.pop() || trimmed;
  }
  return "";
};

const RaiseQueryModal = ({ open, mode = "create", onClose, applicantId, mobileNumber, existingQuery, onSubmitted }) => {
  const { authFetch } = useAuth();
  const [remark, setRemark] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open) {
      setRemark("");
      setFile(null);
      setError("");
      setSuccess("");
    }
  }, [open, mode]);

  if (!open) return null;

  const handleViewFile = (value) => {
    if (!value) return;
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else if (typeof value === "string") {
      window.open(getDocumentUrl(value), "_blank", "noopener,noreferrer");
    }
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (mode !== "create") return;
    if (!remark.trim()) {
      setError("कृपया टिप्पणी दर्ज करें।");
      return;
    }
    if (!file) {
      setError("कृपया अभिलेख अपलोड करें।");
      return;
    }
    if (file.size > MAX_QUERY_FILE_SIZE) {
      setError("क्वेरी अभिलेख का आकार 1 MB से अधिक नहीं होना चाहिए।");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("applicant_id", applicantId || "");
      formData.append("mobile_number", mobileNumber || "");
      formData.append("remark", remark.trim());
      if (file) formData.append("file", file);
      if (file) formData.append("file_name", file.name);

      const response = await authFetch(queryEndpoint, { method: "POST", body: formData });
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await response.json() : await response.text();

      if (!response.ok || (typeof result === "object" && result.success === false)) {
        const message = typeof result === "object"
          ? (result.detail || result.message || result.error)
          : result;
        throw new Error(message || "क्वेरी सबमिट करने में त्रुटि हुई।");
      }

      setSuccess("क्वेरी सफलतापूर्वक सबमिट हो गई।");
      onSubmitted?.(result);
    } catch (err) {
      console.error("Query submit error:", err);
      setError(err.message || "क्वेरी सबमिट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setSubmitting(false);
    }
  };

  const queries = Array.isArray(existingQuery)
    ? existingQuery
    : existingQuery
    ? [existingQuery]
    : [];

  return (
    <div className="nf-pv-overlay" onClick={onClose}>
      <div className="nf-pv-sheet nf-query-sheet" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="nf-pv-x" onClick={onClose} aria-label="Close">×</button>

        <div className="nf-query-header">
          <h2>{mode === "view" ? "Raise Query Details" : "Raise Query"}</h2>
          <p>Application No: {applicantId || "System Generated"}</p>
        </div>

        <div className="nf-query-body">
          {mode === "create" && (
            <div className="nf-query-form" onSubmit={handleSubmit}>
              {error && <div className="nf-error" role="alert">{error}</div>}
              {success && <div className="nf-notice" role="status">{success}</div>}

              <div className="nf-field">
                <label htmlFor="nf-query-mobile">Mobile Number</label>
                <input
                  id="nf-query-mobile"
                  type="text"
                  value={mobileNumber || ""}
                  readOnly
                  placeholder="Mobile Number"
                />
              </div>

              <div className="nf-field">
                <label htmlFor="nf-query-remark">
                  Remark <span className="nf-tag required">अनिवार्य</span>
                </label>
                <textarea
                  id="nf-query-remark"
                  rows={4}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="कृपया अपनी क्वेरी / टिप्पणी यहाँ लिखें"
                  required
                />
              </div>

              <div className="nf-document-upload">
                <label htmlFor="nf-query-file" className="nf-document-upload-label">
                  अभिलेख अपलोड करें <span className="nf-tag required">अनिवार्य</span>
                </label>
                <label htmlFor="nf-query-file" className="nf-document-dropzone">
                  <input
                    id="nf-query-file"
                    type="file"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      if (selectedFile && selectedFile.size > MAX_QUERY_FILE_SIZE) {
                        e.target.value = "";
                        setFile(null);
                        setError("क्वेरी अभिलेख का आकार 1 MB से अधिक नहीं होना चाहिए।");
                        return;
                      }
                      setError("");
                      setFile(selectedFile);
                    }}
                    className="nf-document-input"
                  />
                  <span className="nf-document-dropzone-text">
                    {file ? file.name : "No file chosen"}
                  </span>
                  {file && (
                    <button
                      type="button"
                      className="nf-view-file"
                      onClick={() => handleViewFile(file)}
                      title="View Document"
                      style={{ marginLeft: "8px" }}
                    >
                      <FaEye />
                    </button>
                  )}
                </label>
                <span className="nf-document-upload-hint">
                  PDF, DOC, JPG, PNG (अधिकतम 1MB)
                </span>
              </div>

              <div className="nf-query-actions">
                <button type="button" className="nf-secondary" onClick={onClose} disabled={submitting}>
                  Cancel
                </button>
                <button type="button" className="nf-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Send Query"}
                </button>
              </div>
            </div>
          )}

          {mode === "view" && (
            <div className="nf-query-view">
              {queries.length === 0 && <p>कोई क्वेरी उपलब्ध नहीं है।</p>}
              {queries.map((q, idx) => {
                const queryFile = getQueryFileValue(q, q?.applicant_id || applicantId);
                return (
                <div key={q?.id || idx} className="nf-query-card">
                  <div className="nf-query-row">
                    <strong>Mobile Number:</strong>
                    <span>{q?.mobile_number || mobileNumber || "-"}</span>
                  </div>
                  <div className="nf-query-row">
                    <strong>Remark:</strong>
                    <span>{q?.remark || "-"}</span>
                  </div>
                  <div className="nf-query-row">
                    <strong>Status:</strong>
                    <span className={`nf-query-status nf-query-status-${(q?.status || "pending").toLowerCase()}`}>
                      {q?.status || "pending"}
                    </span>
                  </div>
                  <div className="nf-query-row">
                    <strong>File:</strong>
                    {queryFile ? (
                      <span className="nf-query-file">
                        <FaFileAlt className="pdf-icon" />
                        <span>{getFileName(queryFile)}</span>
                        <button
                          type="button"
                          className="nf-view-file"
                          onClick={() => handleViewFile(queryFile)}
                          title="View Document"
                        >
                          <FaEye />
                        </button>
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                  <div className="nf-query-row">
                    <strong>Submitted At:</strong>
                    <span>{q?.created_at || "-"}</span>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="nf-pv-footer">
          <button type="button" className="nf-pv-closebtn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default RaiseQueryModal;