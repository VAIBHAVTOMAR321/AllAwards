
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../login/AuthContext";
import { FaEye } from "react-icons/fa";

const endpoint = "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part5/";
const mediaBaseUrl = "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend";

const documents = [
  ["नामांकनकर्ता का पहचान पत्र", "अनिवार्य"],
  ["बच्चे का आधार कार्ड/पहचान पत्र", "अनिवार्य"],
  [" बालक / बालिका  का  उत्तराखण्ड का स्थायी निवास प्रमाण पत्र", "अनिवार्य"],
  ["बच्चे का जन्म प्रमाण पत्र/आयु प्रमाण पत्र", "अनिवार्य"],
  ["वीरता की घटना के संबंध में नामांकनकर्ता द्वारा हस्ताक्षरित विस्तृत विवरण", "अनिवार्य"],
  ["बच्चे का पासपोर्ट आकार का फोटो", "अनिवार्य"],
  ["FIR/पुलिस रिपोर्ट", "जहां लागू हो"],
  ["घटना से संबंधित समाचार पत्र की कटिंग / मीडिया रिपोर्ट / फोटो / वीडियो लिंक", "जहां लागू हो"],
  ["प्रत्यक्षदर्शियों के बयान/प्रमाण", "यदि लागू हो"],
  ["घटना से संबंधित समाचार पत्र की कटिंग / मीडिया रिपोर्ट / फोटो / वीडियो लिंक", "जहां लागू हो"],
  ["विद्यालय का प्रमाण पत्र", "यदि लागू हो"],
  ["अन्य सहायक अभिलेख", "यदि लागू हो"],
  ["पासबुक के प्रथम पृष्ठ की प्रति", "अनिवार्य"],
];

const documentHints = {
  10: "* विद्यालय द्वारा जारी प्रमाण पत्र, जिसमें विद्यार्थी का नाम, कक्षा और विद्यालय का नाम हो।",
};

const documentFieldMap = [
  "nominator_id_proof",
  "child_aadhaar_identity",
  "permanent_residence_certificate",
  "child_birth_age_certificate",
  "bravery_incident_description",
  "child_passport_photo",
  "fir_police_report",
  "media_report",
  "eyewitness_statements",
  "incident_photo_video_url",
  "school_certificate",
  "otherSupporting_documents",
  "bank_detail",
];

const hasValue = (value) => String(value || "").trim() !== "";
const hasWitnessData = (witnesses) => {
  const rows = Array.isArray(witnesses) ? witnesses : [];
  return rows.some((row) => ["name", "mobile", "address", "relation"].some((field) => hasValue(row?.[field])));
};
const getDocumentUrl = (value) => {
  if (!hasValue(value)) return "";
  if (/^https?:\/\//i.test(String(value))) return String(value);
  return `${mediaBaseUrl}/${String(value).replace(/^\/+/, "")}`;
};
const getFileName = (value) => {
  if (!value) return "";
  if (value instanceof File) return value.name;
  if (typeof value === "string") {
    const trimmed = String(value).trim();
    if (!trimmed) return "";
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
  return "";
};
const normalizeVideoUrl = (value) => {
  const trimmedValue = String(value || "").trim();
  if (!trimmedValue) return "";
  return /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
};

const BYTES_PER_MB = 1024 * 1024;

const StepD = ({ data, update, error, onSubmitSuccess, onCompleted, isStepDChecked, externalSubmitTrigger, onErrorsChange }) => {
  const { authFetch } = useAuth();
  const allowedExtensions = ["pdf"];
  const allowedMimeTypes = ["application/pdf"];

  const [loadingData, setLoadingData] = useState(true);
  const [submittingIndex, setSubmittingIndex] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null);
  const [pendingDocuments, setPendingDocuments] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasPart5Record, setHasPart5Record] = useState(false);
  const dataFetchStarted = useRef(false);

  const prevTriggerRef = useRef(externalSubmitTrigger);
  
  useEffect(() => {
    if (!hasWitnessData(data.witnesses)) {
      if (data.document8) {
        update({ target: { name: "document8", value: null, type: "text" } });
      }
      setPendingDocuments((prev) => {
        if (!prev.document8) return prev;
        const next = { ...prev };
        delete next.document8;
        return next;
      });
      setFieldErrors((prev) => {
        if (!prev.document8) return prev;
        const next = { ...prev };
        delete next.document8;
        return next;
      });
    }
  }, [data.witnesses, data.document8, update]);

  const visibleDocumentIndices = documents.reduce((indices, _, index) => {
    if (index === 9) return indices;

    // Bank passbook is always visible (index 12)
    if (index === 12) {
      indices.push(index);
      return indices;
    }

    const isFirApplicable = index !== 6 || String(data.firRegistered || "").trim() === "हाँ";
    const isSchoolApplicable = index !== 10 || hasValue(data.currentClass);
    const isMediaApplicable = index !== 7 || String(data.mediaPublished || "").trim() === "हाँ, प्रकाशित हुई है।";
    const isWitnessApplicable = index !== 8 || hasWitnessData(data.witnesses);

    if (isFirApplicable && isSchoolApplicable && isMediaApplicable && isWitnessApplicable) {
      indices.push(index);
    }

    return indices;
  }, []);

  useEffect(() => {
    if (dataFetchStarted.current) return;
    dataFetchStarted.current = true;
    const fetchPart5Data = async () => {
      try {
        const response = await authFetch(endpoint);
        if (!response.ok) return;
        const result = await response.json();
        const responseData = result?.data ?? result;
        const record = Array.isArray(responseData) ? responseData[0] : responseData;
        if (!record) return;

        const applicantId = data.applicant_id || localStorage.getItem("applicantId") || "";
        const isMatchingRecord = hasValue(record.applicant_id)
          && (!applicantId || String(record.applicant_id) === String(applicantId));
        if (isMatchingRecord) {
          setHasPart5Record(true);
        }

        const fieldMapping = {};
        documentFieldMap.forEach((field, index) => {
          if (record[field] !== undefined && record[field] !== null && String(record[field]).trim() !== "") {
            fieldMapping[`document${index}`] = record[field];
          }
        });

        Object.entries(fieldMapping).forEach(([name, value]) => {
          update({ target: { name, value, type: "text" } });
        });

        if (isMatchingRecord && !isStepDChecked && String(record.status || "").trim().toLowerCase() === "completed") {
          onCompleted?.(record);
        }

      } catch (fetchError) {
        console.error("Failed to fetch Part 5 data:", fetchError);
      } finally {
        setLoadingData(false);
      }
    };
    fetchPart5Data();
  }, [authFetch, data.applicant_id, isStepDChecked, onCompleted, update]);

  useEffect(() => {
    if (externalSubmitTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = externalSubmitTrigger;
      if (externalSubmitTrigger) handleNext();
    }
  }, [externalSubmitTrigger]);

  const handleFileChange = (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();

    const isPassportPhoto = index === 5;
    const maxFileSize = 3 * BYTES_PER_MB;
    const currentAllowedExtensions = isPassportPhoto ? ["jpg", "jpeg"] : allowedExtensions;
    const currentAllowedMimeTypes = isPassportPhoto ? ["image/jpeg", "image/jpg"] : allowedMimeTypes;

    const isExtensionAllowed = currentAllowedExtensions.includes(extension);
    const isMimeTypeAllowed = currentAllowedMimeTypes.includes(mimeType);

    if (!isExtensionAllowed || !isMimeTypeAllowed) {
      e.target.value = "";
      update({ target: { name: `document${index}`, value: null } });
      alert(
        isPassportPhoto
          ? `अवैध फ़ाइल प्रकार: "${extension?.toUpperCase() || "Unknown"}"\n\nकृपया केवल JPG, JPEG फ़ाइलें अपलोड करें।`
          : `अवैध फ़ाइल प्रकार: "${extension?.toUpperCase() || "Unknown"}"\n\nकृपया केवल PDF फ़ाइलें अपलोड करें।\nHEIC/HEIF और अन्य फॉर्मैट स्वीकार नहीं हैं।`
      );
      return;
    }

    if (file.size > maxFileSize) {
      e.target.value = "";
      update({ target: { name: `document${index}`, value: null } });
      setFieldErrors((prev) => ({
        ...prev,
        [`document${index}`]: `फ़ाइल का आकार ${maxFileSize / BYTES_PER_MB} MB से अधिक नहीं होना चाहिए।`,
      }));
      return;
    }

    update(e);
    setPendingDocuments((prev) => ({ ...prev, [index]: file }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`document${index}`];
      return next;
    });
  };

  const handleRemoveDocument = (index) => {
    const confirmed = window.confirm("क्या आप यह दस्तावेज़ हटाना चाहते हैं?");
    if (!confirmed) return;
    update({ target: { name: `document${index}`, value: null, type: "text" } });
    setPendingDocuments((prev) => ({ ...prev, [index]: null }));
    if (!hasPart5Record) return;
    handleDocumentSubmit(index, null);
  };

  const handleUrlChange = (e, index) => {
    update(e);
    setPendingDocuments((prev) => ({ ...prev, [index]: e.target.value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`document${index}`];
      return next;
    });
  };

  const handleViewFile = (file) => {
    if (!file) return;
    if (file instanceof File) {
      const fileUrl = URL.createObjectURL(file);
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 10000);
    } else if (typeof file === "string") {
      window.open(getDocumentUrl(file), "_blank", "noopener,noreferrer");
    }
  };

  const buildFormData = (index, value) => {
    const formData = new FormData();
    const applicantId = data.applicant_id || localStorage.getItem("applicantId") || "";

    if (!applicantId) return null;

    formData.append("applicant_id", applicantId);
    if (index === 9) formData.append(documentFieldMap[index], String(value));
    else formData.append(documentFieldMap[index], value);

    return formData;
  };

  const validateDocuments = () => {
    const errors = {};
    visibleDocumentIndices.forEach((index) => {
      const applicability = documents[index][1];
      if (index !== 7 && applicability === "अनिवार्य" && !data[`document${index}`]) {
        errors[`document${index}`] = "यह दस्तावेज़ अनिवार्य है";
      }
      if (index === 6 && String(data.firRegistered || "").trim() === "हाँ" && !data[`document${index}`]) {
        errors[`document${index}`] = "यह दस्तावेज़ अनिवार्य है";
      }
      if (index === 8 && hasWitnessData(data.witnesses) && !data[`document${index}`]) {
        errors[`document${index}`] = "यह दस्तावेज़ अनिवार्य है";
      }
      if (index === 10 && hasValue(data.currentClass) && !data[`document${index}`]) {
        errors[`document${index}`] = "यह दस्तावेज़ अनिवार्य है";
      }
    });
    const mediaRequired = String(data.mediaPublished || "").trim() === "हाँ, प्रकाशित हुई है।";
    if (mediaRequired && !hasValue(data.document7) && !hasValue(data.document9)) {
      errors.document7 = "समाचार पत्र की कटिंग / मीडिया रिपोर्ट / फोटो / वीडियो लिंक में से कोई एक आवश्यक है";
      errors.document9 = errors.document7;
    }
    return errors;
  };

  const handleDocumentSubmit = async (index, valueOverride) => {
    const value = valueOverride === undefined ? pendingDocuments[index] : valueOverride;
    if (value === undefined || (typeof value === "string" && !hasValue(value))) return;
    if (index === 9) {
      try {
        new URL(normalizeVideoUrl(value));
      } catch {
        setAlertInfo({ type: "error", message: "कृपया मान्य वीडियो लिंक दर्ज करें।" });
        return;
      }
    }

    setSubmittingIndex(index);
    setAlertInfo(null);
    try {
      const applicantId = data.applicant_id || localStorage.getItem("applicantId") || "";
      if (!applicantId) throw new Error("Applicant ID नहीं मिला। कृपया पहले Step 1 पूरा करें।");

      const method = hasPart5Record ? "PUT" : "POST";
      const requestOptions = value === null
        ? {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              applicant_id: applicantId,
              [documentFieldMap[index]]: null,
            }),
          }
        : index === 9
        ? {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              applicant_id: applicantId,
              [documentFieldMap[index]]: normalizeVideoUrl(value),
            }),
          }
        : { method, body: buildFormData(index, value) };
      const response = await authFetch(endpoint, requestOptions);

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (response.ok && (result.success === true || result.success === undefined)) {
        setAlertInfo({ type: "success", message: "दस्तावेज़ सफलतापूर्वक सेव हो गया!  " });
        setPendingDocuments((prev) => ({ ...prev, [index]: undefined }));
        setHasPart5Record(true);
      } else {
        const errorMsg = (typeof result === "object" ? (result.detail || result.message || result.error) : result) || "सबमिशन में त्रुटि हुई।";
        setAlertInfo({ type: "error", message: typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg) });
      }
    } catch (err) {
      console.error("Document submit error:", err);
      setAlertInfo({ type: "error", message: err.message || "सबमिशन में त्रुटि हुई। कृपया पुनः प्रयास करें।" });
    } finally {
      setSubmittingIndex(null);
    }
  };

  const handleNext = () => {
    setAlertInfo(null);
    const validationErrors = validateDocuments();
    setFieldErrors(validationErrors);
    if (onErrorsChange) onErrorsChange(validationErrors);
    if (Object.keys(validationErrors).length) {
      requestAnimationFrame(() => {
        const firstKey = Object.keys(validationErrors)[0];
        let el = null;
        if (firstKey === "document7") {
          el = document.getElementById("nf-document-7-file");
        } else if (firstKey === "document9") {
          el = document.getElementById("nf-document-9-url");
        } else if (firstKey.startsWith("document")) {
          const index = firstKey.replace("document", "");
          el = document.getElementById(`nf-document-${index}`);
        }
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    onSubmitSuccess?.();
  };

  if (loadingData) {
    return (
      <section className="nf-card">
        <div className="nf-card-heading">
          <span>Step 4</span>
          <h2>आवश्यक अभिलेख अपलोड (Document Upload)</h2>
        </div>
        <p>डेटा लोड हो रहा है...</p>
      </section>
    );
  }

  return (
    <section className="nf-card">
      {alertInfo && (
        <div
          className="nf-alert"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            borderRadius: "8px",
            border: alertInfo.type === "success" ? "1px solid #22c55e" : "1px solid #ef4444",
            backgroundColor: alertInfo.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: alertInfo.type === "success" ? "#166534" : "#991b1b",
            fontSize: "1rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            animation: "nfFadeIn 0.3s ease",
          }}
        >
          <span>{alertInfo.message}</span>
          <button
            type="button"
            onClick={() => setAlertInfo(null)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: alertInfo.type === "success" ? "#166534" : "#991b1b",
              fontWeight: "bold",
              lineHeight: 1,
              padding: "0 0.25rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="nf-card-heading">
        <span>Step 4</span>
        <h2>आवश्यक अभिलेख अपलोड (Document Upload)</h2>
      </div>

      <div className="nf-upload-list">
        {visibleDocumentIndices.map((index, displayIndex) => {
          const [label, applicability] = documents[index];
          const isPhotoVideoLink = index === 9;
          const isCombinedMedia = index === 7;
          const mediaRequired = String(data.mediaPublished || "").trim() === "हाँ, प्रकाशित हुई है।";
          const isSchoolCertificate = index === 10;
          const isSchoolRequired = index === 10 && hasValue(data.currentClass);
          const isFirRequired = index === 6 && String(data.firRegistered || "").trim() === "हाँ";
          const isWitnessRequired = index === 8 && hasWitnessData(data.witnesses);
          const file = data[`document${index}`];
          const pendingFile = pendingDocuments[index];
          const isSubmitting = submittingIndex === index;

          // Alert logic for specific fields connected to previous steps
          let conditionalAlertMessage = "";
          if (isFirRequired) {
            conditionalAlertMessage = "आपने पिछले चरण में FIR दर्ज कराने हेतु 'हाँ' चुना था। यदि यह अभिलेख अपलोड किए जाने हेतु उपलब्ध नहीं है, तो कृपया पिछले चरण में जाकर 'नहीं' चुनें।";
          } else if (isSchoolRequired) {
            conditionalAlertMessage = "आपने पिछले चरण में विद्यालय में नामांकित होने हेतु 'हाँ' चुना था। यदि यह अभिलेख अपलोड किए जाने हेतु उपलब्ध नहीं है, तो कृपया पिछले चरण में जाकर 'नहीं' चुनें।";
          } else if (isCombinedMedia && mediaRequired) {
            conditionalAlertMessage = "आपने पिछले चरण में मीडिया में प्रकाशित होने हेतु 'हाँ' चुना था। यदि यह अभिलेख अपलोड किए जाने हेतु उपलब्ध नहीं है, तो कृपया पिछले चरण में जाकर 'नहीं' चुनें।";
          } else if (isWitnessRequired) {
            conditionalAlertMessage = "आपने पिछले चरण में प्रत्यक्षदर्शी का विवरण दिया है। यदि यह अभिलेख अपलोड किए जाने हेतु उपलब्ध नहीं है, तो कृपया पिछले चरण में जाकर विवरण हटा दें या 'नहीं' चुनें।";
          }

          return (
            <div className="nf-upload" key={label}>
              <div className="nf-upload-header">
                <div>
                  <strong>
                    {displayIndex + 1}. {label}
                  </strong>
                   <span
                     className={`nf-tag ${
                       applicability === "अनिवार्य" || (isCombinedMedia && mediaRequired) || isFirRequired || isSchoolRequired || isWitnessRequired ? "required" : ""
                     }`}
                   >
                     {(isCombinedMedia && mediaRequired) || isFirRequired || isSchoolRequired || isWitnessRequired ? "अनिवार्य" : applicability}
                   </span>
                </div>

                {file && (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {!isPhotoVideoLink && (
                      <button
                        type="button"
                        className="nf-view-file"
                        onClick={() => handleViewFile(file)}
                        title="View Document"
                      >
                        <FaEye />
                      </button>
                    )}
                    <button
                      type="button"
                      className="nf-secondary"
                      onClick={() => handleRemoveDocument(index)}
                      disabled={isSubmitting}
                    >
                      हटाएं
                    </button>
                  </div>
                )}
              </div>

              {conditionalAlertMessage && (
                <small style={{ color: "#dc3545", fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                  ⚠️ {conditionalAlertMessage}
                </small>
              )}

              {isCombinedMedia ? (
                <div className="nf-field">
                  <small className="nf-hint-note">* यदि एक से अधिक दस्तावेज़ हैं, तो सभी दस्तावेज़ों को एक ही PDF में मर्ज (संयोजित) करके अपलोड करें</small>
                  <small className="nf-hint-note">अधिकतम फ़ाइल आकार: 2 MB</small>
                  <label htmlFor="nf-document-7-file">समाचार पत्र की कटिंग / मीडिया रिपोर्ट / फोटो</label>
                  <input
                    id="nf-document-7-file"
                    name="document7"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 7)}
                    disabled={isSubmitting}
                  />
                  {data.document7 && <small className="nf-file-name">{getFileName(data.document7)}</small>}
                  {data.document7 && (
                    <button type="button" className="nf-secondary" onClick={() => handleRemoveDocument(7)} disabled={isSubmitting}>हटाएं</button>
                  )}
                  <label htmlFor="nf-document-9-url">वीडियो लिंक</label>
                  <input
                    id="nf-document-9-url"
                    name="document9"
                    type="url"
                    placeholder="https://example.com/photo-or-video-link"
                    value={data.document9 || ""}
                    onChange={(e) => handleUrlChange(e, 9)}
                    disabled={submittingIndex === 9}
                  />
                  {data.document9 && (
                    <button type="button" className="nf-secondary" onClick={() => handleRemoveDocument(9)} disabled={submittingIndex === 9}>हटाएं</button>
                  )}
                   <small>कम से कम एक विकल्प अपलोड करना अनिवार्य है।</small>
                   {(fieldErrors.document7 || error.document7) && (
                    <small className="nf-error">
                      {fieldErrors.document7 || error.document7}
                    </small>
                  )}
                   {(fieldErrors.document9 || error.document9) && (
                    <small className="nf-error">
                      {fieldErrors.document9 || error.document9}
                    </small>
                  )}
                   {pendingDocuments[7] && (
                    <button type="button" className="nf-primary" onClick={() => handleDocumentSubmit(7)} disabled={isSubmitting}>
                      {isSubmitting ? "सेव हो रहा है..." : "सेव करें"}
                    </button>
                  )}
                  {pendingDocuments[9] && (
                    <button type="button" className="nf-primary" onClick={() => handleDocumentSubmit(9)} disabled={submittingIndex === 9}>
                      {submittingIndex === 9 ? "सेव हो रहा है..." : "सेव करें"}
                    </button>
                  )}
                </div>
              ) : isPhotoVideoLink ? (
                <div className="nf-field">
                  <input
                    id={`nf-document-${index}`}
                    name={`document${index}`}
                    type="url"
                    placeholder="https://example.com/photo-or-video-link"
                    value={file || ""}
                    onChange={(e) => handleUrlChange(e, index)}
                    disabled={isSubmitting}
                    aria-describedby={`nf-document-help-${index}`}
                  />
                  {error[`document${index}`] && (
                    <small className="nf-error">
                      {fieldErrors[`document${index}`] || error[`document${index}`]}
                    </small>
                  )}
                  <small id={`nf-document-help-${index}`}>
                    कृपया फोटो/वीडियो का लिंक दर्ज करें
                  </small>
                  {pendingFile && (
                    <button type="button" className="nf-primary" onClick={() => handleDocumentSubmit(index)} disabled={isSubmitting}>
                      {isSubmitting ? "सेव हो रहा है..." : "सेव करें"}
                    </button>
                  )}
                </div>
               ) : (
                <>
                  <div className="nf-upload-body">
                    <div className="nf-upload-input">
                      {isSchoolCertificate && documentHints[10] && (
                        <small className="nf-hint-note"> {documentHints[10]}</small>
                      )}
                      <input
                        id={`nf-document-${index}`}
                        name={`document${index}`}
                        type="file"
                        accept={index === 5 ? ".jpg,.jpeg" : ".pdf"}
                        onChange={(e) => handleFileChange(e, index)}
                        disabled={isSubmitting}
                        aria-describedby={`nf-document-help-${index}`}
                      />

                       {file && (
                         <small className="nf-file-name">
                           {getFileName(file)}
                         </small>
                       )}

                      {fieldErrors[`document${index}`] && (
                        <small className="nf-error">
                          {fieldErrors[`document${index}`]}
                        </small>
                      )}

                      {error[`document${index}`] && (
                        <small className="nf-error">
                          {error[`document${index}`]}
                        </small>
                      )}
                    </div>
                  </div>

                  <small id={`nf-document-help-${index}`}>
                    {index === 5 ? "JPG/JPEG only" : "File Format: PDF only"} | Max Size: 3MB प्रति दस्तावेज
                  </small>
                  {pendingFile && (
                    <button type="button" className="nf-primary" onClick={() => handleDocumentSubmit(index)} disabled={isSubmitting}>
                      {isSubmitting ? "सेव हो रहा है..." : "सेव करें"}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

    </section>
  );
};

export default StepD;