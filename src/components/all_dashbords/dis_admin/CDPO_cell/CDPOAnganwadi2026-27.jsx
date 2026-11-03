import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Form,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  FaCheck,
  FaEye,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { cookieFetch } from "../../../login/AuthContext";
import AnganwadiApplicationPreview from "../AnganwadiApplicationPreview";
import {
  getAnganwadiApplicationMerit,
  normalizeAnganwadiApplication,
} from "../anganwadiApplicationMetrics";
import CDPOLeftNav from "./CDPOLeftNav";
import CDPOTopNav from "./CDPOTopNav";
import "../DPO_cell/DPODashboard.css";
import "./CDPOAnganwadi2026-27.css";

const APPLICATIONS_URL =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/ang-puruskar-cdpo-status/";
const PAGE_SIZE = 10;

const readResponse = async (response) => {
  const body = await response.text();
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("The server returned an invalid JSON response.");
  }
};

const getErrorMessage = (payload, fallback) => {
  const detail = payload?.detail || payload?.message || payload?.error;
  if (typeof detail === "string") return detail;
  if (detail) return JSON.stringify(detail);
  return fallback;
};

const displayValue = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "—";
  }
  return String(value);
};

const calculateAgeFromDob = (value) => {
  if (!value) return "—";
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return "—";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age >= 0 ? age : "—";
};

const formatTableDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(parsed);
  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;
  return `${day}-${month}-${year}`;
};

const getStatusVariant = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "approved" || normalized.includes("approv")) {
    return "primary";
  }
  if (normalized.includes("reject")) return "danger";
  if (normalized === "final_submit") return "primary";
  return "warning";
};

const formatStatus = (status) => {
  const labels = {
    final_submit: "Final Submitted",
    submitted: "Submitted",
    approved: "Approved by CDPO",
    approved_by_cdpo: "Approved by CDPO",
    approved_cdpo: "Approved by CDPO",
    approved_by_dpo: "Approved by DPO",
    approved_by_district: "Approved by District",
    rejected: "Rejected",
    rejected_by_cdpo: "Rejected by CDPO",
    rejected_by_dpo: "Rejected by DPO",
    pending: "Pending",
    completed: "Completed",
  };
  return labels[normalizeStatus(status)] || displayValue(status);
};

const normalizeStatus = (status) => String(status || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
const isApprovedStatus = (status) => {
  const value = normalizeStatus(status);
  return value === "approved" || value === "approved_by_cdpo" || value === "approved_cdpo" || value === "approved_by_dpo" || value === "approved_by_district";
};
const isRejectedStatus = (status) => normalizeStatus(status).includes("reject");
const isCompletedStatus = (status) => {
  const value = normalizeStatus(status);
  return ["final_submit", "submitted", "completed"].includes(value) || isApprovedStatus(value) || isRejectedStatus(value);
};

const CDPOAnganwadi2026_27 = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [applications, setApplications] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [apiCount, setApiCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionMessage, setActionMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [decisionStatus, setDecisionStatus] = useState("approved");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [approvalApplication, setApprovalApplication] = useState(null);
  const [remark, setRemark] = useState("");
  const [updatingFormId, setUpdatingFormId] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      if (width < 768) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      "cdpo-anganwadi-modal-open",
      Boolean(selectedApplication || approvalApplication)
    );
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedApplication(null);
        setApprovalApplication(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("cdpo-anganwadi-modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedApplication, approvalApplication]);

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
            `Failed to load applications (HTTP ${response.status}).`
          )
        );
      }
      if (!Array.isArray(payload.data)) {
        throw new Error("The API response does not contain a valid data array.");
      }
      setApplications(payload.data.map(normalizeAnganwadiApplication));
      setProjectName(payload.project || "");
      setApiCount(Number.isFinite(Number(payload.count)) ? Number(payload.count) : payload.data.length);
    } catch (error) {
      console.error("Failed to load Anganwadi award applications:", error);
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
  }, [searchQuery, statusFilter, activeTab]);

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        [
          application.form_id,
          application.filer_name,
          application.filer_mob,
          application.district,
          application.project,
          application.sector,
          application.awc_name,
          application.awc_center,
        ].some((value) => String(value || "").toLowerCase().includes(query));

      const status = normalizeStatus(application.status);
      const matchesTab =
        activeTab === "approved"
          ? isApprovedStatus(status)
          : activeTab === "completed"
            ? isCompletedStatus(status)
            : true;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "submitted" && ["final_submit", "submitted"].includes(status)) ||
        (statusFilter === "approved" && isApprovedStatus(status)) ||
        (statusFilter === "rejected" && isRejectedStatus(status));

      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [applications, searchQuery, statusFilter, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Group by the actual sector field first, then show each AWC/application
  // as its own row. This allows CDPOs to forward multiple applications from
  // the same sector independently.
  const completedGroups = useMemo(() => {
    const groups = new Map();
    filteredApplications.forEach((application) => {
      const sectorKey = String(application.sector || "Unassigned Sector").trim();
      if (!groups.has(sectorKey)) groups.set(sectorKey, []);
      groups.get(sectorKey).push(application);
    });
    return Array.from(groups.entries())
      .map(([sectorKey, items]) => ({
        sectorKey,
        items: [...items].sort((a, b) =>
          String(a.awc_name || a.awc_center || "").localeCompare(String(b.awc_name || b.awc_center || ""))
        ),
      }))
      .sort((a, b) => a.sectorKey.localeCompare(b.sectorKey));
  }, [filteredApplications]);

  const openDecision = (application, nextStatus) => {
    setApprovalApplication(application);
    setDecisionStatus(nextStatus);
    setRemark(application.remark || "");
    setActionMessage(null);
  };

  const updateApplicationStatus = async () => {
    const formId = String(approvalApplication?.form_id || "").trim();
    if (!formId) {
      setActionMessage({
        type: "danger",
        text: "Application Form ID is not available.",
      });
      return;
    }

    setUpdatingFormId(formId);
    setActionMessage(null);
    try {
      const response = await cookieFetch(APPLICATIONS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: formId,
          status: decisionStatus,
          remark: remark.trim(),
        }),
      });
      const payload = await readResponse(response);
      if (!response.ok || payload.success === false) {
        throw new Error(
          getErrorMessage(
            payload,
            `Application could not be ${decisionStatus} (HTTP ${response.status}).`
          )
        );
      }

      const returnedData = payload.data;
      const returnedRecord = Array.isArray(returnedData)
        ? returnedData.find((item) => String(item.form_id) === formId)
        : returnedData && typeof returnedData === "object"
          ? returnedData
          : null;

      setApplications((current) =>
        current.map((item) =>
          String(item.form_id) === formId
            ? {
                ...item,
                ...(returnedRecord || {}),
                form_id: formId,
                status: returnedRecord?.status || payload.status || decisionStatus,
                remark: returnedRecord?.remark ?? payload.remark ?? remark.trim(),
              }
            : item
        )
      );
      setSelectedApplication((current) =>
        current && String(current.form_id) === formId
          ? {
              ...current,
              ...(returnedRecord || {}),
              status: returnedRecord?.status || payload.status || decisionStatus,
              remark: returnedRecord?.remark ?? payload.remark ?? remark.trim(),
            }
          : current
      );
      setActionMessage({
        type: "primary",
        text: `Application ${formId} was ${decisionStatus} successfully.`,
      });
      setApprovalApplication(null);
    } catch (error) {
      console.error(`Failed to set application ${formId} to ${decisionStatus}:`, error);
      setActionMessage({
        type: "danger",
        text: error.message || `Application could not be ${decisionStatus}.`,
      });
    } finally {
      setUpdatingFormId("");
    }
  };

  const handlePrint = () => window.print();


  return (
    <div className="dashboard-container cdpo-anganwadi-dashboard">
      <CDPOLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="main-content-dash cdpo-anganwadi-main">
        <CDPOTopNav
          toggleSidebar={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
        />

        <main className="cdpo-anganwadi-page">
          <header className="cdpo-anganwadi-heading">
            <div className="cdpo-anganwadi-heading-copy">
              <span className="cdpo-anganwadi-eyebrow">
                Child Development Project Officer Panel
              </span>
              <h1>State-Level Anganwadi Worker Award</h1>
              <p>Year 2026-27</p>
            </div>
            <div className="cdpo-anganwadi-heading-mark" aria-hidden="true">
              <span>Anganwadi</span>
              <span className="cdpo-anganwadi-heading-year">2026–27</span>
            </div>
          </header>

          {actionMessage && (
            <Alert
              variant={actionMessage.type}
              dismissible
              onClose={() => setActionMessage(null)}
              className="cdpo-anganwadi-alert"
            >
              {actionMessage.text}
            </Alert>
          )}

          {loadError && (
            <Alert variant="danger" className="cdpo-anganwadi-alert">
              <div className="cdpo-anganwadi-error-row">
                <span>{loadError}</span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={fetchApplications}
                  disabled={loading}
                >
                  Retry
                </Button>
              </div>
            </Alert>
          )}

          <section className="cdpo-anganwadi-content">
            <div className="cdpo-anganwadi-list-heading">
              <div>
                <h2>Application List</h2>
                <p>
                  {projectName ? `Project: ${projectName} · ` : ""}
                  {loading
                    ? "Loading applications..."
                    : `Total applications: ${apiCount} · After filters: ${filteredApplications.length}`}
                </p>
              </div>
              <Button
                variant="outline-primary"
                onClick={fetchApplications}
                disabled={loading}
                className="cdpo-anganwadi-refresh"
              >
                {loading ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            <div className="cdpo-anganwadi-tabs" role="tablist" aria-label="Application views">
              <Button type="button" variant={activeTab === "all" ? "primary" : "outline-primary"} onClick={() => { setActiveTab("all"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "all"}>
                All Forms <span>{applications.length}</span>
              </Button>
              <Button type="button" variant={activeTab === "completed" ? "primary" : "outline-primary"} onClick={() => { setActiveTab("completed"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "completed"}>
                Completed Forms <span>{applications.filter((item) => isCompletedStatus(item.status)).length}</span>
              </Button>
              <Button type="button" variant={activeTab === "approved" ? "primary" : "outline-primary"} onClick={() => { setActiveTab("approved"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "approved"}>
                Approved BY CDPO <span>{applications.filter((item) => isApprovedStatus(item.status)).length}</span>
              </Button>
              <Button type="button" variant={activeTab === "report" ? "primary" : "outline-primary"} onClick={() => { setActiveTab("report"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "report"}>
                Report (All Forms) <span>{applications.length}</span>
              </Button>
            </div>

            <div className="cdpo-anganwadi-filters">
              <div className="cdpo-anganwadi-search">
                <FaSearch aria-hidden="true" />
                <Form.Control
                  type="search"
                  placeholder="Search Form ID, name, mobile, sector, or center..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  aria-label="Search applications"
                />
              </div>
              <Form.Group className="cdpo-anganwadi-status-filter">
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">All Applications</option>
                  <option value="submitted">Final Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="cdpo-anganwadi-table-wrap">
              <Table hover className={`cdpo-anganwadi-table ${activeTab === "report" ? "cdpo-anganwadi-report-table" : ""} ${activeTab === "completed" ? "cdpo-anganwadi-completed-table" : ""}`}>
                <thead>
                  {activeTab === "completed" ? (
                    <tr>
                      <th>Sector</th>
                      <th>Anganwadi Center</th>
                      <th>Candidate Name</th>
                      <th>Joining Date</th>
                      <th>Form ID</th>
                      <th>Remark</th>
                      <th>Merit / Total Marks</th>
                      <th>Actions</th>
                    </tr>
                  ) : activeTab === "report" ? (
                    <tr>
                      <th>क्रम संख्या</th>
                      <th>जनपद</th>
                      <th>परियोजना का नाम</th>
                      <th>केंद्र का नाम</th>
                      <th>Form ID</th>
                      <th>कार्यकर्त्री का नाम</th>
                      <th>कार्यकर्त्री मोबाइल नंबर</th>
                      <th>खाता संख्या</th>
                      <th>आईएफएससी कोड</th>
                      <th>बैंक का नाम</th>
                      <th>जन्म तिथि</th>
                      <th>आयु</th>
                      <th>शैक्षिक योग्यता</th>
                      <th>कार्यकर्त्री पद पर योगदान तिथि</th>
                      <th>विभाग से संबंधित कार्य का विवरण</th>
                      <th>विशेष उपलब्धि</th>
                      <th>परियोजना की टिप्पणियाँ</th>
                      <th>पुरस्कार हेतु प्राप्तांक (CDPO द्वारा प्रदत्त)</th>
                      <th>संबंधित आंगनवाड़ी केंद्र के बच्चों की प्रतिरक्षण दर राज्य स्तरीय दर से कम नहीं होने का प्रमाण-पत्र (हाँ/नहीं)</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>S.no</th>
                      <th>Status</th>
                      <th>Remark</th>
                      <th>Merit / Total Marks</th>
                      <th>Mobile No.</th>
                      <th>Form ID</th>
                      <th>Applicant Name</th>
                      <th>DOB</th>
                      <th>Father/Husband Name</th>
                      <th>Education Qualification</th>
                      <th>District</th>
                      <th>Project</th>
                      <th>AWC Name</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={activeTab === "completed" ? 8 : activeTab === "report" ? 19 : 15} className="cdpo-anganwadi-empty">
                        <Spinner animation="border" size="sm" /> Loading applications...
                      </td>
                    </tr>
                  ) : activeTab === "completed" ? completedGroups.length === 0 ? (
                    <tr><td colSpan={8} className="cdpo-anganwadi-empty">No completed applications found.</td></tr>
                  ) : completedGroups.map(({ sectorKey, items }) => items.map((application, index) => {
                    const formId = String(application.form_id || application.id || "");
                    const isUpdating = updatingFormId === formId;
                    const approved = isApprovedStatus(application.status);
                    const rejected = isRejectedStatus(application.status);
                    return (
                      <tr key={formId}>
                        {index === 0 && (
                          <td rowSpan={items.length} className="cdpo-anganwadi-sector-group-cell">
                            {displayValue(sectorKey)}
                          </td>
                        )}
                        <td>{displayValue(application.awc_name || application.awc_center)}</td>
                        <td>{displayValue(application.filer_name)}</td>
                        <td>{formatTableDate(application.joining_date)}</td>
                        <td className="cdpo-anganwadi-form-id">
                          <button type="button" className="cdpo-form-id-link" onClick={() => setSelectedApplication(application)} aria-label={`View application ${application.form_id}`}>
                            {displayValue(application.form_id)}
                          </button>
                        </td>
                        <td className="cdpo-anganwadi-remark-cell">{displayValue(application.remark)}</td>
                        <td><strong>Total Marks: {displayValue(getAnganwadiApplicationMerit(application))}</strong></td>
                        <td className="cdpo-anganwadi-row-actions-cell">
                          {approved ? (
                            <Badge bg="primary">Forwarded to DPO</Badge>
                          ) : rejected ? (
                            <Badge bg="danger">Rejected</Badge>
                          ) : (
                            <div className="cdpo-anganwadi-row-actions">
                              <Button size="sm" variant="info" disabled={isUpdating} onClick={() => openDecision(application, "approved")}>Forward to DPO</Button>
                              <Button size="sm" variant="outline-danger" disabled={isUpdating} onClick={() => openDecision(application, "rejected")}>Reject</Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })) : paginatedApplications.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === "report" ? 19 : 15} className="cdpo-anganwadi-empty">
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    paginatedApplications.map((application, index) => {
                      const status = String(application.status || "").toLowerCase();
                      const isUpdating = updatingFormId === String(application.form_id || "");
                      return (
                        <tr key={application.form_id || application.id}>
                          {activeTab === "report" ? (
                            <>
                              <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                              <td>{displayValue(application.district)}</td>
                              <td>{displayValue(application.project)}</td>
                              <td>{displayValue(application.awc_name || application.awc_center)}</td>
                              <td className="cdpo-anganwadi-form-id">
                                <button type="button" className="cdpo-form-id-link" onClick={() => setSelectedApplication(application)} aria-label={`View application ${application.form_id}`}>
                                  {displayValue(application.form_id)}
                                </button>
                              </td>
                              <td>{displayValue(application.filer_name)}</td>
                              <td>{displayValue(application.filer_mob)}</td>
                              <td>{displayValue(application.acc_no)}</td>
                              <td>{displayValue(application.acc_ifsc)}</td>
                              <td>{displayValue(application.bank_name)}</td>
                              <td>{formatTableDate(application.dob)}</td>
                              <td>{displayValue(application.age || calculateAgeFromDob(application.dob))}</td>
                              <td>{displayValue(application.edu_qual)}</td>
                              <td>{formatTableDate(application.joining_date)}</td>
                              <td>{displayValue(application.dept_work_detail)}</td>
                              <td>{displayValue(application.ach_work)}</td>
                              <td>{displayValue(application.remark)}</td>
                              <td>{displayValue(getAnganwadiApplicationMerit(application))}</td>
                              <td>{(application.aharta4 || application.immunization_certificate) ? "हाँ" : "नहीं"}</td>
                            </>
                          ) : (
                            <>
                              <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                              <td className="cdpo-anganwadi-status-cell"><Badge bg={getStatusVariant(status)}>{formatStatus(status)}</Badge></td>
                              <td className="cdpo-anganwadi-remark-cell">{displayValue(application.remark)}</td>
                              <td><strong>{displayValue(getAnganwadiApplicationMerit(application))}</strong></td>
                              <td>{displayValue(application.filer_mob)}</td>
                              <td className="cdpo-anganwadi-form-id">
                                <button type="button" className="cdpo-form-id-link" onClick={() => setSelectedApplication(application)} aria-label={`View application ${application.form_id}`}>
                                  {displayValue(application.form_id)}
                                </button>
                              </td>
                              <td>{displayValue(application.filer_name)}</td>
                              <td>{formatTableDate(application.dob)}</td>
                              <td>{displayValue(application.fath_husb_name)}</td>
                              <td>{displayValue(application.edu_qual)}</td>
                              <td>{displayValue(application.district)}</td>
                              <td>{displayValue(application.project)}</td>
                              <td>{displayValue(application.awc_name || application.awc_center)}</td>
                              <td>{formatTableDate(application.joining_date)}</td>
                              <td className="cdpo-anganwadi-actions-cell">
                                <div className="cdpo-anganwadi-row-actions">
                                  <Button size="sm" variant="outline-primary" onClick={() => setSelectedApplication(application)} aria-label={`${application.form_id} Application View`}><FaEye /> View</Button>

                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="cdpo-anganwadi-pagination">
                <span>
                  Page {currentPage} / {totalPages}
                </span>
                <div>
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
              </div>
            )}
          </section>
        </main>
      </div>

      <AnganwadiApplicationPreview
        application={selectedApplication}
        rolePrefix="cdpo"
        onClose={() => setSelectedApplication(null)}
        onPrint={handlePrint}
      >
        {selectedApplication &&
          !["approved", "rejected"].includes(String(selectedApplication.status || "").toLowerCase()) && (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  const application = selectedApplication;
                  setSelectedApplication(null);
                  openDecision(application, "approved");
                }}
              >
                <FaCheck className="me-2" /> Approve
              </Button>
              <Button variant="outline-danger" onClick={() => {
                const application = selectedApplication;
                setSelectedApplication(null);
                openDecision(application, "rejected");
              }}>
                <FaTimes className="me-2" /> Reject
              </Button>
            </>
          )}
      </AnganwadiApplicationPreview>

      <Modal
        show={Boolean(approvalApplication)}
        onHide={() => {
          if (!updatingFormId) setApprovalApplication(null);
        }}
        centered
        dialogClassName="cdpo-anganwadi-approval-dialog"
      >
        <Modal.Header closeButton={!updatingFormId}>
          <Modal.Title>{decisionStatus === "approved" ? "Approve Application" : "Reject Application"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Application <strong>{displayValue(approvalApplication?.form_id)}</strong>{" "}
            {decisionStatus === "approved" ? "Confirm approval of this application." : "Confirm rejection of this application."}
          </p>
          <Form.Group>
            <Form.Label>Remark</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              placeholder={decisionStatus === "approved" ? "Enter an approval remark" : "Enter the reason for rejection"}
              disabled={Boolean(updatingFormId)}
            />
          </Form.Group>
          <p className="cdpo-anganwadi-confirm-note">
            This will send status: {decisionStatus} and the entered remark to the API.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            disabled={Boolean(updatingFormId)}
            onClick={() => setApprovalApplication(null)}
          >
            Cancel
          </Button>
          <Button
            variant={decisionStatus === "approved" ? "success" : "danger"}
            disabled={Boolean(updatingFormId)}
            onClick={updateApplicationStatus}
          >
            {updatingFormId ? (
              <>
                <Spinner size="sm" animation="border" /> Processing...
              </>
            ) : (
              <>
                {decisionStatus === "approved" ? <><FaCheck /> Confirm and Approve</> : <><FaTimes /> Confirm and Reject</>}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CDPOAnganwadi2026_27;
