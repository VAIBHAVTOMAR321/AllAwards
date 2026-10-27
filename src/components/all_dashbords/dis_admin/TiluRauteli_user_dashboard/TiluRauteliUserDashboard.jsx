import React, { useEffect, useMemo, useState } from "react";
import TiluRauteliLeftNav from "./TiluRauteliLeftNav";
import TiluRauteliTopNav from "./TiluRauteliTopNav";
import { cookieFetch, useAuth } from "../../../login/AuthContext";
import "./TiluRauteliUserDashboard.css";

const TELU_API_BASE =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/telu-roteli-2026";
const TELU_MEDIA_BASE =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend";

const WORK_AREA_OPTIONS = [
  "कठिन परिस्थितियों में जीवन-यापन करने वाली महिलाओं एवं बच्चों को सहारा तथा पुनर्वास देने व मुख्यधारा से जोड़ने का कार्य जैसे-निराश्रित, विधवायें, वृद्ध, विकलांग, दुराचार एसिड अटैक से प्रभावित एवं कलह की शिकार महिलाओं / किशोरियों तथा स्ट्रीट चिल्ड्रन, भिक्षावृत्ति में लगे बच्चों आदि को सहारा तथा पुनर्वास देने व मुख्यधारा से जोड़ने सम्बन्धी कार्य।",
  "शिक्षा, सेवा अथवा प्रशिक्षण के क्षेत्र में श्रेष्ठता हासिल की हो, अभिनव प्रयोग किए हो।",
  "महिला स्वयं सहायता समूहों को प्रोत्साहन एवं उनको बैंकों द्वारा आर्थिक सहायता दिलाने का कार्य किया हो। इस कार्य में कम से कम 05 वर्ष का अनुभव रखती हो तथा महिला स्वंय सहायता समूहों को आजीविका गतिविधियों से जोड़ते हुए सम्बन्धित समूहों का बैंक लिंकेज के कार्य में सक्रिय भूमिका निभायी हो तथा विगत 05 वर्षों में कितने लोगों को रोजगार से जोड़ा गया है।",
  "महिलाओं को कृषि, मध्यम, लघु एवं बड़े उद्यम, प्रौद्योगिकी प्रसार आदि क्षेत्रों में रोजगार से जोड़ने का कार्य किया हो।",
  "महिला सम्बन्धी मुद्दों पर जन-जागरूकता पैदा करने, सामाजिक परिवर्तन व समुदाय के भीतर महिला सशक्तिकरण के लिए सक्रिय कार्य किये हों।",
  "विधवा पुनर्विवाह, बाल-विवाह, अनैतिक व्यापार आदि रोकथाम के क्षेत्र में विशेष योगदान दिया हो।",
  "परम्परागत रूढ़िवादिता एवं सामाजिक असमानता को तोड़कर नये मानक स्थापित करने की दिशा में कार्य किया हो।",
  "ऐसी विधवा, बेसहारा अथवा विकलांग महिला/किशोरी जिसने परिवार के अभाव में अपने भाई बहनों को पढ़ा लिखा कर सफलता दिलाई हो।",
  "मीडिया/पत्रकारिता, प्रशासन, गैर सरकारी संगठन, साहित्य, समाज सेवा, उद्योग जगत, खेल, राजनीति, संगीत एवं नृत्य, नाटक, लोककला, सांस्कृतिक विरासत को बढ़ावा देना विभिन्न कला क्षेत्र जैसे चित्रकल/वास्तुकला, आभियांत्रिकी, चिकित्सा, स्वास्थ्य एवं पोषण जैसे क्षेत्रों में विपरीत परिस्थितियों में विशिष्टता हासिल की हो। अदम्य साहसिक, क्रिया-कलापों एवं पर्वतारोहण के क्षेत्र में विशिष्ट उपलब्धि।",
  "अदम्य साहस का परिचय देते हुये किसी की जान बचाने का कार्य किया हो जैसे- बाघ, भालू आदि से लड़कर बहादुरी का परिचय दिया हो।",
  "पर्वतारोहण के क्षेत्र में राष्ट्रीय एवं अन्र्तराष्ट्रीय स्तर पर विशिष्ट उपलब्धि हासिल की हो।",
  "पर्यावरण संरक्षण व जलवायु परिवर्तन को सकारात्मक करने की दिशा से कार्य किये हो",
  "ऐसी महिलायें जिनके द्वारा जानमाल, वनाग्नि एवं जंगली जानवर से लड़कर बहादुरी के क्षेत्र में विशिष्ट / उत्कृष्ट कार्य किया हो।",
  "ऐसी किशोरी/महिला/सामाजिक कार्यकर्त्री तथा महिला सामाजिक संगठनों/संस्था जिन्होंने महिला हिंसा/उत्पीड़न को रोके जाने हेतु कार्य किया हो।",
];

const BANK_OPTIONS = [
  "State Bank of India",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "UCO Bank",
  "Union Bank of India",
  "Bank of India",
  "Kotak Mahindra Bank",
  "Yes Bank",
  "IDBI Bank",
  "Syndicate Bank",
];

const DEFAULT_FORM = {
  form_id: "",
  filer_name: "",
  fath_husb_name: "",
  dob: "",
  filer_mob: "",
  filer_email: "",
  filer_adhar: "",
  edu_qual: "",
  district: "",
  project: "",
  village: "",
  address: "",
  manak1: "",
  manak2: "",
  manak3: "",
  appli_pan: "",
  appli_bank_ac_name: "",
  appli_bank_acc: "",
  appli_ifsc: "",
  appli_bank_name: "",
  appli_img: "",
  appli_sign: "",
  appli_pdf1: "",
  appli_pdf2: "",
  appli_pdf3: "",
  appli_url: "",
  appli_points: "",
  status: "",
  term1: [],
};

const IFSC_PATTERN = /^[A-Za-z]{4}0[A-Z0-9a-z]{6}$/;
const STEP_TWO_REQUIRED_FIELDS = [
  "fath_husb_name",
  "dob",
  "filer_email",
  "edu_qual",
  "village",
  "address",
  "manak1",
  "manak2",
  "manak3",
];
const STEP_THREE_REQUIRED_FIELDS = [
  "appli_pan",
  "appli_bank_ac_name",
  "appli_bank_acc",
  "appli_ifsc",
  "appli_bank_name",
];
const STEP_FOUR_REQUIRED_DOCUMENTS = [
  "appli_img",
  "appli_sign",
  "appli_pdf1",
  "appli_pdf2",
];
const APPLICATION_DOCUMENTS = [
  {
    field: "appli_img",
    title: "महिला / किशोरी की फोटो",
    accept: "image/*",
    kind: "image",
    note: "Upload size up to 10KB to 500KB",
  },
  {
    field: "appli_sign",
    title: "महिला / किशोरी के हस्ताक्षर",
    accept: "image/*",
    kind: "image",
    note: "Upload size up to 10KB to 500KB",
  },
  {
    field: "appli_pdf1",
    title:
      "महिला के जीवन का संक्षिप्त विवरण से संबंधित प्रमाण पत्र, अखबार की कतरनी आदि",
    accept: ".pdf",
    kind: "pdf",
    note: "Upload PDF size 10KB to 20MB",
  },
  {
    field: "appli_pdf2",
    title:
      "उत्कृष्ट कार्यों से संबंधित राष्ट्रीय / अंतर्राष्ट्रीय सम्मान, पुरस्कार, प्रमाण पत्र आदि",
    accept: ".pdf",
    kind: "pdf",
    note: "Upload PDF size 10KB to 20MB",
  },
];
const parseWorkAreaPoints = (points) => {
  const savedPoints = new Set(
    (Array.isArray(points) ? points : String(points || "").split("*"))
      .map((point) => String(point).trim())
      .filter(Boolean),
  );
  return WORK_AREA_OPTIONS.filter((option) => savedPoints.has(option));
};

const isStepComplete = (form, stepNumber) => {
  if (stepNumber === 1) return form.term1.length > 0;
  if (stepNumber === 2) {
    return STEP_TWO_REQUIRED_FIELDS.every((key) =>
      String(form[key] || "").trim(),
    );
  }
  if (stepNumber === 3) {
    return (
      STEP_THREE_REQUIRED_FIELDS.every((key) =>
        String(form[key] || "").trim(),
      ) && IFSC_PATTERN.test(String(form.appli_ifsc || "").trim())
    );
  }
  if (stepNumber === 4) {
    return STEP_FOUR_REQUIRED_DOCUMENTS.every((key) => Boolean(form[key]));
  }
  return false;
};

const getFirstIncompleteStep = (form) =>
  [1, 2, 3, 4].find((stepNumber) => !isStepComplete(form, stepNumber)) || 4;

const getApiErrorMessage = (data, fallback) => {
  const detail = data?.detail || data?.message || data?.error;
  if (typeof detail === "string") return detail;
  if (detail) return JSON.stringify(detail);
  if (data && typeof data === "object" && Object.keys(data).length > 0) {
    return JSON.stringify(data);
  }
  return fallback;
};

const readApiResponse = async (response) => {
  const body = await response.text();
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return { raw: body };
  }
};

const redactSensitiveFields = (data) => ({
  ...data,
  filer_adhar: data.filer_adhar ? "[redacted]" : data.filer_adhar,
  appli_pan: data.appli_pan ? "[redacted]" : data.appli_pan,
  appli_bank_acc: data.appli_bank_acc ? "[redacted]" : data.appli_bank_acc,
});

const readOnlyUser = (account) => ({
  filer_name: account?.full_name || account?.username || "",
  filer_mob: account?.phone || "",
  filer_adhar: account?.adhar_no || account?.filer_adhar || "",
  district: account?.district || "",
  project: account?.project || "",
});

const pickFields = (source, keys) =>
  keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      acc[key] = source[key];
    }
    return acc;
  }, {});

const parseApiRecord = (record = {}) => {
  const term1 = parseWorkAreaPoints(record.appli_points);

  return {
    ...DEFAULT_FORM,
    ...record,
    term1,
    filer_name: record.filer_name || "",
    fath_husb_name: record.fath_husb_name || "",
    dob: record.dob || "",
    filer_mob: record.filer_mob || "",
    filer_email: record.filer_email || "",
    filer_adhar: record.filer_adhar || "",
    edu_qual: record.edu_qual || "",
    district: record.district || "",
    project: record.project || "",
    village: record.village || "",
    address: record.address || "",
    manak1: record.manak1 || "",
    manak2: record.manak2 || "",
    manak3: record.manak3 || "",
    appli_pan: record.appli_pan || "",
    appli_bank_ac_name: record.appli_bank_ac_name || "",
    appli_bank_acc: record.appli_bank_acc || "",
    appli_ifsc: record.appli_ifsc || "",
    appli_bank_name: record.appli_bank_name || "",
    appli_img: record.appli_img || "",
    appli_sign: record.appli_sign || "",
    appli_pdf1: record.appli_pdf1 || "",
    appli_pdf2: record.appli_pdf2 || "",
    appli_pdf3: record.appli_pdf3 || "",
    appli_url: record.appli_url || "",
    appli_points: record.appli_points || term1.join("*"),
    status: record.status || "",
  };
};

const getPreviewUrl = (file) => {
  if (!file) return "";
  if (typeof file === "string") {
    if (/^https?:\/\//i.test(file)) return file;
    const mediaPath = file.startsWith("/") ? file : `/${file}`;
    return mediaPath.startsWith("/media/")
      ? `${TELU_MEDIA_BASE}${mediaPath}`
      : file;
  }
  if (file instanceof File) return URL.createObjectURL(file);
  return "";
};

const TiluRauteliUserDashboard = () => {
  const { user } = useAuth();
  const account = user?.user || user || {};
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [currentStep, setCurrentStep] = useState(1);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(true);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [showApplicationPreview, setShowApplicationPreview] = useState(false);
  const hasAllRequiredDocuments = STEP_FOUR_REQUIRED_DOCUMENTS.every((field) =>
    Boolean(formData[field]),
  );
  const isApplicationLocked = applicationSubmitted;
  const [documentPreviews, setDocumentPreviews] = useState({
    appli_img: "",
    appli_sign: "",
    appli_pdf1: "",
    appli_pdf2: "",
  });
  const selectedWorkAreas = formData.term1;

  const progressSteps = useMemo(
    () => [
      "विशिष्ट कार्य क्षेत्रों का विवरण",
      "व्यक्तिगत जानकारी",
      "बैंक खाते की जानकारी",
      "Document Upload",
    ],
    [],
  );

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

  useEffect(() => {
    const readOnlyInfo = readOnlyUser(account);
    setFormData((prev) => ({
      ...prev,
      ...readOnlyInfo,
      filer_name: readOnlyInfo.filer_name || prev.filer_name,
      filer_mob: readOnlyInfo.filer_mob || prev.filer_mob,
      filer_adhar: readOnlyInfo.filer_adhar || prev.filer_adhar,
      district: readOnlyInfo.district || prev.district,
      project: readOnlyInfo.project || prev.project,
    }));
  }, [account]);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await cookieFetch(`${TELU_API_BASE}/`, {
          method: "GET",
        });
        const payload = await readApiResponse(response);
        if (!response.ok || payload.success === false) {
          const reason = getApiErrorMessage(
            payload,
            `आवेदन लोड नहीं हो सका (HTTP ${response.status})।`,
          );
          console.error("[Tilu API] GET application failed", {
            url: `${TELU_API_BASE}/`,
            status: response.status,
            statusText: response.statusText,
            response: {
              success: payload.success,
              detail: payload.detail,
              message: payload.message,
              errors: payload.errors,
            },
          });
          throw new Error(
            response.status === 401
              ? "सत्र अधिकृत नहीं है। कृपया लॉगआउट करके दोबारा लॉगिन करें।"
              : reason,
          );
        }
        const record = payload?.data || payload?.result || payload || {};
        const normalized = parseApiRecord(record);
        setFormData((prev) => ({
          ...prev,
          ...normalized,
          filer_name: normalized.filer_name || prev.filer_name,
          filer_mob: normalized.filer_mob || prev.filer_mob,
          filer_adhar: normalized.filer_adhar || prev.filer_adhar,
          district: normalized.district || prev.district,
          project: normalized.project || prev.project,
        }));
        setCurrentStep(getFirstIncompleteStep(normalized));
        setApplicationSubmitted(
          String(normalized.status || "").trim().toLowerCase() === "final",
        );
      } catch (error) {
        console.error("Tilu application load failed:", error);
        setStatusMessage({
          type: "error",
          text: error.message || "आवेदन लोड नहीं हो सका।",
        });
      } finally {
        setLoadingRecord(false);
      }
    };

    fetchApplication();
  }, []);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleWorkArea = (value) => {
    setFormData((prev) => {
      const current = prev.term1 || [];
      const hasValue = current.includes(value);
      const next = hasValue
        ? current.filter((item) => item !== value)
        : [...current, value];
      return {
        ...prev,
        term1: next,
        appli_points: next.join("*"),
      };
    });
  };

  const updateDocumentPreview = (field, value) => {
    if (!value) {
      setDocumentPreviews((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    setDocumentPreviews((prev) => ({
      ...prev,
      [field]: getPreviewUrl(value),
    }));
  };

  const validateStep = (stepNumber) => {
    if (stepNumber === 1) {
      if (selectedWorkAreas.length === 0) {
        setStatusMessage({
          type: "error",
          text: "कृपया कम से कम एक विशिष्ट कार्य क्षेत्र चुनें।",
        });
        return false;
      }
      return true;
    }

    if (stepNumber === 2) {
      const missing = STEP_TWO_REQUIRED_FIELDS.find(
        (key) => !String(formData[key] || "").trim(),
      );
      if (missing) {
        setStatusMessage({
          type: "error",
          text: "कृपया सभी आवश्यक व्यक्तिगत जानकारी भरें।",
        });
        return false;
      }
      return true;
    }

    if (stepNumber === 3) {
      const missing = STEP_THREE_REQUIRED_FIELDS.find(
        (key) => !String(formData[key] || "").trim(),
      );
      if (missing) {
        setStatusMessage({
          type: "error",
          text: "कृपया बैंक खाता जानकारी सही रूप में भरें।",
        });
        return false;
      }
      if (!IFSC_PATTERN.test(String(formData.appli_ifsc || "").trim())) {
        setStatusMessage({
          type: "error",
          text: "IFSC कोड सही प्रारूप में दर्ज करें (उदाहरण: SBIN0001234)।",
        });
        return false;
      }
      return true;
    }

    if (stepNumber === 4) {
      const missing = STEP_FOUR_REQUIRED_DOCUMENTS.find(
        (key) => !formData[key],
      );
      if (missing) {
        setStatusMessage({
          type: "error",
          text: "कृपया सभी दस्तावेज़ अपलोड करें।",
        });
        return false;
      }
      return true;
    }

    return true;
  };

  const submitStep = async (stepNumber) => {
    const selectedPoints =
      selectedWorkAreas.join("*") || formData.appli_points;
    const payload = stepNumber === 4
      ? { appli_url: formData.appli_url || "" }
      : stepNumber === 1
      ? { appli_points: selectedPoints }
      : {
          ...pickFields(formData, [
            "fath_husb_name",
            "dob",
            "filer_adhar",
            "edu_qual",
            "project",
            "village",
            "address",
            "manak1",
            "manak2",
            "manak3",
            "appli_pan",
            "appli_bank_ac_name",
            "appli_bank_acc",
            "appli_ifsc",
            "appli_bank_name",
            "appli_url",
          ]),
          appli_points: selectedPoints,
        };

    const requestBody = JSON.stringify(payload);
    const headers = { "Content-Type": "application/json" };

    const response = await cookieFetch(`${TELU_API_BASE}/`, {
      method: "PUT",
      headers,
      body: requestBody,
    });
    const data = await readApiResponse(response);
    if (!response.ok || data.success === false) {
      console.error("[Tilu API] PUT application failed", {
        url: `${TELU_API_BASE}/`,
        status: response.status,
        statusText: response.statusText,
        request: redactSensitiveFields(payload),
        response: data,
      });
      throw new Error(
        response.status === 401
          ? "सत्र अधिकृत नहीं है। कृपया लॉगआउट करके दोबारा लॉगिन करें।"
          : getApiErrorMessage(
              data,
              `फॉर्म सेव नहीं हो पाया (HTTP ${response.status})।`,
            ),
      );
    }

    if (stepNumber === 1 && data.data?.appli_points) {
      const savedWorkAreas = parseWorkAreaPoints(data.data.appli_points);
      setFormData((prev) => ({
        ...prev,
        appli_points: data.data.appli_points,
        term1: savedWorkAreas.length ? savedWorkAreas : prev.term1,
      }));
    } else if (data.data && stepNumber !== 1) {
      setFormData((prev) => ({ ...prev, ...parseApiRecord(data.data) }));
    }
    return data;
  };

  const handleNext = async () => {
    if (currentStep === 4) return;
    if (!validateStep(currentStep)) return;
    setIsSaving(true);
    try {
      await submitStep(currentStep);
      setStatusMessage({
        type: "success",
        text: "डेटा सफलतापूर्वक सेव हो गया है।",
      });
      setCurrentStep((step) => step + 1);
    } catch (error) {
      setStatusMessage({ type: "error", text: error.message || "कुछ गलत हुआ।" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalSubmit = async () => {
    for (const stepNumber of [1, 2, 3, 4]) {
      if (!validateStep(stepNumber)) {
        setCurrentStep(stepNumber);
        return;
      }
    }

    setIsSaving(true);
    try {
      const finalPayload = {
        ...pickFields(formData, [
          "fath_husb_name",
          "dob",
          "filer_adhar",
          "edu_qual",
          "project",
          "village",
          "address",
          "manak1",
          "manak2",
          "manak3",
          "appli_pan",
          "appli_bank_ac_name",
          "appli_bank_acc",
          "appli_ifsc",
          "appli_bank_name",
          "appli_url",
        ]),
        appli_points: selectedWorkAreas.join("*") || formData.appli_points,
        status: "final",
      };
      const response = await cookieFetch(`${TELU_API_BASE}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });
      const payload = await readApiResponse(response);
      if (!response.ok || payload.success === false) {
        console.error("[Tilu API] Final application PUT failed", {
          url: `${TELU_API_BASE}/`,
          status: response.status,
          statusText: response.statusText,
          request: redactSensitiveFields(finalPayload),
          response: payload,
        });
        throw new Error(
          response.status === 401
            ? "सत्र अधिकृत नहीं है। कृपया लॉगआउट करके दोबारा लॉगिन करें।"
            : getApiErrorMessage(
                payload,
                `आवेदन सबमिट नहीं हो सका (HTTP ${response.status})।`,
              ),
        );
      }
      setFormData((prev) => ({
        ...prev,
        status: "final",
      }));
      setApplicationSubmitted(true);
      setShowApplicationPreview(true);
      setStatusMessage({
        type: "success",
        text: "आवेदन सफलतापूर्वक अंतिम रूप से सबमिट हो गया है।",
      });
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: error.message || "आवेदन सबमिट नहीं हो सका।",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
    setStatusMessage({ type: "", text: "" });
  };

  const handlePrintPreview = () => {
    const preview = document.querySelector(".tilu-preview-overlay");
    if (!preview) {
      window.alert("आवेदन का पूर्वावलोकन उपलब्ध नहीं है।");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) {
      window.alert(
        "प्रिंट विंडो ब्लॉक हो गई है। कृपया इस साइट के लिए पॉप-अप की अनुमति दें और दोबारा प्रयास करें।",
      );
      return;
    }

    const stylesheets = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    )
      .map((stylesheet) => `<link rel="stylesheet" href="${stylesheet.href}">`)
      .join("");
    const inlineStyles = Array.from(document.querySelectorAll("style"))
      .map((style) => `<style>${style.textContent}</style>`)
      .join("");

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
      <html lang="hi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>आवेदन का पूर्वावलोकन</title>
          ${stylesheets}
          ${inlineStyles}
          <style>
            @page { size: A4; margin: 12mm; }
            html, body { margin: 0; padding: 0; background: #fff; }
            body * { visibility: visible !important; }
            .tilu-preview-overlay {
              position: static !important;
              display: block !important;
              padding: 0 !important;
              background: #fff !important;
            }
            .tilu-preview-modal {
              width: 100% !important;
              max-height: none !important;
              display: block !important;
              overflow: visible !important;
              border-radius: 0 !important;
              box-shadow: none !important;
            }
            .tilu-preview-content { overflow: visible !important; }
            .tilu-preview-actions { display: none !important; }
            .tilu-preview-section {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .tilu-preview-section ol,
            .tilu-preview-section li {
              text-align: left !important;
            }
            .tilu-print-window-toolbar {
              position: sticky;
              top: 0;
              z-index: 1;
              padding: 10px 16px;
              background: #0b3d5c;
              text-align: right;
            }
            .tilu-print-window-toolbar button {
              border: 0;
              border-radius: 6px;
              padding: 9px 14px;
              background: #fff;
              color: #0b3d5c;
              font: 600 14px Arial, sans-serif;
              cursor: pointer;
            }
            @media print {
              .tilu-print-window-toolbar { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="tilu-print-window-toolbar">
            <button type="button" onclick="window.print()">Print / Save as PDF</button>
          </div>
          ${preview.outerHTML}
        </body>
      </html>`);
    printWindow.document.close();
  };

  const handleStepNavigation = (stepNumber) => {
    setCurrentStep(stepNumber);
    setStatusMessage({ type: "", text: "" });
  };

  const handleDocumentUpload = async (field, file) => {
    if (!file) return;
    const allowedTypes = {
      appli_img: ["image/jpeg", "image/png", "image/jpg"],
      appli_sign: ["image/jpeg", "image/png", "image/jpg"],
      appli_pdf1: ["application/pdf"],
      appli_pdf2: ["application/pdf"],
    };
    const limit = {
      appli_img: 500 * 1024,
      appli_sign: 500 * 1024,
      appli_pdf1: 20 * 1024 * 1024,
      appli_pdf2: 20 * 1024 * 1024,
    };

    if (!allowedTypes[field].includes(file.type)) {
      setStatusMessage({
        type: "error",
        text: field.includes("pdf")
          ? "केवल PDF फाइल अपलोड करें।"
          : "केवल फोटो/इमेज फाइल अपलोड करें।",
      });
      return;
    }

    if (file.size < 10 * 1024 || file.size > limit[field]) {
      setStatusMessage({
        type: "error",
        text: field.includes("pdf")
          ? "PDF का आकार 10KB से 20MB के बीच होना चाहिए।"
          : "फोटो का आकार 10KB से 500KB के बीच होना चाहिए।",
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append(field, file);

    setIsSaving(true);
    try {
      const response = await cookieFetch(`${TELU_API_BASE}/`, {
        method: "PUT",
        body: formDataToSend,
      });
      const payload = await readApiResponse(response);
      if (!response.ok || payload.success === false) {
        console.error("[Tilu API] Document upload failed", {
          url: `${TELU_API_BASE}/`,
          status: response.status,
          statusText: response.statusText,
          field,
          fileSize: file.size,
          response: payload,
        });
        throw new Error(
          response.status === 401
            ? "सत्र अधिकृत नहीं है। कृपया लॉगआउट करके दोबारा लॉगिन करें।"
            : getApiErrorMessage(
                payload,
                `डॉक्यूमेंट अपलोड नहीं हो पाया (HTTP ${response.status})।`,
              ),
        );
      }
      setField(field, payload?.data?.[field] || file.name);
      updateDocumentPreview(field, file);
      const allDocumentsUploaded = STEP_FOUR_REQUIRED_DOCUMENTS.every(
        (requiredField) =>
          requiredField === field || Boolean(formData[requiredField]),
      );
      if (allDocumentsUploaded) {
        setStatusMessage({
          type: "success",
          text: "सभी दस्तावेज़ अपलोड हो गए हैं। अंतिम सबमिट करने से पहले आप आवेदन में बदलाव कर सकते हैं।",
        });
      } else {
        setStatusMessage({
          type: "success",
          text: "दस्तावेज़ सफलतापूर्वक अपलोड किया गया है।",
        });
      }
    } catch (error) {
      setStatusMessage({ type: "error", text: error.message || "डॉक्यूमेंट अपलोड विफल रहा।" });
    } finally {
      setIsSaving(false);
    }
  };

  const removeDocument = (field) => {
    setField(field, "");
    setDocumentPreviews((prev) => ({ ...prev, [field]: "" }));
    setStatusMessage({ type: "success", text: "दस्तावेज़ हटा दिया गया है।" });
  };

  const renderStepOne = () => (
    <div className="tilu-form-grid single-column">
      <div className="tilu-selection-panel">
        <h3>विशिष्ट कार्य क्षेत्र चुनें</h3>
        <div className="tilu-checkbox-list">
          {WORK_AREA_OPTIONS.map((option, index) => {
            const checked = selectedWorkAreas.includes(option);
            return (
              <div className="tilu-checkbox-item" key={`${option}-${index}`}>
                <input
                  type="checkbox"
                  id={`work-area-${index}`}
                  checked={checked}
                  onChange={() => toggleWorkArea(option)}
                />
                <label htmlFor={`work-area-${index}`}>
                  {`${index + 1}. ${option}`}
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <div className="tilu-step-note">
        <span aria-hidden="true">✓</span>
        यह पुरस्कार उन महिला एवं किशोरियों के अतिरिक्त सामाजिक कार्यकर्त्री/महिला सामाजिक संगठनों/संस्था को दिया जाएगा जिन्होंने निम्न निर्दिष्ट क्षेत्रों में कोई विशिष्ट कार्य किया हो।
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="tilu-form-grid">
      <div className="tilu-grid-half">
        <label className="tilu-field-label">आवेदक का नाम कु0/श्रीमती <span className="req">*</span></label>
        <input
          type="text"
          className="tilu-input readonly"
          value={formData.filer_name}
          readOnly
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">पिता/पति का नाम <span className="req">*</span></label>
        <input
          type="text"
          className="tilu-input"
          value={formData.fath_husb_name}
          onChange={(event) => setField("fath_husb_name", event.target.value)}
          placeholder="पिता/पति का नाम"
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">जन्म तिथि <span className="req">*</span></label>
        <input
          type="date"
          className="tilu-input"
          value={formData.dob}
          onChange={(event) => setField("dob", event.target.value)}
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">मोबाइल नंबर</label>
        <input
          type="text"
          className="tilu-input readonly"
          value={formData.filer_mob}
          readOnly
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">Email ID <span className="req">*</span></label>
        <input
          type="email"
          className="tilu-input"
          value={formData.filer_email}
          onChange={(event) => setField("filer_email", event.target.value)}
          placeholder="अपना ईमेल आई.डी लिखें"
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">आधार नंबर</label>
        <input
          type="text"
          className="tilu-input readonly"
          value={formData.filer_adhar}
          readOnly
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">Educational Qualification/शैक्षिक योग्यता <span className="req">*</span></label>
        <select
          className="tilu-select"
          value={formData.edu_qual}
          onChange={(event) => setField("edu_qual", event.target.value)}
        >
          <option value="">Choose from Below/विकल्पों में से चुनें</option>
          <option value="8th/आठवीं">8th/आठवीं</option>
          <option value="10th/दसवीं">10th/दसवीं</option>
          <option value="12th/बारवी">12th/बारवी</option>
          <option value="Diploma/डिप्लोमा">Diploma/डिप्लोमा</option>
          <option value="Graduation/स्नातक">Graduation/स्नातक</option>
          <option value="Post-Graduation/स्नातकोत्तर">Post-Graduation/स्नातकोत्तर</option>
          <option value="P.H.D/पी.एच.डी">P.H.D/पी.एच.डी</option>
        </select>
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">District</label>
        <input
          type="text"
          className="tilu-input readonly"
          value={formData.district}
          readOnly
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">Project</label>
        <input
          type="text"
          className="tilu-input readonly"
          value={formData.project}
          readOnly
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">गांव/क्षेत्र का नाम <span className="req">*</span></label>
        <input
          type="text"
          className="tilu-input"
          value={formData.village}
          onChange={(event) => setField("village", event.target.value)}
          placeholder="अपना गांव/क्षेत्र का नाम लिखें"
        />
      </div>
      <div className="tilu-grid-half tilu-compact">
        <label className="tilu-field-label">पता <span className="req">*</span></label>
        <textarea
          className="tilu-textarea"
          value={formData.address}
          onChange={(event) => setField("address", event.target.value)}
          placeholder="अपना पता लिखें"
        />
      </div>
      <div className="tilu-achievement-areas">
        <label className="tilu-field-label">उपलब्धि के क्षेत्र</label>
        <div className="tilu-selection-panel">
          {selectedWorkAreas.length > 0 ? (
            <ul className="tilu-achievement-list">
              {selectedWorkAreas.map((item, index) => (
                <li key={`${item}-${index}`}>
                  <span aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="tilu-empty-achievements">कोई क्षेत्र चुना नहीं गया है।</p>
          )}
        </div>
      </div>
      <div className="tilu-grid-half tilu-compact">
        <label className="tilu-field-label">महिला की उपलब्धि किस प्रकार उत्कृष्ट आंकी गयी है - से सम्बंधित विवरण लिखें <span className="req">*</span></label>
        <textarea
          className="tilu-textarea"
          value={formData.manak1}
          onChange={(event) => setField("manak1", event.target.value)}
          placeholder="विवरण लिखें"
        />
      </div>
      <div className="tilu-grid-half tilu-compact">
        <label className="tilu-field-label">उत्कृष्ट कार्यो से सम्बंधित राष्ट्रीय /अंतर्राष्ट्रीय सम्मान, पुरुस्कार आदि से सम्बंधित विवरण लिखें <span className="req">*</span></label>
        <textarea
          className="tilu-textarea"
          value={formData.manak2}
          onChange={(event) => setField("manak2", event.target.value)}
          placeholder="विवरण लिखें"
        />
      </div>
      <div className="tilu-grid-half tilu-compact">
        <label className="tilu-field-label">महिला के जीवन का संक्षिप्त विवरण लिखें <span className="req">*</span></label>
        <textarea
          className="tilu-textarea"
          value={formData.manak3}
          onChange={(event) => setField("manak3", event.target.value)}
          placeholder="विवरण लिखें"
        />
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="tilu-form-grid">
      <div className="tilu-grid-half">
        <label className="tilu-field-label">आवेदक का नाम कु0/श्रीमती</label>
        <input
          type="text"
          className="tilu-input readonly"
          value={formData.filer_name}
          readOnly
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">Pancard no./पैन कार्ड न० <span className="req">*</span></label>
        <input
          type="text"
          className="tilu-input"
          value={formData.appli_pan}
          onChange={(event) => setField("appli_pan", event.target.value)}
          placeholder="Applicant Pan card Name"
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">Bank Account Holder Name/बैंक खाता के धारक का नाम <span className="req">*</span></label>
        <input
          type="text"
          className="tilu-input"
          value={formData.appli_bank_ac_name}
          onChange={(event) => setField("appli_bank_ac_name", event.target.value)}
          placeholder="Applicant Bank Account Holder Name"
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">Bank Account No./बैंक खाता नम्बर <span className="req">*</span></label>
        <input
          type="text"
          className="tilu-input"
          value={formData.appli_bank_acc}
          onChange={(event) => setField("appli_bank_acc", event.target.value)}
          placeholder="Applicant Bank Account No."
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">IFSC Code/IFSC कोड <span className="req">*</span></label>
        <input
          type="text"
          className="tilu-input"
          value={formData.appli_ifsc}
          onChange={(event) => setField("appli_ifsc", event.target.value.toUpperCase())}
          placeholder="Applicant IFSC Code"
        />
      </div>
      <div className="tilu-grid-half">
        <label className="tilu-field-label">Bank Name/बैंक का नाम <span className="req">*</span></label>
        <select
          className="tilu-select"
          value={formData.appli_bank_name}
          onChange={(event) => setField("appli_bank_name", event.target.value)}
        >
          <option value="">Choose Bank Name/बैंक का नाम</option>
          {BANK_OPTIONS.map((bank) => (
            <option key={bank} value={bank}>{bank}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStepFour = () => (
    <>
      <div className="tilu-doc-grid">
        {APPLICATION_DOCUMENTS.map((doc) => {
          const hasFile = Boolean(formData[doc.field]);
          const previewUrl =
            documentPreviews[doc.field] || getPreviewUrl(formData[doc.field]);
          return (
            <div className="tilu-doc-card" key={doc.field}>
              <div className="tilu-doc-top">
                <div className="tilu-doc-title">{doc.title}</div>
                <span className={`tilu-doc-state ${hasFile ? "" : "pending"}`}>
                  {hasFile ? "अपलोडेड" : "लंबित"}
                </span>
              </div>

              <div className="tilu-doc-preview">
                {hasFile ? (
                  doc.kind === "image" ? (
                    <img src={previewUrl} alt={doc.title} />
                  ) : (
                    <embed src={previewUrl} type="application/pdf" title={doc.title} />
                  )
                ) : (
                  <div className="tilu-file-placeholder">
                    <span aria-hidden="true">📎</span>
                    <span>कोई फाइल नहीं अपलोड की गई</span>
                  </div>
                )}
              </div>

              {hasFile && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tilu-btn secondary"
                >
                  View document
                </a>
              )}

              <div className="tilu-upload-box">
                {!isApplicationLocked && (
                  <>
                    <input
                      type="file"
                      accept={doc.accept}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          handleDocumentUpload(doc.field, file);
                        }
                      }}
                    />
                    <div className="tilu-upload-meta">{doc.note}</div>
                    {hasFile && (
                      <button
                        type="button"
                        className="tilu-btn danger"
                        onClick={() => removeDocument(doc.field)}
                      >
                        Remove Document
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="tilu-form-grid tilu-social-link">
        <div className="tilu-grid-half">
          <label className="tilu-field-label" htmlFor="tilu-application-url">
            Social media activity link (वैकल्पिक)
          </label>
          <input
            id="tilu-application-url"
            type="url"
            className="tilu-input"
            value={formData.appli_url}
            onChange={(event) => setField("appli_url", event.target.value)}
            placeholder="https://"
          />
        </div>
      </div>
    </>
  );

  const stepContent = {
    1: renderStepOne,
    2: renderStepTwo,
    3: renderStepThree,
    4: renderStepFour,
  };

  const currentTitle = {
    1: "Step 1: विशिष्ट कार्य क्षेत्रों का विवरण",
    2: "Step 2: व्यक्तिगत जानकारी",
    3: "Step 3: बैंक खाते की जानकारी",
    4: "Step 4: Document Upload",
  }[currentStep];

  return (
    <div className="tilu-dashboard-shell">
      <TiluRauteliLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <TiluRauteliTopNav
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen((open) => !open)}
        />

        <div className="tilu-dashboard-inner">
          <header className="tilu-hero">
            <div className="tilu-hero-top">
              <span className="tilu-badge">राज्य स्त्री शक्ति सम्मान</span>
            </div>
            <h1>तीलू रौतेली पुरस्कार वर्ष 2025-26</h1>
            <p>
              इनाम आवेदन फॉर्म को चरणबद्ध रूप में भरें और दस्तावेज़ सत्यापन के साथ अपने
              आवेदन को पूर्ण करें।
            </p>

            <div className="tilu-progress">
              {progressSteps.map((label, index) => {
                const stepNumber = index + 1;
                const completed = isStepComplete(formData, stepNumber);
                const stepState = currentStep === stepNumber
                  ? "active"
                  : completed
                    ? "completed"
                    : "pending";
                return (
                  <button
                    type="button"
                    key={label}
                    className={`tilu-progress-step ${stepState}`}
                    onClick={() => handleStepNavigation(stepNumber)}
                    disabled={loadingRecord || isSaving || isApplicationLocked}
                    aria-current={currentStep === stepNumber ? "step" : undefined}
                  >
                    <div className="tilu-progress-mark">
                      {completed ? "✓" : stepNumber}
                    </div>
                    <div className="tilu-progress-copy">
                      <span className="tilu-progress-kicker">Step {stepNumber}</span>
                      <strong>{label}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </header>

          <section className="tilu-form-card">
            <div className="tilu-step-header">
              <h2>{currentTitle}</h2>
              <span className="tilu-step-badge">{currentStep}/4</span>
            </div>

            {statusMessage.text && (
              <div className={`tilu-status-alert ${statusMessage.type}`}>
                {statusMessage.text}
              </div>
            )}

            {isApplicationLocked && (
              <button
                type="button"
                className="tilu-btn secondary"
                onClick={() => setShowApplicationPreview(true)}
                disabled={isSaving}
              >
                आवेदन का पूर्वावलोकन देखें
              </button>
            )}
            {hasAllRequiredDocuments && !isApplicationLocked && (
              <div className="tilu-final-submit">
                <p>
                  सभी आवश्यक दस्तावेज़ अपलोड हैं। अंतिम सबमिट करने से पहले आप किसी भी चरण में बदलाव कर सकते हैं।
                </p>
                <button
                  type="button"
                  className="tilu-btn success"
                  onClick={handleFinalSubmit}
                  disabled={isSaving || loadingRecord}
                >
                  {isSaving ? "सबमिट हो रहा है..." : "अंतिम रूप से सबमिट करें"}
                </button>
              </div>
            )}

            {loadingRecord ? (
              <div className="tilu-status-alert success">लोड हो रहा है...</div>
            ) : (
              <>
                <fieldset
                  className="tilu-form-fields"
                  disabled={isSaving || isApplicationLocked}
                >
                  {stepContent[currentStep]()}
                </fieldset>
                <div className="tilu-button-row">
                  <div className="tilu-actions">
                    <button
                      type="button"
                      className="tilu-btn secondary"
                      onClick={handleBack}
                      disabled={currentStep === 1 || isSaving || isApplicationLocked}
                    >
                      Back
                    </button>
                    {!isApplicationLocked &&
                      currentStep < 4 && (
                        <button
                          type="button"
                          className="tilu-btn primary"
                          onClick={handleNext}
                          disabled={isSaving}
                        >
                          {isSaving
                            ? "Loading..."
                            : "Save / Continue"}
                        </button>
                      )}
                  </div>
                </div>
              </>
            )}
          </section>
          {showApplicationPreview && (
            <div
              className="tilu-preview-overlay"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setShowApplicationPreview(false);
                }
              }}
            >
              <section
                className="tilu-preview-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="tilu-preview-title"
              >
                <header className="tilu-preview-header">
                  <h2 id="tilu-preview-title">आवेदन का पूर्वावलोकन</h2>
                  <div className="tilu-preview-actions">
                    <button
                      type="button"
                      className="tilu-btn primary tilu-preview-print"
                      onClick={handlePrintPreview}
                      title="आवेदन को प्रिंट करें या PDF के रूप में सहेजें"
                    >
                      PDF डाउनलोड / प्रिंट
                    </button>
                    <button
                      type="button"
                      className="tilu-preview-close"
                      onClick={() => setShowApplicationPreview(false)}
                      aria-label="पूर्वावलोकन बंद करें"
                    >
                      ×
                    </button>
                  </div>
                </header>
                <div className="tilu-preview-content">
                  <section className="tilu-preview-section">
                    <h3>विशिष्ट कार्य क्षेत्र</h3>
                    {selectedWorkAreas.length ? (
                      <ol>
                        {selectedWorkAreas.map((area) => (
                          <li key={area}>{area}</li>
                        ))}
                      </ol>
                    ) : (
                      <p>कोई कार्य क्षेत्र नहीं चुना गया।</p>
                    )}
                  </section>
                  <section className="tilu-preview-section">
                    <h3>व्यक्तिगत जानकारी</h3>
                    {[
                      ["आवेदक का नाम", formData.filer_name],
                      ["पिता/पति का नाम", formData.fath_husb_name],
                      ["जन्म तिथि", formData.dob],
                      ["मोबाइल नंबर", formData.filer_mob],
                      ["ईमेल", formData.filer_email],
                      ["आधार नंबर", formData.filer_adhar],
                      ["शैक्षिक योग्यता", formData.edu_qual],
                      ["जनपद", formData.district],
                      ["परियोजना", formData.project],
                      ["गांव/क्षेत्र", formData.village],
                      ["पता", formData.address],
                      ["उपलब्धि का विवरण", formData.manak1],
                      ["उत्कृष्टता का विवरण", formData.manak2],
                      ["अन्य विवरण", formData.manak3],
                    ].map(([label, value]) => (
                      <div className="tilu-preview-field" key={label}>
                        <strong>{label}</strong>
                        <span>{value || "—"}</span>
                      </div>
                    ))}
                  </section>
                  <section className="tilu-preview-section">
                    <h3>बैंक खाते की जानकारी</h3>
                    {[
                      ["पैन कार्ड नंबर", formData.appli_pan],
                      ["खाताधारक का नाम", formData.appli_bank_ac_name],
                      ["बैंक खाता संख्या", formData.appli_bank_acc],
                      ["IFSC कोड", formData.appli_ifsc],
                      ["बैंक का नाम", formData.appli_bank_name],
                    ].map(([label, value]) => (
                      <div className="tilu-preview-field" key={label}>
                        <strong>{label}</strong>
                        <span>{value || "—"}</span>
                      </div>
                    ))}
                    {formData.appli_url && (
                      <div className="tilu-preview-field">
                        <strong>Social media activity link</strong>
                        <a
                          href={formData.appli_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formData.appli_url}
                        </a>
                      </div>
                    )}
                  </section>
                  <section className="tilu-preview-section">
                    <h3>अपलोड किए गए दस्तावेज़</h3>
                    <div className="tilu-preview-documents">
                      {APPLICATION_DOCUMENTS.map((doc) => {
                        const previewUrl =
                          documentPreviews[doc.field] ||
                          getPreviewUrl(formData[doc.field]);
                        return (
                          <div className="tilu-preview-document" key={doc.field}>
                            <strong>{doc.title}</strong>
                            {previewUrl ? (
                              doc.kind === "image" ? (
                                <img src={previewUrl} alt={doc.title} />
                              ) : (
                                <embed
                                  src={previewUrl}
                                  type="application/pdf"
                                  title={doc.title}
                                />
                              )
                            ) : (
                              <p>दस्तावेज़ उपलब्ध नहीं है।</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TiluRauteliUserDashboard;
