import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Table, Badge, Form, Modal, Button } from "react-bootstrap";
import { FaCogs, FaProjectDiagram, FaBoxOpen, FaServer, FaCube, FaUserGraduate, FaCheckCircle, FaSpinner, FaSearch, FaEye, FaIdCard, FaFileAlt, FaFilePdf, FaFileExcel, FaHourglassHalf, FaPaperclip, FaCheck, FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ITCellTopNav from "./ITCellTopNav";
import ITCellLeftNav from "./ITCellLeftNav";
import PreviewModal from "../../../child_regis/NominationForm/PreviewModal";
import { exportDashboardExcel, exportDashboardPdf } from "../../../../utils/itCellReportExport";
import { formatSubmissionDateTime, resolveSubmissionTimestampFromSteps } from "../../../../utils/submissionDate";

const RECOMMENDATION_URL =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/recommended-application/";

const MEDIA_BASE_URL =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend";

const SITE_ORIGIN = "https://wecdukaward.in";

// Directory the backend stores recommendation uploads in.
const RECOMMENDATION_MEDIA_DIR = "media/bravery/recommended_application";

const joinMediaPath = (path) => {
  const withoutLeadingSlash = path.replace(/^\/+/, "");

  if (withoutLeadingSlash.startsWith("balvirtaawardproject/")) {
    return `${SITE_ORIGIN}/${withoutLeadingSlash}`;
  }

  if (withoutLeadingSlash.startsWith("media/")) {
    return `${MEDIA_BASE_URL}/${withoutLeadingSlash}`;
  }

  if (withoutLeadingSlash.startsWith("bravery/")) {
    return `${MEDIA_BASE_URL}/media/${withoutLeadingSlash}`;
  }

  if (!withoutLeadingSlash.includes("/")) {
    return `${MEDIA_BASE_URL}/${RECOMMENDATION_MEDIA_DIR}/${withoutLeadingSlash}`;
  }

  return `${MEDIA_BASE_URL}/${withoutLeadingSlash}`;
};

const getFileSrc = (file) => {
  if (!file) return null;
  const trimmed = String(file).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const isOurSite = url.hostname.toLowerCase() === "wecdukaward.in";
      if (
        isOurSite &&
        !url.pathname.replace(/^\/+/, "").startsWith("balvirtaawardproject/")
      ) {
        return joinMediaPath(url.pathname);
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  return joinMediaPath(trimmed);
};

const mapApiDataToPreviewData = (item, isApplicationCompleted = false) => {
  if (!item) return null;
  const s1 = item["step-1"] || {};
  const s2 = item["step-2"] || {};
  const s3 = item["step-3"] || {};
  const s4 = item["step-4"] || {};
  const s5 = item["step-5"] || {};

  return {
    applicant_id: item.applicant_id || s1.applicant_id || "",
    registration: item.registration || item.nomination || item,
    // Step 1: Personal Details (from step-1 only, no nomination)
    childName: s1.child_full_name || "",
    fatherName: s1.father_name || "",
    motherName: s1.mother_name || "",
    guardianName: s1.guardian_name || "",
    birthDate: s1.date_of_birth || "",
    gender: s1.gender || "",
    resident: s1.permanent_resident_uttarakhand || "",
    residence_certificate_number: s1.residence_certificate_number || "",
    childMobile: s1.child_guardian_mobile || "",

    // Bank Details (nominator part-2)
    bankAccountHolderType: s2.bank_nominee_relation || s1.bank_nominee_relation || "",
    bankAccountHolderName: s2.bank_holder_name || s1.bank_holder_name || "",
    bankName: s2.bank_name || s1.bank_name || "",
    ifscCode: s2.ifsc_code || s1.ifsc_code || "",
    bankAccountNumber: s2.bank_acc_no || s1.bank_acc_no || "",

    schoolName: s1.school_name || "",
    schoolAddress: s1.school_address || "",
    currentClass: s1.current_class || "",

    // Addresses
    "currentग्राम/मोहल्ला": s1.current_village || "",
    "currentतहसील ": s1.current_post_office || "",
    "currentजनपद": s1.current_district || "",
    "currentविकासखण्ड/नगर निकाय": s1.current_block_local_body || "",
    "currentपिन कोड": s1.current_pincode || "",

    "permanentग्राम/मोहल्ला": s1.permanent_village || "",
    "permanentतहसील ": s1.permanent_post_office || "",
    "permanentजनपद": s1.permanent_district || "",
    "permanentविकासखण्ड/नगर निकाय": s1.permanent_block_local_body || "",
    "permanentपिन कोड": s1.permanent_pincode || "",
    district: s1.permanent_district || "",

    // Submission time comes from the `nominator-part5` (documents) row, not the
    // step 5 declaration row.
    submissionDate: isApplicationCompleted
      ? resolveSubmissionTimestampFromSteps({ s1, s4, s5 })
      : "",
    isApplicationCompleted,
    step1Status: s1.status || "",

    // Step 2: Incident Details
    actTitle: s2.incident_title || "",
    incidentType: s2.incident_type || "",
    actDate: s2.incident_date || "",
    incidentAge: s2.age_at_incident || "",
    actTime: s2.incident_time || "",
    actPlace: s2.incident_location || "",
    actDistrict: s2.incident_district || "",
    shortDescription: s2.incident_description || "",
    rescuedCount: s2.rescued_persons_description || "",
    rescuedPersons: s2.rescued_persons || [],
    rescuedDetails: { people: s2.rescued_persons || [] },
    eyewitnesses: s2.eyewitnesses || [],
    firRegistered: s2.fir_status || "",
    policeStation: s2.police_station || "",
    firNumber: s2.fir_number || "",
    firDate: s2.fir_date || "",
    mediaPublished: s2.media_report_available || "",
    step2Status: s2.status || "",

    // Step 3: Additional Details
    otherAward: s3.other_award || "",
    otherAwardDetails: s3.other_award_details || "",
    additionalInformation: s3.additional_information || "",
    step3Status: s3.status || "",

    // Step 4: Documents
    document0: s4.nominator_id_proof || s5.nominator_id_proof || "",
    document1: s4.child_aadhaar_identity || s5.child_aadhaar_identity || "",
    document2: s4.permanent_residence_certificate || s5.permanent_residence_certificate || "",
    document3: s4.child_birth_age_certificate || s5.child_birth_age_certificate || "",
    document4: s4.bravery_incident_description || s5.bravery_incident_description || "",
    document5: s4.child_passport_photo || s5.child_passport_photo || "",
    document6: s4.fir_police_report || s5.fir_police_report || "",
    document7: s4.media_report || s5.media_report || "",
    document8: s4.eyewitness_statements || s5.eyewitness_statements || "",
    document9: s4.incident_photo_video_url || s5.incident_photo_video_url || "",
    document10: s4.school_certificate || s5.school_certificate || "",
    document11: s4.otherSupporting_documents || s5.otherSupporting_documents || "",
    document12: s4.bank_detail || s5.bank_detail || "",
    step4Status: s4.status || "",

    // Step 5: Declarations
    declarationDocument: s5.declarationDocument || s4.declarationDocument || "",
    parentDeclarationDocument: s5.parentDeclarationDocument || s4.parentDeclarationDocument || "",
    step5Status: s5.status || "",

    rawStep1: s1,
    rawStep2: s2,
    rawStep3: s3,
    rawStep4: s4,
    rawStep5: s5,
    dpoStatus: item.dpo_status || {},
  };
};

const ITCellDashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [counts, setCounts] = useState({ services: 0, projects: 0, products: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [stepStatusFilter, setStepStatusFilter] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showFormPreviewModal, setShowFormPreviewModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [recommendationApp, setRecommendationApp] = useState(null);
  const [recommendedApplications, setRecommendedApplications] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [selectedFormPreviewData, setSelectedFormPreviewData] = useState(null);
  const [formStatusList, setFormStatusList] = useState([]);
  const [loadingFormStatus, setLoadingFormStatus] = useState(false);
  const [formStatusError, setFormStatusError] = useState(null);
  const [noFormDataAlert, setNoFormDataAlert] = useState(false);
  const [exporting, setExporting] = useState("");
  const [exportError, setExportError] = useState(null);
  const navigate = useNavigate();

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

  const fetchFormStatusData = async () => {
    try {
      setLoadingFormStatus(true);
      setFormStatusError(null);
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch("https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/director-itcell/application/status/", {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setFormStatusList(result.data);
        return result.data;
      } else {
        setFormStatusList([]);
        return [];
      }
    } catch (err) {
      console.error("Failed to fetch form status list:", err);
      setFormStatusError(err.message || "Failed to fetch form status details");
      return [];
    } finally {
      setLoadingFormStatus(false);
    }
  };

  const fetchRecommendedApplications = async () => {
    try {
      setRecommendedLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(RECOMMENDATION_URL, {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setRecommendedApplications(result.data);
        return result.data;
      }
      setRecommendedApplications([]);
      return [];
    } catch (err) {
      console.error("Failed to fetch recommended applications:", err);
      setRecommendedApplications([]);
      return [];
    } finally {
      setRecommendedLoading(false);
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch("https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/it-cell/applications/", {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setApplications(result.data);
        } else {
          setApplications([]);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch applications");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
    fetchFormStatusData();
    fetchRecommendedApplications();
  }, []);

   const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };

    const totalApplications = applications.length;
    const completedApplications = applications.filter(app => app.step_status === "Final Submitted").length;
    const inProgressApplications = applications.filter(app => app.step_status && app.step_status.startsWith("step-")).length;

    // Registered but have not started the application form yet.
    const registeredApplications = applications.filter(app => {
      const status = String(app.status || app.step_status || "").trim().toLowerCase();
      return status === "pending" || status === "registered" || status === "";
    }).length;

    const uniqueProjects = Array.from(new Set(applications.map(app => app.project).filter(Boolean))).sort();
    const uniqueDistricts = Array.from(new Set(applications.map(app => app.district).filter(Boolean))).sort();
    const uniqueStepStatuses = Array.from(new Set(applications.map(app => app.step_status).filter(Boolean))).sort();

    const getStepBadge = (stepStatus) => {
      if (stepStatus === "Final Submitted") {
        return <Badge style={{ backgroundColor: "#16715b", color: "#fff", fontSize: "0.7rem", padding: "0.35em 0.6em", fontWeight: 600 }}>Final Submitted</Badge>;
      }
      if (stepStatus && stepStatus.startsWith("step-")) {
        const stepNum = stepStatus.replace("step-", "");
        return <Badge style={{ backgroundColor: "#1d85e9", color: "#fff", fontSize: "0.7rem", padding: "0.35em 0.6em", fontWeight: 600 }}>Step {stepNum}</Badge>;
      }
      if (stepStatus === "pending") {
        return <Badge style={{ backgroundColor: "#f59e0b", color: "#fff", fontSize: "0.7rem", padding: "0.35em 0.6em", fontWeight: 600 }}>Pending</Badge>;
      }
      return <Badge style={{ backgroundColor: "#6b7280", color: "#fff", fontSize: "0.7rem", padding: "0.35em 0.6em", fontWeight: 600 }}>{stepStatus || "-"}</Badge>;
    };

    const recommendedById = new Map(
      recommendedApplications.map((item) => [String(item.applicant_id || "").trim(), item])
    );

    const getRecommendation = (applicantId) =>
      recommendedById.get(String(applicantId || "").trim()) || null;

    const getRecommendationFileSrc = (applicantId) =>
      getFileSrc(getRecommendation(applicantId)?.applicant_file);

    const isRecommended = (applicantId) => Boolean(getRecommendation(applicantId));

    const getRecommendationBadge = (applicantId) => {
      if (!isRecommended(applicantId)) {
        return (
          <Badge style={{ backgroundColor: "#6b7280", color: "#fff", fontSize: "0.7rem", padding: "0.35em 0.6em", fontWeight: 600 }}>
            Not Recommended
          </Badge>
        );
      }
      return (
        <Badge style={{ backgroundColor: "#16715b", color: "#fff", fontSize: "0.7rem", padding: "0.35em 0.6em", fontWeight: 600 }}>
          <FaCheck className="me-1" /> Recommended
        </Badge>
      );
    };

    const filteredApplications = applications.filter(app => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = !term || (
        (app.applicant_id || "").toLowerCase().includes(term) ||
        (app.full_name || "").toLowerCase().includes(term) ||
        (app.phone || "").toLowerCase().includes(term) ||
        (app.email || "").toLowerCase().includes(term)
      );
      const matchesProject = !projectFilter || app.project === projectFilter;
      const matchesDistrict = !districtFilter || app.district === districtFilter;
      const matchesStepStatus = !stepStatusFilter || app.step_status === stepStatusFilter;
      return matchesSearch && matchesProject && matchesDistrict && matchesStepStatus;
    });

    const reportFilters = {
      "Search": searchTerm.trim() || "All",
      "Project": projectFilter || "All",
      "District": districtFilter || "All",
      "Step Status": stepStatusFilter || "All",
    };

    const handleExportPdf = async () => {
      if (exporting) return;
      setExporting("pdf");
      setExportError(null);
      try {
        await exportDashboardPdf({
          applications: filteredApplications,
          districts: districtFilter ? [districtFilter] : undefined,
          filters: reportFilters,
        });
      } catch (err) {
        console.error("Failed to export PDF report:", err);
        setExportError(err.message || "PDF export failed");
      } finally {
        setExporting("");
      }
    };

    const handleExportExcel = async () => {
      if (exporting) return;
      setExporting("excel");
      setExportError(null);
      try {
        await exportDashboardExcel({
          applications: filteredApplications,
          districts: districtFilter ? [districtFilter] : undefined,
          filters: reportFilters,
        });
      } catch (err) {
        console.error("Failed to export Excel report:", err);
        setExportError(err.message || "Excel export failed");
      } finally {
        setExporting("");
      }
    };

    // The registration list has no step records, so the submission time is looked
    // up from the form status response that is already loaded.
    const withSubmissionTimestamp = (app) => {
      if (!app || app.submissionDate) return app;
      const record = (formStatusList || []).find(
        (item) =>
          String(item.applicant_id || "").trim() ===
          String(app.applicant_id || "").trim(),
      );
      const submissionDate = record
        ? resolveSubmissionTimestampFromSteps({
            s1: record["step-1"],
            s4: record["step-4"],
            s5: record["step-5"],
          })
        : "";
      return submissionDate ? { ...app, submissionDate } : app;
    };

    const handleViewClick = (app) => {
      setSelectedApplication(withSubmissionTimestamp(app));
      setNoFormDataAlert(false);
      setShowChoiceModal(true);
    };

    const handleOpenRegistrationDetails = (app = selectedApplication) => {
      setSelectedApplication(withSubmissionTimestamp(app));
      setShowChoiceModal(false);
      setShowRecommendationModal(false);
      setShowModal(true);
    };

    const handleCloseRegistrationModal = () => {
      setShowModal(false);
    };

    const handleOpenFormDetails = async (app = selectedApplication) => {
      if (!app) return;
      setSelectedApplication(app);
      setNoFormDataAlert(false);

      let currentList = formStatusList;
      if (!currentList || currentList.length === 0) {
        currentList = await fetchFormStatusData();
      }

      const foundRecord = currentList.find(
        (item) => String(item.applicant_id || "").trim() === String(app.applicant_id || "").trim()
      );

      if (!foundRecord || !foundRecord["step-1"]) {
        setNoFormDataAlert(true);
        return;
      }

      setShowChoiceModal(false);
      setShowModal(false);
      const isApplicationCompleted =
        String(app.step_status || "").trim().toLowerCase() === "final submitted";
      const mapped = mapApiDataToPreviewData(foundRecord, isApplicationCompleted);
      setSelectedFormPreviewData(mapped);
      setShowFormPreviewModal(true);
    };

    const handleSwitchToForm = (app = selectedApplication) => {
      setShowModal(false);
      handleOpenFormDetails(app);
    };

    const handleSwitchToRegistration = () => {
      setShowFormPreviewModal(false);
      setShowModal(true);
    };

    const handleOpenRecommendationDetails = (app = selectedApplication) => {
      if (!app) return;
      setRecommendationApp(app);
      setSelectedApplication(app);
      setShowChoiceModal(false);
      setShowModal(false);
      setShowRecommendationModal(true);
    };

   return (
      <div className="dashboard-container">
        <ITCellLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />
        <div className="main-content-dash">
          <ITCellTopNav toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-box mt-3">
            <div className="dashboard-header-section" style={{ marginBottom: "24px" }}>
              <h1 className="dashboard-main-title" style={{ fontSize: "clamp(16px, 3vw, 22px)", margin: 0 }}>
                मुख्यमंत्री राज्य बाल वीरता पुरस्कार
              </h1>
              <p className="dashboard-subtitle" style={{ margin: 0, opacity: 0.95 }}>
                IT Cell Dashboard - Student Registration Details
              </p>
            </div>

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} lg={3}>
                <Card className="stat-card h-100" style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}>
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-icon" style={{ backgroundColor: "#eef2ff", color: "#4f46e5", borderRadius: "12px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", marginRight: "1rem" }}>
                      <FaUserGraduate />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", fontWeight: 500 }}>Total Applications</p>
                      <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "#111827" }}>{totalApplications}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Card className="stat-card h-100" style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}>
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-icon" style={{ backgroundColor: "#ecfdf5", color: "#16715b", borderRadius: "12px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", marginRight: "1rem" }}>
                      <FaCheckCircle />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", fontWeight: 500 }}>Final Submitted</p>
                      <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "#111827" }}>{completedApplications}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Card className="stat-card h-100" style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}>
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-icon" style={{ backgroundColor: "#eff6ff", color: "#1d85e9", borderRadius: "12px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", marginRight: "1rem" }}>
                      <FaSpinner />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", fontWeight: 500 }}>In Progress</p>
                      <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "#111827" }}>{inProgressApplications}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Card className="stat-card h-100" style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}>
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-icon" style={{ backgroundColor: "#fff7ed", color: "#ea580c", borderRadius: "12px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", marginRight: "1rem" }}>
                      <FaUserPlus />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", fontWeight: 500 }}>Registered Users</p>
                      <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "#111827" }}>{registeredApplications}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div style={{ marginBottom: "8px" }}>
              <h2 className="section-title" style={{ fontSize: "clamp(14px, 3vw, 20px)", fontWeight: 700, color: "#2c3e50", marginBottom: "4px", paddingBottom: "4px", borderBottom: "3px solid #667eea", display: "inline-block" }}>
                छात्र पंजीकरण विवरण
              </h2>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#667085" }}>Student Registration Details</p>
            </div>

            <div
              className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3"
              style={{ padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px" }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#1e293b" }}>
                  रिपोर्ट निर्यात (Export Report)
                </p>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>
                  रिपोर्ट में शीर्षक, ग्राफ़ तथा सम्पूर्ण पंजीकरण विवरण सम्मिलित होंगे।
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleExportExcel}
                  disabled={Boolean(exporting) || loading || filteredApplications.length === 0}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "8px", fontWeight: 600, fontSize: "0.82rem" }}
                >
                  {exporting === "excel" ? <Spinner animation="border" size="sm" /> : <FaFileExcel />} Export Excel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleExportPdf}
                  disabled={Boolean(exporting) || loading || filteredApplications.length === 0}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "8px", fontWeight: 600, fontSize: "0.82rem" }}
                >
                  {exporting === "pdf" ? <Spinner animation="border" size="sm" /> : <FaFilePdf />} Export PDF
                </Button>
              </div>
            </div>

            {exportError && (
              <Alert variant="danger" className="mt-2" onClose={() => setExportError(null)} dismissible>
                {exportError}
              </Alert>
            )}

            <Row className="mb-3">
              <Col xs={12} md={6} lg={4}>
                <Form.Control
                  type="text"
                  placeholder="Search by Applicant ID, Name, Phone, Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    padding: "8px 12px",
                    fontSize: "0.875rem",
                  }}
                />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Form.Select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.875rem" }}
                >
                  <option value="">All Projects</option>
                  {uniqueProjects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Form.Select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.875rem" }}
                >
                  <option value="">All Districts</option>
                  {uniqueDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={6} lg={2}>
                <Form.Select
                  value={stepStatusFilter}
                  onChange={(e) => setStepStatusFilter(e.target.value)}
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.875rem" }}
                >
                  <option value="">All Status</option>
                  {uniqueStepStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {loading && (
              <div className="text-center mt-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading applications...</p>
              </div>
            )}
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
            {!loading && !error && (
              <div className="table-responsive" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", overflowX: "auto" }}>
                <Table striped bordered hover size="sm" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb" }}>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px", width: "70px" }}>S.No.</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Applicant ID</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Full Name</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Phone</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Email</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Project</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>District</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Step Status</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center" style={{ padding: "24px", color: "#6b7280" }}>No applications found.</td>
                      </tr>
                    ) : (
                      filteredApplications.map((app, index) => (
                        <tr key={app.applicant_id} style={{ verticalAlign: "middle" }}>
                          <td style={{ padding: "10px 8px", fontWeight: 500, color: "#374151", textAlign: "center" }}>{index + 1}</td>
                          <td style={{ padding: "10px 8px", fontWeight: 500, color: "#17324d" }}>{app.applicant_id}</td>
                          <td style={{ padding: "10px 8px", fontWeight: 600, color: "#172033" }}>{app.full_name}</td>
                          <td style={{ padding: "10px 8px" }}>{app.phone}</td>
                          <td style={{ padding: "10px 8px" }}>{app.email || "-"}</td>
                          <td style={{ padding: "10px 8px" }}>{app.project}</td>
                          <td style={{ padding: "10px 8px" }}>{app.district}</td>
                          <td style={{ padding: "10px 8px" }}>{getStepBadge(app.step_status)}</td>
                          <td style={{ padding: "10px 8px", textAlign: "center" }}>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewClick(app)}
                              style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", fontSize: "0.75rem", borderRadius: "6px" }}
                            >
                              <FaEye /> View
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )}

            {/* ── Registration Details Modal (Existing view on view details) ── */}
            <Modal show={showModal} onHide={handleCloseRegistrationModal} size="lg" centered>
              <Modal.Header closeButton style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <Modal.Title style={{ fontSize: "1.1rem", fontWeight: 700, color: "#17324d" }}>
                  Registration Details
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ padding: "20px" }}>
                {selectedApplication && (
                  <div>
                    <h6 style={{ fontWeight: 700, color: "#2c3e50", marginBottom: "12px", paddingBottom: "8px", borderBottom: "2px solid #667eea" }}>
                      Applicant Information
                    </h6>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Applicant ID</small>
                          <p style={{ margin: 0, fontWeight: 600, color: "#17324d", fontSize: "0.9rem" }}>{selectedApplication.applicant_id}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</small>
                          <p style={{ margin: 0, fontWeight: 600, color: "#172033", fontSize: "0.9rem" }}>{selectedApplication.full_name}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nominator Category</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.nominator_category || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Relation With Child</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.relat_with_child || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.phone}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.email || "-"}</p>
                        </div>
                      </Col>
                    </Row>

                    <h6 style={{ fontWeight: 700, color: "#2c3e50", margin: "20px 0 12px", paddingBottom: "8px", borderBottom: "2px solid #667eea" }}>
                      ID Proof Details
                    </h6>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID Proof Type</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.id_proof_type || "-"}{selectedApplication.id_proof_type_other ? ` (${selectedApplication.id_proof_type_other})` : ""}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID Proof Number</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.id_proof_no || "-"}</p>
                        </div>
                      </Col>
                    </Row>

                    <h6 style={{ fontWeight: 700, color: "#2c3e50", margin: "20px 0 12px", paddingBottom: "8px", borderBottom: "2px solid #667eea" }}>
                      Address Details
                    </h6>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Village</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.village || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Post Office</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.post_office || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Project</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.project || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>District</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.district || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pincode</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.pincode || "-"}</p>
                        </div>
                      </Col>
                    </Row>

                    <h6 style={{ fontWeight: 700, color: "#2c3e50", margin: "20px 0 12px", paddingBottom: "8px", borderBottom: "2px solid #667eea" }}>
                      Application Status
                    </h6>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.status || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Step Status</small>
                          <p style={{ margin: 0 }}>{getStepBadge(selectedApplication.step_status)}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Created At</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>
                            {selectedApplication.created_at ? new Date(selectedApplication.created_at).toLocaleString("en-IN") : "-"}
                          </p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Application Submitted On</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>
                            {formatSubmissionDateTime(selectedApplication.submissionDate, "-")}
                          </p>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer style={{ borderTop: "1px solid #e5e7eb", padding: "12px 20px", display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleSwitchToForm(selectedApplication)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600 }}
                >
                  <FaFileAlt /> आवेदन प्रपत्र देखें (Form Details) →
                </Button>
                <Button variant="secondary" onClick={handleCloseRegistrationModal} style={{ borderRadius: "6px", fontSize: "0.875rem" }}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

            {/* ── Choice Modal: Ask user to view either Registration Details or Form Details ── */}
            <Modal show={showChoiceModal} onHide={() => setShowChoiceModal(false)} centered>
              <Modal.Header closeButton style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <Modal.Title style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1e293b" }}>
                  विवरण चुनें / Choose Details to View
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ padding: "20px" }}>
                {selectedApplication && (
                  <div style={{ marginBottom: "16px", padding: "10px 14px", background: "#f1f5f9", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                      Applicant ID: <strong style={{ color: "#0f172a" }}>{selectedApplication.applicant_id}</strong>
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "0.92rem", color: "#0f172a", fontWeight: 600 }}>
                      {selectedApplication.full_name}
                    </p>
                  </div>
                )}

                {noFormDataAlert && (
                  <Alert variant="warning" style={{ fontSize: "0.85rem", marginBottom: "16px" }}>
                    <strong>सूचना:</strong> इस आवेदक द्वारा अभी तक आवेदन प्रपत्र (Step 1) नहीं भरा गया है। आप नीचे दिए गए विकल्प से केवल <strong>पंजीकरण विवरण</strong> देख सकते हैं।
                  </Alert>
                )}

                {loadingFormStatus && (
                  <div className="text-center py-2 mb-3">
                    <Spinner animation="border" size="sm" variant="primary" />
                    <span className="ms-2" style={{ fontSize: "0.85rem", color: "#64748b" }}>फॉर्म डेटा लोड हो रहा है...</span>
                  </div>
                )}

                <p style={{ fontSize: "0.875rem", color: "#475569", marginBottom: "16px" }}>
                  कृपया चुनें कि आप कौन सा विवरण देखना चाहते हैं:
                  <br />
                  <small style={{ color: "#64748b" }}>Please select which details you would like to view:</small>
                </p>

                <div className="d-grid gap-3">
                  <Card
                    onClick={() => handleOpenRegistrationDetails(selectedApplication)}
                    style={{ cursor: "pointer", border: "1.5px solid #cbd5e1", borderRadius: "10px", transition: "all 0.2s" }}
                    className="shadow-sm"
                  >
                    <Card.Body className="d-flex align-items-center" style={{ padding: "14px 16px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", marginRight: "14px", flexShrink: 0 }}>
                        <FaIdCard />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h6 style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                          1. पंजीकरण विवरण (Registration Details)
                        </h6>
                        <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                          प्रारंभिक नामांकनकर्ता विवरण, पता एवं पहचान पत्र की जानकारी
                        </p>
                      </div>
                      <Badge bg="primary" style={{ fontSize: "0.72rem", padding: "6px 10px" }}>देखें →</Badge>
                    </Card.Body>
                  </Card>

                  <Card
                    onClick={() => handleOpenFormDetails(selectedApplication)}
                    style={{ cursor: "pointer", border: "1.5px solid #cbd5e1", borderRadius: "10px", transition: "all 0.2s" }}
                    className="shadow-sm"
                  >
                    <Card.Body className="d-flex align-items-center" style={{ padding: "14px 16px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", marginRight: "14px", flexShrink: 0 }}>
                        <FaFileAlt />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h6 style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                          2. आवेदन प्रपत्र विवरण (Form Details)
                        </h6>
                        <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                          चरणबद्ध प्रपत्र (Step 1 से 5), अभिलेख एवं प्रिंट प्रीव्यू
                        </p>
                      </div>
                      <Badge bg="success" style={{ fontSize: "0.72rem", padding: "6px 10px" }}>देखें →</Badge>
                    </Card.Body>
                  </Card>

                  <Card
                    onClick={() => handleOpenRecommendationDetails(selectedApplication)}
                    style={{ cursor: "pointer", border: "1.5px solid #cbd5e1", borderRadius: "10px", transition: "all 0.2s" }}
                    className="shadow-sm"
                  >
                    <Card.Body className="d-flex align-items-center" style={{ padding: "14px 16px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", marginRight: "14px", flexShrink: 0 }}>
                        <FaPaperclip />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h6 style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                          3. अनुशंसा विवरण (Recommendation Details)
                        </h6>
                        <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                          {isRecommended(selectedApplication?.applicant_id)
                            ? "पुरस्कार हेतु चयनित: फ़ाइल, टिप्पणी एवं दिनांक"
                            : "अभी अनुशंसा नहीं की गई"}
                        </p>
                      </div>
                      {isRecommended(selectedApplication?.applicant_id) ? (
                        <Badge bg="success" style={{ fontSize: "0.72rem", padding: "6px 10px" }}>Recommended</Badge>
                      ) : (
                        <Badge bg="secondary" style={{ fontSize: "0.72rem", padding: "6px 10px" }}>देखें →</Badge>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </Modal.Body>
              <Modal.Footer style={{ borderTop: "1px solid #e2e8f0", padding: "10px 20px" }}>
                <Button variant="secondary" size="sm" onClick={() => setShowChoiceModal(false)} style={{ borderRadius: "6px" }}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

            {/* ── Recommendation Details Modal (read only) ── */}
            <Modal show={showRecommendationModal} onHide={() => setShowRecommendationModal(false)} size="lg" centered>
              <Modal.Header closeButton style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <Modal.Title style={{ fontSize: "1.1rem", fontWeight: 700, color: "#17324d" }}>
                  Recommendation Details
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ padding: "20px" }}>
                {recommendationApp && (
                  <div>
                    <div style={{ marginBottom: "16px", padding: "10px 14px", background: "#f1f5f9", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                        Applicant ID: <strong style={{ color: "#0f172a" }}>{recommendationApp.applicant_id}</strong>
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: "0.92rem", color: "#0f172a", fontWeight: 600 }}>
                        {recommendationApp.full_name}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                        District: <span style={{ color: "#0f172a", fontWeight: 600 }}>{recommendationApp.district || "-"}</span>
                      </p>
                    </div>

                    {(() => {
                      const recommendation = getRecommendation(recommendationApp.applicant_id);
                      if (recommendedLoading) {
                        return (
                          <div className="text-center py-2">
                            <Spinner animation="border" size="sm" variant="primary" />
                            <span className="ms-2" style={{ fontSize: "0.85rem", color: "#64748b" }}>
                              अनुशंसा डेटा लोड हो रहा है...
                            </span>
                          </div>
                        );
                      }
                      if (!recommendation) {
                        return (
                          <Alert variant="secondary" style={{ fontSize: "0.85rem", marginBottom: 0 }}>
                            <FaHourglassHalf className="me-1" /> This applicant has not been recommended for the award yet.
                          </Alert>
                        );
                      }
                      return (
                        <Row className="g-3">
                          <Col xs={12} md={6}>
                            <div style={{ marginBottom: "10px" }}>
                              <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recommendation Status</small>
                              <div style={{ marginTop: "4px" }}>{getRecommendationBadge(recommendationApp.applicant_id)}</div>
                            </div>
                          </Col>
                          <Col xs={12} md={6}>
                            <div style={{ marginBottom: "10px" }}>
                              <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recommended On</small>
                              <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>
                                {recommendation.created_at ? new Date(recommendation.created_at).toLocaleString("en-IN") : "-"}
                              </p>
                            </div>
                          </Col>
                          <Col xs={12} md={6}>
                            <div style={{ marginBottom: "10px" }}>
                              <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>District</small>
                              <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{recommendation.district || "-"}</p>
                            </div>
                          </Col>
                          <Col xs={12} md={6}>
                            <div style={{ marginBottom: "10px" }}>
                              <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recommendation File</small>
                              {getRecommendationFileSrc(recommendationApp.applicant_id) ? (
                                <a
                                  href={getRecommendationFileSrc(recommendationApp.applicant_id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#2563eb", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}
                                >
                                  <FaPaperclip /> View / Download File
                                </a>
                              ) : (
                                <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>No file uploaded</p>
                              )}
                            </div>
                          </Col>
                          <Col xs={12}>
                            <div style={{ marginBottom: "10px" }}>
                              <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Remark</small>
                              <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                                {recommendation.remark || "-"}
                              </p>
                            </div>
                          </Col>
                        </Row>
                      );
                    })()}
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer style={{ borderTop: "1px solid #e5e7eb", padding: "12px 20px", display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleOpenRegistrationDetails(recommendationApp)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600 }}
                >
                  <FaIdCard /> पंजीकरण विवरण देखें →
                </Button>
                <Button variant="secondary" onClick={() => setShowRecommendationModal(false)} style={{ borderRadius: "6px", fontSize: "0.875rem" }}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

            {/* ── Form View Preview Modal (Identical to user preview & print) ── */}
            {showFormPreviewModal && selectedFormPreviewData && (
              <PreviewModal
                data={selectedFormPreviewData}
                onClose={() => setShowFormPreviewModal(false)}
                isApplicationCompleted={selectedFormPreviewData.isApplicationCompleted}
                isITCell={true}
                onSwitchToRegistration={handleSwitchToRegistration}
              />
            )}
          </Container>
        </div>
      </div>
    );
};

export default ITCellDashBoard;