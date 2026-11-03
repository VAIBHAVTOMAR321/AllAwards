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
import { cookieFetch } from "../../login/AuthContext";
import DisLeftnav from "./DisLeftnav";
import DisTopNav from "./DisTopNav";
import AnganwadiApplicationPreview from "./AnganwadiApplicationPreview";
import { getAnganwadiApplicationMerit } from "./anganwadiApplicationMetrics";
import "./DPO_cell/DPODashboard.css";
import "./DirectorAnganwadi2026-27.css";

const APPLICATIONS_URL =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/ang-puruskar/itcell/director/status/";
const DISTRICTS_URL =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/districts/list/";
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
    return "success";
  }
  if (normalized.includes("reject")) return "danger";
  if (normalized === "final_submit") return "primary";
  return "warning";
};

const normalizeStatus = (status) => String(status || "").trim().toLowerCase().replace(/[ -]+/g, "_");
const isDpoApproved = (status) => ["approved_by_dpo", "approved_dpo", "dpo_approved", "approved_by_district_programme_officer", "approved_by_district_program_officer"].includes(normalizeStatus(status));
const isDpoRejected = (status) => ["rejected_by_dpo", "rejected_dpo", "dpo_rejected", "rejected_by_district_programme_officer", "rejected_by_district_program_officer"].includes(normalizeStatus(status));
const isDirectorApproved = (status) => {
  const value = normalizeStatus(status);
  return ["approved", "approved_by_director", "director_approved", "approved_by_directorate", "approved_by_state"].includes(value);
};
const isDirectorRejected = (status) => {
  const value = normalizeStatus(status);
  return ["rejected_by_director", "director_rejected", "rejected_by_directorate", "rejected_by_state"].includes(value);
};
const isCdpoApproved = (status) => {
  const value = normalizeStatus(status);
  if (isDpoApproved(value) || isDpoRejected(value) || isDirectorApproved(value) || isDirectorRejected(value)) return false;
  return ["approved", "approved_by_cdpo", "cdpo_approved", "approved_by_project_officer", "approved_by_child_development_project_officer"].includes(value);
};
const formatStatus = (status) => {
  const value = normalizeStatus(status);
  if (value === "final_submit") return "Final Submitted";
  if (isDirectorApproved(value)) return "Approved by Directorate";
  if (isDirectorRejected(value)) return "Rejected by Directorate";
  if (isDpoApproved(value)) return "Approved by DPO";
  if (isDpoRejected(value)) return "Rejected by DPO";
  if (isCdpoApproved(value)) return "Approved by CDPO";
  if (value.includes("reject")) return "Rejected";
  if (value.includes("approv")) return "Approved";
  if (value === "pending") return "Pending";
  return displayValue(status);
};

const DirectorAnganwadi2026_27 = () => {
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
  const [decisionStatus, setDecisionStatus] = useState("approved");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [approvalApplication, setApprovalApplication] = useState(null);
  const [remark, setRemark] = useState("");
  const [updatingFormId, setUpdatingFormId] = useState("");

  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(true);
  const [districtsError, setDistrictsError] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

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
      "director-anganwadi-modal-open",
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
      document.body.classList.remove("director-anganwadi-modal-open");
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

  const fetchDistricts = useCallback(async () => {
    setDistrictsLoading(true);
    setDistrictsError("");
    try {
      const response = await cookieFetch(DISTRICTS_URL, { method: "GET" });
      const payload = await readResponse(response);
      if (!response.ok || payload.success === false) {
        throw new Error(
          getErrorMessage(
            payload,
            `Failed to load districts (HTTP ${response.status}).`
          )
        );
      }
      const data = Array.isArray(payload.data) ? payload.data : payload.districts || [];
      setDistricts(data);
    } catch (error) {
      console.error("Failed to load districts:", error);
      setDistrictsError(error.message || "Failed to load districts.");
    } finally {
      setDistrictsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activeTab, selectedDistrict]);

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
        activeTab === "dpo-approved"
          // Keep Directorate-approved applications visible in this tab too, so
          // the chosen AWC/candidate remains visible and locked after approval.
          ? (isDpoApproved(status) || isDirectorApproved(status)) && !isDirectorRejected(status)
          : activeTab === "director-approved"
            ? isDirectorApproved(status)
            : true;
      const matchesDistrict =
        !selectedDistrict ||
        String(application.district || "").trim().toLowerCase() ===
          selectedDistrict.trim().toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "submitted" && ["final_submit", "submitted", "completed"].includes(status)) ||
        (statusFilter === "approved" && (isCdpoApproved(status) || isDpoApproved(status) || isDirectorApproved(status))) ||
        (statusFilter === "rejected" && (status.includes("reject")));

      return matchesSearch && matchesStatus && matchesTab && matchesDistrict;
    });
  }, [applications, searchQuery, statusFilter, activeTab, selectedDistrict]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Count of DPO-approved applications per district (DPO approved tab scope).
  const districtCounts = useMemo(() => {
    const counts = new Map();
    districts.forEach(({ district }) => counts.set(String(district || "").trim(), 0));
    applications.forEach((application) => {
      if (isDpoApproved(application.status)) {
        const district = String(application.district || "").trim();
        counts.set(district, (counts.get(district) || 0) + 1);
      }
    });
    return counts;
  }, [applications, districts]);

  // Directorate review table hierarchy: District -> Project -> Sector -> Anganwadi Center.
  // One candidate can be approved for each district/project/sector combination.
  const completedRows = useMemo(() => {
    const districtMap = new Map();
    const ordered = [...filteredApplications].sort((a, b) =>
      [a.district, a.project, a.sector, a.awc_name, a.filer_name]
        .map((v) => String(v || "").toLocaleLowerCase())
        .join("|").localeCompare(
          [b.district, b.project, b.sector, b.awc_name, b.filer_name]
            .map((v) => String(v || "").toLocaleLowerCase()).join("|")
        )
    );
    for (const application of ordered) {
      const districtName = String(application.district || "Unassigned District").trim();
      const projectName = String(application.project || "Unassigned Project").trim();
      const sectorName = String(application.sector || "Unassigned Sector").trim();
      const awcName = String(application.awc_name || application.awc_center || "Unassigned Center").trim();
      const projectKey = JSON.stringify([districtName, projectName]);
      const sectorKey = JSON.stringify([districtName, projectName, sectorName]);
      if (!districtMap.has(districtName)) districtMap.set(districtName, { districtName, projects: new Map(), itemCount: 0 });
      const district = districtMap.get(districtName);
      if (!district.projects.has(projectKey)) district.projects.set(projectKey, { projectKey, projectName, districtName, sectors: new Map(), itemCount: 0 });
      const project = district.projects.get(projectKey);
      if (!project.sectors.has(sectorKey)) project.sectors.set(sectorKey, { sectorKey, sectorName, awcs: new Map(), items: [], itemCount: 0 });
      const sector = project.sectors.get(sectorKey);
      if (!sector.awcs.has(awcName)) sector.awcs.set(awcName, { awcName, items: [] });
      sector.awcs.get(awcName).items.push(application);
      sector.items.push(application);
      sector.itemCount += 1;
      project.itemCount += 1;
      district.itemCount += 1;
    }
    const rows = [];
    for (const district of districtMap.values()) {
      let firstDistrictRow = true;
      for (const project of district.projects.values()) {
        let firstProjectRow = true;
        for (const sector of project.sectors.values()) {
          const approvedForSector = applications.find((item) =>
            String(item.district || "Unassigned District").trim() === district.districtName &&
            String(item.project || "Unassigned Project").trim() === project.projectName &&
            String(item.sector || "Unassigned Sector").trim() === sector.sectorName &&
            isDirectorApproved(item.status)
          );
          const sectorAlreadyApproved = Boolean(approvedForSector);
          const selectedId = approvedForSector?.form_id || selectedAwardBySector[sector.sectorKey] || "";
          let firstSectorRow = true;
          for (const awc of sector.awcs.values()) {
            let firstAwcRow = true;
            for (const application of awc.items) {
              rows.push({ application, districtName: district.districtName, projectName: project.projectName,
                sectorName: sector.sectorName, awcName: awc.awcName, sectorKey: sector.sectorKey,
                districtRowSpan: district.itemCount, projectRowSpan: project.itemCount,
                sectorRowSpan: sector.itemCount, awcRowSpan: awc.items.length,
                showDistrict: firstDistrictRow, showProject: firstProjectRow, showSector: firstSectorRow,
                showAwc: firstAwcRow, showSectorActions: firstSectorRow, sectorAlreadyApproved,
                selectedId, selectedFormId: selectedAwardBySector[sector.sectorKey] || approvedForSector?.form_id || "" });
              firstDistrictRow = false; firstProjectRow = false; firstSectorRow = false; firstAwcRow = false;
            }
          }
        }
      }
    }
    return rows;
  }, [filteredApplications, applications, selectedAwardBySector]);

  const submitSectorSelection = (sectorKey, nextStatus = "approved") => {
    const selectedFormId = selectedAwardBySector[sectorKey];
    const selected = completedRows.find((row) => row.sectorKey === sectorKey && String(row.application.form_id) === String(selectedFormId))?.application;
    if (!selected) {
      setActionMessage({ type: "warning", text: "Please select one candidate for this sector first." });
      return;
    }
    if (applications.some((item) =>
      String(item.district || "Unassigned District").trim() === JSON.parse(sectorKey)[0] &&
      String(item.project || "Unassigned Project").trim() === JSON.parse(sectorKey)[1] &&
      String(item.sector || "Unassigned Sector").trim() === JSON.parse(sectorKey)[2] &&
      isDirectorApproved(item.status)
    )) {
      setActionMessage({ type: "warning", text: "A candidate has already been approved by the Directorate for this district, project and sector." });
      return;
    }
    openDecision(selected, nextStatus);
  };

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
        type: "success",
        text: `Application ${formId} was ${decisionStatus === "approved" ? "approved by Directorate" : "rejected by Directorate"} successfully.`,
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
    <div className="dashboard-container director-anganwadi-dashboard">
      <DisLeftnav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="main-content-dash director-anganwadi-main">
        <DisTopNav
          toggleSidebar={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
        />

        <main className="director-anganwadi-page">
          <header className="director-anganwadi-heading">
            <div className="director-anganwadi-heading-copy">
              <span className="director-anganwadi-eyebrow">
                Directorate Panel
              </span>
              <h1>State-Level Anganwadi Worker Award Selection</h1>
              <p>Year 2026-27</p>
            </div>
            <div className="director-anganwadi-heading-mark" aria-hidden="true">
              <span>Anganwadi</span>
              <span className="director-anganwadi-heading-year">2026–27</span>
            </div>
          </header>

          {actionMessage && (
            <Alert
              variant={actionMessage.type}
              dismissible
              onClose={() => setActionMessage(null)}
              className="director-anganwadi-alert"
            >
              {actionMessage.text}
            </Alert>
          )}

          {loadError && (
            <Alert variant="danger" className="director-anganwadi-alert">
              <div className="director-anganwadi-error-row">
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

          {districtsError && (
            <Alert variant="danger" className="director-anganwadi-alert">
              <div className="director-anganwadi-error-row">
                <span>{districtsError}</span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={fetchDistricts}
                  disabled={districtsLoading}
                >
                  Retry
                </Button>
              </div>
            </Alert>
          )}
          {!districtsLoading && districts.length > 0 && (
            <div className="director-anganwadi-table-wrap">
              <Table hover className="director-anganwadi-table director-anganwadi-district-table">
                <thead>
                  <tr>
                    <th>District</th>
                    {districts.map(({ district }) => (
                      <th key={district}>{district}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>DPO-approved applications</td>
                    {districts.map(({ district }) => {
                      const count = districtCounts.get(String(district || "").trim()) || 0;
                      const isActive = selectedDistrict.trim().toLowerCase() === String(district || "").trim().toLowerCase();
                      return (
                        <td
                          key={district}
                          className={`director-anganwadi-district-count${isActive ? " director-anganwadi-district-active" : ""}`}
                          onClick={() => {
                            setSelectedDistrict(district);
                            setActiveTab("dpo-approved");
                            setSearchQuery("");
                            setStatusFilter("all");
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedDistrict(district);
                              setActiveTab("dpo-approved");
                              setSearchQuery("");
                              setStatusFilter("all");
                            }
                          }}
                          title={`View ${count} DPO-approved application(s) in ${district}`}
                        >
                          <span className="district-count-value">{count}</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </Table>
            </div>
          )}

          <section className="director-anganwadi-content">
            <div className="director-anganwadi-list-heading">
              <div>
                <h2>Application List</h2>
                <p>
                  {projectName ? `Project: ${projectName} · ` : ""}
                  {loading
                    ? "Loading applications..."
                    : `Total applications: ${apiCount} · After filters: ${filteredApplications.length}`}
                </p>
                {selectedDistrict && (
                  <div className="director-anganwadi-active-district">
                    <strong>District:</strong> {selectedDistrict}{" "}
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => {
                        setSelectedDistrict("");
                        setActiveTab("all");
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              <Button
                variant="outline-success"
                onClick={fetchApplications}
                disabled={loading}
                className="director-anganwadi-refresh"
              >
                {loading ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            <div className="director-anganwadi-tabs" role="tablist" aria-label="Application views">
              <Button type="button" variant={activeTab === "all" ? "success" : "outline-success"} onClick={() => { setActiveTab("all"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "all"}>
                All Forms <span>{applications.length}</span>
              </Button>
              <Button type="button" variant={activeTab === "dpo-approved" ? "success" : "outline-success"} onClick={() => { setActiveTab("dpo-approved"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "dpo-approved"}>
                Approved by DPO <span>{applications.filter((item) => (isDpoApproved(item.status) || isDirectorApproved(item.status)) && !isDirectorRejected(item.status)).length}</span>
              </Button>
              <Button type="button" variant={activeTab === "director-approved" ? "success" : "outline-success"} onClick={() => { setActiveTab("director-approved"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "director-approved"}>
                Approved by Directorate <span>{applications.filter((item) => isDirectorApproved(item.status)).length}</span>
              </Button>
              <Button type="button" variant={activeTab === "report" ? "success" : "outline-success"} onClick={() => { setActiveTab("report"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "report"}>
                Report <span>{applications.length}</span>
              </Button>
            </div>

            <div className="director-anganwadi-filters">
              <div className="director-anganwadi-search">
                <FaSearch aria-hidden="true" />
                <Form.Control
                  type="search"
                  placeholder="Search Form ID, name, mobile, sector, or center..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  aria-label="Search applications"
                />
              </div>
              <Form.Group className="director-anganwadi-status-filter">
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

            <div className="director-anganwadi-table-wrap">
              <Table hover className={`director-anganwadi-table ${activeTab === "report" ? "director-anganwadi-report-table" : ""} ${activeTab === "dpo-approved" ? "director-anganwadi-completed-table" : ""}`}>
                <thead>
                  {activeTab === "dpo-approved" ? (
                    <tr>
                      <th>District</th>
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
                      <th>Merit Marks (Directorate)</th>
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
                      <td colSpan={activeTab === "dpo-approved" ? 11 : activeTab === "report" ? 19 : 15} className="director-anganwadi-empty">
                        <Spinner animation="border" size="sm" /> Loading applications...
                      </td>
                    </tr>
                  ) : activeTab === "dpo-approved" ? completedRows.length === 0 ? (
                    <tr><td colSpan={11} className="director-anganwadi-empty">No applications approved by DPO are available for Directorate verification.</td></tr>
                  ) : completedRows.map((row) => {
                    const { application, districtName, projectName, sectorName, awcName, sectorKey, districtRowSpan, projectRowSpan, sectorRowSpan, awcRowSpan, showDistrict, showProject, showSector, showAwc, showSectorActions, sectorAlreadyApproved, selectedId, selectedFormId } = row;
                    const isUpdating = updatingFormId === String(selectedFormId || "");
                    return (
                      <tr key={application.form_id || application.id}>
                        {showDistrict && <td rowSpan={districtRowSpan}>{displayValue(districtName)}</td>}
                        {showProject && <td rowSpan={projectRowSpan}>{displayValue(projectName)}</td>}
                        {showSector && <td rowSpan={sectorRowSpan}>{displayValue(sectorName)}</td>}
                        {showAwc && <td rowSpan={awcRowSpan}>{displayValue(awcName)}</td>}
                        <td>{displayValue(application.filer_name)}</td>
                        <td>{formatTableDate(application.joining_date)}</td>
                        <td className="director-anganwadi-form-id">
                          <button type="button" className="director-form-id-link" onClick={() => setSelectedApplication(application)} aria-label={`View application ${application.form_id}`}>
                            {displayValue(application.form_id)}
                          </button>
                        </td>
                        <td className="director-anganwadi-remark-cell">{displayValue(application.remark)}</td>
                        <td><strong>Total Marks: {displayValue(getAnganwadiApplicationMerit(application))}</strong></td>
                        <td className="director-anganwadi-select-cell">
                          <Form.Check
                            type="radio"
                            name={`award-sector-${sectorKey}`}
                            checked={String(selectedId) === String(application.form_id)}
                            disabled={sectorAlreadyApproved}
                            onChange={() => setSelectedAwardBySector((current) => ({ ...current, [sectorKey]: application.form_id }))}
                            aria-label={`Choose ${application.filer_name} for award in ${sectorName}`}
                          />
                        </td>
                        {showSectorActions && (
                          <td className="director-anganwadi-sector-actions" rowSpan={sectorRowSpan}>
                            <div className="director-anganwadi-sector-action-buttons">
                              {sectorAlreadyApproved ? (
                                <Badge bg="primary">Award Already Approved by Directorate</Badge>
                              ) : (
                                <>
                                  <Button size="sm" variant="primary" disabled={isUpdating} onClick={() => submitSectorSelection(sectorKey, "approved")}>Approve Selected</Button>
                                  <Button size="sm" variant="outline-danger" disabled={isUpdating} onClick={() => submitSectorSelection(sectorKey, "rejected_by_director")}>Reject Selected</Button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  }) : paginatedApplications.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === "report" ? 19 : 15} className="director-anganwadi-empty">
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
                              <td className="director-anganwadi-form-id">
                                <button type="button" className="director-form-id-link" onClick={() => setSelectedApplication(application)} aria-label={`View application ${application.form_id}`}>
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
                              <td className="director-anganwadi-status-cell"><Badge bg={getStatusVariant(status)}>{formatStatus(status)}</Badge></td>
                              <td className="director-anganwadi-remark-cell">{displayValue(application.remark)}</td>
                              <td><strong>{displayValue(getAnganwadiApplicationMerit(application))}</strong></td>
                              <td>{displayValue(application.filer_mob)}</td>
                              <td className="director-anganwadi-form-id">
                                <button type="button" className="director-form-id-link" onClick={() => setSelectedApplication(application)} aria-label={`View application ${application.form_id}`}>
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
                              <td className="director-anganwadi-actions-cell">
                                <div className="director-anganwadi-row-actions">
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
              <div className="director-anganwadi-pagination">
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
        rolePrefix="director"
        onClose={() => setSelectedApplication(null)}
        onPrint={handlePrint}
      />

      <Modal
        show={Boolean(approvalApplication)}
        onHide={() => {
          if (!updatingFormId) setApprovalApplication(null);
        }}
        centered
        dialogClassName="director-anganwadi-approval-dialog"
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
          <p className="director-anganwadi-confirm-note">
            This will send status: {decisionStatus} and the entered remark to the Directorate API.
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

export default DirectorAnganwadi2026_27;
