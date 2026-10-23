import React, { useState, useEffect, useRef } from "react";
import {
  Container,
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
  FaCommentDots,
  FaUserCircle,
  FaSearch,
  FaPaperclip,
} from "react-icons/fa";
import DPOTopNav from "./DPOTopNav";
import DPOLeftNav from "./DPOLeftNav";
import PreviewModal from "../../../child_regis/NominationForm/PreviewModal";
import {
  exportDpoTableExcel,
  exportDpoTablePdf,
} from "../../../../utils/dpoTableExport";
import { formatSubmissionDateTime, resolveSubmissionTimestampFromSteps } from "../../../../utils/submissionDate";
import "./DPODashboard.css";

// Static mapping function (kept for modal structure)
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
  const idProofType =
    idProofTypes[nomination.id_proof_type] || nomination.id_proof_type || "";

  return {
    applicant_id: item.applicant_id || s1.applicant_id || "",
    registration: {
      nominator_category: nomination.nominator_category || "",
      full_name: nomination.full_name || "",
      relat_with_child: nomination.relat_with_child || "",
      phone: nomination.phone || "",
      email: nomination.email || "",
      id_proof_type: idProofType,
      id_proof_number_label: idProofType
        ? `7. ${idProofType} संख्या`
        : "7. पहचान पत्र संख्या",
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
    bankAccountHolderType:
      s2.bank_nominee_relation || s1.bank_nominee_relation || "",
    bankAccountHolderName: s2.bank_holder_name || s1.bank_holder_name || "",
    bankName: s2.bank_name || s1.bank_name || "",
    ifscCode: s2.ifsc_code || s1.ifsc_code || "",
    bankAccountNumber: s2.bank_acc_no || s1.bank_acc_no || "",
    schoolName: s1.school_name || "",
    schoolAddress: s1.school_address || "",
    currentClass: s1.current_class || "",
    "currentग्राम/मोहल्ला": s1.current_village || "",
    "currentतहसील ": s1.current_post_office || "",
    currentजनपद: s1.current_district || "",
    "currentविकासखण्ड/नगर निकाय": s1.current_block_local_body || "",
    "currentपिन कोड": s1.current_pincode || "",
    "permanentग्राम/मोहल्ला": s1.permanent_village || "",
    "permanentतहसील ": s1.permanent_post_office || "",
    permanentजनपद: s1.permanent_district || "",
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
    document2:
      s4.permanent_residence_certificate ||
      s5.permanent_residence_certificate ||
      "",
    document3:
      s4.child_birth_age_certificate || s5.child_birth_age_certificate || "",
    document4:
      s4.bravery_incident_description || s5.bravery_incident_description || "",
    document5: s4.child_passport_photo || s5.child_passport_photo || "",
    document6: s4.fir_police_report || s5.fir_police_report || "",
    document7: s4.media_report || s5.media_report || "",
    document8: s4.eyewitness_statements || s5.eyewitness_statements || "",
    document9: s4.incident_photo_video_url || s5.incident_photo_video_url || "",
    document10: s4.school_certificate || s5.school_certificate || "",
    document11:
      s4.otherSupporting_documents || s5.otherSupporting_documents || "",
    document12: s4.bank_detail || s5.bank_detail || "",
    step4Status: s4.status || "",
    declarationDocument: s5.declarationDocument || s4.declarationDocument || "",
    parentDeclarationDocument:
      s5.parentDeclarationDocument || s4.parentDeclarationDocument || "",
    step5Status: s5.status || "",
    rawStep1: s1,
    rawStep2: s2,
    rawStep3: s3,
    rawStep4: s4,
    rawStep5: s5,
    dpoStatus: item.dpo_status || {},
  };
};

/* STATIC DATA DEFINITIONS REMOVED - fetch data dynamically below */

// One label per funnel stage so the filter reads the same as the District and
// IT Cell dashboards. A registration without any form step counts as "Registered".
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
  if (!raw || lower === "registered" || lower === "pending")
    return "Registered";
  if (lower.startsWith("step-") || lower.startsWith("step ")) {
    return `Step ${lower.replace(/^step[-\s]/, "")}`;
  }
  // The API may report the final stage in any casing.
  const known = STEP_STATUS_ORDER.find(
    (label) => label.toLowerCase() === lower,
  );
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
    ["name", "mobile", "address", "relation"].some((field) =>
      hasText(row?.[field]),
    ),
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
  if (String(s2?.fir_status || "").trim() === "हाँ" && !has("fir_police_report"))
    return false;

  // Witness statements are required only when a witness was described.
  if (hasWitnessData(s2?.eyewitnesses) && !has("eyewitness_statements"))
    return false;

  // School certificate is required only for a student with a class on record.
  if (hasText(s1?.current_class) && !has("school_certificate")) return false;

  // A published incident needs either a media report or a photo/video link.
  const mediaRequired =
    String(s2?.media_report_available || "").trim() ===
    "हाँ, प्रकाशित हुई है।";
  if (mediaRequired && !has("media_report") && !has("incident_photo_video_url"))
    return false;

  return true;
};

const mapApiToApp = (item) => {
  if (!item) return null;
  const s1 = item["step-1"] || {};
  const nomination = item.nomination || {};

  const age = s1.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(s1.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : null;

  const DpoStatusObj = item.dpo_status || {};
  const rawDpoStatus = DpoStatusObj.status_dpo || "pending";
  let dpoStatus = rawDpoStatus;
  if (dpoStatus === "accepted") dpoStatus = "approved";
  const dpoComment = DpoStatusObj.comment_dpo || s1.comment_dpo || "";

  const s2 = item["step-2"] || {};
  const s3 = item["step-3"] || {};
  const s4 = item["step-4"] || {};
  const s5 = item["step-5"] || {};

  // Number of steps the applicant has finished, used for the funnel counts.
  const completedSteps = [s1, s2, s3, s4, s5].filter(
    (step) => step.status === "completed",
  ).length;

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
    lastCompletedStep === 3 && hasAllStep4Documents(s1, s2, s4, s5)
      ? 4
      : lastCompletedStep;

  const hasAnyStep = [s1, s2, s3, s4, s5].some(
    (step) => step && Object.keys(step).length > 0 && step.applicant_id,
  );

  let stepStatus;
  if (reachedStep === 0) {
    // No step finished: either still a plain registration, or part-way through
    // step 1.
    stepStatus = hasAnyStep ? "step-1" : "pending";
  } else if (reachedStep === 5) {
    stepStatus = "Final Submitted";
  } else {
    stepStatus = `step-${reachedStep}`;
  }
  stepStatus = normalizeStepStatus(stepStatus);

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
    // Step 2 holds the incident title the applicant typed in the form, which is
    // what the "Type of Bravery" column shows.
    incident_title: s2.incident_title || s2.incident_type || "",
    step_status: stepStatus,
    completed_steps: Math.max(completedSteps, reachedStep),
    registration_status: String(nomination.status || "")
      .trim()
      .toLowerCase(),
    dpo_status: dpoStatus,
    dpo_status_raw: rawDpoStatus,
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
    created_at: nomination.created_at || nomination.updated_at || "",
    submissionDate: resolveSubmissionTimestampFromSteps({ s1, s4, s5 }),
    email: nomination.email || "",
    phone: nomination.phone || "",
  };
};

const MEDIA_BASE_URL =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend";

const SITE_ORIGIN = "https://wecdukaward.in";

// Directory the backend stores recommendation uploads in.
const RECOMMENDATION_MEDIA_DIR = "media/bravery/recommended_application";

const joinMediaPath = (path) => {
  const withoutLeadingSlash = path.replace(/^\/+/, "");

  // Already points at the backend, e.g. "balvirtaawardproject/.../media/..."
  if (withoutLeadingSlash.startsWith("balvirtaawardproject/")) {
    return `${SITE_ORIGIN}/${withoutLeadingSlash}`;
  }

  // Already carries the media path, e.g. "media/bravery/.../file.pdf"
  if (withoutLeadingSlash.startsWith("media/")) {
    return `${MEDIA_BASE_URL}/${withoutLeadingSlash}`;
  }

  // App-relative path without the media prefix, e.g. "bravery/.../file.pdf"
  if (withoutLeadingSlash.startsWith("bravery/")) {
    return `${MEDIA_BASE_URL}/media/${withoutLeadingSlash}`;
  }

  // Bare file name, e.g. "applicant_file_abc.pdf"
  if (!withoutLeadingSlash.includes("/")) {
    return `${MEDIA_BASE_URL}/${RECOMMENDATION_MEDIA_DIR}/${withoutLeadingSlash}`;
  }

  return `${MEDIA_BASE_URL}/${withoutLeadingSlash}`;
};

const getFileSrc = (file) => {
  if (!file) return null;
  if (file instanceof File) return URL.createObjectURL(file);

  const trimmed = String(file).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const isOurSite = url.hostname.toLowerCase() === "wecdukaward.in";
      // The API returns site-root absolute URLs that serve the SPA instead of
      // the file, so re-point our own links that lack the backend prefix.
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

const DPODashboard = () => {
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
  const [stepStatusFilter, setStepStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFormPreviewModal, setShowFormPreviewModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [selectedFormPreviewData, setSelectedFormPreviewData] = useState(null);
  const [noFormDataAlert, setNoFormDataAlert] = useState(false);
  const [exporting, setExporting] = useState("");
  const [exportError, setExportError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentApp, setCommentApp] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  const [recommendedApplications, setRecommendedApplications] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState(null);

  // Registration list from the same source the IT Cell dashboard reads, used to
  // build the step-status filter so it lists every stage including registered.
  const [registrationList, setRegistrationList] = useState([]);
  const [recommendationFile, setRecommendationFile] = useState(null);
  const [recommendationRemark, setRecommendationRemark] = useState("");
  const [savingRecommendation, setSavingRecommendation] = useState(false);
  const [uploadRecommendationError, setUploadRecommendationError] =
    useState(null);
  const [deletingRecommendation, setDeletingRecommendation] = useState(false);
  const [recommendationProgress, setRecommendationProgress] = useState("");
  const [submittingAllRecommendations, setSubmittingAllRecommendations] =
    useState(false);

  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showConfirmSelectionModal, setShowConfirmSelectionModal] =
    useState(false);
  const [showDeleteRecommendationModal, setShowDeleteRecommendationModal] =
    useState(false);
  const [deleteSelectionIds, setDeleteSelectionIds] = useState([]);
  const [deleteSelectionSearch, setDeleteSelectionSearch] = useState("");
  const [selectionIds, setSelectionIds] = useState([]);
  const [selectionSearch, setSelectionSearch] = useState("");
  const [recommendationTargets, setRecommendationTargets] = useState([]);
  const [recommendationViewOnly, setRecommendationViewOnly] = useState(false);

  // Table shows 50 rows at a time; the page resets whenever the filter set changes.
  const PAGE_SIZE = 50;
  const [currentPage, setCurrentPage] = useState(1);

  // District of the signed-in DPO. Empty until the profile resolves, and left
  // empty on failure so the export stays closed rather than leaking every
  // district the status endpoint returns.

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
      const response = await fetch(
        "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/dpo/application/status/",
        {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const mapped = result.data.map(mapApiToApp);
        setApplications(mapped);
        setFormStatusList(result.data);
        return result.data;
      } else {
        setApplications([]);
        setFormStatusList([]);
        return [];
      }
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
      const data = await fetchApplicationsData();
      return data;
    } catch (err) {
      setFormStatusListError(
        err.message || "Failed to fetch form status details",
      );
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
      const response = await fetch(
        "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/recommended-application/",
        {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setRecommendedApplications(result.data);
        return result.data;
      } else {
        setRecommendedApplications([]);
        return [];
      }
    } catch (err) {
      console.error("Failed to fetch recommended applications:", err);
      setRecommendedError(
        err.message || "Failed to fetch recommended applications",
      );
      return [];
    } finally {
      setRecommendedLoading(false);
    }
  };

  const fetchRegisteredApplications = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/it-cell/applications/",
        {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        },
      );
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

  const DPO_STATUS_URL =
    "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/dpo/application/status/";

  // Saves only the remark. The status is echoed back unchanged because the
  // endpoint resolves the application from this payload and rejects the request
  // with 404 "Application not found" when it is missing.
  const saveDpoComment = async (applicantId, currentStatus, comment) => {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(DPO_STATUS_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        applicant_id: String(applicantId || "").trim(),
        status_dpo: currentStatus || "pending",
        comment_dpo: comment || "",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `HTTP error! status: ${response.status}${errorBody ? ` - ${errorBody}` : ""}`,
      );
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Failed to update DPO status");
    }
    return result;
  };

  const RECOMMENDATION_URL =
    "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/recommended-application/";

  const readErrorBody = async (response) => {
    const text = await response.text().catch(() => "");
    if (!text) return "";
    try {
      const parsed = JSON.parse(text);
      const details = parsed.errors
        ? Object.entries(parsed.errors)
            .map(
              ([field, messages]) =>
                `${field}: ${[].concat(messages).join(", ")}`,
            )
            .join(" | ")
        : parsed.message || "";
      return details ? ` - ${details}` : ` - ${text}`;
    } catch {
      return ` - ${text}`;
    }
  };

  const requestRecommendation = async ({ method, payload, file }) => {
    const accessToken = localStorage.getItem("accessToken");
    const authHeaders = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    // The endpoint expects a file upload, so send multipart first to avoid a
    // rejected JSON request. applicant_file is appended separately because a
    // File cannot go through the string form of FormData.
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "applicant_file") return;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    // Only send the file part when there is a real file. A remark-only update
    // omits it so the stored file is left untouched.
    if (file) {
      formData.append("applicant_file", file, file.name);
    }

    let response = await fetch(RECOMMENDATION_URL, {
      method,
      headers: { ...authHeaders },
      body: formData,
    });

    // Fall back to a JSON body if multipart is not accepted. A file cannot be
    // carried in JSON, so applicant_file is sent as null on that path.
    if (!response.ok && [400, 415, 422].includes(response.status)) {
      const jsonPayload = { ...payload, applicant_file: null };
      response = await fetch(RECOMMENDATION_URL, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(jsonPayload),
      });
    }

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}${await readErrorBody(response)}`,
      );
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Failed to save recommendation");
    }
    return result;
  };

  const isForwardedToDirector = (applicantId) =>
    String(getRecommendation(applicantId)?.is_forwared_to_director || "")
      .trim()
      .toLowerCase() === "yes";

  const handleFinalSubmitAllRecommendations = async () => {
    if (activeTab !== "completed") return;
    const targets = recommendedCandidates;
    if (!targets.length || submittingAllRecommendations) return;

    // Forwarding is one-way: the flag closes the recommendation tab for the
    // whole district, so make the DPO acknowledge it before anything is sent.
    const isConfirmed = window.confirm(
      `Forward ${targets.length} recommended application${
        targets.length === 1 ? "" : "s"
      } to the Directorate?\n\nOnce forwarded, this action cannot be reverted.`,
    );
    if (!isConfirmed) return;

    setSubmittingAllRecommendations(true);
    setActionMessage(null);
    const submittedIds = [];
    const failures = [];
    try {
      for (let index = 0; index < targets.length; index += 1) {
        const applicantId = String(targets[index].applicant_id || "").trim();
        const recommendation = getRecommendation(applicantId);
        if (!applicantId || !recommendation) continue;

        setRecommendationProgress(
          `Submitting ${index + 1} of ${targets.length}...`,
        );
        try {
          const accessToken = localStorage.getItem("accessToken");
          const response = await fetch(RECOMMENDATION_URL, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
            body: JSON.stringify({
              applicant_id: applicantId,
              ...(recommendation.id ? { id: recommendation.id } : {}),
              is_forwared_to_director: "yes",
            }),
          });
          if (!response.ok) {
            throw new Error(
              `HTTP error! status: ${response.status}${await readErrorBody(response)}`,
            );
          }
          const result = await response.json();
          if (!result.success)
            throw new Error(
              result.message || "Failed to submit recommendation",
            );
          submittedIds.push(applicantId);
        } catch (err) {
          failures.push(`${applicantId}: ${err.message}`);
        }
      }

      await fetchRecommendedApplications();
      setActionMessage({
        type: failures.length ? "warning" : "success",
        text: failures.length
          ? `${submittedIds.length} of ${targets.length} applications submitted. Failed: ${failures.join(" | ")}`
          : `${submittedIds.length} recommended application${submittedIds.length === 1 ? "" : "s"} submitted to the Directorate.`,
      });
    } finally {
      setSubmittingAllRecommendations(false);
      setRecommendationProgress("");
    }
  };

  // Runs one request per applicant in order, but the DPO sees a single action.
  const runForEachTarget = async ({ targets, verb, emptyMessage }) => {
    const failed = [];
    let done = 0;

    for (const app of targets) {
      const applicantId = String(app.applicant_id || "").trim();
      if (!applicantId) continue;
      done += 1;
      setRecommendationProgress(`Processing ${done} of ${targets.length}...`);
      try {
        await verb(app, applicantId);
      } catch (err) {
        failed.push(`${applicantId}: ${err.message}`);
      }
    }

    return { done, failed, emptyMessage };
  };

  const handleRecommendationFileChange = (event) => {
    const input = event.target;
    const file = input.files?.[0] || null;
    if (file && !isPdfFile(file)) {
      input.value = "";
      setRecommendationFile(null);
      setUploadRecommendationError(
        `Only PDF format is allowed for upload. Received: ${file.name}`,
      );
      return;
    }
    setUploadRecommendationError(null);
    setRecommendationFile(file);
  };

  const handleSaveRecommendation = async () => {
    const targets = recommendationTargets.filter(
      (app) =>
        normalizeStepStatus(app.step_status) === "Final Submitted" &&
        !isForwardedToDirector(app.applicant_id),
    );
    if (activeTab !== "completed" || !targets.length || savingRecommendation)
      return;

    if (!recommendationFile) {
      setUploadRecommendationError("Please upload a recommendation file.");
      return;
    }
    if (!isPdfFile(recommendationFile)) {
      setUploadRecommendationError("Only PDF format is allowed for upload.");
      return;
    }
    if (!recommendationRemark.trim()) {
      setUploadRecommendationError("Please enter a remark.");
      return;
    }

    setSavingRecommendation(true);
    setUploadRecommendationError(null);
    setRecommendationProgress("");
    try {
      const remark = recommendationRemark.trim();
      // A remark-only update sends no file, so the stored file is kept.
      const { done, failed } = await runForEachTarget({
        targets,
        verb: async (app, applicantId) => {
          const existing = getRecommendation(applicantId);
          const payload = {
            applicant_id: applicantId,
            remark,
            applicant_file: recommendationFile.name,
          };
          if (existing?.id) {
            payload.id = existing.id;
          }

          await requestRecommendation({
            method: existing ? "PUT" : "POST",
            payload,
            file: recommendationFile,
          });
        },
      });

      await fetchRecommendedApplications();
      await fetchApplicationsData();

      if (failed.length) {
        setUploadRecommendationError(
          `${done - failed.length} of ${done} applicants were saved. Failed: ${failed.join(" | ")}`,
        );
      } else {
        setActionMessage({
          type: "success",
          text: `Recommendation saved for ${done} applicant${done === 1 ? "" : "s"} and forwarded successfully.`,
        });
        setShowRecommendationModal(false);
        setRecommendationTargets([]);
        setSelectionIds([]);
        setRecommendationFile(null);
        setRecommendationRemark("");
      }
    } catch (err) {
      setUploadRecommendationError(
        err.message || "Failed to save recommendation",
      );
    } finally {
      setSavingRecommendation(false);
      setRecommendationProgress("");
    }
  };

  // Removes the stored recommendation for every target. Returns null when nothing
  // was attempted so callers can leave their modal open.
  const deleteRecommendations = async (targets) => {
    const withRecords = targets.filter(
      (app) =>
        normalizeStepStatus(app.step_status) === "Final Submitted" &&
        getRecommendation(app.applicant_id)?.id &&
        !isForwardedToDirector(app.applicant_id),
    );
    if (
      activeTab !== "completed" ||
      !withRecords.length ||
      deletingRecommendation
    )
      return null;

    const isConfirmed = window.confirm(
      `Are you sure you want to remove the recommendation for ${withRecords.length} applicant${
        withRecords.length === 1 ? "" : "s"
      }?\n\nThese applications will no longer be forwarded.`,
    );
    if (!isConfirmed) return null;

    setDeletingRecommendation(true);
    setUploadRecommendationError(null);
    setRecommendationProgress("");
    try {
      const { done, failed } = await runForEachTarget({
        targets: withRecords,
        verb: async (app, applicantId) => {
          const existing = getRecommendation(applicantId);
          await requestRecommendation({
            method: "DELETE",
            payload: { id: existing.id, applicant_id: applicantId },
          });
        },
      });

      await fetchRecommendedApplications();
      await fetchApplicationsData();

      if (failed.length) {
        setUploadRecommendationError(
          `${done - failed.length} of ${done} applicants were removed. Failed: ${failed.join(" | ")}`,
        );
      } else {
        setActionMessage({
          type: "success",
          text: `Recommendation removed for ${done} applicant${done === 1 ? "" : "s"}.`,
        });
      }
      return { done, failed };
    } catch (err) {
      setUploadRecommendationError(
        err.message || "Failed to delete recommendation",
      );
      return null;
    } finally {
      setDeletingRecommendation(false);
      setRecommendationProgress("");
    }
  };

  const handleOpenDeleteRecommendationModal = () => {
    if (activeTab !== "completed" || !recommendedCandidates.length) return;
    setDeleteSelectionSearch("");
    setUploadRecommendationError(null);
    setShowDeleteRecommendationModal(true);
  };

  const closeDeleteRecommendationModal = () => {
    if (deletingRecommendation) return;
    setShowDeleteRecommendationModal(false);
    setDeleteSelectionIds([]);
    setDeleteSelectionSearch("");
    setUploadRecommendationError(null);
    setRecommendationProgress("");
  };

  const toggleDeleteSelectionId = (applicantId) => {
    const id = String(applicantId || "").trim();
    if (!id) return;
    setDeleteSelectionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleDeleteSelectedRecommendations = async () => {
    const targets = applications.filter((app) =>
      deleteSelectionIds.includes(String(app.applicant_id || "").trim()),
    );
    if (!targets.length) {
      setUploadRecommendationError(
        "Please select at least one recommended applicant.",
      );
      return;
    }

    const result = await deleteRecommendations(targets);
    if (!result || result.failed.length) return;

    setShowDeleteRecommendationModal(false);
    setDeleteSelectionIds([]);
    setDeleteSelectionSearch("");
  };

  useEffect(() => {
    fetchApplicationsData();
    fetchRecommendedApplications();
    fetchRegisteredApplications();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Funnel: registered -> step 1-3 done -> step 4 done -> fully submitted.
  const completedApplications = applications.filter(
    (app) => app.step_status === "Final Submitted",
  ).length;

  // Every application received, not only the registrations that have not
  // started the form yet.
  const totalRegistrationCount = applications.length;

  const inProgressApplications = applications.filter(
    (app) => app.completed_steps >= 1 && app.completed_steps <= 3,
  ).length;

  const totalApplications = applications.filter(
    (app) => app.completed_steps >= 4 && app.step_status !== "Final Submitted",
  ).length;

  const getStepBadge = (stepStatus) => {
    const label = normalizeStepStatus(stepStatus);
    if (label === "Final Submitted") {
      return (
        <Badge bg="success" className="badge-soft">
          Final Submitted
        </Badge>
      );
    }
    if (label === "Registered") {
      return (
        <Badge bg="secondary" className="badge-soft">
          Registered
        </Badge>
      );
    }
    if (label.startsWith("Step ")) {
      return (
        <Badge bg="primary" className="badge-soft">
          {label}
        </Badge>
      );
    }
    return (
      <Badge bg="secondary" className="badge-soft">
        {label || "-"}
      </Badge>
    );
  };

  const getDpoStatusBadge = (dpoStatus) => {
    switch (dpoStatus) {
      case "approved":
      case "verified":
      case "accepted":
        return (
          <Badge bg="success" className="badge-soft">
            <FaCheck className="me-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge bg="danger" className="badge-soft">
            <FaTimes className="me-1" /> Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge bg="warning" text="dark" className="badge-soft">
            <FaHourglassHalf className="me-1" /> Pending
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary" className="badge-soft">
            Not Reviewed
          </Badge>
        );
    }
  };

  const recommendedById = new Map(
    recommendedApplications.map((item) => [
      String(item.applicant_id || "").trim(),
      item,
    ]),
  );

  const getRecommendation = (applicantId) =>
    recommendedById.get(String(applicantId || "").trim()) || null;

  const getRecommendationFileSrc = (applicantId) =>
    getFileSrc(getRecommendation(applicantId)?.applicant_file);

  const isRecommended = (applicantId) =>
    Boolean(getRecommendation(applicantId));

  const getRecommendationBadge = (applicantId) => {
    if (!isRecommended(applicantId)) {
      return (
        <Badge bg="secondary" className="badge-soft">
          Not Recommended
        </Badge>
      );
    }
    if (isForwardedToDirector(applicantId)) {
      return (
        <Badge bg="primary" className="badge-soft">
          Forwarded to Directorate
        </Badge>
      );
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
      (app.nominator_name || "").toLowerCase().includes(term) ||
      (app.child_name || "").toLowerCase().includes(term) ||
      (app.father_name || "").toLowerCase().includes(term) ||
      (app.phone || "").toLowerCase().includes(term) ||
      (app.email || "").toLowerCase().includes(term) ||
      (app.village || "").toLowerCase().includes(term);

    const matchesProject = !projectFilter || app.project === projectFilter;
    const matchesStepStatus =
      !stepStatusFilter ||
      normalizeStepStatus(app.step_status) === stepStatusFilter;

    let matchesTab = true;
    if (activeTab === "completed") {
      matchesTab = app.step_status === "Final Submitted";
    } else if (activeTab === "verified") {
      matchesTab = isRecommended(app.applicant_id);
    }

    return matchesSearch && matchesProject && matchesStepStatus && matchesTab;
  });

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));

  // A filter change can leave the user past the last page, so clamp instead of
  // showing an empty table.
  const safePage = Math.min(currentPage, totalPages);

  const paginatedApplications = filteredApplications.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, projectFilter, stepStatusFilter, activeTab]);

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
    new Set(filteredApplications.map((app) => app.project).filter(Boolean)),
  ).sort();

  // Options come from both sources: every stage present in the step data plus
  // the registration list, so a stage is never missing because no current row
  // happens to sit in it. Built from all applications rather than the filtered
  // ones, otherwise selecting a stage would collapse the dropdown to just it.
  const uniqueStepStatuses = (() => {
    const seen = new Set([
      ...applications.map((app) => normalizeStepStatus(app.step_status)),
      ...registrationList.map((item) => normalizeStepStatus(item.step_status)),
    ]);
    seen.delete("");
    const ordered = STEP_STATUS_ORDER.filter((label) => seen.has(label));
    const extra = Array.from(seen)
      .filter((label) => !STEP_STATUS_ORDER.includes(label))
      .sort();
    return [...ordered, ...extra];
  })();

  const exportApplications = filteredApplications.map((app) => ({
    ...app,
    step_status: normalizeStepStatus(app.step_status) || "-",
    recommendation: !isRecommended(app.applicant_id)
      ? "Not Recommended"
      : isForwardedToDirector(app.applicant_id)
        ? "Forwarded to Directorate"
        : "Recommended",
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
      (item) =>
        String(item.applicant_id || "").trim() ===
        String(app.applicant_id || "").trim(),
    );

    if (!foundRecord) {
      setNoFormDataAlert(true);
      return;
    }

    setShowModal(false);
    const isApplicationCompleted =
      normalizeStepStatus(app.step_status) === "Final Submitted";
    const mapped = mapApiDataToPreviewData(foundRecord, isApplicationCompleted);
    setSelectedFormPreviewData(mapped);
    setShowFormPreviewModal(true);
  };

  const handleSwitchToForm = (app = selectedApplication) => {
    setShowModal(false);
    handleOpenFormDetails(app);
  };

  const handleOpenRecommendationDetails = (app = selectedApplication) => {
    if (
      !app ||
      !isRecommended(app.applicant_id) ||
      (activeTab !== "completed" && activeTab !== "verified")
    )
      return;
    setSelectedApplication(app);
    setShowModal(false);
    setRecommendationTargets([app]);
    setRecommendationFile(null);
    setRecommendationRemark("");
    setUploadRecommendationError(null);
    setRecommendationViewOnly(true);
    setShowRecommendationModal(true);
  };

  const toggleSelectionId = (applicantId) => {
    const id = String(applicantId || "").trim();
    if (!id) return;
    setSelectionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleOpenSelectionModal = () => {
    if (
      activeTab !== "completed" ||
      loading ||
      submittingAllRecommendations ||
      hasFinalisedRecommendations ||
      !allCompletedHaveComments
    ) {
      return;
    }
    setSelectionSearch("");
    setUploadRecommendationError(null);
    setShowSelectionModal(true);
  };

  const handleConfirmSelection = () => {
    const targets = applications.filter(
      (app) =>
        selectionIds.includes(String(app.applicant_id || "").trim()) &&
        normalizeStepStatus(app.step_status) === "Final Submitted" &&
        !isForwardedToDirector(app.applicant_id),
    );
    if (!targets.length) {
      setUploadRecommendationError("Please select at least one applicant.");
      return;
    }
    setRecommendationTargets(targets);
    setShowSelectionModal(false);
    setShowConfirmSelectionModal(true);
  };

  const handleProceedToRecommendation = () => {
    if (
      activeTab !== "completed" ||
      !recommendationTargets.length ||
      recommendationTargets.some(
        (app) =>
          normalizeStepStatus(app.step_status) !== "Final Submitted" ||
          isForwardedToDirector(app.applicant_id),
      )
    )
      return;
    setShowConfirmSelectionModal(false);
    setRecommendationFile(null);
    setRecommendationRemark("");
    setUploadRecommendationError(null);
    setShowRecommendationModal(true);
  };

  const closeRecommendationModal = () => {
    if (savingRecommendation || deletingRecommendation) return;
    setShowRecommendationModal(false);
    setRecommendationTargets([]);
    setRecommendationViewOnly(false);
    setRecommendationFile(null);
    setRecommendationRemark("");
    setUploadRecommendationError(null);
    setRecommendationProgress("");
  };

  // A final submit closes the recommendation window for the whole tab. Once any
  // applicant of this district is forwarded to the Directorate, no other
  // candidate can be recommended.
  const hasFinalisedRecommendations = applications.some((app) =>
    isForwardedToDirector(app.applicant_id),
  );

  // Recommendations open only after every completed application in the
  // district carries a DPO comment, so each one is reviewed first.
  const completedTabApplications = applications.filter(
    (app) => app.step_status === "Final Submitted",
  );
  const allCompletedHaveComments =
    completedTabApplications.length > 0 &&
    completedTabApplications.every((app) => hasText(app.dpo_comment));

  // Applicants that can still receive a recommendation. Anyone who already has
  // one is left out so the picker only offers new candidates.
  const selectionCandidates = applications.filter((app) => {
    if (
      normalizeStepStatus(app.step_status) !== "Final Submitted" ||
      isForwardedToDirector(app.applicant_id) ||
      isRecommended(app.applicant_id)
    )
      return false;
    const term = selectionSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      (app.applicant_id || "").toLowerCase().includes(term) ||
      (app.full_name || "").toLowerCase().includes(term) ||
      (app.nominator_name || "").toLowerCase().includes(term) ||
      (app.child_name || "").toLowerCase().includes(term) ||
      (app.father_name || "").toLowerCase().includes(term)
    );
  });

  const selectedRecommendationApps = recommendationTargets;
  const alreadyRecommendedCount = selectedRecommendationApps.filter((app) =>
    isRecommended(app.applicant_id),
  ).length;

  // Only applicants that already carry a recommendation can be deleted here.
  const recommendedCandidates = applications.filter(
    (app) =>
      normalizeStepStatus(app.step_status) === "Final Submitted" &&
      isRecommended(app.applicant_id) &&
      !isForwardedToDirector(app.applicant_id),
  );

  // The directorate forward closes the tab for everyone, so it blinks only while
  // there is something left to forward and no submit is already running.
  const isForwardReady =
    !loading &&
    !submittingAllRecommendations &&
    recommendedCandidates.length > 0;

  const recommendedCandidatesFiltered = recommendedCandidates.filter((app) => {
    const term = deleteSelectionSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      (app.applicant_id || "").toLowerCase().includes(term) ||
      (app.full_name || "").toLowerCase().includes(term) ||
      (app.nominator_name || "").toLowerCase().includes(term) ||
      (app.child_name || "").toLowerCase().includes(term) ||
      (app.father_name || "").toLowerCase().includes(term)
    );
  });

  const handleSaveComment = async () => {
    const applicantId = commentApp?.applicant_id;
    if (
      activeTab !== "completed" ||
      normalizeStepStatus(commentApp?.step_status) !== "Final Submitted" ||
      isForwardedToDirector(applicantId) ||
      !applicantId ||
      savingComment
    )
      return;
    if (!commentText.trim()) return;

    setSavingComment(true);
    setCommentError(null);
    try {
      await saveDpoComment(
        applicantId,
        commentApp?.dpo_status_raw,
        commentText.trim(),
      );

      setActionMessage({
        type: "success",
        text: `Comment saved for ${commentApp?.full_name}.`,
      });
      handleCloseCommentModal();
      await fetchApplicationsData();
    } catch (err) {
      setCommentError(`Comment could not be saved. ${err.message}`);
    } finally {
      setSavingComment(false);
    }
  };

  const handleOpenCommentModal = (app) => {
    if (
      activeTab !== "completed" ||
      normalizeStepStatus(app?.step_status) !== "Final Submitted" ||
      isForwardedToDirector(app?.applicant_id)
    )
      return;
    setCommentApp(app);
    setCommentText(app?.dpo_comment || "");
    setCommentError(null);
    setShowCommentModal(true);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setCommentApp(null);
    setCommentText("");
    setCommentError(null);
  };

  const noFormDataAlertRef = useRef(null);

  useEffect(() => {
    if (noFormDataAlert && noFormDataAlertRef.current) {
      noFormDataAlertRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [noFormDataAlert]);

  return (
    <div className="dashboard-container">
      <DPOLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <DPOTopNav toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

        <div
          fluid
          className="dashboard-page-content p-4"
          style={{ background: "#f8fafc", minHeight: "calc(100vh - 60px)" }}
        >
          {/* Page Header */}
          <div className="dashboard-page-header d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div>
              <h2
                className="mb-1 fw-bold text-dark"
                style={{ fontSize: "1.5rem" }}
              >
                District Level Verification Dashboard
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                मुख्यमंत्री राज्य बाल वीरता पुरस्कार - Verify student
                applications
              </p>
            </div>
          </div>

          {actionMessage && (
            <Alert
              variant={actionMessage.type}
              className="rounded-3 border-0 shadow-sm"
              onClose={() => setActionMessage(null)}
              dismissible
            >
              {actionMessage.text}
            </Alert>
          )}

          {exportError && (
            <Alert
              variant="danger"
              className="rounded-3 border-0 shadow-sm"
              onClose={() => setExportError(null)}
              dismissible
            >
              {exportError}
            </Alert>
          )}

          {formStatusListLoading && (
            <div className="text-center py-2">
              <Spinner animation="border" size="sm" variant="primary" />
              <span
                className="ms-2"
                style={{ fontSize: "0.85rem", color: "#64748b" }}
              >
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
              <strong>सूचना:</strong> इस आवेदक द्वारा अभी तक आवेदन प्रपत्र (Step
              1) नहीं भरा गया है।
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
                  {
                    label: "Total Registration",
                    value: totalRegistrationCount,
                    icon: <FaUserGraduate />,
                    bg: "primary-soft",
                    color: "primary",
                  },
                  {
                    label: "In Progress",
                    value: inProgressApplications,
                    icon: <FaSpinner />,
                    bg: "info-soft",
                    color: "info",
                  },
                  {
                    label: "Total Applications",
                    value: totalApplications,
                    icon: <FaTasks />,
                    bg: "warning-soft",
                    color: "warning",
                  },
                  {
                    label: "Final Submitted",
                    value: completedApplications,
                    icon: <FaCheckCircle />,
                    bg: "success-soft",
                    color: "success",
                  },
                ].map((stat, idx) => (
                  <Col xs={6} lg={3} key={idx}>
                    <Card
                      className="dashboard-stat-card border-0 shadow-sm h-100"
                      style={{ borderRadius: "12px" }}
                    >
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
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#64748b",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {stat.label}
                          </div>
                          <div
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: 700,
                              color: "#0f172a",
                              lineHeight: 1.2,
                            }}
                          >
                            {stat.value}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Filters & Table Container */}
              <Card
                className="dashboard-table-card border-0 shadow-sm"
                style={{ borderRadius: "12px" }}
              >
                <Card.Body className="p-4">
                  {/* Filter Bar */}
                  <div className="dashboard-filter-bar mb-3">
                    <div
                      className="dashboard-tabs d-flex flex-wrap gap-2 mb-3"
                      style={{ borderBottom: "1px solid #e2e8f0" }}
                    >
                      <button
                        type="button"
                        className={`px-4 py-2 border-0 rounded-top ${activeTab === "all" ? "active-tab" : "inactive-tab"}`}
                        style={{
                          background:
                            activeTab === "all" ? "#2563eb" : "#f1f5f9",
                          color: activeTab === "all" ? "#fff" : "#64748b",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          borderBottom:
                            activeTab === "all"
                              ? "3px solid #2563eb"
                              : "3px solid transparent",
                          borderRadius: "8px 8px 0 0",
                        }}
                        onClick={() => {
                          setActiveTab("all");
                          setStepStatusFilter("");
                        }}
                      >
                        All Forms
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 border-0 rounded-top ${activeTab === "completed" ? "active-tab" : "inactive-tab"}`}
                        style={{
                          background:
                            activeTab === "completed" ? "#16a34a" : "#f1f5f9",
                          color: activeTab === "completed" ? "#fff" : "#64748b",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          borderBottom:
                            activeTab === "completed"
                              ? "3px solid #16a34a"
                              : "3px solid transparent",
                          borderRadius: "8px 8px 0 0",
                        }}
                        onClick={() => {
                          setActiveTab("completed");
                          setStepStatusFilter("");
                        }}
                      >
                        Completed Forms
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 border-0 rounded-top ${activeTab === "verified" ? "active-tab" : "inactive-tab"}`}
                        style={{
                          background:
                            activeTab === "verified" ? "#7c3aed" : "#f1f5f9",
                          color: activeTab === "verified" ? "#fff" : "#64748b",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          borderBottom:
                            activeTab === "verified"
                              ? "3px solid #7c3aed"
                              : "3px solid transparent",
                          borderRadius: "8px 8px 0 0",
                        }}
                        onClick={() => {
                          setActiveTab("verified");
                          setStepStatusFilter("");
                        }}
                      >
                        Recommended by District Committee
                      </button>
                    </div>
                    <Row className="g-3 align-items-center">
                      <Col
                        xs={12}
                        md={activeTab === "completed" ? 6 : 4}
                        lg={activeTab === "completed" ? 4 : 4}
                      >
                        <div className="input-group">
                          <span
                            className="input-group-text bg-white border-end-0"
                            style={{
                              borderRadius: "8px 0 0 8px",
                              borderColor: "#cbd5e1",
                            }}
                          >
                            <FaSearch className="text-muted" size={14} />
                          </span>
                          <Form.Control
                            type="text"
                            placeholder="Search by name, ID, title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-start-0"
                            style={{
                              borderRadius: "0 6px 6px 0",
                              borderColor: "#cbd5e1",
                            }}
                          />
                        </div>
                      </Col>
                      <Col xs={6} md={2} lg={2}>
                        <Form.Select
                          value={projectFilter}
                          onChange={(e) => setProjectFilter(e.target.value)}
                          className="filter-select"
                        >
                          <option value="">All Projects</option>
                          {uniqueProjects.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      {activeTab !== "completed" &&
                        activeTab !== "verified" && (
                          <Col xs={6} md={2} lg={2}>
                            <Form.Select
                              value={stepStatusFilter}
                              onChange={(e) =>
                                setStepStatusFilter(e.target.value)
                              }
                              className="filter-select"
                            >
                              <option value="">All Steps</option>
                              {uniqueStepStatuses.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </Form.Select>
                          </Col>
                        )}
                    </Row>
                  </div>

                  {activeTab === "completed" && (
                    <div
                      className="dashboard-filter-actions d-flex flex-wrap align-items-center gap-2 mb-3 p-3 rounded-3"
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleOpenSelectionModal}
                        disabled={
                          loading ||
                          submittingAllRecommendations ||
                          hasFinalisedRecommendations ||
                          !allCompletedHaveComments
                        }
                        className="d-flex align-items-center"
                        style={{
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                        }}
                        title={
                          allCompletedHaveComments
                            ? "Add Recommendation"
                            : "Add a comment to every completed application first"
                        }
                      >
                        <FaPaperclip size={13} className="me-1" />{" "}
                       Add Recommendation
                      </Button>
                      {!allCompletedHaveComments && !hasFinalisedRecommendations && (
                        <span
                          className="text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Add a comment to every completed application to
                          enable recommendations.
                        </span>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleOpenDeleteRecommendationModal}
                        disabled={loading || recommendedCandidates.length === 0}
                        className="d-flex align-items-center"
                        style={{
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                        }}
                      >
                        <FaTimes size={13} className="me-1" /> Delete
                        Recommendation
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={handleFinalSubmitAllRecommendations}
                        disabled={
                          loading ||
                          submittingAllRecommendations ||
                          recommendedCandidates.length === 0
                        }
                        className={`d-flex align-items-center${
                          isForwardReady ? " dpo-forward-blink" : ""
                        }`}
                        style={{
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                        }}
                      >
                        {submittingAllRecommendations ? (
                          <Spinner size="sm" className="me-1" />
                        ) : (
                          <FaCheck className="me-1" />
                        )}
                        {submittingAllRecommendations
                          ? "Submitting..."
                          : `Forward To Directorate${recommendedCandidates.length ? ` (${recommendedCandidates.length})` : ""}`}
                      </Button>
                      {isForwardReady && (
                        <span className="dpo-forward-notice">
                          Important: Click &quot;Forward To Directorate&quot; to
                          send the final recommended list to the Directorate.
                          This cannot be undone.
                        </span>
                      )}
                      {recommendationProgress && (
                        <span
                          className="text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {recommendationProgress}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="d-flex justify-content-end gap-2 mb-2">
                    <Button
                      variant="light"
                      size="sm"
                      className="d-flex align-items-center border shadow-sm"
                      onClick={handleExportExcel}
                      disabled={Boolean(exporting) || exportApplications.length === 0}
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
                      disabled={Boolean(exporting) || exportApplications.length === 0}
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
                  <div className="dashboard-table-wrap verification-table-wrap table-responsive">
                    <Table
                      hover
                      className="dashboard-table align-items-center"
                      style={{ borderBottom: "1px solid #e2e8f0" }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: "#f8fafc",
                            borderBottom: "2px solid #e2e8f0",
                          }}
                        >
                          <th
                            style={{
                              padding: "12px 16px",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              width: "50px",
                            }}
                          >
                            #
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Photo
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Nominator Full Name
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Child Full Name
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                             Father's Name
                           </th>
                           <th
                             style={{
                               padding: "12px 16px",
                               color: "#64748b",
                               fontSize: "0.75rem",
                               fontWeight: 600,
                               textTransform: "uppercase",
                               letterSpacing: "0.5px",
                             }}
                           >
                             Mobile No
                           </th>
                           <th
                            style={{
                              padding: "12px 16px",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Age
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Class
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Type of Bravery
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Step Status
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Recommended by District Committee
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Comment by District Committee
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              textAlign: "right",
                              width: "300px",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.length === 0 ? (
                          <tr>
                            <td
                              colSpan="13"
                              className="text-center py-5 text-muted"
                              style={{ fontSize: "0.9rem" }}
                            >
                              No applications found matching your criteria.
                            </td>
                          </tr>
                        ) : (
                          paginatedApplications.map((app, index) => (
                            <tr
                              key={app.applicant_id}
                              style={{ borderBottom: "1px solid #e2e8f0" }}
                            >
                              <td
                                style={{
                                  padding: "12px 16px",
                                  color: "#94a3b8",
                                  fontWeight: 500,
                                }}
                              >
                                {index + 1}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                {app.photo ? (
                                  <Image
                                    src={app.photo}
                                    roundedCircle
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      objectFit: "cover",
                                      border: "2px solid #e2e8f0",
                                    }}
                                    alt="profile"
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      borderRadius: "50%",
                                      background: "#f1f5f9",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FaUserCircle
                                      style={{
                                        color: "#cbd5e1",
                                        fontSize: "1.2rem",
                                      }}
                                    />
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                {app.nominator_name || "-"}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    color: "#0f172a",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {app.child_name || "-"}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "#94a3b8",
                                  }}
                                >
                                  {app.applicant_id}
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  color: "#475569",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {app.father_name || "-"}
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  color: "#475569",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {app.phone || "-"}
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  color: "#475569",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {app.age || "-"}
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  color: "#475569",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {app.class_name || "-"}
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  color: "#475569",
                                  fontSize: "0.875rem",
                                  maxWidth: "250px",
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                }}
                                title={app.incident_title || ""}
                              >
                                {app.incident_title || "-"}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                {getStepBadge(app.step_status)}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                {getRecommendationBadge(app.applicant_id)}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                {app.dpo_comment ? (
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#475569",
                                      maxWidth: "180px",
                                      textOverflow: "ellipsis",
                                      overflow: "hidden",
                                      whiteSpace: "nowrap",
                                    }}
                                    title={app.dpo_comment}
                                  >
                                    {app.dpo_comment}
                                  </div>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#94a3b8",
                                    }}
                                  >
                                    -
                                  </span>
                                )}
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  textAlign: "right",
                                }}
                              >
                                <div className="d-flex gap-2 justify-content-end">
                                  {activeTab === "completed" && (
                                    <Button
                                      variant="light"
                                      size="sm"
                                      onClick={() =>
                                        handleOpenCommentModal(app)
                                      }
                                      className="d-flex align-items-center justify-content-center border flex-shrink-0"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        padding: 0,
                                        borderRadius: "8px",
                                        borderColor: "#e2e8f0",
                                        color: "#64748b",
                                      }}
                                       disabled={isForwardedToDirector(
                                         app.applicant_id,
                                       )}
                                       title={
                                         isForwardedToDirector(app.applicant_id)
                                           ? "Comment locked: already forwarded to the Directorate"
                                           : "Add / Edit Comment"
                                       }
                                     >
                                       <FaCommentDots size={14} />
                                    </Button>
                                  )}
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleOpenFormDetails(app)}
                                    className="d-flex align-items-center flex-shrink-0"
                                    style={{
                                      borderRadius: "8px",
                                      padding: "0px 12px",
                                      height: "32px",
                                      fontSize: "0.8rem",
                                      fontWeight: 500,
                                      whiteSpace: "nowrap",
                                    }}
                                    title="View Form"
                                  >
                                    <FaFileAlt className="me-1" /> View Form
                                  </Button>
                                  {(activeTab === "completed" ||
                                    activeTab === "verified") &&
                                    isRecommended(app.applicant_id) && (
                                      <>
                                        <Button
                                          variant="primary"
                                          size="sm"
                                          onClick={() =>
                                            handleOpenRecommendationDetails(app)
                                          }
                                          className="d-flex align-items-center flex-shrink-0"
                                          style={{
                                            borderRadius: "8px",
                                            padding: "0px 12px",
                                            height: "32px",
                                            fontSize: "0.8rem",
                                            fontWeight: 500,
                                            whiteSpace: "nowrap",
                                          }}
                                          title="View Recommendation"
                                        >
                                          <FaPaperclip className="me-1" />{" "}
                                          Recommendation
                                        </Button>
                                      </>
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
                              className={`dashboard-page-btn ${
                                page === safePage ? "active" : ""
                              }`}
                              onClick={() => goToPage(page)}
                            >
                              {page}
                            </Button>
                          ) : (
                            <span
                              key={`${page}-${pageIndex}`}
                              className="dashboard-page-ellipsis"
                            >
                              ...
                            </span>
                          ),
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
        <Modal
          show={showModal}
          onHide={handleCloseRegistrationModal}
          size="lg"
          centered
          contentClassName="border-0 shadow-lg"
        >
          <Modal.Header
            closeButton
            className="bg-white border-bottom p-4"
            style={{ borderRadius: "12px 12px 0 0" }}
          >
            <Modal.Title
              className="fw-bold text-dark"
              style={{ fontSize: "1.1rem" }}
            >
              Registration Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4" style={{ background: "#fff" }}>
            {selectedApplication && (
              <div>
                <h6
                  className="text-uppercase text-muted mb-3"
                  style={{
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                    fontWeight: 700,
                  }}
                >
                  Applicant Information
                </h6>
                <Row className="g-3 mb-4">
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Applicant ID</small>
                      <p className="detail-value text-primary fw-bold">
                        {selectedApplication.applicant_id}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Full Name</small>
                      <p className="detail-value text-dark fw-bold">
                        {selectedApplication.full_name}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Nominator Category</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.nominator_category || "-"}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">
                        Relation With Child
                      </small>
                      <p className="detail-value text-dark">
                        {selectedApplication.relat_with_child || "-"}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Phone</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.phone || "-"}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Email</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.email || "-"}
                      </p>
                    </div>
                  </Col>
                </Row>

                <h6
                  className="text-uppercase text-muted mb-3"
                  style={{
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                    fontWeight: 700,
                  }}
                >
                  ID Proof Details
                </h6>
                <Row className="g-3 mb-4">
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">ID Proof Type</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.id_proof_type || "-"}
                        {selectedApplication.id_proof_type_other
                          ? ` (${selectedApplication.id_proof_type_other})`
                          : ""}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">ID Proof Number</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.id_proof_no || "-"}
                      </p>
                    </div>
                  </Col>
                </Row>

                <h6
                  className="text-uppercase text-muted mb-3"
                  style={{
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                    fontWeight: 700,
                  }}
                >
                  Address Details
                </h6>
                <Row className="g-3 mb-4">
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Village</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.village || "-"}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Post Office</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.post_office || "-"}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Project</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.project || "-"}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">District</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.district || "-"}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Pincode</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.pincode || "-"}
                      </p>
                    </div>
                  </Col>
                </Row>

                <h6
                  className="text-uppercase text-muted mb-3"
                  style={{
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                    fontWeight: 700,
                  }}
                >
                  Application Status
                </h6>
                <Row className="g-3 mb-4">
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Status</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.status || "-"}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Step Status</small>
                      <div className="mt-1">
                        {getStepBadge(selectedApplication.step_status)}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">DPO Status</small>
                      <div className="mt-1">
                        {getDpoStatusBadge(selectedApplication.dpo_status)}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">Created At</small>
                      <p className="detail-value text-dark">
                        {selectedApplication.created_at
                          ? new Date(
                              selectedApplication.created_at,
                            ).toLocaleString("en-IN")
                          : "-"}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="detail-block">
                      <small className="detail-label">
                        Application Submitted On
                      </small>
                      <p className="detail-value text-dark">
                        {formatSubmissionDateTime(
                          selectedApplication.submissionDate,
                          "-",
                        )}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="detail-block">
                      <small className="detail-label">DPO Comment</small>
                      <p
                        className="detail-value text-dark"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {selectedApplication.dpo_comment ||
                          "No comment added yet."}
                      </p>
                    </div>
                  </Col>
                </Row>

                {(activeTab === "completed" || activeTab === "verified") &&
                  isRecommended(selectedApplication.applicant_id) && (
                  <div
                    className="p-4 rounded-3 mt-3"
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #86efac",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6
                        className="text-uppercase text-muted mb-0"
                        style={{
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                          fontWeight: 700,
                        }}
                      >
                        Recommendation
                      </h6>
                      <Button
                        variant="link"
                        onClick={() =>
                          handleOpenRecommendationDetails(selectedApplication)
                        }
                        className="p-0 text-decoration-none fw-bold"
                        style={{ fontSize: "0.8rem" }}
                      >
                        View Recommendation
                      </Button>
                    </div>
                    {(() => {
                      const recommendation = getRecommendation(
                        selectedApplication.applicant_id,
                      );
                      if (!recommendation) {
                        return (
                          <Alert
                            variant="info"
                            className="rounded-3 border-0 mb-0"
                            style={{ fontSize: "0.85rem" }}
                          >
                            <FaHourglassHalf className="me-1" /> This
                            application is approved but not recommended yet.
                          </Alert>
                        );
                      }
                      return (
                        <Row className="g-3">
                          <Col xs={12} md={6}>
                            <div className="detail-block">
                              <small className="detail-label">
                                Recommended On
                              </small>
                              <p className="detail-value text-dark">
                                {recommendation.created_at
                                  ? new Date(
                                      recommendation.created_at,
                                    ).toLocaleString("en-IN")
                                  : "-"}
                              </p>
                            </div>
                          </Col>
                          <Col xs={12} md={6}>
                            <div className="detail-block">
                              <small className="detail-label">
                                Recommendation File
                              </small>
                              {getRecommendationFileSrc(
                                selectedApplication.applicant_id,
                              ) ? (
                                <a
                                  href={getRecommendationFileSrc(
                                    selectedApplication.applicant_id,
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="d-inline-flex align-items-center text-decoration-none fw-bold"
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "#2563eb",
                                  }}
                                >
                                  <FaPaperclip className="me-1" /> View /
                                  Download File
                                </a>
                              ) : (
                                <p className="detail-value text-dark">-</p>
                              )}
                            </div>
                          </Col>
                          <Col xs={12}>
                            <div className="detail-block">
                              <small className="detail-label">Remark</small>
                              <p
                                className="detail-value text-dark"
                                style={{ whiteSpace: "pre-wrap" }}
                              >
                                {recommendation.remark || "-"}
                              </p>
                            </div>
                          </Col>
                        </Row>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer
            className="p-4 border-top"
            style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}
          >
            <Button
              variant="link"
              onClick={() => handleSwitchToForm(selectedApplication)}
              className="me-auto p-0 text-decoration-none fw-bold"
              style={{ fontSize: "0.85rem" }}
            >
              <FaFileAlt className="me-1" /> आवेदन प्रपत्र देखें →
            </Button>
            <Button
              variant="secondary"
              onClick={handleCloseRegistrationModal}
              className="px-4"
              style={{ borderRadius: "8px", fontSize: "0.85rem" }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Applicant Selection Modal */}
        <Modal
          show={showSelectionModal}
          onHide={() => setShowSelectionModal(false)}
          size="lg"
          centered
          contentClassName="border-0 shadow-lg"
        >
          <Modal.Header
            closeButton
            className="bg-white border-bottom p-4"
            style={{ borderRadius: "12px 12px 0 0" }}
          >
            <Modal.Title
              className="fw-bold text-dark"
              style={{ fontSize: "1.1rem" }}
            >
              Select Applicants for Recommendation
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4" style={{ background: "#fff" }}>
            <Form.Control
              type="text"
              placeholder="Search by name or applicant ID..."
              value={selectionSearch}
              onChange={(e) => setSelectionSearch(e.target.value)}
              className="mb-3"
              style={{
                borderRadius: "8px",
                borderColor: "#cbd5e1",
                fontSize: "0.85rem",
              }}
            />

            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() =>
                  setSelectionIds(
                    selectionCandidates.map((app) =>
                      String(app.applicant_id || "").trim(),
                    ),
                  )
                }
                style={{ borderRadius: "8px", fontSize: "0.78rem" }}
              >
                Select All ({selectionCandidates.length})
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setSelectionIds([])}
                style={{ borderRadius: "8px", fontSize: "0.78rem" }}
              >
                Clear All
              </Button>
              <span
                className="text-muted ms-auto"
                style={{ fontSize: "0.8rem" }}
              >
                {selectionIds.length} selected
              </span>
            </div>

            <div
              className="p-3 rounded-3"
              style={{
                border: "1px solid #e2e8f0",
                maxHeight: "320px",
                overflowY: "auto",
              }}
            >
              {selectionCandidates.length === 0 ? (
                <p
                  className="text-muted text-center py-4 mb-0"
                  style={{ fontSize: "0.85rem" }}
                >
                  No applicants found.
                </p>
              ) : (
                selectionCandidates.map((app) => {
                  const id = String(app.applicant_id || "").trim();
                  return (
                    <label
                      key={id}
                      className="d-flex align-items-center gap-3 px-2 py-2 rounded-2"
                      style={{ cursor: "pointer" }}
                    >
                      <Form.Check
                        type="checkbox"
                        checked={selectionIds.includes(id)}
                        onChange={() => toggleSelectionId(id)}
                      />
                      <div className="flex-grow-1">
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#0f172a",
                            fontSize: "0.875rem",
                          }}
                        >
                          {app.full_name || "-"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {id}
                        </div>
                      </div>
                      <div>{getRecommendationBadge(id)}</div>
                    </label>
                  );
                })
              )}
            </div>

            {uploadRecommendationError && (
              <Alert
                variant="danger"
                className="rounded-3 py-2 mt-3 mb-0"
                style={{ fontSize: "0.8rem" }}
              >
                {uploadRecommendationError}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer
            className="p-4 border-top"
            style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}
          >
            <Button
              variant="light"
              onClick={() => setShowSelectionModal(false)}
              className="px-4 border"
              style={{ borderRadius: "8px", fontSize: "0.85rem" }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSelection}
              disabled={selectionIds.length === 0}
              className="px-4"
              style={{
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              Continue
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Confirm Selection Modal */}
        <Modal
          show={showConfirmSelectionModal}
          onHide={() => setShowConfirmSelectionModal(false)}
          centered
          contentClassName="border-0 shadow-lg"
        >
          <Modal.Header
            closeButton
            className="bg-white border-bottom p-4"
            style={{ borderRadius: "12px 12px 0 0" }}
          >
            <Modal.Title
              className="fw-bold text-dark"
              style={{ fontSize: "1.1rem" }}
            >
              Confirm Applicants Selected For Recommendation
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4" style={{ background: "#fff" }}>
            <Alert
              variant="info"
              className="rounded-3 border-0"
              style={{ fontSize: "0.85rem" }}
            >
              The same file and remark will be posted for every applicant listed
              below. Please confirm the selection before continuing.
            </Alert>
            <div
              className="p-3 rounded-3"
              style={{
                border: "1px solid #e2e8f0",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {recommendationTargets.map((app) => (
                <div
                  key={app.applicant_id}
                  className="d-flex align-items-center justify-content-between px-2 py-2"
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#0f172a",
                        fontSize: "0.875rem",
                      }}
                    >
                      {app.full_name || "-"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {app.applicant_id}
                    </div>
                  </div>
                  <div>{getRecommendationBadge(app.applicant_id)}</div>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer
            className="p-4 border-top"
            style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}
          >
            <Button
              variant="light"
              onClick={() => setShowConfirmSelectionModal(false)}
              className="px-4 border"
              style={{ borderRadius: "8px", fontSize: "0.85rem" }}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleProceedToRecommendation}
              className="px-4"
              style={{
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              Confirm &amp; Continue
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Recommendation Modal: lists only the recommended applicants */}
        <Modal
          show={showDeleteRecommendationModal}
          onHide={closeDeleteRecommendationModal}
          size="lg"
          centered
          contentClassName="border-0 shadow-lg"
        >
          <Modal.Header
            closeButton
            className="bg-white border-bottom p-4"
            style={{ borderRadius: "12px 12px 0 0" }}
          >
            <Modal.Title
              className="fw-bold text-dark"
              style={{ fontSize: "1.1rem" }}
            >
              Delete Recommendation
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4" style={{ background: "#fff" }}>
            <Form.Control
              type="text"
              placeholder="Search by name or applicant ID..."
              value={deleteSelectionSearch}
              onChange={(e) => setDeleteSelectionSearch(e.target.value)}
              className="mb-3"
              style={{
                borderRadius: "8px",
                borderColor: "#cbd5e1",
                fontSize: "0.85rem",
              }}
            />

            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() =>
                  setDeleteSelectionIds(
                    recommendedCandidatesFiltered.map((app) =>
                      String(app.applicant_id || "").trim(),
                    ),
                  )
                }
                style={{ borderRadius: "8px", fontSize: "0.78rem" }}
              >
                Select All ({recommendedCandidatesFiltered.length})
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setDeleteSelectionIds([])}
                style={{ borderRadius: "8px", fontSize: "0.78rem" }}
              >
                Clear All
              </Button>
              <span
                className="text-muted ms-auto"
                style={{ fontSize: "0.8rem" }}
              >
                {deleteSelectionIds.length} selected
              </span>
            </div>

            <div
              className="p-3 rounded-3"
              style={{
                border: "1px solid #e2e8f0",
                maxHeight: "320px",
                overflowY: "auto",
              }}
            >
              {recommendedCandidatesFiltered.length === 0 ? (
                <p
                  className="text-muted text-center py-4 mb-0"
                  style={{ fontSize: "0.85rem" }}
                >
                  No recommended applicants found.
                </p>
              ) : (
                recommendedCandidatesFiltered.map((app) => {
                  const id = String(app.applicant_id || "").trim();
                  return (
                    <label
                      key={id}
                      className="d-flex align-items-center gap-3 px-2 py-2 rounded-2"
                      style={{ cursor: "pointer" }}
                    >
                      <Form.Check
                        type="checkbox"
                        checked={deleteSelectionIds.includes(id)}
                        onChange={() => toggleDeleteSelectionId(id)}
                      />
                      <div className="flex-grow-1">
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#0f172a",
                            fontSize: "0.875rem",
                          }}
                        >
                          {app.full_name || "-"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {id}
                        </div>
                      </div>
                      <div>{getRecommendationBadge(id)}</div>
                    </label>
                  );
                })
              )}
            </div>

            {recommendationProgress && (
              <Alert
                variant="info"
                className="rounded-3 py-2 mt-3 mb-0"
                style={{ fontSize: "0.8rem" }}
              >
                {recommendationProgress}
              </Alert>
            )}
            {uploadRecommendationError && (
              <Alert
                variant="danger"
                className="rounded-3 py-2 mt-3 mb-0"
                style={{ fontSize: "0.8rem" }}
              >
                {uploadRecommendationError}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer
            className="p-4 border-top"
            style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}
          >
            <Button
              variant="light"
              onClick={closeDeleteRecommendationModal}
              className="px-4 border"
              style={{ borderRadius: "8px", fontSize: "0.85rem" }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSelectedRecommendations}
              disabled={
                deletingRecommendation || deleteSelectionIds.length === 0
              }
              className="px-4 d-flex align-items-center"
              style={{
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              {deletingRecommendation ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <FaTimes className="me-1" />
              )}
              {deletingRecommendation
                ? "Deleting..."
                : `Delete Recommendation${deleteSelectionIds.length > 0 ? ` (${deleteSelectionIds.length})` : ""}`}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Recommendation Modal: one file + remark for every selected applicant */}
        <Modal
          show={showRecommendationModal}
          onHide={closeRecommendationModal}
          size="lg"
          centered
          contentClassName="border-0 shadow-lg"
        >
          <Modal.Header
            closeButton
            className="bg-white border-bottom p-4"
            style={{ borderRadius: "12px 12px 0 0" }}
          >
            <Modal.Title
              className="fw-bold text-dark"
              style={{ fontSize: "1.1rem" }}
            >
              {recommendationViewOnly
                ? "Recommendation Details"
                : alreadyRecommendedCount > 0
                  ? "Update Recommendation"
                  : "Add Recommendation"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4" style={{ background: "#fff" }}>
            {selectedRecommendationApps.length === 0 ? (
              <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                No applicants selected.
              </p>
            ) : (
              <div>
                <div
                  className="p-3 mb-4 rounded-3"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                >
                  <h6
                    className="text-uppercase text-muted mb-2"
                    style={{
                      fontSize: "0.7rem",
                      letterSpacing: "0.5px",
                      fontWeight: 700,
                    }}
                  >
                     Applicants Selected For Recommendation ({selectedRecommendationApps.length})
                  </h6>
                  <div style={{ maxHeight: "160px", overflowY: "auto" }}>
                    {selectedRecommendationApps.map((app) => (
                      <div
                        key={app.applicant_id}
                        className="d-flex align-items-center justify-content-between px-2 py-1"
                      >
                        <span style={{ fontSize: "0.85rem", color: "#0f172a" }}>
                          <span className="fw-bold">
                            {app.full_name || "-"}
                          </span>{" "}
                          <span className="text-muted">
                            Applicant ID: {app.applicant_id}
                          </span>
                        </span>
                        {isRecommended(app.applicant_id) && (
                          <Badge bg="success" className="badge-soft">
                            Recommended
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {recommendationViewOnly ? (
                  selectedRecommendationApps.map((app) => {
                    const recommendation = getRecommendation(app.applicant_id);
                    if (!recommendation) {
                      return (
                        <Alert
                          key={app.applicant_id}
                          variant="secondary"
                          className="rounded-3 border-0"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {app.full_name} (Applicant ID: {app.applicant_id}) has
                          not been recommended yet.
                        </Alert>
                      );
                    }
                    return (
                      <div
                        key={app.applicant_id}
                        className="p-3 mb-3 rounded-3"
                        style={{ border: "1px solid #e2e8f0" }}
                      >
                        <div className="d-flex flex-wrap gap-3 mb-2">
                          <div className="detail-block">
                            <small className="detail-label">Applicant</small>
                            <p className="detail-value text-dark">
                              {app.full_name} (Applicant ID: {app.applicant_id})
                            </p>
                          </div>
                          <div className="detail-block">
                            <small className="detail-label">
                              Recommended On
                            </small>
                            <p className="detail-value text-dark">
                              {recommendation.created_at
                                ? new Date(
                                    recommendation.created_at,
                                  ).toLocaleString("en-IN")
                                : "-"}
                            </p>
                          </div>
                          <div className="detail-block">
                            <small className="detail-label">File</small>
                            {getRecommendationFileSrc(app.applicant_id) ? (
                              <a
                                href={getRecommendationFileSrc(
                                  app.applicant_id,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="d-inline-flex align-items-center text-decoration-none fw-bold"
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#2563eb",
                                }}
                              >
                                <FaPaperclip className="me-1" /> View / Download
                              </a>
                            ) : (
                              <p className="detail-value text-dark">
                                No file uploaded
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="detail-block">
                          <small className="detail-label">Remark</small>
                          <p
                            className="detail-value text-dark"
                            style={{ whiteSpace: "pre-wrap" }}
                          >
                            {recommendation.remark || "-"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="mb-3">
                      <Form.Label
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Recommendation File{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleRecommendationFileChange}
                        className="border"
                        style={{
                          borderRadius: "8px",
                          borderColor: "#cbd5e1",
                          fontSize: "0.85rem",
                        }}
                      />
                      <div
                        className="mt-1 text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {PDF_UPLOAD_NOTE}
                      </div>
                      <div
                        className="mt-1 text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        This file is uploaded for all{" "}
                        {selectedRecommendationApps.length} selected applicant
                        {selectedRecommendationApps.length === 1 ? "" : "s"}.
                      </div>
                    </div>
                    <div className="mb-3">
                      <Form.Label
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Remark <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={recommendationRemark}
                        onChange={(e) =>
                          setRecommendationRemark(e.target.value)
                        }
                        placeholder="Enter remarks for recommendation..."
                        className="border"
                        style={{
                          borderRadius: "8px",
                          borderColor: "#cbd5e1",
                          fontSize: "0.85rem",
                        }}
                      />
                      <div
                        className="mt-1 text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        The same remark is saved against every selected
                        applicant.
                      </div>
                    </div>
                    {recommendationProgress && (
                      <Alert
                        variant="info"
                        className="rounded-3 py-2 mb-3"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {recommendationProgress}
                      </Alert>
                    )}
                    {uploadRecommendationError && (
                      <Alert
                        variant="danger"
                        className="rounded-3 py-2 mb-3"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {uploadRecommendationError}
                      </Alert>
                    )}
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={handleSaveRecommendation}
                        disabled={
                          savingRecommendation || deletingRecommendation
                        }
                        className="d-flex align-items-center"
                        style={{ borderRadius: "8px", fontWeight: 500 }}
                      >
                        {savingRecommendation ? (
                          <Spinner size="sm" />
                        ) : (
                          <FaCheck className="me-1" />
                        )}
                        {savingRecommendation
                          ? "Saving..."
                          : alreadyRecommendedCount > 0
                            ? "Update Recommendations"
                            : "Save & Forward"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer
            className="p-4 border-top"
            style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}
          >
            <Button
              variant="secondary"
              onClick={closeRecommendationModal}
              className="px-4"
              style={{ borderRadius: "8px", fontSize: "0.85rem" }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add Comment Modal */}
        <Modal
          show={showCommentModal}
          onHide={handleCloseCommentModal}
          centered
          contentClassName="border-0 shadow-lg"
        >
          <Modal.Header
            closeButton
            className="bg-white border-bottom p-4"
            style={{ borderRadius: "12px 12px 0 0" }}
          >
            <Modal.Title
              className="fw-bold text-dark"
              style={{ fontSize: "1.1rem" }}
            >
              Add Comment
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {commentApp && (
              <div className="mb-3">
                <p className="mb-1 text-muted" style={{ fontSize: "0.85rem" }}>
                  Applicant:{" "}
                  <span className="fw-bold text-dark">
                    {commentApp.full_name}
                  </span>{" "}
                  ({commentApp.applicant_id})
                </p>
              </div>
            )}

            <Form.Group>
              <Form.Label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Comment / Remark
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter your remark/comment here..."
                style={{
                  borderRadius: "8px",
                  borderColor: "#cbd5e1",
                  fontSize: "0.875rem",
                }}
              />
              {commentError && (
                <Alert
                  variant="danger"
                  className="rounded-3 py-2 mt-3 mb-0"
                  style={{ fontSize: "0.8rem" }}
                >
                  {commentError}
                </Alert>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer
            className="p-4 border-top"
            style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}
          >
            <Button
              variant="light"
              onClick={handleCloseCommentModal}
              className="px-4 border"
              style={{ borderRadius: "8px", fontSize: "0.85rem" }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveComment}
              disabled={savingComment || !commentText.trim()}
              className="px-4 d-flex align-items-center"
              style={{
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              {savingComment ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <FaCheck className="me-1" />
              )}
              {savingComment ? "Saving..." : "Save Comment"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Form Preview Modal */}
        {showFormPreviewModal && selectedFormPreviewData && (
          <PreviewModal
            data={selectedFormPreviewData}
            onClose={() => setShowFormPreviewModal(false)}
            isApplicationCompleted={selectedFormPreviewData.isApplicationCompleted}
            isDPO={true}
          />
        )}
      </div>
    </div>
  );
};

export default DPODashboard;
