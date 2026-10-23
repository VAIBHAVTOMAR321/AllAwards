import React, { useMemo, useState, useRef } from "react";
import "./PreviewModal.css";
import { isAgeNotEligible, getAgeIneligibilityMessage } from "./ageEligibility";
import {
  NOT_SUBMITTED_LABEL,
  extractSubmissionTimestamp,
  formatSubmissionDateTime,
  resolveSubmissionTimestampFromSteps,
} from "../../../utils/submissionDate";

const yesNo = (val) =>
  val === "हाँ" || val === "yes" || val === true
    ? "हाँ"
    : val === "नहीं" || val === "no" || val === false
    ? "नहीं"
    : val || "-";

const formatRescuedPersonAge = (age) => {
  if (!age) return "";
  const parts = String(age).split("/");
  if (parts.length !== 3 || !parts.every((part) => /^\d+$/.test(part.trim()))) {
    return age;
  }
  return `${parts[0].trim()} वर्ष ${parts[1].trim()} महीने ${parts[2].trim()} दिन`;
};

const calcAge = (dob) => {
  if (!dob) return "-";
  try {
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return "-";
    const ref = new Date("2025-07-01");
    let years = ref.getFullYear() - birth.getFullYear();
    let months = ref.getMonth() - birth.getMonth();
    let days = ref.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(ref.getFullYear(), ref.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    return `${years} वर्ष ${months} माह ${days} दिन (as on 1-July-2025)`;
  } catch { return "-"; }
};

const getFileType = (file) => {
  if (!file) return null;
  if (typeof file === "string") {
    if (/\.pdf$/i.test(file)) return "pdf";
    if (/\.(doc|docx)$/i.test(file)) return "doc";
    if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file)) return "image";
    return "other";
  }
  if (file instanceof File) {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (file.type.includes("word") || file.type.includes("document")) return "doc";
    return "other";
  }
  return null;
};

const getFileName = (file) => {
  if (!file) return null;
  if (file instanceof File) return file.name;
  if (typeof file === "string") {
    const trimmed = String(file).trim();
    if (!trimmed) return null;
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
  return null;
};

const getFileSrc = (file) => {
  if (!file) return null;
  const mediaBaseUrl = "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend";
  if (typeof file === "string") {
    const trimmed = String(file).trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `${mediaBaseUrl}/${trimmed.replace(/^\/+/, "")}`;
  }
  if (file instanceof File) return URL.createObjectURL(file);
  return null;
};

/* ── Doc preview box ── */
const DocPreview = ({ file }) => {
  const src = useMemo(() => getFileSrc(file), [file]);
  const type = useMemo(() => getFileType(file), [file]);

  if (!src) {
    return (
      <div className="nf-pv-dprev nf-pv-dprev-na">
        <span>Not Applicable</span>
      </div>
    );
  }
  const openFile = () => { if (src) window.open(src, "_blank"); };

  if (type === "image") {
    return (
      <div className="nf-pv-dprev" onClick={openFile} title="क्लिक करें">
        <img src={src} alt="preview" className="nf-pv-dprev-img" />
      </div>
    );
  }
  if (type === "pdf") {
    return (
      <div className="nf-pv-dprev nf-pv-dprev-pdf" onClick={openFile} title="क्लिक करें">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <span>PDF</span>
      </div>
    );
  }
  return (
    <div className="nf-pv-dprev nf-pv-dprev-doc" onClick={openFile} title="क्लिक करें">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#217193" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
      <span>DOC</span>
    </div>
  );
};

/* ── 4-col helpers ── */
const Row4 = ({ l1, v1, l2, v2 }) => (
  <tr>
    <td className="nf-pv-l4">{l1}</td>
    <td className="nf-pv-v4">{v1 || "-"}</td>
    <td className="nf-pv-l4">{l2}</td>
    <td className="nf-pv-v4">{v2 || "-"}</td>
  </tr>
);

const Row4Full = ({ label, value }) => (
  <tr>
    <td className="nf-pv-l4">{label}</td>
    <td className="nf-pv-v4" colSpan="3">{value || "-"}</td>
  </tr>
);

/* ── Expand / Collapse ── */
const ExpandText = ({ text, maxWords = 20 }) => {
  const [open, setOpen] = useState(false);
  if (!text) return <span>-</span>;
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return <span>{text}</span>;
  return (
    <span>
      {open ? text : words.slice(0, maxWords).join(" ") + "..."}
      <button type="button" className="nf-pv-more-btn" onClick={() => setOpen((p) => !p)}>
        {open ? " कम दिखाएं ▲" : " और पढ़ें ▼"}
      </button>
    </span>
  );
};

/* ── Single doc cell (name + filename) ── */
const DocNameCell = ({ label, file }) => {
  const fname = getFileName(file);
  return (
    <td className="nf-pv-l4 nf-pv-docname">
      <span>{label}</span>
      {fname && <small>{fname}</small>}
    </td>
  );
};

/* ════════════════════════════════════════════════ */
const PreviewModal = ({ data, onClose, topAccepted, onTopAcceptedChange, isApplicationCompleted, isITCell = false, onSwitchToRegistration }) => {
  const printRef = useRef(null);
  const isAgeIneligible = isAgeNotEligible(data?.birthDate, data?.actDate);
  const applicationNumber = data?.applicant_id || data?.applicationNumber || "System Generated";
  const district = data?.["permanentजनपद"] || data?.district || "-";
  const registrationRecord = data?.registration || {};
  const nominatorRecord = data?.nominator || {};
  const registrationAddress =
    registrationRecord.address || nominatorRecord.address || data?.address || {};
  const registrationSources = [
    registrationRecord,
    nominatorRecord,
    data,
    registrationAddress,
  ];
  const getRegistrationValue = (...keys) => {
    for (const source of registrationSources) {
      for (const key of keys) {
        const value = source?.[key];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          return value;
        }
      }
    }
    return "";
  };
  const rawIdProofType = getRegistrationValue(
    "id_proof_type",
    "idType",
    "id_type",
  );
  const idProofTypeLabels = {
    aadhaar: "आधार कार्ड",
    pan: "पैन कार्ड",
    driving_license: "ड्राइविंग लाइसेंस",
    pehchan_patraw: "पहचान पत्र (फोटो के साथ)",
    passport: "पासपोर्ट",
    voter_id: "मतदाता पहचान पत्र",
  };
  const registration = {
    nominator_category: getRegistrationValue("nominator_category", "category"),
    full_name: getRegistrationValue("full_name", "name"),
    relat_with_child: getRegistrationValue("relat_with_child", "relation"),
    phone: getRegistrationValue("phone", "mobile", "mobile_number", "phone_number"),
    email: getRegistrationValue("email"),
    id_proof_type:
      idProofTypeLabels[String(rawIdProofType).toLowerCase()] || rawIdProofType,
    id_proof_number_label: getRegistrationValue("id_proof_number_label"),
    id_proof_no: getRegistrationValue("id_proof_no", "idNumber", "id_number"),
    village: getRegistrationValue("village", "ग्राम/मोहल्ला"),
    post_office: getRegistrationValue("post_office", "तहसील "),
    project: getRegistrationValue("project", "विकासखण्ड/नगर निकाय"),
    district: getRegistrationValue("district", "जनपद"),
    pincode: getRegistrationValue("pincode", "pin_code", "पिन कोड"),
  };
  if (!registration.id_proof_number_label && registration.id_proof_type) {
    registration.id_proof_number_label = `7. ${registration.id_proof_type} संख्या`;
  }

  // The `nominator-part5` (documents) row carries the submission time; read it
  // only after the form has reached its final-submitted status.
  const submissionTimestamp = isApplicationCompleted
    ? data?.submissionTimestamp ||
      resolveSubmissionTimestampFromSteps({
        s1: data?.rawStep1,
        s4: data?.rawStep4,
        s5: data?.rawStep5,
      }) ||
      extractSubmissionTimestamp(data?.rawStep5) ||
      data?.submissionDate ||
      ""
    : "";
  const submissionDate = isApplicationCompleted
    ? formatSubmissionDateTime(submissionTimestamp, NOT_SUBMITTED_LABEL)
    : "";

  const photoSrc = useMemo(() => getFileSrc(data?.document5), [data?.document5]);

  const goToStep = (step) => {
    const target = document.getElementById(`nf-pv-${step}`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const curAddr = [data?.["currentग्राम/मोहल्ला"], data?.["currentतहसील "], data?.["currentजनपद"], data?.["currentपिन कोड"]].filter(Boolean).join(" / ");
  const perAddr = [data?.["permanentग्राम/मोहल्ला"], data?.["permanentतहसील "], data?.["permanentजनपद"], data?.["permanentपिन कोड"]].filter(Boolean).join(" / ");

  const allDocs = [
    { label: "नामांकनकर्ता का पहचान पत्र", key: "document0" },
    { label: "बच्चे का आधार कार्ड/पहचान पत्र", key: "document1" },
    { label: " बालक / बालिका  का  उत्तराखण्ड का स्थायी निवास प्रमाण पत्र", key: "document2" },
    { label: "बच्चे का जन्म प्रमाण पत्र/आयु प्रमाण पत्र", key: "document3" },
    { label: "वीरता घटना का विस्तृत विवरण", key: "document4" },
    { label: "बच्चे का पासपोर्ट आकार फोटो", key: "document5" },
    { label: "FIR/पुलिस रिपोर्ट", key: "document6" },
    { label: "समाचार पत्र की कटिंग/मीडिया रिपोर्ट", key: "document7" },
    { label: "प्रत्यक्षदर्शियों के बयान/प्रमाण", key: "document8" },
    { label: "घटना से संबंधित फोटो/वीडियो", key: "document9" },
    { label: "विद्यालय का प्रमाण पत्र", key: "document10" },
    { label: "अन्य सहायक अभिलेख", key: "document11" },
    { label: "पासबुक के प्रथम पृष्ठ की प्रति", key: "document12" },
    { label: "नामांकनकर्ता घोषणा अभिलेख", key: "declarationDocument" },
    { label: "अभिभावक घोषणा अभिलेख", key: "parentDeclarationDocument" },
  ];

  const docPairs = [];
  for (let i = 0; i < allDocs.length; i += 2) {
    docPairs.push({ left: allDocs[i], right: allDocs[i + 1] || null });
  }

  /* ── Print handler with auto-expand ── */
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const expandButtons = printContent.querySelectorAll(".nf-pv-more-btn");
    const collapsedBtns = [];

    expandButtons.forEach((btn) => {
      if (btn.textContent.includes("और पढ़ें")) {
        collapsedBtns.push(btn);
        btn.click();
      }
    });

    setTimeout(() => {
      const fullHTML = printContent.innerHTML;
      collapsedBtns.forEach((btn) => btn.click());

      const printWindow = window.open("", "_blank", "width=1100,height=700");
      if (!printWindow) {
        alert("Pop-up blocked! Please allow pop-ups for this site to print.");
        return;
      }

      let styleSheetsHTML = "";
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          if (sheet.href) {
            styleSheetsHTML += `<link rel="stylesheet" href="${sheet.href}" type="text/css" />`;
          } else if (sheet.cssRules) {
            let css = "";
            for (let j = 0; j < sheet.cssRules.length; j++) {
              css += sheet.cssRules[j].cssText + "\n";
            }
            styleSheetsHTML += `<style type="text/css">${css}</style>`;
          }
        } catch (e) { /* skip cross-origin */ }
      }

      printWindow.document.write(`<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8" />
  <title>Print - ${applicationNumber}</title>
  ${styleSheetsHTML}
  <style type="text/css">
    /* ═════════════════ PAGE SETUP ═══════════════ */
    @page {
      size: 297mm 420mm;
      margin: 12mm 8mm 10mm 8mm;
    }

    /* ═══════════════ COLOR FIX ═══════════════ */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* ═══════════════ BASE RESET ═══════════════ */
    html, body {
      margin: 0;
      padding: 0;
      background: #fff !important;
      font-family: "Noto Sans Devanagari", "Mangal", "Kokila", "Arial Unicode MS", sans-serif;
    }

    /* ═══════════════ SHEET — match screen height flow ═══════════════ */
    .nf-pv-sheet {
      width: 100% !important;
      max-width: 100% !important;
      min-height: auto !important;
      height: auto !important;
      box-shadow: none !important;
      overflow: visible !important;
      position: static !important;
    }

    /* ═══════════════ OVERLAY — remove fixed positioning ═══════════════ */
    .nf-pv-overlay {
      position: static !important;
      background: #fff !important;
      padding: 0 !important;
      display: block !important;
      overflow: visible !important;
      animation: none !important;
      width: 100% !important;
      height: auto !important;
    }

    /* ═══════════════ HIDE non-printable ═══════════════ */
    .nf-pv-x,
    .nf-pv-print-bar,
    .nf-pv-footer,
    .nf-pv-more-btn {
      display: none !important;
    }

    /* ═══════════════ HEADER — same left/right as screen ═══════════════ */
    .nf-pv-dept-header {
      padding: 18px 20mm 10px !important;
      margin-top: 8px !important;
    }

    /* ═══════════════ BODY — same left/right as screen ═══════════════ */
    .nf-pv-body {
      overflow: visible !important;
      padding: 12px 15mm 16px !important;
    }

    /* ═══════════════ BLOCKS — same spacing as screen ═══════════════ */
    .nf-pv-block {
      margin-bottom: 8px !important;
    }
    .nf-pv-block-label {
      margin-top: 22px !important;
      margin-bottom: 3px !important;
    }
    .nf-pv-form-id {
      margin-bottom: 4px !important;
    }

    /* ═══════════════ TABLE — same cell padding as screen ═══════════════ */
    .nf-pv-t4 td {
      border-color: #000 !important;
      padding: 3px 7px !important;
    }
    .nf-pv-l4 {
      background: #f0f4f8 !important;
    }
    .nf-pv-sub4 {
      background: #fafbfc !important;
    }
    .nf-pv-sep4 {
      border-top-color: #000 !important;
    }

    /* ═══════════════ PHOTO ROW ═══════════════ */
    .nf-pv-photo-row {
      border-color: #000 !important;
    }
    .nf-pv-photo-box {
      border-color: #000 !important;
      background: #f7f8fa !important;
    }

    /* ═══════════════ DOC PREVIEW BOXES ═══════════════ */
    .nf-pv-dprev {
      cursor: default !important;
      box-shadow: none !important;
    }
    .nf-pv-dprev-na {
      background: #fafafa !important;
      border-color: #ccc !important;
    }
    .nf-pv-dprev-pdf {
      background: #fdf2f2 !important;
    }
    .nf-pv-dprev-doc {
      background: #f0f7fa !important;
    }

    /* ═══════════════ DECLARATION BOX — same padding as screen ═══════════════ */
    .nf-pv-decl-box {
      border-color: #000 !important;
      padding: 10px 12px !important;
    }
    .nf-pv-decl-box p {
      margin: 0 0 6px !important;
    }
    .nf-pv-decl-sign {
      margin-bottom: 8px !important;
    }
    .nf-pv-sign-name {
      border-top-color: #000 !important;
    }
    .nf-pv-dstatus.has {
      color: #0d47a1 !important;
    }

    /* ═══════════════ PAGE BREAK — only force page 2 start ═══════════════ */
    .nf-pv-page2-start {
      page-break-before: always !important;
    }
  </style>
</head>
<body>
  ${fullHTML}
  <script type="text/javascript">
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`);

      printWindow.document.close();
    }, 80);
  };

  return (
    <div className="nf-pv-overlay" onClick={onClose}>
      <div className="nf-pv-sheet" onClick={(e) => e.stopPropagation()}>

        {/* ── Print Bar ── */}
        <div className="nf-pv-print-bar">
          <div className="nf-pv-bar-left">
            <button type="button" className="nf-pv-printbtn" onClick={handlePrint}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print</span>
            </button>
            <div className="nf-pv-step-pills">
              {["step1", "step2", "step3", "step4", "step5"].map((s, i) => (
                <button
                  key={s}
                  type="button"
                  className="nf-pv-pill"
                  onClick={() => goToStep(s)}
                >
                  Step {i + 1}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="nf-pv-x nf-pv-x-inbar" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* ── Printable area ── */}
        <div ref={printRef} className="nf-pv-printable">

          <div className="nf-pv-dept-header">
            <h1>महिला सशक्तिकरण एवं बाल विकास विभाग</h1>
            <p>उत्तराखण्ड सरकार</p>
          </div>

          <div className="nf-pv-body">

            <div className="nf-pv-form-id">
              Form ID: {applicationNumber}
              {isApplicationCompleted && ` (Final Submitted on ${submissionDate})`}
            </div>

            <div className="nf-pv-block" id="nf-pv-registration">
              <div className="nf-pv-block-label">पंजीकरण विवरण (Registration Details):</div>
              <table className="nf-pv-t4">
                <tbody>
                  <Row4 l1="1. नामांकनकर्ता की श्रेणी" v1={registration.nominator_category} l2="2. नामांकनकर्ता का पूरा नाम" v2={registration.full_name} />
                  <Row4 l1="3. बच्चे से संबंध" v1={registration.relat_with_child} l2="4. मोबाइल नंबर" v2={registration.phone} />
                  <Row4 l1="5. ई-मेल आईडी" v1={registration.email} l2="6. (नामांकनकर्ता) पहचान पत्र का प्रकार" v2={registration.id_proof_type} />
                  <Row4 l1={registration.id_proof_number_label || "7. पहचान पत्र संख्या"} v1={registration.id_proof_no} l2="ग्राम/मोहल्ला/घर का पूरा पता" v2={registration.village} />
                  <Row4 l1="तहसील" v1={registration.post_office} l2="विकासखण्ड/नगर निकाय" v2={registration.project} />
                  <Row4 l1="जनपद" v1={registration.district} l2="पिन कोड" v2={registration.pincode} />
                </tbody>
              </table>
            </div>

            {/* ═══════════════════════════════════════
                 PAGE 1 — आवेदक + वीरता
                 ═══════════════════════════════════════ */}

            {/* ── 1. आवेदक का विवरण (Step 1) ── */}
            <div className="nf-pv-block" id="nf-pv-step1">
              <div className="nf-pv-block-label">चरण 1 / Step 1: आवेदक का विवरण (Nominee Details):</div>
              <div className="nf-pv-photo-row">
                <table className="nf-pv-t4">
                  <tbody>
                    <Row4 l1="बच्चे का पूरा नाम" v1={data?.childName} l2="पिता का नाम" v2={data?.fatherName} />
                    <Row4 l1="माता का नाम" v1={data?.motherName} l2="अभिभावक का नाम" v2={data?.guardianName} />
                    <Row4 l1="मोबाइल नंबर" v1={data?.childMobile} l2="लिंग" v2={data?.gender} />
                    <Row4 l1="जन्म तिथि" v1={data?.birthDate} l2="आयु" v2={calcAge(data?.birthDate)} />
                    <Row4 l1="उत्तराखण्ड का स्थायी निवासी" v1={yesNo(data?.resident)} l2="वर्तमान कक्षा" v2={data?.currentClass} />
                    <Row4Full label="विद्यालय का नाम" value={data?.schoolName} />
                    <Row4Full label="विद्यालय का पता" value={data?.schoolAddress} />
                    <tr><td colSpan="4" className="nf-pv-sep4" /></tr>
                    <Row4 l1="वर्तमान पता" v1={curAddr} l2="स्थायी पता" v2={perAddr} />
                    <Row4 l1="वर्तमान विकासखण्ड / नगर निकाय" v1={data?.["currentविकासखण्ड/नगर निकाय"]} l2="स्थायी विकासखण्ड / नगर निकाय" v2={data?.["permanentविकासखण्ड/नगर निकाय"]} />
                    <Row4 l1="वर्तमान जनपद" v1={data?.["currentजनपद"]} l2="स्थायी जनपद" v2={district} />
                    <Row4 l1="वर्तमान पिन कोड" v1={data?.["currentपिन कोड"]} l2="स्थायी पिन कोड" v2={data?.["permanentपिन कोड"]} />
                    <tr><td colSpan="4" className="nf-pv-sep4" /></tr>
                    <tr>
                      <td className="nf-pv-l4" colSpan="4">10. बैंक खाता विवरण ( जिसमें पुरस्कार की धनराशि अंतरित की जानी है )</td>
                    </tr>
                    <Row4 l1="खाता किसके नाम पर है" v1={data?.bankAccountHolderType} l2="खाताधारक का पूरा नाम" v2={data?.bankAccountHolderName} />
                    <Row4 l1="बैंक का नाम" v1={data?.bankName} l2="IFSC कोड" v2={data?.ifscCode} />
                    <Row4Full label="बैंक खाता संख्या" value={data?.bankAccountNumber} />
                  </tbody>
                </table>
                <div className="nf-pv-photo-wrap">
                  <div className="nf-pv-photo-box">
                    {photoSrc ? <img src={photoSrc} alt="फोटो" className="nf-pv-photo-img" /> : <span className="nf-pv-photo-ph">फोटो</span>}
                  </div>
                  <span className="nf-pv-photo-label">पासपोर्ट फोटो</span>
                </div>
              </div>
            </div>

            {/* ── 2. वीरता की घटना का विवरण (Step 2) ── */}
            <div className="nf-pv-block" id="nf-pv-step2">
              <div className="nf-pv-block-label">चरण 2 / Step 2: वीरता की घटना का विवरण (Bravery Act Details):</div>
              <table className="nf-pv-t4">
                <tbody>
                  <Row4Full label="घटना का शीर्षक" value={data?.actTitle} />
                  <Row4 l1="घटना की दिनांक" v1={data?.actDate} l2="घटना का समय" v2={data?.actTime} />
                  <Row4 l1="घटना का स्थान" v1={data?.actPlace} l2="घटना का जनपद" v2={data?.actDistrict} />
                  <tr>
                    <td className="nf-pv-l4">संक्षिप्त विवरण</td>
                    <td className="nf-pv-v4" colSpan="3">
                      <ExpandText text={data?.shortDescription} maxWords={20} />
                    </td>
                  </tr>
                  <Row4Full label="बचाए गये व्यक्तियों का विवरण" value={data?.rescuedCount} />
                  {Array.isArray(data?.rescuedPersons) && data.rescuedPersons.length > 0 && (
                    <tr>
                      <td className="nf-pv-l4">बचाए गए व्यक्ति विवरण</td>
                      <td className="nf-pv-v4" colSpan="3">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {data.rescuedPersons.map((p, pIdx) => {
                            const [pName, pMobile, rawAge, pRel] = Array.isArray(p)
                              ? p
                              : [
                                  p.name,
                                  p.mobile,
                                  p.age || [p.ageYears, p.ageMonths, p.ageDays]
                                    .filter((part) => part !== undefined && part !== null && part !== "")
                                    .join("/"),
                                  p.relation,
                                ];
                            const pAge = formatRescuedPersonAge(rawAge);
                            if (!pName && !pMobile && !pAge && !pRel) return null;
                            return (
                              <span key={pIdx} style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontSize: "0.72rem", border: "1px solid #e2e8f0" }}>
                                <strong>{pName || "-"}</strong> ({pRel || "-"}) {pAge ? `| आयु: ${pAge}` : ""} {pMobile ? `| मो: ${pMobile}` : ""}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ═══════════════════════════════════════
                 PAGE 2 — अतिरिक्त जानकारी + अभिलेख + घोषणा
                 ═══════════════════════════════════════ */}

            {/* ── 3. अतिरिक्त जानकारी (Step 3) ── */}
            <div className="nf-pv-block nf-pv-page2-start" id="nf-pv-step3">
              <div className="nf-pv-block-label">चरण 3 / Step 3: अतिरिक्त जानकारी (Additional Information):</div>
              <table className="nf-pv-t4">
                <tbody>
                  <tr>
                    <td className="nf-pv-l4" colSpan="3">1. क्या पुलिस रिपोर्ट / FIR दर्ज है ?</td>
                    <td className="nf-pv-v4 nf-pv-ynv4">{yesNo(data?.firRegistered)}</td>
                  </tr>
                  {data?.firRegistered === "हाँ" && (
                    <>
                      <tr>
                        <td className="nf-pv-sub4" colSpan="3">थाना</td>
                        <td className="nf-pv-v4">{data?.policeStation || "-"}</td>
                      </tr>
                      <tr>
                        <td className="nf-pv-sub4" colSpan="3">FIR संख्या</td>
                        <td className="nf-pv-v4">{data?.firNumber || "-"}</td>
                      </tr>
                      <tr>
                        <td className="nf-pv-sub4" colSpan="3">FIR दिनांक</td>
                        <td className="nf-pv-v4">{data?.firDate || "-"}</td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <td className="nf-pv-l4" colSpan="3">2. क्या समाचार पत्र / मीडिया रिपोर्ट प्रकाशित हुई ?</td>
                    <td className="nf-pv-v4 nf-pv-ynv4">{data?.mediaPublished || "-"}</td>
                  </tr>
                  <tr>
                    <td className="nf-pv-l4" colSpan="3">3. क्या कोई अन्य पुरस्कार / सम्मान प्राप्त हुआ है ?</td>
                    <td className="nf-pv-v4 nf-pv-ynv4">{yesNo(data?.otherAward)}</td>
                  </tr>
                  {data?.otherAward === "हाँ" && (
                    <tr>
                      <td className="nf-pv-sub4" colSpan="3">अन्य पुरस्कार का विवरण</td>
                      <td className="nf-pv-v4">{data?.otherAwardDetails || "-"}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="nf-pv-l4" colSpan="3">4. अतिरिक्त टिप्पणी / अन्य महत्वपूर्ण जानकारी</td>
                    <td className="nf-pv-v4">{data?.additionalInformation || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── 4. आवश्यक अभिलेख अपलोड (Step 4) ── */}
            <div className="nf-pv-block" id="nf-pv-step4">
              <div className="nf-pv-block-label">चरण 4 / Step 4: आवश्यक अभिलेख अपलोड (Uploaded Documents):</div>
              <table className="nf-pv-t4">
                <tbody>
                  {docPairs.map((pair, idx) => (
                    <tr key={idx}>
                      <DocNameCell label={pair.left.label} file={data?.[pair.left.key]} />
                      <td className="nf-pv-v4 nf-pv-prev-td">
                        <DocPreview file={data?.[pair.left.key]} />
                      </td>
                      {pair.right ? (
                        <>
                          <DocNameCell label={pair.right.label} file={data?.[pair.right.key]} />
                          <td className="nf-pv-v4 nf-pv-prev-td">
                            <DocPreview file={data?.[pair.right.key]} />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="nf-pv-l4 nf-pv-empty" />
                          <td className="nf-pv-v4 nf-pv-empty" />
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── 5. घोषणा (Step 5) ── */}
            <div className="nf-pv-block" id="nf-pv-step5">
              <div className="nf-pv-block-label">चरण 5 / Step 5: घोषणा एवं सहमति (Declaration):</div>
              <div className="nf-pv-decl-box">
                <p className="nf-pv-decl-title">नामांकनकर्ता की घोषणा:</p>
                <p>
                  मेरे द्वारा उपरोक्त भरी गई समस्त जानकारी पूर्णतयः सत्य एवं
                  सही है। यदि कोई जानकारी उपरोक्त में अंकित है और गलत पाई
                  जाती है तो विभाग द्वारा नियमानुसार कार्यवाही की जा
                  सकती है जिसकी सम्पूर्ण जिम्मेदारी आवेदक की होगी।
                </p>
                {data?.declarationDocument && (
                  <div className="nf-pv-decl-view">
                    <a href={getFileSrc(data?.declarationDocument)} target="_blank" rel="noopener noreferrer" className="nf-pv-dstatus has">view</a>
                  </div>
                )}
                <div className="nf-pv-decl-sign">
                  <span className="nf-pv-sign-name">{data?.childName || "-"}</span>
                </div>
                <div className="nf-pv-sign-line">
                  <span>नामांकनकर्ता</span>
                  <span>द्वारा</span>
                  <span>हस्ताक्षर</span>
                </div>

                <p className="nf-pv-decl-title" style={{ marginTop: "14px" }}>
                  अभिभावक की घोषणा / सहमति:
                </p>
                <p>
                  मैं/हम इस बात से सहमत हूँ कि महिला सशक्तिकरण एवं बाल
                  विकास विभाग, उत्तराखण्ड द्वारा उपलब्ध कराई गई जानकारी
                  एवं संलग्न अभिलेखों का संबंधित जिला प्रशासन, पुलिस
                  विभाग एवं अन्य सक्षम प्राधिकारी के माध्यम से सत्यापन
                  कराया जा सकता है। मैं/हम यह भी सहमत हूँ कि गलत अथवा
                  भ्रामक जानकारी पाए जाने की स्थिति में नामांकन निरस्त
                  किया जा सकता है तथा नियमानुसार आवश्यक कार्यवाही की
                  जा सकती है। पुरस्कार हेतु चयन की स्थिति में बच्चे के नाम,
                  फोटो एवं वीरता की घटना से संबंधित विवरण का उपयोग
                  विभाग द्वारा पुरस्कार संबंधी प्रचार-प्रसार एवं
                  आधिकारिक प्रयोजनों के लिए किया जा सकेगा।
                </p>
                {data?.parentDeclarationDocument && (
                  <div className="nf-pv-decl-view">
                    <a href={getFileSrc(data?.parentDeclarationDocument)} target="_blank" rel="noopener noreferrer" className="nf-pv-dstatus has">view</a>
                  </div>
                )}
                <div className="nf-pv-decl-sign">
                  <span className="nf-pv-sign-name">
                    {data?.guardianName || data?.fatherName || "-"}
                  </span>
                </div>
                <div className="nf-pv-sign-line">
                  <span>अभिभावक</span>
                  <span>द्वारा</span>
                  <span>हस्ताक्षर</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        {/* ── End printable ── */}

        {/* ── Footer ── */}
        <div className="nf-pv-footer">
          {isITCell ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "auto", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", background: "#f1f5f9", padding: "4px 10px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                  IT Cell Form View: {applicationNumber}
                </span>
                {onSwitchToRegistration && (
                  <button
                    type="button"
                    className="nf-pv-switchbtn"
                    onClick={onSwitchToRegistration}
                    style={{ background: "#eef2ff", color: "#3730a3", border: "1px solid #c7d2fe", borderRadius: "4px", padding: "5px 12px", fontSize: "0.76rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    ← पंजीकरण विवरण देखें (Registration Details)
                  </button>
                )}
              </div>
              <button type="button" className="nf-pv-closebtn" onClick={onClose}>Close</button>
            </>
          ) : (
            <>
              <label className="nf-pv-accept" style={isAgeIneligible ? { cursor: "not-allowed", opacity: 0.6 } : undefined}>
                <input
                  type="checkbox"
                  checked={isApplicationCompleted ? true : topAccepted}
                  onChange={(e) => onTopAcceptedChange?.(e.target.checked)}
                  disabled={isApplicationCompleted || isAgeIneligible}
                />
                <span>मैंने समस्त शर्तें पढ़ ली हैं और मैं उनसे सहमत हूँ।</span>
              </label>
              {isAgeIneligible && <small className="nf-pv-warn">{getAgeIneligibilityMessage(data?.birthDate, data?.actDate)}</small>}
              {!isAgeIneligible && !isApplicationCompleted && topAccepted && <small className="nf-pv-warn">बदलाव करने के लिए कृपया ऊपर दिए गए चेकबॉक्स को अनचेक करें।</small>}
              <button type="button" className="nf-pv-closebtn" onClick={onClose}>Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;