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
  {
    field: "appli_pdf1",
    label: "महिला की उपलब्धि से संबंधित दस्तावेज़",
    type: "pdf",
  },
  {
    field: "appli_pdf2",
    label: "जीवन-वृत्त / समाचार-पत्र / प्रमाण पत्र",
    type: "pdf",
  },
  {
    field: "appli_pdf3",
    label: "सम्मान / पुरस्कार / अन्य प्रमाण पत्र",
    type: "pdf",
  },
];

const DETAIL_FIELDS = [
  ["जन्म तिथि", "dob"],
  ["मोबाइल नंबर", "filer_mob"],
  ["ईमेल आईडी", "filer_email"],
  ["आधार नंबर", "filer_adhar"],
  ["पिता / पति का नाम", "fath_husb_name"],
  ["शैक्षिक योग्यता", "edu_qual"],
  ["वर्तमान पता", "address"],
  ["जनपद", "district"],
  ["परियोजना / विकासखंड", "project"],
  ["गांव / क्षेत्र", "village"],
  ["पैन कार्ड नंबर", "appli_pan"],
  ["बैंक खाता धारक का नाम", "appli_bank_ac_name"],
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
    throw new Error("Invalid response received from the server.");
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

const displayValue = (value) =>
  value === null || value === undefined || String(value).trim() === ""
    ? "—"
    : value;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const PAGE_SIZE = 100;

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
            `Failed to load applications (HTTP ${response.status}).`,
          ),
        );
      }
      if (!Array.isArray(payload.data)) {
        throw new Error(
          "Server did not return application list in correct format.",
        );
      }
      setApplications(payload.data);
    } catch (error) {
      console.error("Failed to load Tilu Rauteli applications:", error);
      setLoadError(error.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, selectedProjects]);

  const uniqueProjects = [
    ...new Set(applications.map((a) => String(a.project || "")).filter(Boolean)),
  ].sort();

  const filteredApplications = applications.filter((application) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      String(application.form_id || "").toLowerCase().includes(query) ||
      String(application.filer_name || "").toLowerCase().includes(query);
    const matchesTab =
      activeTab === "all" ||
      String(application.status || "").toLowerCase() ===
        "approved by district committee";
    const matchesProject =
      selectedProjects.length === 0 ||
      selectedProjects.includes(String(application.project || ""));
    return matchesSearch && matchesTab && matchesProject;
  });

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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

  useEffect(() => {
    if (!selectedApplication) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelectedApplication(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedApplication]);

  const updateApplicationStatus = async (application, status) => {
    const formId = String(application.form_id || "").trim();
    if (!formId) {
      setActionMessage({
        type: "danger",
        text: "Form ID not available for this application.",
      });
      return;
    }
    const actionLabel =
      status === "approved by district committee" ? "Approved" : "Rejected";
    if (
      !window.confirm(
        `Do you want to ${actionLabel} application ${formId}?`,
      )
    )
      return;

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
            `Status could not be updated (HTTP ${response.status}).`,
          ),
        );
      }
      const updatedRecord = payload.data;
      const returnedRecord = Array.isArray(updatedRecord)
        ? updatedRecord.find((record) => record.form_id === formId)
        : updatedRecord;
      const newStatus = returnedRecord?.status || status;
      setApplications((current) =>
        current.map((item) =>
          String(item.form_id) === formId
            ? { ...item, ...(returnedRecord || {}), status: newStatus }
            : item,
        ),
      );
      setSelectedApplication((current) =>
        current && String(current.form_id) === formId
          ? { ...current, ...(returnedRecord || {}), status: newStatus }
          : current,
      );
      setActionMessage({
        type: "success",
        text: `Application ${formId} has been ${actionLabel}.`,
      });
    } catch (error) {
      console.error(
        `Failed to update Tilu Rauteli status for ${formId}:`,
        error,
      );
      setActionMessage({
        type: "danger",
        text: error.message || "Status could not be updated.",
      });
    } finally {
      setUpdatingFormId("");
    }
  };

  const handlePrint = () => window.print();

  const renderDetailRows = (fields) =>
    fields.map(([label, field]) => {
      const value = selectedApplication[field];
      if (field === "appli_url" && !value) return null;
      return (
        <tr key={field}>
          <th>{label}</th>
          <td>
            {field === "appli_url" && value ? (
              <a href={value} target="_blank" rel="noreferrer">
                {value}
              </a>
            ) : field === "dob" ? (
              formatDate(value)
            ) : (
              displayValue(value)
            )}
          </td>
        </tr>
      );
    });

  const renderDocument = ({ field, label, type }) => {
    const url = getMediaUrl(selectedApplication[field]);
    return (
      <tr key={field}>
        <th>{label}</th>
        <td className="tilu-dpo-document-cell">
          {!url ? (
            <span>Document not available.</span>
          ) : type === "image" ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="tilu-dpo-image-link"
            >
              <img src={url} alt={label} />
            </a>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="tilu-dpo-document-link"
            >
                <FaFilePdf /> View / Download PDF
            </a>
          )}
        </td>
      </tr>
    );
  };

  const achievementPoints = String(selectedApplication?.appli_points || "")
    .split("*")
    .map((point) => point.trim())
    .filter(Boolean);

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
              <p>District Level Verification</p>
              <h1>State Women Power Tilu Rauteli Award 2026-27</h1>
              <span>Application Details and Approval</span>
            </div>
            <Button
              variant="outline-light"
              onClick={fetchApplications}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" animation="border" /> : "Refresh"}
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
              <div className="tilu-dpo-heading-left">
                <div className="tilu-dpo-tabs">
                  <button
                    className={activeTab === "all" ? "tilu-dpo-tab active" : "tilu-dpo-tab"}
                    onClick={() => setActiveTab("all")}
                  >
                    All Applications
                  </button>
                  <button
                    className={activeTab === "approved" ? "tilu-dpo-tab active" : "tilu-dpo-tab"}
                    onClick={() => setActiveTab("approved")}
                  >
                    Approved Applications
                  </button>
                  <button
                    className={activeTab === "report" ? "tilu-dpo-tab active" : "tilu-dpo-tab"}
                    onClick={() => setActiveTab("report")}
                  >
                    Report
                  </button>
                </div>
                <h2>Application List</h2>
                <p>
                  {loading
                    ? "Loading applications..."
                    : `Total Applications: ${filteredApplications.length}`}
                </p>
              </div>
              <div className="tilu-dpo-filters">
                <div className="tilu-dpo-search">
                  <input
                    type="text"
                    placeholder="Search by Form ID or Applicant Name..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <div className="tilu-dpo-project-filter">
                  <label>Project / Development Block</label>
                  <select
                    multiple
                    size={Math.min(uniqueProjects.length, 5) || 1}
                    value={selectedProjects}
                    onChange={(event) => {
                      const values = Array.from(
                        event.target.selectedOptions,
                        (option) => option.value,
                      );
                      setSelectedProjects(values);
                    }}
                  >
                    {uniqueProjects.map((project) => (
                      <option key={project} value={project}>
                        {project}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="tilu-dpo-table-scroll">
              {activeTab === "report" ? (
                <Table hover className="tilu-dpo-table mb-0 tilu-dpo-report-table">
                  <thead>
                      <tr>
                        <th>S.no</th>
                        <th>District</th>
                        <th>Applicant</th>
                        <th>Husband/Father Name</th>
                        <th>Bank Name</th>
                        <th>Account Number</th>
                        <th>IFSC Code</th>
                        <th>Mobile</th>
                        <th>Application Points</th>
                      </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="9" className="tilu-dpo-empty">
                          <Spinner animation="border" size="sm" /> Loading applications...
                        </td>
                      </tr>
                    ) : filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="tilu-dpo-empty">
                          No report data available.
                        </td>
                      </tr>
                    ) : (
                      paginatedApplications.map((application, index) => {
                        const achievementPoints = String(
                          application.appli_points || ""
                        )
                          .split("*")
                          .map((point) => point.trim())
                          .filter(Boolean);
                        return (
                          <tr key={application.form_id || application.id}>
                            <td>{index + 1}</td>
                            <td>{application.district || "—"}</td>
                            <td>{application.filer_name || "—"}</td>
                            <td>{application.fath_husb_name || "—"}</td>
                            <td>{application.appli_bank_name || "—"}</td>
                            <td>{application.appli_bank_acc || "—"}</td>
                            <td>{application.appli_ifsc || "—"}</td>
                            <td>{application.filer_mob || "—"}</td>
                            <td>
                              {achievementPoints.length > 0 ? (
                                <ol
                                  className="tilu-dpo-points"
                                  style={{ margin: 0, paddingLeft: 20 }}
                                >
                                  {achievementPoints.map(
                                    (point, pi) => (
                                      <li key={pi}>{point}</li>
                                    )
                                  )}
                                </ol>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              ) : (
                <Table hover className="tilu-dpo-table mb-0">
                  <thead>
                    <tr>
                      <th>S.no</th>
                      <th>Form ID</th>
                      <th>Applicant Name</th>
                      <th>DOB</th>
                      <th>Educational</th>
                      <th>Address</th>
                      <th>District</th>
                      <th>Social Media Link</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="10" className="tilu-dpo-empty">
                          <Spinner animation="border" size="sm" /> Loading applications...
                        </td>
                      </tr>
                    ) : filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="tilu-dpo-empty">
                          No applications available.
                        </td>
                      </tr>
                    ) : (
                      paginatedApplications.map((application, index) => {
                        const status = String(application.status || "pending");
                        const isApproved =
                          status.toLowerCase() ===
                          "approved by district committee";
                        const isRejected =
                          status.toLowerCase() ===
                          "rejected by district committee";
                        const isUpdating =
                          updatingFormId === String(application.form_id || "");
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
                                    View Link
                                  </a>
                              ) : (
                                <span className="tilu-dpo-no-link">—</span>
                              )}
                            </td>
                            <td>
                              <Badge bg={getStatusVariant(status)}>
                                {status}
                              </Badge>
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
                                {isApproved ? (
                                  <Button
                                    size="sm"
                                    variant="success"
                                    disabled
                                  >
                                    <FaCheck /> Approved
                                  </Button>
                                ) : (
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
                                )}
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  disabled={isUpdating || isRejected || isApproved}
                                  onClick={() =>
                                    updateApplicationStatus(
                                      application,
                                      "rejected by district committee",
                                    )
                                  }
                                >
                                  {isRejected ? "Rejected" : "Reject"}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              )}
            </div>
            {totalPages > 1 && (
              <div className="tilu-dpo-pagination">
                <span className="tilu-dpo-page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage((page) => page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </section>
        </main>
      </div>

      {selectedApplication && (
        <div
          className="tilu-dpo-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setSelectedApplication(null);
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
                <h2 id="tilu-dpo-preview-title">आवेदन का पूर्वावलोकन</h2>
                <span>Form ID: {selectedApplication.form_id || "—"}</span>
              </div>
              <div className="tilu-dpo-modal-actions">
                <Button variant="light" onClick={handlePrint}>
                  <FaPrint /> प्रिंट / PDF
                </Button>
                <Button
                  variant="outline-light"
                  onClick={() => setSelectedApplication(null)}
                >
                  <FaTimes /> बंद करें
                </Button>
              </div>
            </header>

            <div className="tilu-dpo-print-area">
              <article className="tilu-dpo-application-document">
                <header className="tilu-dpo-document-header">
                  <div className="tilu-dpo-department-name">
                    महिला सशक्तिकरण एवं बाल विकास विभाग
                  </div>
                  <h2>
                    राज्य स्त्री शक्ति तीलू रौतेली पुरस्कार हेतु आवेदन पत्र
                  </h2>
                </header>

                <section className="tilu-dpo-pdf-section">
                  <table className="tilu-dpo-pdf-table">
                    <tbody>
                      <tr className="tilu-dpo-table-title">
                        <th colSpan="2">जानकारी का शीर्षक</th>
                      </tr>
                      <tr>
                        <th>Form ID | आवेदन फार्म संख्या</th>
                        <td>{displayValue(selectedApplication.form_id)}</td>
                      </tr>
                      <tr>
                        <th>Applicant | आवेदिका</th>
                        <td className="tilu-dpo-applicant-photo-cell">
                          {selectedApplication.appli_img && (
                            <img
                              className="tilu-dpo-applicant-photo"
                              src={getMediaUrl(selectedApplication.appli_img)}
                              alt="आवेदिका का फोटो"
                            />
                          )}
                          <strong>
                            {displayValue(selectedApplication.filer_name)}
                          </strong>
                          <span>
                            {displayValue(selectedApplication.filer_mob)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th>महिला / किशोरी के हस्ताक्षर</th>
                        <td className="tilu-dpo-signature-cell">
                          {selectedApplication.appli_sign ? (
                            <img
                              className="tilu-dpo-signature"
                              src={getMediaUrl(selectedApplication.appli_sign)}
                              alt="आवेदिका के हस्ताक्षर"
                            />
                          ) : (
                            "दस्तावेज़ उपलब्ध नहीं है।"
                          )}
                        </td>
                      </tr>
                      {renderDetailRows(
                        DETAIL_FIELDS.filter(
                          ([label, field]) => !["appli_url"].includes(field),
                        ),
                      )}
                    </tbody>
                  </table>
                </section>

                <section className="tilu-dpo-pdf-section">
                  <table className="tilu-dpo-pdf-table">
                    <tbody>
                      <tr className="tilu-dpo-table-title">
                        <th colSpan="2">जानकारी का शीर्षक</th>
                      </tr>
                      <tr>
                        <th>
                          महिला की उपलब्धि किस प्रकार उत्कृष्ट आंकी गयी है — से
                          संबंधित डॉक्यूमेंटेशन
                        </th>
                        <td className="tilu-dpo-long-text">
                          <div>{displayValue(selectedApplication.manak1)}</div>
                          <div className="tilu-dpo-inline-document">
                            {getMediaUrl(selectedApplication.appli_pdf1) ? (
                              <a
                                href={getMediaUrl(
                                  selectedApplication.appli_pdf1,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="tilu-dpo-document-link"
                              >
                                <FaFilePdf /> PDF देखें / डाउनलोड करें
                              </a>
                            ) : (
                              <span>दस्तावेज़ उपलब्ध नहीं है।</span>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          महिला के जीवन के संक्षिप्त विवरण से संबंधित प्रमाण
                          पत्र, अखबार की कतरनी (newspaper cutting) आदि
                        </th>
                        <td className="tilu-dpo-long-text">
                          <div>{displayValue(selectedApplication.manak3)}</div>
                          <div className="tilu-dpo-inline-document">
                            {getMediaUrl(selectedApplication.appli_pdf2) ? (
                              <a
                                href={getMediaUrl(
                                  selectedApplication.appli_pdf2,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="tilu-dpo-document-link"
                              >
                                <FaFilePdf /> PDF देखें / डाउनलोड करें
                              </a>
                            ) : (
                              <span>दस्तावेज़ उपलब्ध नहीं है।</span>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          उत्कृष्ट कार्यों से संबंधित राष्ट्रीय / अंतर्राष्ट्रीय
                          सम्मान, पुरस्कार, प्रमाण पत्र आदि
                        </th>
                        <td className="tilu-dpo-long-text">
                          <div>{displayValue(selectedApplication.manak2)}</div>
                          <div className="tilu-dpo-inline-document">
                            {getMediaUrl(selectedApplication.appli_pdf3) ? (
                              <a
                                href={getMediaUrl(
                                  selectedApplication.appli_pdf3,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="tilu-dpo-document-link"
                              >
                                <FaFilePdf /> PDF देखें / डाउनलोड करें
                              </a>
                            ) : (
                              <span>दस्तावेज़ उपलब्ध नहीं है।</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <section className="tilu-dpo-pdf-section">
                  <table className="tilu-dpo-pdf-table">
                    <tbody>
                      <tr className="tilu-dpo-table-title">
                        <th colSpan="2">Information Title</th>
                      </tr>
                     
 <tr>
   <th>उपलब्धि के क्षेत्र</th>
   <td className="tilu-dpo-long-text">
    {achievementPoints.length > 0 ? (
      <ol className="tilu-dpo-points">
        {achievementPoints.map((point, index) => (
          <li key={`${index}-${point}`}>
            {point}
          </li>
        ))}
      </ol>
    ) : (
      "—"
    )}
  </td>
</tr>

                    </tbody>
                  </table>
                  <div className="tilu-dpo-document-footer">
                    <span>
                      Form ID: {displayValue(selectedApplication.form_id)}
                    </span>
                    <span>
                      स्थिति:{" "}
                      {displayValue(selectedApplication.status || "pending")}
                    </span>
                  </div>
                </section>
              </article>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default TiluRauteli2026_27;
