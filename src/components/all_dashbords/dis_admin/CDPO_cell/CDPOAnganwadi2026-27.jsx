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
  FaFilePdf,
  FaPrint,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { cookieFetch } from "../../../login/AuthContext";
import CDPOLeftNav from "./CDPOLeftNav";
import CDPOTopNav from "./CDPOTopNav";
import "../DPO_cell/DPODashboard.css";
import "./CDPOAnganwadi2026-27.css";

const APPLICATIONS_URL =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/ang-puruskar-cdpo-status/";
const MEDIA_BASE_URL =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend";
const PAGE_SIZE = 10;

const APPLICATION_FIELDS = [
  ["Application ID", "form_id"],
  ["Applicant Name", "filer_name"],
  ["Father / Husband Name", "fath_husb_name"],
  ["Date of Birth", "dob"],
  ["Age", "age"],
  ["Mobile Number", "filer_mob"],
  ["Email", "filer_email"],
  ["Educational Qualification", "edu_qual"],
  ["District", "district"],
  ["Project", "project"],
  ["Sector", "sector"],
  ["Anganwadi Center", "awc_name"],
  ["Center Code", "awc_center"],
  ["Joining Date", "joining_date"],
  ["Village", "village"],
  ["Address", "address"],
  ["City", "city"],
  ["PIN Code", "pincode"],
  ["Bank Account Holder", "acc_holder"],
  ["Bank Account Number", "acc_no"],
  ["IFSC Code", "acc_ifsc"],
  ["Bank Name", "bank_name"],
  ["PAN Card", "pancard"],
];

const MARK_GROUPS = [
  {
    title: "Schemes and Beneficiaries",
    fields: [
      ["Pradhan Mantri Matru Vandana Yojana (PMMVY)", "pmmvy"],
      ["Chief Minister Mahalakshmi Kit (CMMK)", "cmmk"],
      ["Nanda Gaura Yojana – First Installment", "nanda1"],
      ["Nanda Gaura Yojana – Second Installment", "nanda2"],
    ],
  },
  {
    title: "Center Operations and Services",
    fields: [
      ["Poshan Tracker", "pt"],
      ["Survey", "survey"],
      ["Annual Report", "ann"],
      ["Poshan Tracker Group", "pt_group"],
      ["Referral", "sandharbh"],
      ["Community Activity", "sam"],
      ["VHSND", "vhsnd"],
      ["Beneficiary Details", "pt_ben"],
      ["Records", "abhilekh"],
      ["Cleanliness Measures", "saaf"],
      ["Deworming", "krimi"],
      ["Nutrition Week", "poshan_week"],
    ],
  },
  {
    title: "Nutrition and Health",
    fields: [
      ["SAM – Up to 6 Months", "sam_6mon"],
      ["SAM – 6 Months to 6 Years", "sam_6yr"],
      ["MAM – Up to 6 Months", "mam_6mon"],
      ["Severe Cases", "gambhir"],
      ["RBSK", "rbsk"],
    ],
  },
  {
    title: "Other Work and Achievements",
    fields: [
      ["Other Work", "other_work"],
      ["Departmental Work", "dept_work"],
      ["Individual Work", "per_work"],
      ["Achievement Work", "ach_work"],
    ],
  },
];

const DOCUMENT_FIELDS = [
  ["Applicant Photo", "photo_img", "image"],
  ["Signature", "signature", "image"],
  ["Eligibility Document 1", "aharta1", "pdf"],
  ["Eligibility Document 2", "aharta2", "pdf"],
  ["Eligibility Document 3", "aharta3", "pdf"],
  ["Eligibility Document 4", "aharta4", "pdf"],
  ["Selection Criteria - Achievements / News Records", "manak2", "pdf"],
  ["Selection Criteria - Departmental Model Center Work", "manak3a", "pdf"],
  ["Selection Criteria - Individual Model Center Work", "manak3b", "pdf"],
  ["Awards / Certificates for Excellent Work", "manak4", "pdf"],
  ["Poshan Tracker Group Photo", "pt_group_img", "image"],
  ["Referral Document", "sandharbh_img", "image"],
  ["Community Activity Document", "sam_img", "image"],
  ["SAM – Up to 6 Months Document", "sam_6mon_img", "image"],
  ["SAM – Up to 6 Years Document", "sam_6yr_img", "image"],
  ["MAM – Up to 6 Months Document", "mam_6mon_img", "image"],
  ["Severe Case Document", "gambhir_img", "image"],
  ["Other Work Document", "other_work_img", "image"],
];

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

const formatDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

const getMediaUrl = (file) => {
  if (!file) return "";
  const path = String(file).trim();
  if (/^https?:\/\//i.test(path)) return path;
  return `${MEDIA_BASE_URL}/${path.replace(/^\/+/, "")}`;
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

const getMarkValue = (application, prefix) => {
  if (prefix === "saaf") {
    return {
      obtained: application.saaf_ans,
      marks: application.saaf_marks,
      total: null,
    };
  }
  if (prefix === "sam_6mon" || prefix === "sam_6yr" || prefix === "mam_6mon") {
    return {
      obtained: null,
      marks: application[`${prefix}_marks`],
      total: application[`${prefix}_tot`],
    };
  }
  if (prefix === "other_work" || prefix === "dept_work" ||
      prefix === "per_work" || prefix === "ach_work") {
    return {
      obtained: application[`${prefix}_detail`],
      marks: application[`${prefix}_marks`],
      total: null,
    };
  }
  if (prefix === "rbsk") {
    return {
      obtained: application.rbsk_obt,
      marks: application.rbsk_marks,
      total: application.rbsk_tot,
    };
  }
  if (prefix === "sam") {
    return {
      obtained: application.sam_detail || application.sam_obt,
      marks: application.sam_marks,
      total: application.sam_tot,
    };
  }
  if (prefix === "gambhir") {
    return {
      obtained: application.gambhir_detail,
      marks: application.gambhir_marks,
      total: application.gambhir_tot,
    };
  }
  return {
    obtained: application[`${prefix}_obt`],
    marks: application[`${prefix}_marks`],
    total: application[`${prefix}_tot`],
  };
};

const getApplicationMerit = (application) => {
  if (!application) return null;

  // Prefer the criterion marks returned by the API. This is important for the
  // Completed Forms and Approved by CDPO tabs, which must show the same total
  // as the marks visible in the application preview.
  let calculatedTotal = 0;
  let foundNumericMark = false;

  Object.entries(application).forEach(([field, rawValue]) => {
    if (!field.endsWith("_marks")) return;
    if (rawValue === null || rawValue === undefined || String(rawValue).trim() === "") return;
    const numericValue = Number(rawValue);
    if (Number.isFinite(numericValue)) {
      calculatedTotal += numericValue;
      foundNumericMark = true;
    }
  });

  const rawMerit = application.merit;
  const apiMerit = rawMerit !== null && rawMerit !== undefined && String(rawMerit).trim() !== ""
    ? Number(rawMerit)
    : null;

  // If actual criterion marks are available and add up to a positive value,
  // use that total even when the API's stored merit is stale. If marks are
  // absent or all zero, preserve a valid API merit as a fallback.
  if (foundNumericMark && calculatedTotal > 0) return calculatedTotal;
  if (apiMerit !== null && Number.isFinite(apiMerit)) return apiMerit;
  return foundNumericMark ? calculatedTotal : null;
};

// Normalize records returned by the API once so every tab and the preview use
// the same fields and numeric marks, regardless of whether the backend sends
// numbers or numeric strings. Preserve all original API fields.
const normalizeApplication = (record) => {
  if (!record || typeof record !== "object") return record;
  const normalized = { ...record };
  Object.keys(normalized).forEach((key) => {
    if (key.endsWith("_marks") || key === "merit" || key.endsWith("_tot") || key.endsWith("_obt")) {
      const value = normalized[key];
      if (value !== null && value !== undefined && String(value).trim() !== "" && Number.isFinite(Number(value))) {
        normalized[key] = Number(value);
      }
    }
  });
  return normalized;
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
  const [selectedAwardBySector, setSelectedAwardBySector] = useState({});
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
      setApplications(payload.data.map(normalizeApplication));
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

  const completedGroups = useMemo(() => {
    const groups = new Map();
    filteredApplications.forEach((application) => {
      const sectorKey = String(
        application.sector || application.awc_name || application.awc_center || application.project || "Unassigned Sector"
      ).trim();
      if (!groups.has(sectorKey)) groups.set(sectorKey, []);
      groups.get(sectorKey).push(application);
    });
    return Array.from(groups.entries()).map(([sectorKey, items]) => ({ sectorKey, items }));
  }, [filteredApplications]);

  const submitSectorSelection = (sectorKey, nextStatus = "approved") => {
    const selectedFormId = selectedAwardBySector[sectorKey];
    const selected = completedGroups
      .find((group) => group.sectorKey === sectorKey)
      ?.items.find((item) => String(item.form_id) === String(selectedFormId));
    if (!selected) {
      setActionMessage({ type: "warning", text: "Please select one candidate for this sector first." });
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

  const previewValue = (value) => {
    if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : "—";
    return displayValue(value);
  };

  const renderPreviewFile = (application, field, label) => {
    const filePath = application?.[field];
    if (!filePath) {
      return <span className="cdpo-preview-missing">दस्तावेज़ अपलोड नहीं हुआ है / Document Not Uploaded</span>;
    }
    const url = getMediaUrl(filePath);
    const fileName = String(filePath).split(/[\\/]/).pop() || label;
    const isImage = /\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(String(filePath));
    const isPdf = /\.pdf(\?.*)?$/i.test(String(filePath));
    return (
      <div className="cdpo-preview-file">
        {isImage && <img src={url} alt={label} loading="lazy" />}
        {isPdf && <iframe title={label} src={url} loading="lazy" />}
        <a href={url} target="_blank" rel="noreferrer">{fileName}</a>
      </div>
    );
  };

  const renderApplicantPreviewRows = (application) => {
    const rows = [
      ["आवेदन फार्म संख्या", application.form_id],
      ["आवेदक का नाम कु0 / श्रीमती", application.filer_name],
      ["पिता / पति का नाम", application.fath_husb_name],
      ["जन्म तिथि", formatDate(application.dob)],
      ["आयु", application.age],
      ["मोबाइल नंबर", application.filer_mob],
      ["ईमेल आईडी", application.filer_email],
      ["शैक्षिक योग्यता", application.edu_qual],
      ["जनपद", application.district],
      ["विकासखंड / परियोजना", application.project],
      ["सेक्टर", application.sector],
      ["वर्तमान में तैनात आंगनबाड़ी / मिनी आंगनबाड़ी केंद्र का नाम", application.awc_name],
      ["आंगनबाड़ी केंद्र कोड", application.awc_center],
      ["योगदान तिथि", formatDate(application.joining_date)],
      ["गांव / क्षेत्र का नाम", application.village],
      ["पता", application.address],
      ["शहर", application.city],
      ["पिन कोड", application.pincode],
      ["खाताधारक का नाम", application.acc_holder],
      ["खाता संख्या", application.acc_no],
      ["IFSC कोड", application.acc_ifsc],
      ["बैंक का नाम", application.bank_name],
      ["पैन कार्ड", application.pancard],
    ];
    return rows.map(([label, value], index) => (
      <tr key={label}>
        <td>{label}:</td>
        <td>
          {previewValue(value)}
          {index === 1 && (
            <div className="cdpo-preview-applicant-photo">
              {renderPreviewFile(application, "photo_img", "Applicant Photo")}
            </div>
          )}
        </td>
      </tr>
    ));
  };

  const PREVIEW_MARK_GROUP_TITLES = {
    "Schemes and Beneficiaries": "योजनाओं की प्रगति",
    "Center Operations and Services": "केंद्र संचालन एवं सेवाएं",
    "Nutrition and Health": "पोषण एवं स्वास्थ्य",
    "Other Work and Achievements": "अन्य विशिष्ट कार्य एवं उपलब्धियां",
  };

  const PREVIEW_MARK_LABELS = {
    pmmvy: "प्रधानमंत्री मातृ वंदना योजना की प्रगति",
    cmmk: "मुख्यमंत्री महालक्ष्मी किट योजना की प्रगति",
    nanda1: "नंदा गौरा योजना - प्रथम किश्त",
    nanda2: "नंदा गौरा योजना - द्वितीय किश्त",
    pt: "पोषण ट्रैकर ऐप में पूर्व-स्कूली शिक्षा",
    survey: "वित्तीय वर्ष में गृह भ्रमण",
    ann: "अन्नप्राशन गतिविधियां",
    pt_group: "पोषण ट्रैकर ऐप में समुदाय आधारित गतिविधियां",
    sandharbh: "संदर्भ सेवाएं",
    sam: "कुपोषित एवं अतिकुपोषित लाभार्थी",
    vhsnd: "VHSND (ग्राम स्वच्छता एवं पोषण दिवस)",
    pt_ben: "पोषण ट्रैकर ऐप में आधार नामांकन",
    abhilekh: "अभिलेखों / पंजिकाओं का रखरखाव",
    saaf: "आंगनवाड़ी केंद्र एवं आसपास की साफ-सफाई",
    krimi: "राष्ट्रीय कृमि दिवस",
    poshan_week: "राष्ट्रीय पोषण सप्ताह",
    sam_6mon: "अतिकुपोषित श्रेणी के 0–6 वर्ष के बच्चे",
    sam_6yr: "अतिकुपोषित से कुपोषित श्रेणी में आए 0–6 वर्ष के बच्चे",
    mam_6mon: "कुपोषित से सामान्य श्रेणी में आए 0–6 वर्ष के बच्चे",
    gambhir: "गंभीर बीमारी से ग्रसित बच्चों का विवरण",
    rbsk: "RBSK टीम द्वारा केंद्र भ्रमण",
    other_work: "अन्य विशिष्ट कार्य (BLO, जनगणना, पल्स पोलियो आदि)",
    dept_work: "विभागीय सहयोग से किए गए कार्य",
    per_work: "व्यक्तिगत प्रयास से केंद्र को सार्वजनिक भवन में स्थानांतरित करना",
    ach_work: "अन्य विशिष्ट उपलब्धियां एवं कुपोषण उन्मूलन के प्रयास",
  };

  const PREVIEW_DOCUMENT_LABELS = {
    photo_img: "आवेदक का फोटो",
    signature: "आवेदक के हस्ताक्षर",
    pt_group_img: "समुदाय आधारित गतिविधियों से संबंधित फोटो",
    sandharbh_img: "संदर्भण पर्ची (Referral Slip)",
    sam_img: "कुपोषित एवं अतिकुपोषित लाभार्थियों से संबंधित फोटो",
    sam_6mon_img: "अतिकुपोषित बच्चों की फोटो",
    sam_6yr_img: "श्रेणी में सुधार वाले बच्चों की फोटो",
    mam_6mon_img: "सामान्य श्रेणी में आए बच्चों की फोटो",
    gambhir_img: "गंभीर बीमारी से ग्रसित बच्चों की फोटो",
    other_work_img: "आदेश की फोटो",
  };

  const renderAssessmentPreviewRows = (application) =>
    MARK_GROUPS.map((group) => (
      <React.Fragment key={group.title}>
        <tr className="cdpo-preview-group-row">
          <th colSpan={2}>{PREVIEW_MARK_GROUP_TITLES[group.title] || group.title}</th>
        </tr>
        {group.fields.map(([label, prefix]) => {
          const mark = getMarkValue(application, prefix);
          return (
            <tr key={prefix}>
              <td>{PREVIEW_MARK_LABELS[prefix] || label}</td>
              <td>
                <div className="cdpo-preview-answer">
                  <strong>कुल / विवरण:</strong>{" "}
                  {previewValue(mark.total !== null && mark.total !== undefined ? mark.total : mark.obtained)}
                </div>
                <div className="cdpo-preview-answer">
                  <strong>प्राप्त / रिपोर्ट किए गए:</strong> {previewValue(mark.obtained)}
                </div>
                <div className="cdpo-preview-answer">
                  <strong>प्राप्त अंक:</strong> {previewValue(mark.marks)}
                </div>
              </td>
            </tr>
          );
        })}
      </React.Fragment>
    ));

  const renderCertificatePreviewRows = (application, fields) =>
    fields.map(([label, field]) => {
      const previewLabel = PREVIEW_DOCUMENT_LABELS[field] || label;
      return (
        <tr key={field}>
          <td>{previewLabel}</td>
          <td>{renderPreviewFile(application, field, previewLabel)}</td>
        </tr>
      );
    });

  const ELIGIBILITY_PREVIEW_FIELDS = [
    ["1. आंगनबाड़ी कार्यकर्ती / मिनी कार्यकर्ती के रूप में पांच वर्ष की निरंतर सेवा पूर्ण कर ली हो तथा वर्तमान में कार्यरत हों (CDPO द्वारा प्रदत्त प्रमाण-पत्र)", "aharta1"],
    ["2. ऐसे आंगनबाड़ी केंद्र / मिनी आंगनबाड़ी केंद्र का संचालन करती हों जहां सर्वे अनुसार ग्रामीण क्षेत्रों में न्यूनतम 10 एवं शहरी क्षेत्रों में न्यूनतम 20 बच्चे पंजीकृत हों (क्षेत्रीय सुपरवाइजर द्वारा प्रदत्त प्रमाण-पत्र)", "aharta2"],
    ["3. संबंधित आंगनबाड़ी केंद्र के समस्त लाभार्थी पोषण ट्रैकर ऐप में पंजीकृत हों (क्षेत्रीय सुपरवाइजर द्वारा प्रदत्त प्रमाण-पत्र)", "aharta3"],
    ["4. संबंधित आंगनबाड़ी केंद्र के समस्त बच्चों की प्रतिरक्षण दर राज्य स्तरीय दर से कम न होने का प्रमाण-पत्र", "aharta4"],
  ];

  const SELECTION_PREVIEW_FIELDS = [
    ["1. अन्य विशिष्ट उपलब्धियों, महत्वपूर्ण दिवसों एवं कुपोषण उन्मूलन के प्रयासों के समाचार / अभिलेख", "manak2"],
    ["2(i). विभागीय सहयोग से केंद्र को मॉडल बनाने के कार्यों का विवरण", "manak3a"],
    ["2(ii). व्यक्तिगत प्रयासों से केंद्र को मॉडल बनाने के कार्यों का विवरण", "manak3b"],
    ["3. उत्कृष्ट कार्यों हेतु प्राप्त सम्मान, पुरस्कार या प्रमाण-पत्र", "manak4"],
  ];

  const renderApplicationDetails = (application) => (
    <div className="cdpo-anganwadi-detail-table-wrap">
      <Table bordered responsive className="cdpo-anganwadi-detail-table">
        <tbody>
          {APPLICATION_FIELDS.map(([label, field]) => (
            <tr key={field}>
              <th>{label}</th>
              <td>
                {field === "dob" || field === "joining_date"
                  ? formatDate(application[field])
                  : displayValue(application[field])}
              </td>
            </tr>
          ))}
          <tr>
            <th>Merit Marks</th>
            <td>
              <strong>{displayValue(getApplicationMerit(application))}</strong>
            </td>
          </tr>
          <tr>
            <th>Current Status</th>
            <td>
              <Badge bg={getStatusVariant(application.status)}>
                {formatStatus(application.status)}
              </Badge>
            </td>
          </tr>
          <tr>
            <th>CDPO Remark</th>
            <td>{displayValue(application.remark)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderMarkGroups = (application) => (
    <div className="cdpo-anganwadi-mark-groups">
      {MARK_GROUPS.map((group) => (
        <section className="cdpo-anganwadi-mark-group" key={group.title}>
          <h3>{group.title}</h3>
          <div className="cdpo-anganwadi-detail-table-wrap">
            <Table bordered responsive className="cdpo-anganwadi-detail-table">
              <thead>
                <tr>
                  <th>Evaluation Criteria</th>
                  <th>Total / Details</th>
                  <th>Marks Obtained</th>
                </tr>
              </thead>
              <tbody>
                {group.fields.map(([label, prefix]) => {
                  const mark = getMarkValue(application, prefix);
                  const totalLabel =
                    mark.total !== null && mark.total !== undefined
                      ? displayValue(mark.total)
                      : displayValue(mark.obtained);
                  return (
                    <tr key={prefix}>
                      <td>{label}</td>
                      <td>{totalLabel}</td>
                      <td>{displayValue(mark.marks)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </section>
      ))}
    </div>
  );

  const renderDocuments = (application) => {
    const availableDocuments = DOCUMENT_FIELDS.filter(([, field]) => application[field]);
    if (availableDocuments.length === 0) {
      return <p className="cdpo-anganwadi-muted">No documents are available.</p>;
    }

    return (
      <div className="cdpo-anganwadi-documents">
        {availableDocuments.map(([label, field, type]) => {
          const url = getMediaUrl(application[field]);
          return (
            <div className="cdpo-anganwadi-document" key={field}>
              {type === "image" ? (
                <a href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt={label} loading="lazy" />
                  <span>{label}</span>
                </a>
              ) : (
                <a href={url} target="_blank" rel="noreferrer">
                  <FaFilePdf aria-hidden="true" />
                  <span>{label} — View / Download</span>
                </a>
              )}
            </div>
          );
        })}
      </div>
    );
  };

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
                variant="outline-success"
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
              <Button type="button" variant={activeTab === "all" ? "success" : "outline-success"} onClick={() => { setActiveTab("all"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "all"}>
                All Forms <span>{applications.length}</span>
              </Button>
              <Button type="button" variant={activeTab === "completed" ? "success" : "outline-success"} onClick={() => { setActiveTab("completed"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "completed"}>
                Completed Forms <span>{applications.filter((item) => isCompletedStatus(item.status)).length}</span>
              </Button>
              <Button type="button" variant={activeTab === "approved" ? "success" : "outline-success"} onClick={() => { setActiveTab("approved"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "approved"}>
                Approved BY CDPO <span>{applications.filter((item) => isApprovedStatus(item.status)).length}</span>
              </Button>
              <Button type="button" variant={activeTab === "report" ? "success" : "outline-success"} onClick={() => { setActiveTab("report"); setStatusFilter("all"); }} role="tab" aria-selected={activeTab === "report"}>
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
                      <th>Anganwadi Center</th>
                      <th>Candidate name</th>
                      <th>Joining Date</th>
                      <th>Form ID</th>
                      <th>Remark</th>
                      <th>Merit / Total Marks</th>
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
                    const selectedId = selectedAwardBySector[sectorKey] || "";
                    const centerAlreadyApproved = applications.some((item) => {
                      const itemSector = String(item.sector || item.awc_name || item.awc_center || item.project || "Unassigned Sector").trim();
                      const centerKey = String(sectorKey || "").trim();
                      return itemSector === centerKey && isApprovedStatus(item.status);
                    });
                    const selectedFormId = selectedAwardBySector[sectorKey];
                    const isUpdating = updatingFormId === String(selectedFormId || "");
                    const rowDisabled = centerAlreadyApproved;
                    return (
                      <tr key={application.form_id || application.id} className={rowDisabled ? "cdpo-anganwadi-row-disabled" : ""}>
                        <td>{displayValue(application.awc_name || application.awc_center)}</td>
                        <td>{displayValue(application.filer_name)}</td>
                        <td>{formatTableDate(application.joining_date)}</td>
                        <td className="cdpo-anganwadi-form-id">
                          <button type="button" className="cdpo-form-id-link" onClick={() => setSelectedApplication(application)} aria-label={`View application ${application.form_id}`}>
                            {displayValue(application.form_id)}
                          </button>
                        </td>
                        <td className="cdpo-anganwadi-remark-cell">{displayValue(application.remark)}</td>
                        <td><strong>Total Marks: {displayValue(getApplicationMerit(application))}</strong></td>
                        <td className="cdpo-anganwadi-select-cell">
                          <Form.Check
                            type="radio"
                            name={`award-sector-${sectorKey}`}
                            checked={String(selectedId) === String(application.form_id)}
                            disabled={rowDisabled}
                            onChange={() => setSelectedAwardBySector((current) => ({ ...current, [sectorKey]: application.form_id }))}
                            aria-label={`Choose ${application.filer_name} for award in ${sectorKey}`}
                          />
                        </td>
                        {index === 0 && (
                          <td className="cdpo-anganwadi-sector-actions" rowSpan={items.length}>
                            <div className="cdpo-anganwadi-sector-action-buttons">
                              {centerAlreadyApproved ? (
                                <Badge bg="success">Forwarded to DPO / Approved</Badge>
                              ) : (
                                <>
                                  <Button size="sm" variant="info" disabled={isUpdating} onClick={() => submitSectorSelection(sectorKey, "approved")}>Submit</Button>
                                  <Button size="sm" variant="outline-danger" disabled={isUpdating} onClick={() => submitSectorSelection(sectorKey, "rejected")}>Reject Selected</Button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
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
                              <td>{displayValue(getApplicationMerit(application))}</td>
                              <td>{(application.aharta4 || application.immunization_certificate) ? "हाँ" : "नहीं"}</td>
                            </>
                          ) : (
                            <>
                              <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                              <td className="cdpo-anganwadi-status-cell"><Badge bg={getStatusVariant(status)}>{formatStatus(status)}</Badge></td>
                              <td className="cdpo-anganwadi-remark-cell">{displayValue(application.remark)}</td>
                              <td><strong>{displayValue(getApplicationMerit(application))}</strong></td>
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

      {selectedApplication && (
        <div
          className="cdpo-anganwadi-preview-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedApplication(null);
          }}
        >
          <section
            className="cdpo-anganwadi-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cdpo-anganwadi-preview-title"
          >
            <header className="cdpo-anganwadi-document-header">
              <div>
                <h2 id="cdpo-anganwadi-preview-title">आवेदन का पूर्वावलोकन</h2>
                <p>आंगनवाड़ी कार्यकर्त्री पुरस्कार 2026–27</p>
              </div>
              <div className="cdpo-anganwadi-document-actions">
                <Button variant="outline-light" onClick={handlePrint}>
                  <FaPrint className="me-2" /> प्रिंट / PDF
                </Button>
                <Button
                  variant="light"
                  aria-label="Close application preview"
                  onClick={() => setSelectedApplication(null)}
                >
                  ×
                </Button>
              </div>
            </header>

            <div className="cdpo-anganwadi-document-content">
              <article className="cdpo-anganwadi-print-area">
                <h1 className="cdpo-anganwadi-document-department">
                  महिला सशक्तिकरण एवं बाल विकास विभाग
                </h1>
                <h2 className="cdpo-anganwadi-document-title">
                  आंगनवाड़ी कार्यकर्त्री पुरस्कार 2026–27 आवेदन पत्र
                </h2>

                <div className={`cdpo-anganwadi-document-status ${String(selectedApplication.status || "").toLowerCase() === "approved" ? "is-approved" : ""}`}>
                  <strong>आवेदन की स्थिति:</strong> {formatStatus(selectedApplication.status)}
                  <span className="cdpo-anganwadi-document-status-separator"> | </span>
                  <strong>Merit Marks:</strong> {displayValue(getApplicationMerit(selectedApplication))}
                </div>

                <div className="cdpo-anganwadi-document-table-wrap">
                  <table className="cdpo-anganwadi-document-table">
                    <thead>
                      <tr><th>जानकारी का शीर्षक</th><th></th></tr>
                    </thead>
                    <tbody>{renderApplicantPreviewRows(selectedApplication)}</tbody>
                  </table>
                </div>

                <h3 className="cdpo-anganwadi-document-section-title">मूल्यांकन के लिए प्रश्न</h3>
                <div className="cdpo-anganwadi-document-table-wrap">
                  <table className="cdpo-anganwadi-document-table cdpo-anganwadi-assessment-preview-table">
                    <thead><tr><th>मूल्यांकन के लिए प्रश्न</th><th>चुना हुआ उत्तर / अंक विवरण</th></tr></thead>
                    <tbody>{renderAssessmentPreviewRows(selectedApplication)}</tbody>
                  </table>
                </div>

                <h3 className="cdpo-anganwadi-document-section-title">Step 3: अपलोड दस्तावेज़ / प्रमाण पत्र का विवरण</h3>
                <div className="cdpo-anganwadi-document-table-wrap">
                  <table className="cdpo-anganwadi-document-table">
                    <thead><tr><th>अनिवार्य अर्हताओं के सापेक्ष प्रमाण पत्र</th><th>प्रमाण पत्र</th></tr></thead>
                    <tbody>{renderCertificatePreviewRows(selectedApplication, ELIGIBILITY_PREVIEW_FIELDS)}</tbody>
                  </table>
                </div>

                <h3 className="cdpo-anganwadi-document-section-title">चयन मानक संबंधित प्रमाण पत्र</h3>
                <div className="cdpo-anganwadi-document-table-wrap">
                  <table className="cdpo-anganwadi-document-table">
                    <thead><tr><th>चयन मानक संबंधित प्रमाण पत्र</th><th>प्रमाण पत्र</th></tr></thead>
                    <tbody>{renderCertificatePreviewRows(selectedApplication, SELECTION_PREVIEW_FIELDS)}</tbody>
                  </table>
                </div>

                <h3 className="cdpo-anganwadi-document-section-title">अन्य अपलोड दस्तावेज़ / फोटो</h3>
                <div className="cdpo-anganwadi-document-table-wrap">
                  <table className="cdpo-anganwadi-document-table">
                    <thead><tr><th>दस्तावेज़ का विवरण</th><th>अपलोड की गई फाइल</th></tr></thead>
                    <tbody>
                      {renderCertificatePreviewRows(
                        selectedApplication,
                        DOCUMENT_FIELDS
                          .filter(([, field]) => !["photo_img", "signature", "aharta1", "aharta2", "aharta3", "aharta4", "manak2", "manak3a", "manak3b", "manak4"].includes(field))
                          .map(([label, field]) => [label, field])
                      )}
                      <tr>
                        <td>आवेदक के हस्ताक्षर</td>
                        <td>{renderPreviewFile(selectedApplication, "signature", "आवेदक के हस्ताक्षर")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="cdpo-anganwadi-document-section-title">CDPO समीक्षा</h3>
                <div className="cdpo-anganwadi-document-table-wrap">
                  <table className="cdpo-anganwadi-document-table">
                    <tbody>
                      <tr><td>आवेदन की स्थिति</td><td>{formatStatus(selectedApplication.status)}</td></tr>
                      <tr><td>CDPO की टिप्पणी</td><td>{displayValue(selectedApplication.remark)}</td></tr>
                    </tbody>
                  </table>
                </div>
              </article>

              <div className="cdpo-anganwadi-document-footer">
                <div>
                  <strong>आवेदन फार्म संख्या:</strong> {displayValue(selectedApplication.form_id)}
                  <span> · </span>
                  <strong>Merit Marks:</strong> {displayValue(getApplicationMerit(selectedApplication))}
                </div>
                <div className="cdpo-anganwadi-document-footer-actions">
                  <Button variant="secondary" onClick={() => setSelectedApplication(null)}>
                    <FaTimes className="me-2" /> बंद करें
                  </Button>
                  {!["approved", "rejected"].includes(String(selectedApplication.status || "").toLowerCase()) && (
                    <Button
                      variant="success"
                      onClick={() => {
                        const application = selectedApplication;
                        setSelectedApplication(null);
                        openDecision(application, "approved");
                      }}
                    >
                      <FaCheck className="me-2" /> Approve
                    </Button>
                  )}
                  {!["approved", "rejected"].includes(String(selectedApplication.status || "").toLowerCase()) && (
                    <Button variant="outline-danger" onClick={() => {
                      const application = selectedApplication;
                      setSelectedApplication(null);
                      openDecision(application, "rejected");
                    }}>
                      <FaTimes className="me-2" /> Reject
                    </Button>
                  )}
                  <Button variant="info" onClick={handlePrint}>
                    <FaPrint className="me-2" /> Print
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

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
