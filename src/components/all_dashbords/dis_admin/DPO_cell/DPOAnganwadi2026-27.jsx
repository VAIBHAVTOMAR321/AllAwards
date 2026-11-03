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
import DPOLeftNav from "./DPOLeftNav";
import DPOTopNav from "./DPOTopNav";
import "./DPODashboard.css";
import "./DPOAnganwadi2026-27.css";

const APPLICATIONS_URL =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/ang-puruskar-dpo-status/";
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

const normalizeStatus = (status) => String(status || "").trim().toLowerCase().replace(/[ -]+/g, "_");
const isDpoApproved = (status) => ["approved_by_dpo", "approved_dpo", "dpo_approved", "approved_by_district_programme_officer", "approved_by_district_program_officer"].includes(normalizeStatus(status));
const isDpoRejected = (status) => ["rejected_by_dpo", "rejected_dpo", "dpo_rejected", "rejected_by_district_programme_officer", "rejected_by_district_program_officer"].includes(normalizeStatus(status));
const isCdpoApproved = (status) => {
  const value = normalizeStatus(status);
  if (isDpoApproved(value) || isDpoRejected(value)) return false;
  return ["approved", "approved_by_cdpo", "cdpo_approved", "approved_by_project_officer", "approved_by_child_development_project_officer"].includes(value);
};
const formatStatus = (status) => {
  const value = normalizeStatus(status);
  if (value === "final_submit") return "Final Submitted";
  if (isDpoApproved(value)) return "Approved by DPO";
  if (isDpoRejected(value)) return "Rejected by DPO";
  if (isCdpoApproved(value)) return "Approved by CDPO";
  if (value.includes("reject")) return "Rejected";
  if (value.includes("approv")) return "Approved";
  if (value === "pending") return "Pending";
  return displayValue(status);
};

const DPOAnganwadi2026_27 = () => {
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
  const [selectedAwardBySector, setSelectedAwardBySector] = useState({});
  const [decisionStatus, setDecisionStatus] = useState("approved_by_dpo");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [approvalApplications, setApprovalApplications] = useState([]);
  const [remark, setRemark] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingSectorKey, setUpdatingSectorKey] = useState("");

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
      "dpo-anganwadi-modal-open",
      Boolean(selectedApplication || approvalApplications.length > 0)
    );
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedApplication(null);
        setApprovalApplications([]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("dpo-anganwadi-modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedApplication, approvalApplications]);

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
      setApplications(payload.data);
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
        activeTab === "cdpo-approved"
          ? (isCdpoApproved(status) || isDpoApproved(status))
          : activeTab === "dpo-approved"
            ? isDpoApproved(status)
            : true;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "submitted" && ["final_submit", "submitted", "completed"].includes(status)) ||
        (statusFilter === "approved" && (isCdpoApproved(status) || isDpoApproved(status))) ||
        (statusFilter === "rejected" && (status.includes("reject")));

      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [applications, searchQuery, statusFilter, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Group the CDPO-review table hierarchically: Project -> Sector -> AWC.
  // The approval lock applies to a project + sector pair, not just a sector label.
  const completedRows = useMemo(() => {
    const projectMap = new Map();

    filteredApplications.forEach((application) => {
      const projectName = String(application.project || "Unassigned Project").trim();
      const sectorName = String(application.sector || "Unassigned Sector").trim();
      const awcName = String(application.awc_name || application.awc_center || "Unassigned Center").trim();
      const sectorKey = JSON.stringify([projectName, sectorName]);

      if (!projectMap.has(projectName)) {
        projectMap.set(projectName, { projectName, sectors: new Map(), itemCount: 0 });
      }
      const project = projectMap.get(projectName);
      if (!project.sectors.has(sectorKey)) {
        project.sectors.set(sectorKey, {
          sectorKey,
          sectorName,
          awcs: new Map(),
          items: [],
          itemCount: 0,
        });
      }
      const sector = project.sectors.get(sectorKey);
      if (!sector.awcs.has(awcName)) sector.awcs.set(awcName, { awcName, items: [] });
      sector.awcs.get(awcName).items.push(application);
      sector.items.push(application);
      sector.itemCount += 1;
      project.itemCount += 1;
    });

    const rows = [];
    for (const project of projectMap.values()) {
      let firstProjectRow = true;
      for (const sector of project.sectors.values()) {
        const selectedFormIds = (selectedAwardBySector[sector.sectorKey] || []).slice();
        let firstSectorRow = true;

        for (const awc of sector.awcs.values()) {
          let firstAwcRow = true;
          for (const application of awc.items) {
            rows.push({
              application,
              projectName: project.projectName,
              sectorName: sector.sectorName,
              awcName: awc.awcName,
              sectorKey: sector.sectorKey,
              projectRowSpan: project.itemCount,
              sectorRowSpan: sector.itemCount,
              awcRowSpan: awc.items.length,
              showProject: firstProjectRow,
              showSector: firstSectorRow,
              showAwc: firstAwcRow,
              showSectorActions: firstSectorRow,
              selectedFormIds,
            });
            firstProjectRow = false;
            firstSectorRow = false;
            firstAwcRow = false;
          }
        }
      }
    }
    return rows;
  }, [filteredApplications, selectedAwardBySector]);

  const toggleSectorSelection = (sectorKey, formId) => {
    setSelectedAwardBySector((current) => {
      const selected = [...(current[sectorKey] || [])];
      const id = String(formId);
      const index = selected.indexOf(id);
      if (index >= 0) selected.splice(index, 1);
      else selected.push(id);
      return { ...current, [sectorKey]: selected };
    });
  };

  const submitSectorSelection = (sectorKey, nextStatus = "approved_by_dpo") => {
    const selectedFormIds = selectedAwardBySector[sectorKey] || [];
    const selected = completedRows
      .filter((row) => row.sectorKey === sectorKey && selectedFormIds.includes(String(row.application.form_id)))
      .map((row) => row.application);
    if (selected.length === 0) {
      setActionMessage({ type: "warning", text: "Please select at least one candidate for this sector first." });
      return;
    }
    if (selected.some((item) => isDpoApproved(item.status))) {
      setActionMessage({ type: "warning", text: "One or more selected candidates are already approved by DPO." });
      return;
    }
    setUpdatingSectorKey(sectorKey);
    openDecision(selected, nextStatus);
  };

  const openDecision = (applications, nextStatus) => {
    setApprovalApplications(Array.isArray(applications) ? applications : [applications]);
    setDecisionStatus(nextStatus);
    setRemark("");
    setActionMessage(null);
  };

  const updateApplicationStatus = async () => {
    if (approvalApplications.length === 0) {
      setActionMessage({ type: "danger", text: "No applications selected for forwarding." });
      return;
    }

    const formIds = approvalApplications.map((app) => String(app.form_id || "").trim());
    if (formIds.some((id) => !id)) {
      setActionMessage({ type: "danger", text: "Application Form ID is not available for one or more applications." });
      return;
    }

    setIsUpdating(true);
    setActionMessage(null);
    try {
      for (const formId of formIds) {
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
              `Application ${formId} could not be ${decisionStatus} (HTTP ${response.status}).`
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
      }

      setActionMessage({
        type: "primary",
        text: `${formIds.length} application(s) were ${decisionStatus} successfully.`,
      });
      setApprovalApplications([]);
    } catch (error) {
      console.error(`Failed to set applications to ${decisionStatus}:`, error);
      setActionMessage({
        type: "danger",
        text: error.message || `Applications could not be ${decisionStatus}.`,
      });
    } finally {
      setIsUpdating(false);
      setUpdatingSectorKey("");
    }
  };

  const handlePrint = () => window.print();


  return (
    <div className="dashboard-container dpo-anganwadi-dashboard">
      <DPOLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="main-content-dash dpo-anganwadi-main">
        <DPOTopNav
          toggleSidebar={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
        />

        <main className="dpo-anganwadi-page">
          <header className="dpo-anganwadi-heading">
            <div className="dpo-anganwadi-heading-copy">
              <span className="dpo-anganwadi-eyebrow">
                District Programme Officer Panel
              </span>
              <h1>District-Level Anganwadi Worker Award Verification</h1>
              <p>Year 2026-27</p>
            </div>
            <div className="dpo-anganwadi-heading-mark" aria-hidden="true">
              <span>Anganwadi</span>
              <span className="dpo-anganwadi-heading-year">2026–27</span>
            </div>
          </header>

          {actionMessage && (
            <Alert
              variant={actionMessage.type}
              dismissible
              onClose={() => setActionMessage(null)}
              className="dpo-anganwadi-alert"
            >
              {actionMessage.text}
            </Alert>
          )}

          {loadError && (
            <Alert variant="danger" className="dpo-anganwadi-alert">
              <div className="dpo-anganwadi-error-row">
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

          <section className="dpo-anganwadi-content">
            <div className="dpo-anganwadi-list-heading">
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
                className="dpo-anganwadi-refresh"
              >
                {loading ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            <div className="dpo-anganwadi-tabs" role="tablist" aria-label="Application views">
              <Button type="button" variant={activeTab === "all" ? "primary" : "outline-primary"} onClick={() => { setActiveTab("all"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "all"}>
                All Forms <span>{applications.length}</span>
              </Button>
              <Button type="button" variant={activeTab === "cdpo-approved" ? "primary" : "outline-primary"} onClick={() => { setActiveTab("cdpo-approved"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "cdpo-approved"}>
                Approved by CDPO <span>{applications.filter((item) => isCdpoApproved(item.status) || isDpoApproved(item.status)).length}</span>
              </Button>
              <Button type="button" variant={activeTab === "dpo-approved" ? "primary" : "outline-primary"} onClick={() => { setActiveTab("dpo-approved"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "dpo-approved"}>
                Approved by DPO <span>{applications.filter((item) => isDpoApproved(item.status)).length}</span>
              </Button>
              <Button type="button" variant={activeTab === "report" ? "primary" : "outline-primary"} onClick={() => { setActiveTab("report"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "report"}>
                Report (All Forms) <span>{applications.length}</span>
              </Button>
            </div>

            <div className="dpo-anganwadi-filters">
              <div className="dpo-anganwadi-search">
                <FaSearch aria-hidden="true" />
                <Form.Control
                  type="search"
                  placeholder="Search Form ID, name, mobile, sector, or center..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  aria-label="Search applications"
                />
              </div>
              <Form.Group className="dpo-anganwadi-status-filter">
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">All Applications</option>
                  <option value="submitted">Final Submitted</option>
                  <option value="approved">Approved by CDPO / DPO</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="dpo-anganwadi-table-wrap">
              <Table hover className={`dpo-anganwadi-table ${activeTab === "report" ? "dpo-anganwadi-report-table" : ""} ${activeTab === "cdpo-approved" ? "dpo-anganwadi-completed-table" : ""}`}>
                <thead>
                  {activeTab === "cdpo-approved" ? (
                    <tr>
                      <th>Project</th>
                      <th>Sector</th>
                      <th>Anganwadi Center</th>
                      <th>Candidate name</th>
                      <th>Joining Date</th>
                      <th>Form ID</th>
                      <th>Remark</th>
                      <th>Merit</th>
                      <th>Choose for AWARD</th>
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
                      <th>पुरस्कार हेतु प्राप्तांक (DPO द्वारा प्रदत्त)</th>
                      <th>संबंधित आंगनवाड़ी केंद्र के बच्चों की प्रतिरक्षण दर राज्य स्तरीय दर से कम नहीं होने का प्रमाण-पत्र (हाँ/नहीं)</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>S.no</th>
                      <th>Status</th>
                      <th>Remark</th>
                      <th>Merit</th>
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
                      <td colSpan={activeTab === "cdpo-approved" ? 10 : activeTab === "report" ? 19 : 15} className="dpo-anganwadi-empty">
                        <Spinner animation="border" size="sm" /> Loading applications...
                      </td>
                    </tr>
                  ) : activeTab === "cdpo-approved" ? completedRows.length === 0 ? (
                    <tr><td colSpan={10} className="dpo-anganwadi-empty">No applications approved by CDPO or already approved by DPO are available for verification.</td></tr>
                  ) : completedRows.map((row) => {
                    const { application, projectName, sectorName, awcName, sectorKey, projectRowSpan, sectorRowSpan, awcRowSpan, showProject, showSector, showAwc, showSectorActions, selectedFormIds } = row;
                    const isUpdating = updatingSectorKey === sectorKey;
                    const isSelected = selectedFormIds.includes(String(application.form_id || ""));
                    const isAlreadyApproved = isDpoApproved(application.status);
                    return (
                      <tr key={application.form_id || application.id}>
                        {showProject && <td rowSpan={projectRowSpan}>{displayValue(projectName)}</td>}
                        {showSector && <td rowSpan={sectorRowSpan}>{displayValue(sectorName)}</td>}
                        {showAwc && <td rowSpan={awcRowSpan}>{displayValue(awcName)}</td>}
                        <td>{displayValue(application.filer_name)}</td>
                        <td>{formatTableDate(application.joining_date)}</td>
                        <td className="dpo-anganwadi-form-id">
                          <button type="button" className="dpo-form-id-link" onClick={() => setSelectedApplication(application)} aria-label={`View application ${application.form_id}`}>
                            {displayValue(application.form_id)}
                          </button>
                        </td>
                        <td className="dpo-anganwadi-remark-cell">{displayValue(application.remark)}</td>
                        <td><strong>Total Marks: {displayValue(application.merit)}</strong></td>
                        <td className="dpo-anganwadi-select-cell">
                          <Form.Check
                            type="checkbox"
                            name={`award-sector-${sectorKey}`}
                            checked={isSelected}
                            disabled={isAlreadyApproved}
                            onChange={() => toggleSectorSelection(sectorKey, application.form_id)}
                            aria-label={`Choose ${application.filer_name} for award in ${sectorName}`}
                          />
                        </td>
                        {showSectorActions && (
                          <td className="dpo-anganwadi-sector-actions" rowSpan={sectorRowSpan}>
                            <div className="dpo-anganwadi-sector-action-buttons">
                              <>
                                <Button size="sm" variant="info" disabled={isUpdating} onClick={() => submitSectorSelection(sectorKey, "approved_by_dpo")}>Submit</Button>
                                <Button size="sm" variant="outline-danger" disabled={isUpdating} onClick={() => submitSectorSelection(sectorKey, "rejected_by_dpo")}>Reject Selected</Button>
                              </>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  }) : paginatedApplications.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === "report" ? 19 : 15} className="dpo-anganwadi-empty">
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    paginatedApplications.map((application, index) => {
                      const status = String(application.status || "").toLowerCase();
                      return (
                        <tr key={application.form_id || application.id}>
                          {activeTab === "report" ? (
                            <>
                              <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                              <td>{displayValue(application.district)}</td>
                              <td>{displayValue(application.project)}</td>
                              <td>{displayValue(application.awc_name || application.awc_center)}</td>
                              <td className="dpo-anganwadi-form-id">
                                <button type="button" className="dpo-form-id-link" onClick={() => setSelectedApplication(application)} aria-label={`View application ${application.form_id}`}>
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
                              <td>{displayValue(application.merit)}</td>
                              <td>{(application.aharta4 || application.immunization_certificate) ? "हाँ" : "नहीं"}</td>
                            </>
                          ) : (
                            <>
                              <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                              <td className="dpo-anganwadi-status-cell"><Badge bg={getStatusVariant(status)}>{formatStatus(status)}</Badge></td>
                              <td className="dpo-anganwadi-remark-cell">{displayValue(application.remark)}</td>
                              <td><strong>{displayValue(application.merit)}</strong></td>
                              <td>{displayValue(application.filer_mob)}</td>
                              <td className="dpo-anganwadi-form-id">
                                <button type="button" className="dpo-form-id-link" onClick={() => setSelectedApplication(application)} aria-label={`View application ${application.form_id}`}>
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
                              <td className="dpo-anganwadi-actions-cell">
                                <div className="dpo-anganwadi-row-actions">
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
              <div className="dpo-anganwadi-pagination">
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
        rolePrefix="dpo"
        formatStatus={formatStatus}
        merit={selectedApplication?.merit}
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
                  openDecision([application], "approved");
                }}
              >
                <FaCheck className="me-2" /> Approve
              </Button>
              <Button variant="outline-danger" onClick={() => {
                const application = selectedApplication;
                setSelectedApplication(null);
                openDecision([application], "rejected");
              }}>
                <FaTimes className="me-2" /> Reject
              </Button>
            </>
          )}
      </AnganwadiApplicationPreview>

      <Modal
        show={approvalApplications.length > 0}
        onHide={() => {
          if (!isUpdating) setApprovalApplications([]);
        }}
        centered
        dialogClassName="dpo-anganwadi-approval-dialog"
      >
        <Modal.Header closeButton={!isUpdating}>
          <Modal.Title>{decisionStatus === "approved_by_dpo" ? "Approve Applications" : "Reject Applications"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Confirm {decisionStatus === "approved_by_dpo" ? "approval" : "rejection"} of{" "}
            <strong>{approvalApplications.length}</strong> application(s):{" "}
            {approvalApplications.map((app) => <span key={app.form_id}>{displayValue(app.form_id)}</span>).join(", ")}
          </p>
          <Form.Group>
            <Form.Label>Remark</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              placeholder={decisionStatus === "approved_by_dpo" ? "Enter an approval remark" : "Enter the reason for rejection"}
              disabled={isUpdating}
            />
          </Form.Group>
          <p className="dpo-anganwadi-confirm-note">
            This will send status: {decisionStatus} and the entered remark to the DPO status API for each selected application.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            disabled={isUpdating}
            onClick={() => setApprovalApplications([])}
          >
            Cancel
          </Button>
          <Button
            variant={decisionStatus === "approved_by_dpo" ? "primary" : "danger"}
            disabled={isUpdating || approvalApplications.length === 0}
            onClick={updateApplicationStatus}
          >
            {isUpdating ? (
              <>
                <Spinner size="sm" animation="border" /> Processing...
              </>
            ) : (
              <>
                {decisionStatus === "approved_by_dpo" ? <><FaCheck /> Confirm and Approve All</> : <><FaTimes /> Confirm and Reject All</>}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DPOAnganwadi2026_27;
