import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Spinner, Table } from "react-bootstrap";
import { FaCheck, FaEye, FaFilePdf, FaPrint, FaTimes } from "react-icons/fa";
import { cookieFetch } from "../../../login/AuthContext";
import DPOLeftNav from "./DPOLeftNav";
import DPOTopNav from "./DPOTopNav";
import "./tilurauteli2026-27.css";

const APPLICATIONS_URL =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/telu-roteli-dpo-status/";
const MEDIA_BASE_URL =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend";

const REQUIRED_DOCUMENTS = [
  { field: "appli_img", label: "आवेदिका का फोटो", type: "image" },
  { field: "appli_sign", label: "हस्ताक्षर", type: "image" },
  { field: "appli_pdf1", label: "उपलब्धियों का प्रमाण", type: "pdf" },
  { field: "appli_pdf2", label: "पुरस्कार / प्रमाण पत्र", type: "pdf" },
  { field: "appli_pdf3", label: "अन्य दस्तावेज़", type: "pdf" },
];

const DETAIL_FIELDS = [
  ["आवेदिका का नाम", "filer_name"],
  ["पिता / पति का नाम", "fath_husb_name"],
  ["जन्म तिथि", "dob"],
  ["मोबाइल नंबर", "filer_mob"],
  ["ईमेल", "filer_email"],
  ["आधार नंबर", "filer_adhar"],
  ["शैक्षिक योग्यता", "edu_qual"],
  ["जनपद", "district"],
  ["परियोजना / विकासखंड", "project"],
  ["गांव / क्षेत्र", "village"],
  ["पूरा पता", "address"],
  ["पैन कार्ड नंबर", "appli_pan"],
  ["खाताधारक का नाम", "appli_bank_ac_name"],
  ["बैंक खाता संख्या", "appli_bank_acc"],
  ["IFSC कोड", "appli_ifsc"],
  ["बैंक का नाम", "appli_bank_name"],
  ["सोशल मीडिया लिंक", "appli_url"],
];

const readResponse = async (response) => {
  const body = await response.text();
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("सर्वर से अमान्य प्रतिक्रिया प्राप्त हुई।");
  }
};

const getErrorMessage = (payload, fallback) => {
  const detail = payload?.detail || payload?.message || payload?.error;
  if (typeof detail === "string") return detail;
  if (detail) return JSON.stringify(detail);
  return fallback;
};

const getMediaUrl = (file) => {
  if (!file) return "";
  const path = String(file).trim();
  if (/^https?:\/\//i.test(path)) return path;
  return `${MEDIA_BASE_URL}/${path.replace(/^\/+/, "")}`;
};

const getStatusVariant = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("reject")) return "danger";
  if (normalized.includes("approv")) return "success";
  return "warning";
};

const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const TiluRauteli2026_27 = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionMessage, setActionMessage] = useState(null);
  const [updatingFormId, setUpdatingFormId] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await cookieFetch(APPLICATIONS_URL, { method: "GET" });
      const payload = await readResponse(response);
      if (!response.ok || payload.success === false) {
        throw new Error(
          getErrorMessage(
            payload,
            `आवेदन लोड नहीं हो सके (HTTP ${response.status})।`,
          ),
        );
      }
      if (!Array.isArray(payload.data)) {
        throw new Error("सर्वर से आवेदन सूची सही प्रारूप में प्राप्त नहीं हुई।");
      }
      setApplications(payload.data);
    } catch (error) {
      console.error("Failed to load Tilu Rauteli applications:", error);
      setLoadError(error.message || "आवेदन लोड नहीं हो सके।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateApplicationStatus = async (application, status) => {
    const formId = String(application.form_id || "").trim();
    if (!formId) {
      setActionMessage({
        type: "danger",
        text: "इस आवेदन का Form ID उपलब्ध नहीं है।",
      });
      return;
    }

    const actionLabel =
      status === "approved by district committee" ? "स्वीकृत" : "अस्वीकृत";
    if (
      !window.confirm(
        `क्या आप आवेदन ${formId} को ${actionLabel} करना चाहते हैं?`,
      )
    ) {
      return;
    }

    setUpdatingFormId(formId);
    setActionMessage(null);
    try {
      const response = await cookieFetch(APPLICATIONS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: formId, status }),
      });
      const payload = await readResponse(response);
      if (!response.ok || payload.success === false) {
        throw new Error(
          getErrorMessage(
            payload,
            `स्टेटस अपडेट नहीं हो सका (HTTP ${response.status})।`,
          ),
        );
      }
      const updatedRecord = payload.data;
      setApplications((current) =>
        current.map((item) =>
          item.form_id === formId
            ? {
                ...item,
                ...(updatedRecord && !Array.isArray(updatedRecord)
                  ? updatedRecord
                  : {}),
                status:
                  updatedRecord?.status ||
                  (Array.isArray(updatedRecord)
                    ? updatedRecord.find((record) => record.form_id === formId)
                        ?.status
                    : "") ||
                  status,
              }
            : item,
        ),
      );
      setSelectedApplication((current) =>
        current?.form_id === formId
          ? {
              ...current,
              ...(updatedRecord && !Array.isArray(updatedRecord)
                ? updatedRecord
                : {}),
              status: updatedRecord?.status || status,
            }
          : current,
      );
      setActionMessage({
        type: "success",
        text: `आवेदन ${formId} ${actionLabel} कर दिया गया है।`,
      });
    } catch (error) {
      console.error(`Failed to update Tilu Rauteli status for ${formId}:`, error);
      setActionMessage({
        type: "danger",
        text: error.message || "स्टेटस अपडेट नहीं हो सका।",
      });
    } finally {
      setUpdatingFormId("");
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="dashboard-container tilu-dpo-dashboard">
      <DPOLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <DPOTopNav toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="tilu-dpo-page">
          <header className="tilu-dpo-page-header">
            <div>
              <p>जिला स्तरीय सत्यापन</p>
              <h1>राज्य स्त्री शक्ति तीलू रौतेली पुरस्कार 2026-27</h1>
              <span>आवेदनों का विवरण एवं अनुमोदन</span>
            </div>
            <Button
              variant="outline-primary"
              onClick={fetchApplications}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" animation="border" /> : "रीफ्रेश"}
            </Button>
          </header>

          {actionMessage && (
            <Alert
              variant={actionMessage.type}
              dismissible
              onClose={() => setActionMessage(null)}
            >
              {actionMessage.text}
            </Alert>
          )}
          {loadError && <Alert variant="danger">{loadError}</Alert>}

          <section className="tilu-dpo-table-card">
            <div className="tilu-dpo-table-heading">
              <div>
                <h2>आवेदन सूची</h2>
                <p>
                  {loading
                    ? "आवेदन लोड हो रहे हैं..."
                    : `कुल आवेदन: ${applications.length}`}
                </p>
              </div>
            </div>
            <div className="tilu-dpo-table-scroll">
              <Table hover responsive className="tilu-dpo-table mb-0">
                <thead>
                  <tr>
                    <th>S.no</th>
                    <th>Form ID</th>
                    <th>Applicant Name</th>
                    <th>DOB</th>
                    <th>Education</th>
                    <th>Address</th>
                    <th>District</th>
                    <th>Social Media Link/URL</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="tilu-dpo-empty">
                        <Spinner animation="border" size="sm" /> आवेदन लोड हो रहे हैं...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="tilu-dpo-empty">
                        कोई आवेदन उपलब्ध नहीं है।
                      </td>
                    </tr>
                  ) : (
                    applications.map((application, index) => {
                      const status = String(application.status || "pending");
                      const isApproved =
                        status.toLowerCase() ===
                        "approved by district committee";
                      const isRejected =
                        status.toLowerCase() ===
                        "rejected by district committee";
                      const isUpdating =
                        updatingFormId === application.form_id;
                      return (
                        <tr key={application.form_id || application.id}>
                          <td>{index + 1}</td>
                          <td className="tilu-dpo-form-id">
                            {application.form_id || "—"}
                          </td>
                          <td>{application.filer_name || "—"}</td>
                          <td>{formatDate(application.dob)}</td>
                          <td>{application.edu_qual || "—"}</td>
                          <td className="tilu-dpo-address">
                            {application.address || "—"}
                          </td>
                          <td>{application.district || "—"}</td>
                          <td>
                            {application.appli_url ? (
                              <a
                                href={application.appli_url}
                                target="_blank"
                                rel="noreferrer"
                                className="tilu-dpo-url"
                              >
                                Link
                              </a>
                            ) : (
                              <span className="tilu-dpo-no-link">×</span>
                            )}
                          </td>
                          <td>
                            <Badge bg={getStatusVariant(status)}>{status}</Badge>
                          </td>
                          <td>
                            <div className="tilu-dpo-actions">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() =>
                                  setSelectedApplication(application)
                                }
                              >
                                <FaEye /> View
                              </Button>
                              <Button
                                size="sm"
                                variant="success"
                                disabled={isUpdating || isApproved}
                                onClick={() =>
                                  updateApplicationStatus(
                                    application,
                                    "approved by district committee",
                                  )
                                }
                              >
                                {isUpdating ? (
                                  <Spinner size="sm" animation="border" />
                                ) : (
                                  <FaCheck />
                                )}{" "}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                disabled={isUpdating || isRejected}
                                onClick={() =>
                                  updateApplicationStatus(
                                    application,
                                    "rejected by district committee",
                                  )
                                }
                              >
                                <FaTimes /> Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </section>
        </main>
      </div>

      {selectedApplication && (
        <div
          className="tilu-dpo-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedApplication(null);
            }
          }}
        >
          <section
            className="tilu-dpo-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tilu-dpo-preview-title"
          >
            <header className="tilu-dpo-modal-toolbar">
              <div>
                <h2 id="tilu-dpo-preview-title">
                  आवेदन का पूर्वावलोकन
                </h2>
                <span>Form ID: {selectedApplication.form_id || "—"}</span>
              </div>
              <div className="tilu-dpo-modal-actions">
                <Button variant="primary" onClick={handlePrint}>
                  <FaPrint /> View as PDF / Print
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setSelectedApplication(null)}
                >
                  बंद करें
                </Button>
              </div>
            </header>
            <div className="tilu-dpo-print-area">
              <div className="tilu-dpo-document-header">
                <h1>महिला सशक्तिकरण एवं बाल विकास विभाग</h1>
                <p>उत्तराखण्ड सरकार</p>
                <h2>राज्य स्त्री शक्ति तीलू रौतेली पुरस्कार 2026-27</h2>
                <div className="tilu-dpo-document-meta">
                  <strong>Form ID: {selectedApplication.form_id || "—"}</strong>
                  <Badge bg={getStatusVariant(selectedApplication.status)}>
                    {selectedApplication.status || "pending"}
                  </Badge>
                </div>
              </div>

              <section className="tilu-dpo-detail-section">
                <h3>आवेदिका का विवरण</h3>
                <div className="tilu-dpo-detail-grid">
                  {DETAIL_FIELDS.map(([label, field]) => {
                    if (field === "appli_url" && !selectedApplication[field]) {
                      return null;
                    }
                    return (
                      <div className="tilu-dpo-detail-item" key={field}>
                        <strong>{label}</strong>
                        {field === "appli_url" && selectedApplication[field] ? (
                          <a
                            href={selectedApplication[field]}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {selectedApplication[field]}
                          </a>
                        ) : (
                          <span>{selectedApplication[field] || "—"}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="tilu-dpo-detail-section">
                <h3>विशिष्ट कार्य क्षेत्र</h3>
                {String(selectedApplication.appli_points || "")
                  .split("*")
                  .map((point) => point.trim())
                  .filter(Boolean).length ? (
                  <ol className="tilu-dpo-points">
                    {String(selectedApplication.appli_points || "")
                      .split("*")
                      .map((point) => point.trim())
                      .filter(Boolean)
                      .map((point, index) => (
                        <li key={`${index}-${point}`}>{point}</li>
                      ))}
                  </ol>
                ) : (
                  <p>—</p>
                )}
              </section>

              <section className="tilu-dpo-detail-section">
                <h3>उपलब्धियों एवं योगदान का विवरण</h3>
                <div className="tilu-dpo-detail-grid">
                  {[
                    ["महिला की उपलब्धि का विवरण", "manak1"],
                    ["सम्मान / पुरस्कार का विवरण", "manak2"],
                    ["जीवन का संक्षिप्त विवरण", "manak3"],
                  ].map(([label, field]) => (
                    <div className="tilu-dpo-detail-item full" key={field}>
                      <strong>{label}</strong>
                      <span>{selectedApplication[field] || "—"}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="tilu-dpo-detail-section">
                <h3>अपलोड किए गए दस्तावेज़</h3>
                <div className="tilu-dpo-documents">
                  {REQUIRED_DOCUMENTS.map(({ field, label, type }) => {
                    const url = getMediaUrl(selectedApplication[field]);
                    return (
                      <div className="tilu-dpo-document" key={field}>
                        <strong>{label}</strong>
                        {!url ? (
                          <p>दस्तावेज़ उपलब्ध नहीं है।</p>
                        ) : type === "image" ? (
                          <a href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt={label} />
                          </a>
                        ) : (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="tilu-dpo-document-link"
                          >
                            <FaFilePdf /> PDF देखें / डाउनलोड करें
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default TiluRauteli2026_27;
