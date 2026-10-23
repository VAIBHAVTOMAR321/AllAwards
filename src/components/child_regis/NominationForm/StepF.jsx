import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../login/AuthContext";
import { FaEye, FaFileAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import RaiseQueryModal from "./RaiseQueryModal.jsx";
import { isAgeNotEligible, getAgeIneligibilityMessage } from "./ageEligibility";
import {
  NOT_SUBMITTED_LABEL,
  extractSubmissionTimestamp,
  formatSubmissionDateTime,
} from "../../../utils/submissionDate";
import { SendOTP } from "../../otpsendverify/SendOTP";
import { VerifyOTP } from "../../otpsendverify/VerifyOTP";

const declaration = "मैं/हम यह प्रमाणित करते हैं कि इस ऑनलाइन नामांकन प्रपत्र में मेरे/हमारे द्वारा उपलब्ध कराई गई समस्त जानकारी एवं संलग्न अभिलेख मेरे/हमारे ज्ञान एवं विश्वास के अनुसार सत्य एवं सही हैं। उपरोक्त आवेदन में मेरे/हमारे द्वारा कोई महत्वपूर्ण तथ्य छिपाया नहीं गया है। तथा मुख्यमंत्री राज्य बाल पुरुष्कार हेतु नामांकन योग्य है।";
const parentDeclaration = "मैं/हम इस बात से सहमत हूँ कि महिला सशक्तिकरण एवं बाल विकास विभाग, उत्तराखण्ड द्वारा उपलब्ध कराई गई जानकारी एवं संलग्न अभिलेखों का संबंधित जिला प्रशासन, पुलिस विभाग एवं अन्य सक्षम प्राधिकारी के माध्यम से सत्यापन कराया जा सकता है। मैं/हम यह भी सहमत हूँ कि गलत अथवा भ्रामक जानकारी पाए जाने की स्थिति में नामांकन निरस्त किया जा सकता है तथा नियमानुसार आवेदन की कार्यवाही की जा सकती है। पुरस्कार हेतु चयन की स्थिति में बच्चे के नाम, फोटो एवं वीरता की घटना से संबंधित विवरण का उपयोग विभाग द्वारा पुरस्कार संबंधी प्रचार-प्रसार एवं आधिकारिक प्रयोजनों के लिए किया जा सकेगा।";
const endpoint = "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part5/declaration/";
const documentsEndpoint = "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part5/";
const registrationEndpoint = "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part2/";
const mediaBaseUrl =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/media";
const queryEndpoint = "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/applicant/request/";
const MAX_UPLOAD_SIZE = 1024 * 1024;

const getDocumentUrl = (value) => {
  if (!value) return "";

  const raw = String(value).trim();
  if (!raw) return "";

  let normalizedPath = raw;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      normalizedPath = url.pathname.replace(/^\/+/, "");
    } catch {
      normalizedPath = raw.replace(/^https?:\/\/[^/]+\//i, "");
    }
  } else {
    normalizedPath = raw.replace(/^\/+/, "");
  }

  if (/^media\//i.test(normalizedPath)) {
    normalizedPath = normalizedPath.replace(/^media\//i, "");
  }

  if (!normalizedPath) return "";

  return `${mediaBaseUrl}/${normalizedPath}`;
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

const StepF = ({ data, update, onSave, onPreview, onSubmit, canSubmit, topAccepted, onApplicationCompleted }) => {
  const { user, authFetch } = useAuth();
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showParentDocumentUpload, setShowParentDocumentUpload] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nominatorPhoneNumber, setNominatorPhoneNumber] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryMode, setQueryMode] = useState("create");
  const [queryData, setQueryData] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [hasSubmittedQuery, setHasSubmittedQuery] = useState(false);
  const [otpModal, setOtpModal] = useState(null);
  const [otpMobile, setOtpMobile] = useState("");
  const [submissionTimestamp, setSubmissionTimestamp] = useState("");
  const [pendingDocuments, setPendingDocuments] = useState({
    declarationDocument: null,
    parentDeclarationDocument: null,
  });
  const registrationFetchStarted = useRef(false);
  const updateRef = useRef(update);
  updateRef.current = update;
  const submissionTimestampRef = useRef({ documents: "", declaration: "" });
  const manualDocumentEditRef = useRef({
    declarationDocument: false,
    parentDeclarationDocument: false,
  });

  // The displayed submission time is the `updated_at` of the `nominator-part5`
  // (documents) row; the declaration row is only a fallback.
  const applySubmissionTimestamp = (source, payload) => {
    const timestamp = extractSubmissionTimestamp(payload);
    if (!timestamp || submissionTimestampRef.current[source] === timestamp) {
      return timestamp;
    }
    submissionTimestampRef.current = {
      ...submissionTimestampRef.current,
      [source]: timestamp,
    };
    const effective =
      submissionTimestampRef.current.documents ||
      submissionTimestampRef.current.declaration ||
      timestamp;
    setSubmissionTimestamp(effective);
    updateRef.current({
      target: { name: "submissionDate", value: effective, type: "text" },
    });
    return effective;
  };

  const userMobile = data?.mobile_number || data?.mobileNumber || user?.mobile_number || user?.mobile || "";
  const isAgeIneligible = isAgeNotEligible(data?.birthDate, data?.actDate);
  const ageIneligibilityMessage = getAgeIneligibilityMessage(data?.birthDate, data?.actDate);

  const applicantId = data?.applicant_id || user?.applicant_id || localStorage.getItem("applicantId") || "";
  const applicantMobile = data?.mobile_number || data?.phone_number || data?.childMobile || nominatorPhoneNumber || userMobile;
  const district = data?.["permanentजनपद"] || data?.permanentजनपद || data?.district || "System Generated";
  const submissionDate = formatSubmissionDateTime(
    submissionTimestamp || data?.submissionDate,
    NOT_SUBMITTED_LABEL,
  );

  useEffect(() => {
    let active = true;
    const fetchPart6Data = async () => {
      try {
        const response = await authFetch(endpoint);
        if (!response.ok) return;
        const result = await response.json();
        const responseData = result?.data ?? result;
        const record = Array.isArray(responseData) ? responseData[0] : responseData;
        const recordApplicantId = record?.applicant_id;
        if (active && record && (!applicantId || String(recordApplicantId) === String(applicantId))) {
          applySubmissionTimestamp("declaration", record);
          if (!manualDocumentEditRef.current.declarationDocument && record.declarationDocument) {
            update({ target: { name: "declarationDocument", value: record.declarationDocument, type: "text" } });
          }
          if (!manualDocumentEditRef.current.parentDeclarationDocument && record.parentDeclarationDocument) {
            update({ target: { name: "parentDeclarationDocument", value: record.parentDeclarationDocument, type: "text" } });
          }
          if (record.declarationDocument) {
            update({ target: { name: "declarationAccepted", checked: true, type: "checkbox" } });
          }
          if (record.parentDeclarationDocument) {
            update({ target: { name: "parentDeclarationAccepted", checked: true, type: "checkbox" } });
          }
          const status = String(record.status || record.submission_status || "").trim().toLowerCase();
          if (status === "completed") {
            setIsCompleted(true);
            onApplicationCompleted?.(record);
          }
        }
      } catch (fetchError) {
        console.error("Failed to fetch Part 6 data:", fetchError);
      } finally {
        if (active) setLoadingData(false);
      }
    };
    fetchPart6Data();
    return () => { active = false; };
  }, [applicantId, authFetch, onApplicationCompleted]);

  useEffect(() => {
    let active = true;
    const fetchDocumentsData = async () => {
      try {
        const response = await authFetch(documentsEndpoint);
        if (!response.ok) return;
        const result = await response.json();
        const records = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];
        const record =
          records.find((item) => !applicantId || String(item?.applicant_id) === String(applicantId)) ||
          records[0];
        if (active && record) {
          applySubmissionTimestamp("documents", record);
        }
      } catch (fetchError) {
        console.error("Failed to fetch nomination documents timestamp:", fetchError);
      }
    };

    fetchDocumentsData();
    return () => { active = false; };
  }, [applicantId, authFetch]);

  useEffect(() => {
    if (registrationFetchStarted.current) return;
    registrationFetchStarted.current = true;
    let active = true;
    const fetchRegistrationData = async () => {
      try {
        const response = await authFetch(registrationEndpoint);
        if (!response.ok) return;
        const result = await response.json();
        const records = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];
        const record = records.find((item) => !applicantId || String(item?.applicant_id) === String(applicantId)) || records[0];
        const mobile = record?.child_guardian_mobile || record?.mobile_number;
        if (active && mobile && !data?.childMobile) {
          update({ target: { name: "childMobile", value: mobile, type: "text" } });
        }
      } catch (fetchError) {
        console.error("Failed to fetch registration details:", fetchError);
      }
    };
    fetchRegistrationData();
    return () => { active = false; };
  }, [applicantId, authFetch, update]);

  useEffect(() => {
    let active = true;
    const fetchNominatorPhone = async () => {
      try {
        const response = await authFetch("https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part1/");
        if (!response.ok) return;
        const result = await response.json();
        const records = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];
        const record = records.find((item) => !applicantId || String(item?.applicant_id || "") === String(applicantId)) || records[0];
        const rawPhone = record?.phone || record?.phone_number || record?.mobile_number || record?.mobile || "";
        const phone = String(rawPhone || "").replace(/[^0-9]/g, "").slice(0, 10);

        if (active && phone) {
          setNominatorPhoneNumber(phone);
          if (!data?.phone_number && !data?.mobile_number) {
            update({ target: { name: "phone_number", value: phone, type: "text" } });
          }
        }
      } catch (fetchError) {
        console.error("Failed to fetch nominator phone number:", fetchError);
      }
    };

    fetchNominatorPhone();

    return () => {
      active = false;
    };
  }, [applicantId, authFetch, update]);

  useEffect(() => {
    if (data.declarationAccepted) {
      setShowDocumentUpload(true);
    }
  }, [data.declarationAccepted]);

  useEffect(() => {
    if (data.parentDeclarationAccepted) {
      setShowParentDocumentUpload(true);
    }
  }, [data.parentDeclarationAccepted]);

  const fetchQueries = async () => {
    if (!applicantId) return null;
    setQueryLoading(true);
    try {
      const response = await authFetch(`${queryEndpoint}?applicant_id=${encodeURIComponent(applicantId)}`);
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await response.json() : null;
      if (response.ok && result?.success) {
        const list = (Array.isArray(result.data) ? result.data : [])
          .filter((item) => String(item?.applicant_id || "") === String(applicantId));
        setQueryData(list);
        const hasQuery = list.length > 0;
        setHasSubmittedQuery(hasQuery);
        return list;
      }
      setQueryData(null);
      setHasSubmittedQuery(false);
    } catch (err) {
      console.error("Failed to fetch queries:", err);
      setQueryData(null);
      setHasSubmittedQuery(false);
    } finally {
      setQueryLoading(false);
    }
    return null;
  };

  useEffect(() => {
    if (!isCompleted || !applicantId) {
      setQueryData(null);
      setHasSubmittedQuery(false);
      return;
    }

    let active = true;
    const loadExistingQuery = async () => {
      const list = await fetchQueries();
      if (!active) return;
      if (list?.length) {
        setQueryMode("view");
      } else {
        setQueryMode("create");
      }
    };

    loadExistingQuery();
    return () => {
      active = false;
    };
  }, [isCompleted, applicantId, authFetch]);

  const getOrFetchPhone = async () => {
    if (nominatorPhoneNumber) return nominatorPhoneNumber;
    try {
      const response = await authFetch("https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part1/");
      if (response.ok) {
        const result = await response.json();
        const records = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];
        const record = records.find((item) => !applicantId || String(item?.applicant_id || "") === String(applicantId)) || records[0];
        const rawPhone = record?.phone || record?.phone_number || record?.mobile_number || record?.mobile || "";
        const clean = String(rawPhone || "").replace(/[^0-9]/g, "").slice(0, 10);
        if (clean) {
          setNominatorPhoneNumber(clean);
          return clean;
        }
      }
    } catch (e) {
      console.error("Error fetching phone:", e);
    }
    return String(data?.childMobile || data?.mobile_number || userMobile || "").replace(/[^0-9]/g, "").slice(0, 10);
  };

  const handleRaiseQuery = async () => {
    const phone = await getOrFetchPhone();
    setOtpMobile(phone);
    setOtpModal("send");
  };

  const handleQueryButton = async () => {
    console.info("[StepF][query] clicked", { applicantId, isCompleted });
    const list = await fetchQueries();
    const hasExistingQuery = Array.isArray(list) ? list.length > 0 : hasSubmittedQuery;

    if (hasExistingQuery) {
      setQueryMode("view");
      setShowQueryModal(true);
      return;
    }

    const phone = await getOrFetchPhone();
    console.info("[StepF][query] opening send OTP modal", {
      mobile: phone ? `${phone.slice(0, 2)}******${phone.slice(-2)}` : "<missing>",
      mobileLength: phone.length,
    });
    setOtpMobile(phone);
    setOtpModal("send");
  };

  const handleSendOtpSuccess = (mobile) => {
    console.info("[StepF][query] send OTP succeeded; switching to verify modal");
    setOtpMobile(mobile);
    setOtpModal("verify");
  };

  const handleOtpSuccess = () => {
    console.info("[StepF][query] OTP verified; opening query form");
    setOtpModal(null);
    setQueryMode("create");
    setShowQueryModal(true);
  };

  const handleQuerySubmitted = async (result) => {
    setHasSubmittedQuery(true);
    setQueryMode("view");
    setQueryData(result?.data || null);
    await fetchQueries();
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    update(e);
    setShowDocumentUpload(checked);
  };

  const handleParentCheckboxChange = (e) => {
    const checked = e.target.checked;
    update(e);
    setShowParentDocumentUpload(checked);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > MAX_UPLOAD_SIZE) {
      e.target.value = "";
      setSubmitError("फ़ाइल का आकार 1 MB से अधिक नहीं होना चाहिए।");
      return;
    }
    setSubmitError("");
    manualDocumentEditRef.current.declarationDocument = true;
    setPendingDocuments((prev) => ({ ...prev, declarationDocument: file }));
    update({ target: { name: "declarationDocument", value: file } });
  };

  const handleParentFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > MAX_UPLOAD_SIZE) {
      e.target.value = "";
      setSubmitError("फ़ाइल का आकार 1 MB से अधिक नहीं होना चाहिए।");
      return;
    }
    setSubmitError("");
    manualDocumentEditRef.current.parentDeclarationDocument = true;
    setPendingDocuments((prev) => ({ ...prev, parentDeclarationDocument: file }));
    update({ target: { name: "parentDeclarationDocument", value: file } });
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

  const getEffectiveDocumentValue = (fieldName) => {
    const pendingValue = pendingDocuments[fieldName];
    if (pendingValue instanceof File) return pendingValue;

    const currentValue = data?.[fieldName];
    if (currentValue instanceof File) return currentValue;
    if (currentValue && typeof currentValue === "string" && currentValue.trim()) return currentValue;

    return null;
  };

  const handleFinalSubmit = async () => {
    if (!canSubmit || isCompleted || submitting) return;

    if (isAgeIneligible) {
      setSubmitError(ageIneligibilityMessage);
      return;
    }

    const declarationValue = getEffectiveDocumentValue("declarationDocument");
    const parentDeclarationValue = getEffectiveDocumentValue("parentDeclarationDocument");

    if (!declarationValue || !parentDeclarationValue) {
      setSubmitError("कृपया दोनों घोषणा दस्तावेज़ अपलोड/चुनें।");
      return;
    }
    if (declarationValue instanceof File && declarationValue.size > MAX_UPLOAD_SIZE) {
      setSubmitError("नामांकनकर्ता घोषणा फ़ाइल का आकार 1 MB से अधिक नहीं होना चाहिए।");
      return;
    }
    if (parentDeclarationValue instanceof File && parentDeclarationValue.size > MAX_UPLOAD_SIZE) {
      setSubmitError("अभिभावक घोषणा फ़ाइल का आकार 1 MB से अधिक नहीं होना चाहिए।");
      return;
    }

    const jsonPayload = {
      applicant_id: applicantId,
      declarationDocument: declarationValue instanceof File ? declarationValue.name : declarationValue,
      parentDeclarationDocument: parentDeclarationValue instanceof File ? parentDeclarationValue.name : parentDeclarationValue,
      declarationAccepted: Boolean(data.declarationAccepted),
      parentDeclarationAccepted: Boolean(data.parentDeclarationAccepted),
    };

    const formData = new FormData();
    formData.append("applicant_id", applicantId);
    formData.append("declarationAccepted", String(Boolean(data.declarationAccepted)));
    formData.append("parentDeclarationAccepted", String(Boolean(data.parentDeclarationAccepted)));
    if (declarationValue) formData.append("declarationDocument", declarationValue);
    if (parentDeclarationValue) formData.append("parentDeclarationDocument", parentDeclarationValue);

    setSubmitting(true);
    setSubmitError("");
    try {
      let response = await authFetch(endpoint, { method: "PUT", body: formData });
      let contentType = response.headers.get("content-type") || "";
      let result = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok || (typeof result === "object" && result.success === false)) {
        const fallbackResponse = await authFetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jsonPayload),
        });

        contentType = fallbackResponse.headers.get("content-type") || "";
        result = contentType.includes("application/json")
          ? await fallbackResponse.json()
          : await fallbackResponse.text();

        if (!fallbackResponse.ok || (typeof result === "object" && result.success === false)) {
          const message = typeof result === "object"
            ? (result.detail || result.message || result.error || result.error_message)
            : result;
          throw new Error(message || "अंतिम सबमिशन में त्रुटि हुई।");
        }

        response = fallbackResponse;
      }

      setPendingDocuments({
        declarationDocument: null,
        parentDeclarationDocument: null,
      });
      manualDocumentEditRef.current = {
        declarationDocument: false,
        parentDeclarationDocument: false,
      };
      setIsCompleted(true);
      const storedTimestamp = applySubmissionTimestamp("declaration", result);

      // Some deployments answer the PUT without the saved row, so read it back
      // from the step 5 endpoint to display the time the server actually saved.
      if (!storedTimestamp) {
        try {
          const savedResponse = await authFetch(endpoint);
          if (savedResponse.ok) {
            const savedContentType = savedResponse.headers.get("content-type") || "";
            const savedResult = savedContentType.includes("application/json")
              ? await savedResponse.json()
              : null;
            applySubmissionTimestamp("declaration", savedResult);
          }
        } catch (refreshError) {
          console.error("Failed to read back the declaration timestamp:", refreshError);
        }
      }

      onApplicationCompleted?.(result);
      onSubmit?.();
    } catch (error) {
      console.error("Final declaration submit error:", error);
      setSubmitError(error.message || "अंतिम सबमिशन में त्रुटि हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <section className="nf-card">
        <div className="nf-card-heading">
          <span>Step 5</span>
          <h2>घोषणा एवं सहमति (Declaration)</h2>
        </div>
        <p>डेटा लोड हो रहा है...</p>
      </section>
    );
  }

  return (
    <section className="nf-card">
      {submitError && (
        <div className="nf-error" role="alert">
          {submitError}
        </div>
      )}
      <div className="nf-card-heading">
        <span>Step 5</span>
        <h2>घोषणा एवं सहमति (Declaration)</h2>
      </div>
      <div className="nf-declaration">
        <h3 className="nf-declaration-heading">नामांकनकर्ता की घोषणा</h3>
        <p>{declaration}</p>
        <div className="nf-declaration-center">
          <label className="nf-declaration-checkbox-label">
            <input
              type="checkbox"
              name="declarationAccepted"
              checked={Boolean(data.declarationAccepted)}
              onChange={handleCheckboxChange}
              disabled={isCompleted}
            />{" "}
            <span>
              मैंने उपर्युक्त घोषणा को पढ़ लिया है तथा मैं इससे सहमत हूँ।
            </span>
          </label>
        </div>
        <div className="nf-template-link-row">
          <Link
            to="/declaration1.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="nf-template-pdf-link"
          >
            <FaFileAlt className="pdf-icon" />
            टेम्पलेट डाउनलोड करें
          </Link>
        </div>
        {showDocumentUpload && (
          <div className="nf-document-upload">
            <label
              htmlFor="nf-declarationDocument"
              className="nf-document-upload-label"
            >
              अभिलेख अपलोड करें
            </label>
            <label
              htmlFor="nf-declarationDocument"
              className="nf-document-dropzone"
            >
              <input
                id="nf-declarationDocument"
                type="file"
                name="declarationDocument"
                onChange={handleFileChange}
                className="nf-document-input"
                disabled={isCompleted}
              />
              <span className="nf-document-dropzone-text">
                {data.declarationDocument
                  ? getFileName(data.declarationDocument)
                  : "No file chosen"}
              </span>
              {data.declarationDocument && (
                <button
                  type="button"
                  className="nf-view-file"
                  onClick={() => handleViewFile(data.declarationDocument)}
                  title="View Document"
                  style={{ marginLeft: "8px" }}
                >
                  <FaEye />
                </button>
              )}
            </label>
            <span className="nf-document-upload-hint">
              PDF, DOC, JPG, PNG (अधिकतम 1MB)
            </span>
          </div>
        )}
      </div>
      <div className="nf-declaration">
        <h3 className="nf-declaration-heading">अभिभावक की सहमति </h3>
        <p>{parentDeclaration}</p>
        <div className="nf-declaration-center">
          <label className="nf-declaration-checkbox-label">
            <input
              type="checkbox"
              name="parentDeclarationAccepted"
              checked={Boolean(data.parentDeclarationAccepted)}
              onChange={handleParentCheckboxChange}
              disabled={isCompleted}
            />
            <span>
              मैंने उपर्युक्त सहमति को पढ़ लिया है तथा मैं इससे सहमत हूँ।
            </span>
          </label>
        </div>
        <div className="nf-template-link-row">
          <Link
            to="/declaration2.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="nf-template-pdf-link"
          >
            <FaFileAlt className="pdf-icon" />
            टेम्पलेट डाउनलोड करें
          </Link>
        </div>
        {showParentDocumentUpload && (
          <div className="nf-document-upload">
            <label
              htmlFor="nf-parentDeclarationDocument"
              className="nf-document-upload-label"
            >
              अभिलेख अपलोड करें
            </label>
            <label
              htmlFor="nf-parentDeclarationDocument"
              className="nf-document-dropzone"
            >
              <input
                id="nf-parentDeclarationDocument"
                type="file"
                name="parentDeclarationDocument"
                onChange={handleParentFileChange}
                className="nf-document-input"
                disabled={isCompleted}
              />
              <span className="nf-document-dropzone-text">
                {data.parentDeclarationDocument
                  ? getFileName(data.parentDeclarationDocument)
                  : "No file chosen"}
              </span>
              {data.parentDeclarationDocument && (
                <button
                  type="button"
                  className="nf-view-file"
                  onClick={() => handleViewFile(data.parentDeclarationDocument)}
                  title="View Document"
                  style={{ marginLeft: "8px" }}
                >
                  <FaEye />
                </button>
              )}
            </label>
            <span className="nf-document-upload-hint">
              PDF, DOC, JPG, PNG (अधिकतम 1MB)
            </span>
          </div>
        )}
      </div>
      {isAgeIneligible && !isCompleted && (
        <div
          className="nf-notice"
          style={{ background: "#fef2f2", borderLeftColor: "#ef4444", color: "#991b1b", marginTop: "-.75rem" }}
        >
          {ageIneligibilityMessage}
        </div>
      )}
      {(data.declarationDocument || data.parentDeclarationDocument) && !isCompleted && (
        <div
          className="nf-notice"
          style={{
            background: topAccepted ? "#e4f4ed" : "#fff7ed",
            borderLeftColor: topAccepted ? "#16715b" : "#e7b858",
            color: topAccepted ? "#105944" : "#8a4b08",
            marginTop: "-.75rem",
          }}
        >
          {topAccepted
            ? "शर्तों की सहमति दर्ज कर ली गई है। अब आप 'Final Submit' बटन दबाकर आवेदन जमा कर सकते हैं।"
            : "घोषणा अभिलेख जमा करने के पश्चात कृपया 'Preview Application' खोलें और प्रीव्यू में नीचे दिए गए चेकबॉक्स 'मैंने समस्त शर्तें पढ़ ली हैं और मैं उनसे सहमत हूँ।' पर चिन्ह अवश्य लगाएँ। चेकबॉक्स चुनने के पश्चात ही 'Final Submit' बटन सक्रिय होगा।"}
        </div>
      )}
      <div className="nf-final">
        <h3>अंतिम प्रस्तुतीकरण (Final Submission)</h3>
        <div className="nf-final-actions">
          <button type="button" className="nf-secondary" onClick={onPreview}>
            Preview Application
          </button>
          {!isCompleted && (
            <button
              type="button"
              className="nf-primary"
              disabled={!canSubmit || isAgeIneligible}
              onClick={handleFinalSubmit}
            >
              {submitting ? "Submitting..." : "Final Submit"}
            </button>
          )}
          {isCompleted && (
            <button
              type="button"
              className={hasSubmittedQuery ? "nf-secondary" : "nf-primary"}
              onClick={handleQueryButton}
              disabled={queryLoading}
            >
              {queryLoading ? "Loading..." : hasSubmittedQuery ? "View Query" : "Raise Query"}
            </button>
          )}
        </div>
        <p className="nf-note">
          नोट: Final Submit के पश्चात आवेदन में कोई संशोधन नहीं किया जा सकेगा।
        </p>
      </div>
      <div className="nf-system">
        <p>
          <strong>Application Number:</strong>{" "}
          {applicantId || "System Generated"}
        </p>
        <p>
          <strong>Application Submission Date:</strong> {submissionDate}
        </p>
        <p>
          <strong>District:</strong> {district}
        </p>
      </div>
      <SendOTP
        show={otpModal === "send"}
        onClose={() => setOtpModal(null)}
        defaultMobile={otpMobile || nominatorPhoneNumber || data?.childMobile || userMobile}
        onSuccess={handleSendOtpSuccess}
      />
      <VerifyOTP
        show={otpModal === "verify"}
        onClose={() => setOtpModal(null)}
        mobile={otpMobile || nominatorPhoneNumber || data?.childMobile || userMobile}
        onSuccess={handleOtpSuccess}
      />
      <RaiseQueryModal
        open={showQueryModal}
        mode={queryMode}
        onClose={() => setShowQueryModal(false)}
        applicantId={applicantId}
        mobileNumber={nominatorPhoneNumber || applicantMobile}
        existingQuery={queryData}
        onSubmitted={handleQuerySubmitted}
      />
    </section>
  );
};

export default StepF;