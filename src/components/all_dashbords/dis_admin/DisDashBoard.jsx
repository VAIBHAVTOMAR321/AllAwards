import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Form,
  Modal,
  Button,
  Alert,
  Spinner,
  Image,
} from "react-bootstrap";
import {
  FaUserGraduate,
  FaCheckCircle,
  FaSpinner,
  FaFileAlt,
  FaFilePdf,
  FaFileExcel,
  FaHourglassHalf,
  FaCheck,
  FaTimes,
  FaTasks,
  FaUserCircle,
  FaSearch,
  FaMapMarkerAlt,
  FaPaperclip,
} from "react-icons/fa";
import DisTopNav from "./DisTopNav";
import DisLeftnav from "./DisLeftnav";
import PreviewModal from "../../child_regis/NominationForm/PreviewModal";
import { exportDashboardExcel, exportDashboardPdf } from "../../../utils/itCellReportExport";
import { exportDpoTableExcel, exportDpoTablePdf } from "../../../utils/dpoTableExport";
import { formatSubmissionDateTime, resolveSubmissionTimestampFromSteps } from "../../../utils/submissionDate";
import "./DPO_cell/DPODashboard.css";

const BASE_URL =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api";
const DIRECTOR_RECOMMENDATION_URL = `${BASE_URL}/recommended-application-by-director/`;

const MEDIA_BASE_URL =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend";

// Directory the backend stores recommendation uploads in.
const RECOMMENDATION_MEDIA_DIR = "media/bravery/recommended_application";

const SITE_ORIGIN = "https://wecdukaward.in";

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
  const nomination = item.nomination || item;
  const idProofTypes = {
    aadhaar: "आधार कार्ड",
    pan: "पैन कार्ड",
    driving_license: "ड्राइविंग लाइसेंस",
    pehchan_patraw: "पहचान पत्र (फोटो के साथ)",
    passport: "पासपोर्ट",
    voter_id: "मतदाता पहचान पत्र",
  };
  const idProofType = idProofTypes[nomination.id_proof_type] || nomination.id_proof_type || "";

  return {
    applicant_id: item.applicant_id || s1.applicant_id || "",
    registration: {
      nominator_category: nomination.nominator_category || "",
      full_name: nomination.full_name || "",
      relat_with_child: nomination.relat_with_child || "",
      phone: nomination.phone || "",
      email: nomination.email || "",
      id_proof_type: idProofType,
      id_proof_number_label: idProofType ? `7. ${idProofType} संख्या` : "7. पहचान पत्र संख्या",
      id_proof_no: nomination.id_proof_no || "",
      village: nomination.village || "",
      post_office: nomination.post_office || "",
      project: nomination.project || "",
      district: nomination.district || "",
      pincode: nomination.pincode || "",
    },
    childName: s1.child_full_name || "",
    fatherName: s1.father_name || "",
    motherName: s1.mother_name || "",
    guardianName: s1.guardian_name || "",
    birthDate: s1.date_of_birth || "",
    gender: s1.gender || "",
    resident: s1.permanent_resident_uttarakhand || "",
    residence_certificate_number: s1.residence_certificate_number || "",
    childMobile: s1.child_guardian_mobile || "",
    bankAccountHolderType: s2.bank_nominee_relation || s1.bank_nominee_relation || "",
    bankAccountHolderName: s2.bank_holder_name || s1.bank_holder_name || "",
    bankName: s2.bank_name || s1.bank_name || "",
    ifscCode: s2.ifsc_code || s1.ifsc_code || "",
    bankAccountNumber: s2.bank_acc_no || s1.bank_acc_no || "",
    schoolName: s1.school_name || "",
    schoolAddress: s1.school_address || "",
    currentClass: s1.current_class || "",
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
    otherAward: s3.other_award || "",
    otherAwardDetails: s3.other_award_details || "",
    additionalInformation: s3.additional_information || "",
    step3Status: s3.status || "",
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

// One label per funnel stage so the filter reads the same as the IT Cell
// dashboard. A registration without any form step counts as "Registered".
const STEP_STATUS_ORDER = [
  "Registered",
  "Step 1",
  "Step 2",
  "Step 3",
  "Step 4",
  "Step 5",
  "Final Submitted",
];

const normalizeStepStatus = (value) => {
  const raw = String(value || "").trim();
  const lower = raw.toLowerCase();
  if (!raw || lower === "registered" || lower === "pending") return "Registered";
  if (lower.startsWith("step-") || lower.startsWith("step ")) {
    return `Step ${lower.replace(/^step[-\s]/, "")}`;
  }
  // The API may report the final stage in any casing.
  const known = STEP_STATUS_ORDER.find((label) => label.toLowerCase() === lower);
  return known || raw;
};

// Documents step 4 always asks for. The remaining slots on the form become
// mandatory only when the step 1/2 answers say they apply, which is why the
// checks below repeat the step 4 validation from the NominationForm.
const REQUIRED_STEP4_DOCUMENTS = [
  "nominator_id_proof",
  "child_aadhaar_identity",
  "permanent_residence_certificate",
  "child_birth_age_certificate",
  "bravery_incident_description",
  "child_passport_photo",
  "bank_detail",
];

const hasText = (value) => String(value || "").trim() !== "";

const PDF_UPLOAD_NOTE = "Note: Only PDF format is allowed for upload.";

const isPdfFile = (file) => {
  if (!file) return false;
  const name = String(file.name || "").trim().toLowerCase();
  if (!name.endsWith(".pdf")) return false;
  const type = String(file.type || "").trim().toLowerCase();
  return !type || type === "application/pdf" || type === "application/x-pdf";
};

const hasWitnessData = (witnesses) => {
  const rows = Array.isArray(witnesses) ? witnesses : [];
  return rows.some((row) =>
    ["name", "mobile", "address", "relation"].some((field) => hasText(row?.[field]))
  );
};

// Step 5 mirrors the step 4 uploads, so either record can carry the file path.
const hasStep4Document = (s4, s5, field) => hasText(s4?.[field] || s5?.[field]);

// True once the applicant has attached every document their answers require,
// i.e. they have submitted the form and are waiting on the declaration.
const hasAllStep4Documents = (s1, s2, s4, s5) => {
  const has = (field) => hasStep4Document(s4, s5, field);

  if (!REQUIRED_STEP4_DOCUMENTS.every(has)) return false;

  // FIR report is required only when the applicant said an FIR was filed.
  if (String(s2?.fir_status || "").trim() === "हाँ" && !has("fir_police_report")) return false;

  // Witness statements are required only when a witness was described.
  if (hasWitnessData(s2?.eyewitnesses) && !has("eyewitness_statements")) return false;

  // School certificate is required only for a student with a class on record.
  if (hasText(s1?.current_class) && !has("school_certificate")) return false;

  // A published incident needs either a media report or a photo/video link.
  const mediaRequired =
    String(s2?.media_report_available || "").trim() === "हाँ, प्रकाशित हुई है।";
  if (mediaRequired && !has("media_report") && !has("incident_photo_video_url")) return false;

  return true;
};

const mapApiToApp = (item) => {
  if (!item) return null;
  const s1 = item["step-1"] || {};
  const s2 = item["step-2"] || {};
  const s3 = item["step-3"] || {};
  const s4 = item["step-4"] || {};
  const s5 = item["step-5"] || {};
  const nomination = item.nomination || {};

  // Number of steps the applicant has finished, used for the funnel counts.
  const completedSteps = [s1, s2, s3, s4, s5].filter(
    (step) => step.status === "completed"
  ).length;

  const age = s1.date_of_birth
    ? Math.floor((Date.now() - new Date(s1.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const dpoStatusObj = item.dpo_status || {};
  let dpoStatus = dpoStatusObj.status_dpo || "pending";
  if (dpoStatus === "accepted") dpoStatus = "approved";
  const dpoComment = dpoStatusObj.comment_dpo || s1.comment_dpo || "";

  const hasAnyStep = [s1, s2, s3, s4, s5].some(
    (step) => step && Object.keys(step).length > 0 && step.applicant_id
  );

  // Steps are filled in order, so the last one finished without a gap is the
  // furthest the applicant has actually got.
  let lastCompletedStep = 0;
  [s1, s2, s3, s4, s5].some((step) => {
    if (step.status !== "completed") return true;
    lastCompletedStep += 1;
    return false;
  });

  // Step 4 saves every file as soon as it is uploaded, so an applicant who has
  // attached everything their answers require has really submitted the form,
  // even though the step-4 record is not flagged as completed yet.
  const reachedStep =
    lastCompletedStep === 3 && hasAllStep4Documents(s1, s2, s4, s5) ? 4 : lastCompletedStep;

  const computeStepStatus = () => {
    // Nothing finished yet: the applicant either has not touched the form or is
    // part-way through step 1.
    if (reachedStep === 0) return hasAnyStep ? "step-1" : "pending";
    if (reachedStep === 5) return "Final Submitted";
    return `step-${reachedStep}`;
  };

  const registrationStatus = String(nomination.status || "").trim().toLowerCase();

  // The API reports the next step the applicant is expected to fill, so once any
  // form data exists the finished step is derived from the step records instead.
  const reportedStepStatus = String(item.step_status || "").trim();
  const stepStatus = normalizeStepStatus(
    hasAnyStep ? computeStepStatus() : reportedStepStatus || computeStepStatus()
  );

  return {
    applicant_id: item.applicant_id || nomination.applicant_id || "",
    full_name: s1.child_full_name || nomination.full_name || "",
    nominator_name: nomination.full_name || "",
    child_name: s1.child_full_name || "",
    father_name: s1.father_name || "",
    age: age || "-",
    class_name: s1.current_class || "",
    photo: getFileSrc(s4.child_passport_photo || s5.child_passport_photo || ""),
    district: nomination.district || s1.permanent_district || "",
    // Step 2 records the incident title the applicant picked in the form, which
    // is what the "Type of Bravery" column shows. Fall back to the stored code
    // when older applications only have that.
    bravery_type: s2.incident_title || s2.incident_type || "",
    incident_title: s2.incident_title || "",
    step_status: stepStatus,
    completed_steps: Math.max(completedSteps, reachedStep),
    dpo_status: dpoStatus,
    dpo_comment: dpoComment,
    nominator_category: nomination.nominator_category || "",
    relat_with_child: nomination.relat_with_child || "",
    id_proof_type: nomination.id_proof_type || "",
    id_proof_type_other: nomination.id_proof_type_other || "",
    id_proof_no: nomination.id_proof_no || "",
    village: nomination.village || "",
    post_office: nomination.post_office || "",
    project: nomination.project || "",
    pincode: nomination.pincode || "",
    status: nomination.status || "",
    registration_status: registrationStatus,
    created_at: nomination.created_at || nomination.updated_at || "",
    submissionDate: resolveSubmissionTimestampFromSteps({ s1, s4, s5 }),
    email: nomination.email || "",
    phone: nomination.phone || "",
  };
};

const DisDashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [applications, setApplications] = useState([]);
  const [formStatusList, setFormStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formStatusListLoading, setFormStatusListLoading] = useState(false);
  const [formStatusListError, setFormStatusListError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [stepStatusFilter, setStepStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFormPreviewModal, setShowFormPreviewModal] = useState(false);
  const [selectedFormPreviewData, setSelectedFormPreviewData] = useState(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [recommendationApp, setRecommendationApp] = useState(null);
  const [noFormDataAlert, setNoFormDataAlert] = useState(false);
  const [exporting, setExporting] = useState("");
  const [exportError, setExportError] = useState(null);

  const [recommendedApplications, setRecommendedApplications] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState(null);
  const [directorRecommendations, setDirectorRecommendations] = useState([]);
  const [directorRecommendationsCount, setDirectorRecommendationsCount] = useState(0);
  const [directorRecommendationsLoading, setDirectorRecommendationsLoading] = useState(false);
  const [directorateSelectionIds, setDirectorateSelectionIds] = useState([]);
  const [showDirectorateSelectionModal, setShowDirectorateSelectionModal] = useState(false);
  const [showDirectorateConfirmModal, setShowDirectorateConfirmModal] = useState(false);
  const [showDirectorateRecommendationModal, setShowDirectorateRecommendationModal] = useState(false);
  const [showDirectorateDeleteModal, setShowDirectorateDeleteModal] = useState(false);
  const [directorateDeleteIds, setDirectorateDeleteIds] = useState([]);
  const [directorateSearch, setDirectorateSearch] = useState("");
  const [directorateDeleteSearch, setDirectorateDeleteSearch] = useState("");
  const [directorateTargets, setDirectorateTargets] = useState([]);
  const [directorateFile, setDirectorateFile] = useState(null);
  const [directorateRemark, setDirectorateRemark] = useState("");
  const [directorateSaving, setDirectorateSaving] = useState(false);
  const [directorateDeleting, setDirectorateDeleting] = useState(false);
  const [directorateProgress, setDirectorateProgress] = useState("");
  const [directorateError, setDirectorateError] = useState(null);
  const [directorateActionMessage, setDirectorateActionMessage] = useState("");

  // Registration list from the same source the IT Cell dashboard reads, used to
  // build the step-status filter so it lists every stage including registered.
  const [registrationList, setRegistrationList] = useState([]);

  // Table shows 50 rows at a time; the page resets whenever the filter set changes.
  const PAGE_SIZE = 50;
  const [currentPage, setCurrentPage] = useState(1);

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

  const fetchApplicationsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/director-itcell/application/status/`, {
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
        setApplications(result.data.map(mapApiToApp));
        setFormStatusList(result.data);
        return result.data;
      }
      setApplications([]);
      setFormStatusList([]);
      return [];
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError(err.message || "Failed to fetch applications");
      setApplications([]);
      setFormStatusList([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchFormStatusData = async () => {
    setFormStatusListLoading(true);
    setFormStatusListError(null);
    try {
      return await fetchApplicationsData();
    } catch (err) {
      setFormStatusListError(err.message || "Failed to fetch form status details");
      return [];
    } finally {
      setFormStatusListLoading(false);
    }
  };

  const fetchRecommendedApplications = async () => {
    try {
      setRecommendedLoading(true);
      setRecommendedError(null);
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/recommended-application/`, {
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
      setRecommendedError(err.message || "Failed to fetch recommended applications");
      return [];
    } finally {
      setRecommendedLoading(false);
    }
  };

  const fetchDirectorRecommendations = async () => {
    try {
      setDirectorRecommendationsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(DIRECTOR_RECOMMENDATION_URL, {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setDirectorRecommendations(result.data);
        setDirectorRecommendationsCount(Number(result.count ?? result.data.length));
        return result.data;
      }
      setDirectorRecommendations([]);
      setDirectorRecommendationsCount(0);
      return [];
    } catch (err) {
      console.error("Failed to fetch Director recommendations:", err);
      setDirectorateError(err.message || "Failed to fetch Director recommendations");
      setDirectorRecommendations([]);
      setDirectorRecommendationsCount(0);
      return [];
    } finally {
      setDirectorRecommendationsLoading(false);
    }
  };

  const fetchRegisteredApplications = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/bravery/it-cell/applications/`, {
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
        setRegistrationList(result.data);
        return result.data;
      }
      setRegistrationList([]);
      return [];
    } catch (err) {
      console.error("Failed to fetch registered applications:", err);
      setRegistrationList([]);
      return [];
    }
  };

  useEffect(() => {
    fetchApplicationsData();
    fetchRecommendedApplications();
    fetchDirectorRecommendations();
    fetchRegisteredApplications();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Funnel: registered -> step 1-3 done -> step 4 done -> fully submitted.
  const completedApplications = applications.filter(
    (app) => app.step_status === "Final Submitted"
  ).length;

  // Every application received, not only the registrations that have not
  // started the form yet.
  const totalRegistrationCount = applications.length;

  const inProgressApplications = applications.filter(
    (app) => app.completed_steps >= 1 && app.completed_steps <= 3
  ).length;

  const totalApplications = applications.filter(
    (app) => app.completed_steps >= 4 && app.step_status !== "Final Submitted"
  ).length;

  const recommendedCount = recommendedApplications.filter(
    (item) => String(item.is_forwared_to_director || "").trim().toLowerCase() === "yes"
  ).length;

  const recommendedById = new Map(
    recommendedApplications.map((item) => [String(item.applicant_id || "").trim(), item])
  );

  const getRecommendation = (applicantId) =>
    recommendedById.get(String(applicantId || "").trim()) || null;

  const directorRecommendationById = new Map(
    directorRecommendations.map((item) => [String(item.applicant_id || "").trim(), item])
  );

  const getDirectorRecommendation = (applicantId) =>
    directorRecommendationById.get(String(applicantId || "").trim()) || null;

  const getRecommendationFileSrc = (applicantId) =>
    getFileSrc(getRecommendation(applicantId)?.applicant_file);

  const isDirectorateForwarded = (applicantId) =>
    Boolean(getDirectorRecommendation(applicantId));

  const isForwardedToDirector = (applicantId) =>
    String(getRecommendation(applicantId)?.is_forwared_to_director || "").trim().toLowerCase() === "yes";

  const toggleDirectorateSelection = (applicantId) => {
    const id = String(applicantId || "").trim();
    if (!id) return;
    setDirectorateSelectionIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id]
    );
  };

  const readRecommendationError = async (response) => {
    const text = await response.text().catch(() => "");
    if (!text) return "";
    try {
      const parsed = JSON.parse(text);
      const details = parsed.errors
        ? Object.entries(parsed.errors)
            .map(([field, messages]) => `${field}: ${[].concat(messages).join(", ")}`)
            .join(" | ")
        : parsed.message || "";
      return details ? ` - ${details}` : ` - ${text}`;
    } catch {
      return ` - ${text}`;
    }
  };

  const requestDirectorRecommendation = async ({ method, payload, file }) => {
    const accessToken = localStorage.getItem("accessToken");
    const authHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key !== "dir_file" && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    if (file) formData.append("dir_file", file, file.name);

    let response = await fetch(DIRECTOR_RECOMMENDATION_URL, {
      method,
      headers: authHeaders,
      body: formData,
    });
    if (!response.ok && [400, 415, 422].includes(response.status)) {
      response = await fetch(DIRECTOR_RECOMMENDATION_URL, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ ...payload, dir_file: file?.name || null }),
      });
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}${await readRecommendationError(response)}`);
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Failed to save Director recommendation");
    return result;
  };

  const toggleDirectorateDeleteSelection = (applicantId) => {
    const id = String(applicantId || "").trim();
    if (!id) return;
    setDirectorateDeleteIds((previous) =>
      previous.includes(id) ? previous.filter((selectedId) => selectedId !== id) : [...previous, id]
    );
  };

  const handleOpenDirectorateSelection = () => {
    setDirectorateSelectionIds([]);
    setDirectorateSearch("");
    setDirectorateError(null);
    setShowDirectorateSelectionModal(true);
  };

  const handleConfirmDirectorateSelection = () => {
    const targets = recommendedCandidates.filter((app) =>
      directorateSelectionIds.includes(String(app.applicant_id || "").trim())
    );
    if (!targets.length) {
      setDirectorateError("Please select at least one recommended applicant.");
      return;
    }
    setDirectorateTargets(targets);
    setShowDirectorateSelectionModal(false);
    setShowDirectorateConfirmModal(true);
  };

  const handleProceedWithDirectorateRecommendation = () => {
    setShowDirectorateConfirmModal(false);
    setDirectorateFile(null);
    setDirectorateRemark("");
    setDirectorateError(null);
    setShowDirectorateRecommendationModal(true);
  };

  const handleCloseDirectorateRecommendation = () => {
    if (directorateSaving || directorateDeleting) return;
    setShowDirectorateRecommendationModal(false);
    setDirectorateTargets([]);
    setDirectorateFile(null);
    setDirectorateRemark("");
    setDirectorateError(null);
    setDirectorateProgress("");
  };

  const handleDirectorateFileChange = (event) => {
    const input = event.target;
    const file = input.files?.[0] || null;
    if (file && !isPdfFile(file)) {
      input.value = "";
      setDirectorateFile(null);
      setDirectorateError(`Only PDF format is allowed for upload. Received: ${file.name}`);
      return;
    }
    setDirectorateError(null);
    setDirectorateFile(file);
  };

  const handleSaveDirectorateRecommendation = async () => {
    if (!directorateTargets.length || directorateSaving) return;
    if (!directorateFile || !directorateRemark.trim()) {
      setDirectorateError("Please upload a recommendation file and enter a remark.");
      return;
    }
    if (!isPdfFile(directorateFile)) {
      setDirectorateError("Only PDF format is allowed for upload.");
      return;
    }

    setDirectorateSaving(true);
    setDirectorateError(null);
    const forwardedIds = [];
    const failures = [];
    try {
      for (let index = 0; index < directorateTargets.length; index += 1) {
        const app = directorateTargets[index];
        const applicantId = String(app.applicant_id || "").trim();
        setDirectorateProgress(`Processing ${index + 1} of ${directorateTargets.length}...`);
        try {
          await requestDirectorRecommendation({
            method: "POST",
            payload: {
              applicant_id: applicantId,
              remark: directorateRemark.trim(),
              dir_file: directorateFile.name,
            },
            file: directorateFile,
          });
          forwardedIds.push(applicantId);
        } catch (requestError) {
          failures.push(`${applicantId}: ${requestError.message}`);
        }
      }

      await fetchDirectorRecommendations();
      await fetchApplicationsData();
      if (failures.length) {
        setDirectorateError(`${forwardedIds.length} of ${directorateTargets.length} applicants forwarded. Failed: ${failures.join(" | ")}`);
      } else {
        setDirectorateActionMessage(`${forwardedIds.length} applicant${forwardedIds.length === 1 ? "" : "s"} forwarded to the Final List.`);
        setDirectorateTargets([]);
        setDirectorateSelectionIds([]);
        setDirectorateFile(null);
        setDirectorateRemark("");
        setShowDirectorateRecommendationModal(false);
      }
    } catch (requestError) {
      setDirectorateError(requestError.message || "Failed to save recommendation");
    } finally {
      setDirectorateSaving(false);
      setDirectorateProgress("");
    }
  };

  const handleDeleteDirectorateRecommendations = async () => {
    const targets = applications.filter((app) =>
      directorateDeleteIds.includes(String(app.applicant_id || "").trim())
    );
    if (!targets.length || directorateDeleting) return;
    const confirmed = window.confirm(
      `Delete the Director recommendation for ${targets.length} applicant${targets.length === 1 ? "" : "s"}?`
    );
    if (!confirmed) return;
    setDirectorateDeleting(true);
    setDirectorateError(null);
    const removedIds = [];
    const failures = [];
    try {
      for (let index = 0; index < targets.length; index += 1) {
        const app = targets[index];
        const applicantId = String(app.applicant_id || "").trim();
        const recommendation = getDirectorRecommendation(applicantId);
        setDirectorateProgress(`Deleting ${index + 1} of ${targets.length}...`);
        if (!recommendation?.id) {
          failures.push(`${applicantId}: Director recommendation record not found`);
          continue;
        }
        try {
          await requestDirectorRecommendation({
            method: "DELETE",
            payload: { id: recommendation.id, applicant_id: applicantId },
          });
          removedIds.push(applicantId);
        } catch (requestError) {
          failures.push(`${applicantId}: ${requestError.message}`);
        }
      }
      await fetchDirectorRecommendations();
      await fetchApplicationsData();
      if (failures.length) {
        setDirectorateError(`${removedIds.length} of ${targets.length} recommendations deleted. Failed: ${failures.join(" | ")}`);
      } else {
        setDirectorateActionMessage(`Recommendation deleted for ${removedIds.length} applicant${removedIds.length === 1 ? "" : "s"}.`);
        setShowDirectorateDeleteModal(false);
        setDirectorateDeleteIds([]);
      }
    } finally {
      setDirectorateDeleting(false);
      setDirectorateProgress("");
    }
  };

  const getStepBadge = (stepStatus) => {
    const label = normalizeStepStatus(stepStatus);
    if (label === "Final Submitted") {
      return <Badge bg="success" className="badge-soft">Final Submitted</Badge>;
    }
    if (label === "Registered") {
      return <Badge bg="secondary" className="badge-soft">Registered</Badge>;
    }
    if (label.startsWith("Step ")) {
      return <Badge bg="primary" className="badge-soft">{label}</Badge>;
    }
    return <Badge bg="secondary" className="badge-soft">{label || "-"}</Badge>;
  };

  const getRecommendationBadge = (applicantId) => {
    const recommendation = getRecommendation(applicantId);
    if (!recommendation) {
      return <Badge bg="secondary" className="badge-soft">Not Recommended</Badge>;
    }
    return (
      <Badge bg="success" className="badge-soft">
        <FaCheck className="me-1" /> Recommended
      </Badge>
    );
  };

  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (app.applicant_id || "").toLowerCase().includes(term) ||
      (app.full_name || "").toLowerCase().includes(term) ||
      (app.phone || "").toLowerCase().includes(term) ||
      (app.email || "").toLowerCase().includes(term) ||
      (app.village || "").toLowerCase().includes(term);

    const matchesProject = !projectFilter || app.project === projectFilter;
    const matchesDistrict = !districtFilter || app.district === districtFilter;
    const matchesStepStatus =
      !stepStatusFilter || normalizeStepStatus(app.step_status) === stepStatusFilter;

    let matchesTab = true;
    if (activeTab === "completed") {
      matchesTab = app.step_status === "Final Submitted";
    } else if (activeTab === "recommended") {
      matchesTab = isForwardedToDirector(app.applicant_id);
    } else if (activeTab === "final") {
      matchesTab = isDirectorateForwarded(app.applicant_id);
    }

    return matchesSearch && matchesProject && matchesDistrict && matchesStepStatus && matchesTab;
  });

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));

  // A filter change can leave the user past the last page, so clamp instead of
  // showing an empty table.
  const safePage = Math.min(currentPage, totalPages);

  const paginatedApplications = filteredApplications.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, projectFilter, districtFilter, stepStatusFilter, activeTab]);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const pageNumbers = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const pages = [1];
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    if (start > 2) pages.push("start-ellipsis");
    for (let page = start; page <= end; page += 1) pages.push(page);
    if (end < totalPages - 1) pages.push("end-ellipsis");
    pages.push(totalPages);
    return pages;
  })();

  const uniqueProjects = Array.from(
    new Set(applications.map((app) => app.project).filter(Boolean))
  ).sort();
  const uniqueDistricts = Array.from(
    new Set(applications.map((app) => app.district).filter(Boolean))
  ).sort();
  // Options come from both sources: every stage present in the step data plus
  // the registration list, so a stage is never missing because no current row
  // happens to sit in it.
  const uniqueStepStatuses = (() => {
    const seen = new Set([
      ...applications.map((app) => normalizeStepStatus(app.step_status)),
      ...registrationList.map((item) => normalizeStepStatus(item.step_status)),
    ]);
    seen.delete("");
    const ordered = STEP_STATUS_ORDER.filter((label) => seen.has(label));
    const extra = Array.from(seen).filter((label) => !STEP_STATUS_ORDER.includes(label)).sort();
    return [...ordered, ...extra];
  })();

  const reportFilters = {
    Search: searchTerm.trim() || "All",
    Project: projectFilter || "All",
    District: districtFilter || "All",
    "Step Status": stepStatusFilter || "All",
    Tab:
      activeTab === "all"
        ? "All Forms"
        : activeTab === "completed"
          ? "Completed"
          : activeTab === "recommended"
            ? "Recommended by District Committee"
              : "Final List",
  };

  // Prepare export data similar to DPODashboard - detailed application table
  const exportApplications = filteredApplications.map((app) => ({
    ...app,
    nominator_name: app.nominator_name || app.full_name || "",
    child_name: app.child_name || app.full_name || "",
    father_name: app.father_name || "",
    step_status: normalizeStepStatus(app.step_status) || "-",
    recommendation: getDirectorRecommendation(app.applicant_id) ? "Forwarded to Directorate" : !isForwardedToDirector(app.applicant_id) ? "Not Recommended" : "Recommended",
    dpo_comment: app.dpo_comment || "",
    incident_title: app.incident_title || app.bravery_type || "",
  }));

  const handleExportPdf = async () => {
    if (exporting || !exportApplications.length) return;
    setExporting("pdf");
    setExportError(null);
    try {
      await exportDpoTablePdf(exportApplications);
    } catch (err) {
      setExportError(err.message || "PDF export failed");
    } finally {
      setExporting("");
    }
  };

  const handleExportExcel = async () => {
    if (exporting || !exportApplications.length) return;
    setExporting("excel");
    setExportError(null);
    try {
      await exportDpoTableExcel(exportApplications);
    } catch (err) {
      setExportError(err.message || "Excel export failed");
    } finally {
      setExporting("");
    }
  };

  const handleCloseRegistrationModal = () => setShowModal(false);

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

    if (!foundRecord) {
      setNoFormDataAlert(true);
      return;
    }

    setShowModal(false);
    const isApplicationCompleted =
      normalizeStepStatus(app.step_status) === "Final Submitted";
    setSelectedFormPreviewData(
      mapApiDataToPreviewData(foundRecord, isApplicationCompleted)
    );
    setShowFormPreviewModal(true);
  };

  const handleSwitchToForm = (app = selectedApplication) => {
    setShowModal(false);
    handleOpenFormDetails(app);
  };

  const handleOpenRecommendationDetails = (app = selectedApplication) => {
    if (!app) return;
    setRecommendationApp(app);
    setSelectedApplication(app);
    setShowModal(false);
    setShowRecommendationModal(true);
  };

  const recommendedCandidates = applications.filter(
    (app) => isForwardedToDirector(app.applicant_id) && !getDirectorRecommendation(app.applicant_id)
  );
  const directorRecommendationCandidates = applications.filter((app) =>
    getDirectorRecommendation(app.applicant_id)
  );
  const directorateSelectionCandidates = recommendedCandidates.filter((app) => {
    const term = directorateSearch.trim().toLowerCase();
    return !term || `${app.applicant_id} ${app.full_name}`.toLowerCase().includes(term);
  });
  const directorateDeleteCandidates = directorRecommendationCandidates.filter((app) => {
    const term = directorateDeleteSearch.trim().toLowerCase();
    return !term || `${app.applicant_id} ${app.full_name}`.toLowerCase().includes(term);
  });

  const noFormDataAlertRef = useRef(null);

  useEffect(() => {
    if (noFormDataAlert && noFormDataAlertRef.current) {
      noFormDataAlertRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [noFormDataAlert]);

  return (
    <div className="dashboard-container">
      <DisLeftnav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <DisTopNav toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

        <div fluid className="dashboard-page-content p-2" style={{ background: "#f8fafc", minHeight: "calc(100vh - 60px)" }}>
          {/* Page Header */}
          <div className="dashboard-page-header d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1 fw-bold text-dark" style={{ fontSize: "1.5rem" }}>
                State Dashboard
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                मुख्यमंत्री राज्य बाल वीरता पुरस्कार - District wise student applications
              </p>
            </div>
            <div className="d-flex gap-2 mt-3 mt-md-0">
              <Button
                variant="light"
                size="sm"
                className="d-flex align-items-center border shadow-sm"
                onClick={handleExportExcel}
                disabled={Boolean(exporting) || loading || filteredApplications.length === 0}
              >
                {exporting === "excel" ? <Spinner size="sm" /> : <FaFileExcel className="me-2 text-success" />}
                Excel
              </Button>
              <Button
                variant="light"
                size="sm"
                className="d-flex align-items-center border shadow-sm"
                onClick={handleExportPdf}
                disabled={Boolean(exporting) || loading || filteredApplications.length === 0}
              >
                {exporting === "pdf" ? <Spinner size="sm" /> : <FaFilePdf className="me-2 text-danger" />}
                PDF
              </Button>
            </div>
          </div>

          {exportError && (
            <Alert variant="danger" className="rounded-3 border-0 shadow-sm" onClose={() => setExportError(null)} dismissible>
              {exportError}
            </Alert>
          )}

          {recommendedError && (
            <Alert variant="warning" className="rounded-3 border-0 shadow-sm">
              {recommendedError}
            </Alert>
          )}

          {directorateError && (
            <Alert variant="danger" className="rounded-3 border-0 shadow-sm" onClose={() => setDirectorateError(null)} dismissible>
              {directorateError}
            </Alert>
          )}
          {directorateActionMessage && (
            <Alert
              variant="success"
              className="rounded-3 border-0 shadow-sm"
              onClose={() => setDirectorateActionMessage("")}
              dismissible
            >
              {directorateActionMessage}
            </Alert>
          )}

          {formStatusListLoading && (
            <div className="text-center py-2">
              <Spinner animation="border" size="sm" variant="primary" />
              <span className="ms-2" style={{ fontSize: "0.85rem", color: "#64748b" }}>
                फॉर्म डेटा लोड हो रहा है...
              </span>
            </div>
          )}

          {noFormDataAlert && (
            <Alert
              ref={noFormDataAlertRef}
              variant="warning"
              dismissible
              onClose={() => setNoFormDataAlert(false)}
              className="rounded-3 border-0 shadow-sm"
              style={{ fontSize: "0.875rem" }}
            >
              <strong>सूचना:</strong> इस आवेदक द्वारा अभी तक आवेदन प्रपत्र (Step 1) नहीं भरा गया है।
            </Alert>
          )}

          {loading && (
            <div className="text-center mt-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading applications...</p>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="rounded-3 border-0 shadow-sm">
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <>
              {/* Compact Stat Cards */}
              <Row className="g-3 mb-4">
                {[
                  { label: "Total Registration", value: totalRegistrationCount, icon: <FaUserGraduate />, bg: "primary-soft", color: "primary" },
                  { label: "In Progress", value: inProgressApplications, icon: <FaSpinner />, bg: "info-soft", color: "info" },
                  { label: "Total Applications", value: totalApplications, icon: <FaTasks />, bg: "warning-soft", color: "warning" },
                  { label: "Final Submitted", value: completedApplications, icon: <FaCheckCircle />, bg: "success-soft", color: "success" },
                  { label: "Recommended", value: recommendedLoading ? "-" : recommendedCount, icon: <FaCheck />, bg: "success-soft", color: "success" },
                ].map((stat, idx) => (
                  <Col xs={6} md={4} lg={4} key={idx}>
                    <Card className="dashboard-stat-card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
                      <Card.Body className="d-flex align-items-center p-3">
                        <div
                          className="d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: `var(--${stat.bg}, #e2e8f0)`,
                            color: `var(--bs-${stat.color}, #333)`,
                            fontSize: "1.1rem",
                          }}
                        >
                          {stat.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {stat.label}
                          </div>
                          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                            {stat.value}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Filters & Table Container */}
              <Card className="dashboard-table-card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                <Card.Body className="p-4">
                  {/* Filter Bar */}
                  <div className="dashboard-filter-bar mb-3">
                    <div className="dashboard-tabs d-flex flex-wrap gap-2 mb-3" style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <button
                        type="button"
                        className={`px-4 py-2 border-0 rounded-top ${activeTab === "all" ? "active-tab" : "inactive-tab"}`}
                        style={{
                          background: activeTab === "all" ? "#2563eb" : "#f1f5f9",
                          color: activeTab === "all" ? "#fff" : "#64748b",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          borderBottom: activeTab === "all" ? "3px solid #2563eb" : "3px solid transparent",
                          borderRadius: "8px 8px 0 0",
                        }}
                        onClick={() => { setActiveTab("all"); setStepStatusFilter(""); }}
                      >
                        All Forms
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 border-0 rounded-top ${activeTab === "completed" ? "active-tab" : "inactive-tab"}`}
                        style={{
                          background: activeTab === "completed" ? "#16a34a" : "#f1f5f9",
                          color: activeTab === "completed" ? "#fff" : "#64748b",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          borderBottom: activeTab === "completed" ? "3px solid #16a34a" : "3px solid transparent",
                          borderRadius: "8px 8px 0 0",
                        }}
                        onClick={() => { setActiveTab("completed"); setStepStatusFilter(""); }}
                      >
                        Completed Forms
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 border-0 rounded-top ${activeTab === "recommended" ? "active-tab" : "inactive-tab"}`}
                        style={{
                          background: activeTab === "recommended" ? "#7c3aed" : "#f1f5f9",
                          color: activeTab === "recommended" ? "#fff" : "#64748b",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          borderBottom: activeTab === "recommended" ? "3px solid #7c3aed" : "3px solid transparent",
                          borderRadius: "8px 8px 0 0",
                        }}
                        onClick={() => {
                          setActiveTab("recommended");
                          setStepStatusFilter("");
                          setDirectorateSelectionIds([]);
                        }}
                      >
                        Recommended by District Committee
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 border-0 rounded-top ${activeTab === "final" ? "active-tab" : "inactive-tab"}`}
                        style={{
                          background: activeTab === "final" ? "#334155" : "#f1f5f9",
                          color: activeTab === "final" ? "#fff" : "#64748b",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          borderBottom: activeTab === "final" ? "3px solid #334155" : "3px solid transparent",
                          borderRadius: "8px 8px 0 0",
                        }}
                        onClick={() => {
                          setActiveTab("final");
                          setStepStatusFilter("");
                          setDirectorateSelectionIds([]);
                        }}
                      >
                        Final List ({directorRecommendationsLoading ? "..." : directorRecommendationsCount})
                      </button>
                    </div>
                    <Row className="g-3 align-items-center">
                      <Col xs={12} md={4} lg={4}>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0" style={{ borderRadius: "8px 0 0 8px", borderColor: "#cbd5e1" }}>
                            <FaSearch className="text-muted" size={14} />
                          </span>
                          <Form.Control
                            type="text"
                            placeholder="Search by name, ID, village, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-start-0"
                            style={{ borderRadius: "0 6px 6px 0", borderColor: "#cbd5e1" }}
                          />
                        </div>
                      </Col>
                      <Col xs={6} md={3} lg={2}>
                        <Form.Select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="filter-select">
                          <option value="">All Districts</option>
                          {uniqueDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                        </Form.Select>
                      </Col>
                      <Col xs={6} md={3} lg={2}>
                        <Form.Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="filter-select">
                          <option value="">All Projects</option>
                          {uniqueProjects.map((p) => <option key={p} value={p}>{p}</option>)}
                        </Form.Select>
                      </Col>
                      {activeTab !== "completed" && activeTab !== "recommended" && activeTab !== "final" && (
                        <Col xs={6} md={2} lg={2}>
                          <Form.Select value={stepStatusFilter} onChange={(e) => setStepStatusFilter(e.target.value)} className="filter-select">
                            <option value="">All Steps</option>
                            {uniqueStepStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                          </Form.Select>
                        </Col>
                      )}
                    </Row>
                    {activeTab === "recommended" && (
                      <div className="dashboard-filter-actions d-flex flex-wrap align-items-center gap-2 mt-3">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={handleOpenDirectorateSelection}
                          disabled={recommendedCandidates.length === 0}
                          className="d-flex align-items-center"
                        >
                          <FaCheck className="me-1" /> Recommend to Final List
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setDirectorateDeleteIds([]);
                            setDirectorateDeleteSearch("");
                            setDirectorateError(null);
                            setShowDirectorateDeleteModal(true);
                          }}
                          disabled={directorRecommendationCandidates.length === 0}
                          className="d-flex align-items-center"
                        >
                          <FaTimes className="me-1" /> Delete Recommendation
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Export buttons above table */}
                  <div className="d-flex justify-content-end gap-2 mb-2">
                    <Button
                      variant="light"
                      size="sm"
                      className="d-flex align-items-center border shadow-sm"
                      onClick={handleExportExcel}
                      disabled={Boolean(exporting) || loading || filteredApplications.length === 0}
                      title="Export all matching table rows to Excel"
                    >
                      {exporting === "excel" ? (
                        <Spinner size="sm" />
                      ) : (
                        <FaFileExcel className="me-2 text-success" />
                      )}
                      Excel
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      className="d-flex align-items-center border shadow-sm"
                      onClick={handleExportPdf}
                      disabled={Boolean(exporting) || loading || filteredApplications.length === 0}
                      title="Export all matching table rows to PDF"
                    >
                      {exporting === "pdf" ? (
                        <Spinner size="sm" />
                      ) : (
                        <FaFilePdf className="me-2 text-danger" />
                      )}
                      PDF
                    </Button>
                  </div>

                  {/* Table */}
                  <div className="dashboard-table-wrap district-table-wrap table-responsive">
                    <Table hover className="dashboard-table align-items-center" style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", width: "50px" }}>#</th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Photo</th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Nominator Full Name</th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Child Full Name</th>
                           <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Father's Name</th>
                           <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Mobile No</th>
                           <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Age</th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Class</th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Type of Bravery</th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            <FaMapMarkerAlt className="me-1" /> District
                          </th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Step Status</th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Recommended by District Committee</th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {activeTab === "final" ? "Director Remark" : "Comment by District Committee"}
                          </th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.length === 0 ? (
                          <tr>
                            <td colSpan={15} className="text-center py-5 text-muted" style={{ fontSize: "0.9rem" }}>
                              No applications found matching your criteria.
                            </td>
                          </tr>
                        ) : (
                          paginatedApplications.map((app, index) => (
                            <tr key={app.applicant_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 500 }}>
                                {(safePage - 1) * PAGE_SIZE + index + 1}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                {app.photo ? (
                                  <Image src={app.photo} roundedCircle style={{ width: "36px", height: "36px", objectFit: "cover", border: "2px solid #e2e8f0" }} alt="profile" />
                                ) : (
                                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <FaUserCircle style={{ color: "#cbd5e1", fontSize: "1.2rem" }} />
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.875rem" }}>{app.nominator_name || "-"}</div>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.875rem" }}>{app.child_name || "-"}</div>
                              </td>
                               <td style={{ padding: "12px 16px", color: "#475569", fontSize: "0.875rem" }}>{app.father_name || "-"}</td>
                               <td style={{ padding: "12px 16px", color: "#475569", fontSize: "0.875rem" }}>{app.phone || "-"}</td>
                               <td style={{ padding: "12px 16px", color: "#475569", fontSize: "0.875rem" }}>{app.age || "-"}</td>
                              <td style={{ padding: "12px 16px", color: "#475569", fontSize: "0.875rem" }}>{app.class_name || "-"}</td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  color: "#475569",
                                  fontSize: "0.875rem",
                                }}
                                title={app.bravery_type || ""}
                              >
                                {app.bravery_type || "-"}
                              </td>
                              <td style={{ padding: "12px 16px", color: "#475569", fontSize: "0.875rem" }}>
                                {app.district || "-"}
                                {app.project && (
                                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{app.project}</div>
                                )}
                              </td>
                              <td style={{ padding: "12px 16px" }}>{getStepBadge(app.step_status)}</td>
                              <td style={{ padding: "12px 16px" }}>{getRecommendationBadge(app.applicant_id)}</td>
                              <td style={{ padding: "12px 16px" }}>
                                {(activeTab === "final"
                                  ? getDirectorRecommendation(app.applicant_id)?.dir_remark
                                  : app.dpo_comment) ? (
                                  <div
                                    style={{ fontSize: "0.8rem", color: "#475569", maxWidth: "180px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
                                    title={activeTab === "final"
                                      ? getDirectorRecommendation(app.applicant_id)?.dir_remark
                                      : app.dpo_comment}
                                  >
                                    {activeTab === "final"
                                      ? getDirectorRecommendation(app.applicant_id)?.dir_remark
                                      : app.dpo_comment}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>-</span>
                                )}
                              </td>
                              <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                <div className="d-flex gap-2 justify-content-end">
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleOpenFormDetails(app)}
                                    className="d-flex align-items-center"
                                    style={{ borderRadius: "8px", fontSize: "0.8rem", fontWeight: 500 }}
                                    title="View Form"
                                  >
                                    <FaFileAlt className="me-1" /> View Form
                                  </Button>
                                  {Boolean(getRecommendation(app.applicant_id)) && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleOpenRecommendationDetails(app)}
                                      className="d-flex align-items-center"
                                      style={{ borderRadius: "8px", padding: "0px 12px", height: "32px", fontSize: "0.8rem", fontWeight: 500 }}
                                      title="View Recommendation"
                                    >
                                      <FaPaperclip className="me-1" /> Recommendation
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {filteredApplications.length > 0 && (
                    <div className="dashboard-pagination">
                      <span className="dashboard-pagination-info">
                        Showing {(safePage - 1) * PAGE_SIZE + 1} to{" "}
                        {Math.min(safePage * PAGE_SIZE, filteredApplications.length)} of{" "}
                        {filteredApplications.length} applications
                      </span>
                      <div className="dashboard-pagination-controls">
                        <Button
                          variant="light"
                          size="sm"
                          className="dashboard-page-btn"
                          disabled={safePage === 1}
                          onClick={() => goToPage(safePage - 1)}
                        >
                          Previous
                        </Button>
                        {pageNumbers.map((page, pageIndex) =>
                          typeof page === "number" ? (
                            <Button
                              key={page}
                              variant="light"
                              size="sm"
                              className={`dashboard-page-btn ${page === safePage ? "active" : ""}`}
                              onClick={() => goToPage(page)}
                            >
                              {page}
                            </Button>
                          ) : (
                            <span key={`${page}-${pageIndex}`} className="dashboard-page-ellipsis">
                              ...
                            </span>
                          )
                        )}
                        <Button
                          variant="light"
                          size="sm"
                          className="dashboard-page-btn"
                          disabled={safePage === totalPages}
                          onClick={() => goToPage(safePage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </div>

        {/* Registration Details Modal */}
        <Modal show={showModal} onHide={handleCloseRegistrationModal} size="lg" centered contentClassName="border-0 shadow-lg">
          <Modal.Header closeButton className="bg-white border-bottom p-4" style={{ borderRadius: "12px 12px 0 0" }}>
            <Modal.Title className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
              Registration Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4" style={{ background: "#fff" }}>
            {selectedApplication && (
              <div>
                <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px", fontWeight: 700 }}>
                  Applicant Information
                </h6>
                <Row className="g-3 mb-4">
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Applicant ID</small>
                      <p className="detail-value text-primary fw-bold">{selectedApplication.applicant_id}</p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Full Name</small>
                      <p className="detail-value text-dark fw-bold">{selectedApplication.full_name}</p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Nominator Category</small>
                      <p className="detail-value text-dark">{selectedApplication.nominator_category || "-"}</p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Relation With Child</small>
                      <p className="detail-value text-dark">{selectedApplication.relat_with_child || "-"}</p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Phone</small>
                      <p className="detail-value text-dark">{selectedApplication.phone || "-"}</p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Email</small>
                      <p className="detail-value text-dark">{selectedApplication.email || "-"}</p>
                    </div>
                  </Col>
                </Row>

                <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px", fontWeight: 700 }}>
                  ID Proof Details
                </h6>
                <Row className="g-3 mb-4">
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">ID Proof Type</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.id_proof_type || "-"}
                        {selectedApplication.id_proof_type_other ? ` (${selectedApplication.id_proof_type_other})` : ""}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">ID Proof Number</small>
                      <p className="detail-value text-dark">{selectedApplication.id_proof_no || "-"}</p>
                    </div>
                  </Col>
                </Row>

                <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px", fontWeight: 700 }}>
                  Address Details
                </h6>
                <Row className="g-3 mb-4">
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Village</small>
                      <p className="detail-value text-dark">{selectedApplication.village || "-"}</p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Post Office</small>
                      <p className="detail-value text-dark">{selectedApplication.post_office || "-"}</p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Project</small>
                      <p className="detail-value text-dark">{selectedApplication.project || "-"}</p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">District</small>
                      <p className="detail-value text-dark">{selectedApplication.district || "-"}</p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Pincode</small>
                      <p className="detail-value text-dark">{selectedApplication.pincode || "-"}</p>
                    </div>
                  </Col>
                </Row>

                <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px", fontWeight: 700 }}>
                  Application Status
                </h6>
                <Row className="g-3 mb-4">
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Registration Status</small>
                      <p className="detail-value text-dark">{selectedApplication.registration_status || "-"}</p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Status</small>
                      <p className="detail-value text-dark">{selectedApplication.status || "-"}</p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Step Status</small>
                      <div className="mt-1">{getStepBadge(selectedApplication.step_status)}</div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Created At</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.created_at
                          ? new Date(selectedApplication.created_at).toLocaleString("en-IN")
                          : "-"}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Application Submitted On</small>
                      <p className="detail-value text-dark">
                        {formatSubmissionDateTime(selectedApplication.submissionDate, "-")}
                      </p>
                    </div>
                  </Col>
                </Row>

                <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px", fontWeight: 700 }}>
                  Recommendation
                </h6>
                {(() => {
                  const recommendation = getRecommendation(selectedApplication.applicant_id);
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
                      <Alert variant="secondary" className="rounded-3 border-0 mb-0" style={{ fontSize: "0.85rem" }}>
                        <FaHourglassHalf className="me-1" /> This application has not been recommended yet.
                      </Alert>
                    );
                  }
                  return (
                    <div className="p-4 rounded-3" style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
                      <Row className="g-3">
                        <Col xs={12} md={6}>
                          <div className="detail-block">
                            <small className="detail-label">Recommended On</small>
                            <p className="detail-value text-dark">
                              {recommendation.created_at
                                ? new Date(recommendation.created_at).toLocaleString("en-IN")
                                : "-"}
                            </p>
                          </div>
                        </Col>
                        <Col xs={12} md={6}>
                          <div className="detail-block">
                            <small className="detail-label">District</small>
                            <p className="detail-value text-dark">{recommendation.district || "-"}</p>
                          </div>
                        </Col>
                        <Col xs={12} md={6}>
                          <div className="detail-block">
                            <small className="detail-label">Recommendation File</small>
                            {getRecommendationFileSrc(selectedApplication.applicant_id) ? (
                              <a
                                href={getRecommendationFileSrc(selectedApplication.applicant_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="d-inline-flex align-items-center text-decoration-none fw-bold"
                                style={{ fontSize: "0.85rem", color: "#2563eb" }}
                              >
                                <FaPaperclip className="me-1" /> View / Download File
                              </a>
                            ) : (
                              <p className="detail-value text-dark">-</p>
                            )}
                          </div>
                        </Col>
                        <Col xs={12} md={6}>
                          <div className="detail-block">
                            <small className="detail-label">Remark</small>
                            <p className="detail-value text-dark">{recommendation.remark || "-"}</p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  );
                })()}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="p-4 border-top" style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}>
            <Button
              variant="link"
              onClick={() => handleSwitchToForm(selectedApplication)}
              className="me-auto p-0 text-decoration-none fw-bold"
              style={{ fontSize: "0.85rem" }}
            >
              <FaFileAlt className="me-1" /> आवेदन प्रपत्र देखें →
            </Button>
            <Button variant="secondary" onClick={handleCloseRegistrationModal} className="px-4" style={{ borderRadius: "8px", fontSize: "0.85rem" }}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Recommendation Details Modal (read only) */}
        <Modal show={showRecommendationModal} onHide={() => setShowRecommendationModal(false)} size="lg" centered contentClassName="border-0 shadow-lg">
          <Modal.Header closeButton className="bg-white border-bottom p-4" style={{ borderRadius: "12px 12px 0 0" }}>
            <Modal.Title className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
              Recommendation Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4" style={{ background: "#fff" }}>
            {recommendationApp && (
              <div>
                <div className="p-3 mb-4 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <p className="mb-1 text-muted" style={{ fontSize: "0.8rem" }}>
                    Applicant ID: <span className="fw-bold text-dark">{recommendationApp.applicant_id}</span>
                  </p>
                  <h5 className="mb-0 text-dark" style={{ fontSize: "1rem" }}>{recommendationApp.full_name}</h5>
                  <p className="mb-0 mt-1 text-muted" style={{ fontSize: "0.8rem" }}>
                    District: <span className="fw-bold text-dark">{recommendationApp.district || "-"}</span>
                  </p>
                </div>

                {(() => {
                  const directorRecommendation = activeTab === "final";
                  const recommendation = directorRecommendation
                    ? getDirectorRecommendation(recommendationApp.applicant_id)
                    : getRecommendation(recommendationApp.applicant_id);
                  if (directorRecommendation ? directorRecommendationsLoading : recommendedLoading) {
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
                      <Alert variant="secondary" className="rounded-3 border-0 mb-0" style={{ fontSize: "0.85rem" }}>
                        <FaHourglassHalf className="me-1" /> This applicant has not been recommended for the award yet.
                      </Alert>
                    );
                  }
                  return (
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div className="detail-block">
                          <small className="detail-label">Recommendation Status</small>
                          <div className="mt-1">{getRecommendationBadge(recommendationApp.applicant_id)}</div>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="detail-block">
                          <small className="detail-label">Recommended On</small>
                          <p className="detail-value text-dark">
                            {recommendation.created_at
                              ? new Date(recommendation.created_at).toLocaleString("en-IN")
                              : "-"}
                          </p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="detail-block">
                          <small className="detail-label">District</small>
                            <p className="detail-value text-dark">{recommendation.district || recommendationApp.district || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="detail-block">
                          <small className="detail-label">Recommendation File</small>
                          {getFileSrc(directorRecommendation
                            ? recommendation.dir_file
                            : recommendation.applicant_file) ? (
                            <a
                              href={getFileSrc(directorRecommendation
                                ? recommendation.dir_file
                                : recommendation.applicant_file)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="d-inline-flex align-items-center text-decoration-none fw-bold"
                              style={{ fontSize: "0.85rem", color: "#2563eb" }}
                            >
                              <FaPaperclip className="me-1" /> View / Download File
                            </a>
                          ) : (
                            <p className="detail-value text-dark">No file uploaded</p>
                          )}
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className="detail-block">
                          <small className="detail-label">Remark</small>
                          <p className="detail-value text-dark" style={{ whiteSpace: "pre-wrap" }}>
                            {recommendation.dir_remark || recommendation.remark || "-"}
                          </p>
                        </div>
                      </Col>
                    </Row>
                  );
                })()}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="p-4 border-top" style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}>
            <Button variant="secondary" onClick={() => setShowRecommendationModal(false)} className="px-4" style={{ borderRadius: "8px", fontSize: "0.85rem" }}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDirectorateSelectionModal} onHide={() => setShowDirectorateSelectionModal(false)} size="lg" centered contentClassName="border-0 shadow-lg">
          <Modal.Header closeButton className="bg-white border-bottom p-4">
            <Modal.Title className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
              Select District-Recommended Applicants
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form.Control
              type="text"
              placeholder="Search by name or applicant ID..."
              value={directorateSearch}
              onChange={(event) => setDirectorateSearch(event.target.value)}
              className="mb-3"
            />
            <div className="d-flex align-items-center gap-2 mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setDirectorateSelectionIds(directorateSelectionCandidates.map((app) => String(app.applicant_id || "").trim()))}
              >
                Select All ({directorateSelectionCandidates.length})
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => setDirectorateSelectionIds([])}>
                Clear All
              </Button>
              <span className="text-muted ms-auto" style={{ fontSize: "0.8rem" }}>
                {directorateSelectionIds.length} selected
              </span>
            </div>
            <div className="p-3" style={{ border: "1px solid #e2e8f0", maxHeight: "320px", overflowY: "auto" }}>
              {directorateSelectionCandidates.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">No District Committee recommendations found.</p>
              ) : directorateSelectionCandidates.map((app) => {
                const id = String(app.applicant_id || "").trim();
                return (
                  <label key={id} className="d-flex align-items-center gap-3 px-2 py-2" style={{ cursor: "pointer" }}>
                    <Form.Check type="checkbox" checked={directorateSelectionIds.includes(id)} onChange={() => toggleDirectorateSelection(id)} />
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{app.full_name || "-"}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>{id}</div>
                    </div>
                    {getRecommendationBadge(id)}
                  </label>
                );
              })}
            </div>
            {directorateError && <Alert variant="danger" className="mt-3 mb-0">{directorateError}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowDirectorateSelectionModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmDirectorateSelection} disabled={!directorateSelectionIds.length}>Continue</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDirectorateConfirmModal} onHide={() => setShowDirectorateConfirmModal(false)} centered contentClassName="border-0 shadow-lg">
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>Confirm Applicants for Final List</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">The same recommendation file and remark will be attached to each selected applicant.</Alert>
            <div className="p-3" style={{ border: "1px solid #e2e8f0", maxHeight: "280px", overflowY: "auto" }}>
              {directorateTargets.map((app) => (
                <div key={app.applicant_id} className="d-flex justify-content-between py-2 border-bottom">
                  <span>{app.full_name || "-"} <small className="text-muted">({app.applicant_id})</small></span>
                  {getRecommendationBadge(app.applicant_id)}
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowDirectorateConfirmModal(false)}>Back</Button>
            <Button variant="primary" onClick={handleProceedWithDirectorateRecommendation}>Confirm &amp; Continue</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDirectorateRecommendationModal} onHide={handleCloseDirectorateRecommendation} size="lg" centered contentClassName="border-0 shadow-lg">
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>Recommend to Final List</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="p-3 mb-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", maxHeight: "170px", overflowY: "auto" }}>
              <strong className="d-block mb-2"> Applicants Selected For Final List ({directorateTargets.length})</strong>
              {directorateTargets.map((app) => (
                <div key={app.applicant_id} className="py-1">
                  {app.full_name || "-"} <small className="text-muted">({app.applicant_id})</small>
                </div>
              ))}
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Recommendation File <span className="text-danger">*</span></Form.Label>
              <Form.Control type="file" accept=".pdf,application/pdf" onChange={handleDirectorateFileChange} />
              <Form.Text muted>{PDF_UPLOAD_NOTE}</Form.Text>
              <Form.Text muted>One file will be uploaded for all Applicants Selected For Final List.</Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label>Remark <span className="text-danger">*</span></Form.Label>
              <Form.Control as="textarea" rows={3} value={directorateRemark} onChange={(event) => setDirectorateRemark(event.target.value)} placeholder="Enter remarks for the final-list recommendation..." />
            </Form.Group>
            {directorateProgress && <Alert variant="info" className="mt-3 mb-0">{directorateProgress}</Alert>}
            {directorateError && <Alert variant="danger" className="mt-3 mb-0">{directorateError}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDirectorateRecommendation}>Cancel</Button>
            <Button variant="success" onClick={handleSaveDirectorateRecommendation} disabled={directorateSaving || directorateDeleting}>
              {directorateSaving ? <><Spinner size="sm" className="me-2" />Saving...</> : <><FaCheck className="me-1" />Save &amp; Forward</>}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDirectorateDeleteModal} onHide={() => !directorateDeleting && setShowDirectorateDeleteModal(false)} size="lg" centered contentClassName="border-0 shadow-lg">
          <Modal.Header closeButton={!directorateDeleting}>
            <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>Delete Director Recommendation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              type="text"
              placeholder="Search by name or applicant ID..."
              value={directorateDeleteSearch}
              onChange={(event) => setDirectorateDeleteSearch(event.target.value)}
              className="mb-3"
            />
            <div className="d-flex gap-2 align-items-center mb-3">
              <Button variant="outline-secondary" size="sm" onClick={() => setDirectorateDeleteIds(directorateDeleteCandidates.map((app) => String(app.applicant_id || "").trim()))}>
                Select All ({directorateDeleteCandidates.length})
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => setDirectorateDeleteIds([])}>Clear All</Button>
              <span className="text-muted ms-auto">{directorateDeleteIds.length} selected</span>
            </div>
            <div className="p-3" style={{ border: "1px solid #e2e8f0", maxHeight: "320px", overflowY: "auto" }}>
              {directorateDeleteCandidates.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">No Director recommendations found.</p>
              ) : directorateDeleteCandidates.map((app) => {
                const id = String(app.applicant_id || "").trim();
                return (
                  <label key={id} className="d-flex align-items-center gap-3 px-2 py-2" style={{ cursor: "pointer" }}>
                    <Form.Check type="checkbox" checked={directorateDeleteIds.includes(id)} onChange={() => toggleDirectorateDeleteSelection(id)} />
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{app.full_name || "-"}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>{id}</div>
                    </div>
                    {getRecommendationBadge(id)}
                  </label>
                );
              })}
            </div>
            {directorateProgress && <Alert variant="info" className="mt-3 mb-0">{directorateProgress}</Alert>}
            {directorateError && <Alert variant="danger" className="mt-3 mb-0">{directorateError}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowDirectorateDeleteModal(false)} disabled={directorateDeleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteDirectorateRecommendations} disabled={directorateDeleting || !directorateDeleteIds.length}>
              {directorateDeleting ? <><Spinner size="sm" className="me-2" />Deleting...</> : <><FaTimes className="me-1" />Delete Recommendation</>}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Form Preview Modal */}
        {showFormPreviewModal && selectedFormPreviewData && (
          <PreviewModal
            data={selectedFormPreviewData}
            onClose={() => setShowFormPreviewModal(false)}
            isApplicationCompleted={selectedFormPreviewData.isApplicationCompleted}
            isITCell={true}
          />
        )}
      </div>
    </div>
  );
};

export default DisDashBoard;
