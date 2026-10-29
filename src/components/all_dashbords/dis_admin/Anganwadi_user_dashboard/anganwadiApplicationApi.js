import { cookieFetch } from "../../../login/AuthContext";

const APPLICATION_API_BASE =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/ang-puruskar-2026";

const ANGANWADI_DROPDOWN_BASE =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/anganwadi-dropdown";

export const isAnganwadiApplicationDemoMode = true;

const FIXED_ASSESSMENT_TARGETS = {
  survey_tot: "300",
  pt_group_tot: "24",
  vhsnd_tot: "52",
  rbsk_tot: "2",
};

const normalizeMultiSelect = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const normalizeApplicationData = (data = {}) => ({
  ...data,
  ...FIXED_ASSESSMENT_TARGETS,
  saaf_ans: normalizeMultiSelect(data.saaf_ans),
});

export const fetchAnganwadiDropdown = async (district, project, sector) => {
  const params = new URLSearchParams();
  if (district) params.set("district", district);
  if (project) params.set("project", project);
  if (sector) params.set("sector", sector);
  const response = await cookieFetch(
    `${ANGANWADI_DROPDOWN_BASE}/?${params.toString()}`,
    { method: "GET" },
  );
  const body = await response.text();
  const trimmed = body.trim();
  if (!trimmed) return [];
  if (trimmed[0] !== "{" && trimmed[0] !== "[") {
    throw new Error(`आंगनवाड़ी सूची उत्तर पढ़ा नहीं जा सका (HTTP ${response.status})`);
  }
  try {
    const data = JSON.parse(trimmed);
    return Array.isArray(data) ? data : data.data || [];
  } catch {
    throw new Error(`आंगनवाड़ी सूची उत्तर पढ़ा नहीं जा सका (HTTP ${response.status})`);
  }
};

const resolveAwcName = async (awcCenter, district, project, sector) => {
  if (!awcCenter) return "";
  const list = await fetchAnganwadiDropdown(district, project, sector);
  const match = list.find(
    (item) => String(item.awc_code || "") === String(awcCenter),
  );
  return match ? match.awc_name || match.display_name || "" : "";
};

export const getAccountField = (account, ...fieldNames) => {
  const profiles = [account, account?.profile, account?.user, account?.data];
  for (const profile of profiles) {
    for (const fieldName of fieldNames) {
      const value = profile?.[fieldName];
      if (value !== undefined && value !== null && value !== "") return value;
    }
  }
  return "";
};

const createInitialApplication = (account = {}) => ({
  applicant_id: getAccountField(account, "unique_id"),
  status: "step0",
  filer_name: getAccountField(account, "name", "full_name", "username"),
  fath_husb_name: "",
  dob: "",
  age: "",
  filer_mob: getAccountField(account, "phone", "mobile_no"),
  filer_email: getAccountField(account, "email"),
  filer_adhar: getAccountField(
    account,
    "adhar_no",
    "aadhaar_no",
    "aadhar_no",
    "aadhaar_number",
    "aadhar_number",
    "filer_adhar",
  ),
  edu_qual: "",
  district: getAccountField(account, "district"),
  project: getAccountField(account, "project"),
  sector: getAccountField(account, "sector"),
  awc_center: getAccountField(account, "awc_center"),
  awc_name: "",
  joining_date: getAccountField(account, "joining_date"),
  village: "",
  address: "",
  city: "",
  pincode: "",
  acc_holder: "",
  acc_no: "",
  acc_ifsc: "",
  bank_name: "",
  pancard: "",
  pmmvy_tot: "",
  pmmvy_obt: "",
  cmmk_tot: "",
  cmmk_obt: "",
  nanda1_tot: "",
  nanda1_obt: "",
  nanda2_tot: "",
  nanda2_obt: "",
  pt_tot: "",
  pt_obt: "",
  survey_tot: "300",
  survey_obt: "",
  ann_tot: "",
  ann_obt: "",
  pt_group_tot: "24",
  pt_group_obt: "",
  pt_group_img: null,
  sandharbh_tot: "",
  sandharbh_obt: "",
  sandharbh_img: null,
  sam_tot: "",
  sam_obt: "",
  sam_detail: "",
  sam_img: null,
  vhsnd_tot: "52",
  vhsnd_obt: "",
  pt_ben_tot: "",
  pt_ben_obt: "",
  abhilekh_tot: "",
  abhilekh_obt: "",
  saaf_ans: [],
  krimi_tot: "",
  krimi_obt: "",
  poshan_week_tot: "",
  poshan_week_obt: "",
  sam_6mon_tot: "",
  sam_6mon_img: null,
  sam_6yr_tot: "",
  sam_6yr_img: null,
  mam_6mon_tot: "",
  mam_6mon_img: null,
  gambhir_tot: "",
  gambhir_detail: "",
  gambhir_img: null,
  rbsk_tot: "2",
  rbsk_obt: "",
  rbsk_surv_obt: "",
  other_work_detail: "",
  other_work_img: null,
  dept_work_detail: "",
  per_work_detail: "",
  ach_work: "",
  aharta1: "",
  aharta2: "",
  aharta3: "",
  aharta4: "",
  manak2: "",
  manak3a: "",
  manak3b: "",
  manak4: "",
  photo_img: "",
  signature: "",
  declarationAccepted: false,
});

const readApiResponse = async (response, fallback) => {
  const body = await response.text();
  const trimmed = body.trim();
  if (!trimmed) return {};
  if (trimmed[0] !== "{" && trimmed[0] !== "[") {
    throw new Error(`${fallback} (HTTP ${response.status})`);
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(`${fallback} (HTTP ${response.status})`);
  }
};

const formatApiError = (data, fallback) => {
  const detail = data.detail || data.message || data.error;
  if (typeof detail === "string") return detail;
  if (detail) return JSON.stringify(detail);
  const fieldErrors = Object.entries(data)
    .filter(([key]) => !["success", "status", "data"].includes(key))
    .map(([field, messages]) => {
      const message = Array.isArray(messages)
        ? messages.join(", ")
        : typeof messages === "string"
          ? messages
          : JSON.stringify(messages);
      return `${field}: ${message}`;
    });
  return fieldErrors.length ? fieldErrors.join(" | ") : fallback;
};

const requestApplication = async (step, method = "GET", body, contentType) => {
  const headers = {};
  if (contentType) headers["Content-Type"] = contentType;
  const response = await cookieFetch(
    `${APPLICATION_API_BASE}/step${step}/`,
    {
      method,
      headers,
      ...(body ? { body: contentType === "application/json" ? JSON.stringify(body) : body } : {}),
    },
  );
  const data = await readApiResponse(
    response,
    `चरण ${step} के आवेदन का उत्तर पढ़ा नहीं जा सका।`,
  );
  if (!response.ok || data.success === false) {
    throw new Error(
      `${formatApiError(
        data,
        `चरण ${step} का आवेदन सेव / लोड नहीं हो सका`,
      )} (HTTP ${response.status})`,
    );
  }
  return data;
};

const normalizeStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase().replaceAll("-", "");
  if (normalized === "step1") return "step1";
  if (normalized === "step2") return "step2";
  if (normalized === "step3") return "step3";
  if (normalized === "final" || normalized === "approved" || normalized === "final_submit") return "final";
  return "step0";
};

const hasValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const PATTERNS = {
  name: /^[A-Za-zÀ-ÖØ-öø-ÿ\s\.']{2,100}$/,
  mobile: /^[0-9]{10}$/,
  adhar: /^[0-9]{12}$/,
  pincode: /^[0-9]{6}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  pancard: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  email: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  age: /^(?:[1-9]?\d|100)$/,
  account: /^[0-9]{9,18}$/,
  numeric: /^\d+(\.\d+)?$/,
};

const fieldPattern = (field) => {
  switch (field) {
    case "filer_name":
    case "fath_husb_name":
    case "district":
    case "project":
    case "village":
    case "city":
    case "address":
    case "acc_holder":
    case "bank_name":
      return PATTERNS.name;
    case "awc_center":
    case "awc_name":
      return null;
    case "filer_mob":
      return PATTERNS.mobile;
    case "filer_adhar":
      return PATTERNS.adhar;
    case "pincode":
      return PATTERNS.pincode;
    case "acc_ifsc":
      return PATTERNS.ifsc;
    case "pancard":
      return PATTERNS.pancard;
    case "filer_email":
      return PATTERNS.email;
    case "dob":
    case "joining_date":
      return PATTERNS.date;
    case "age":
      return PATTERNS.age;
    case "acc_no":
      return PATTERNS.account;
    default:
      return null;
  }
};

const formatValidationErrors = (errors) =>
  errors.map(({ field, message }) => `${field}: ${message}`).join(" | ");

export const getStepOneFormatErrors = (application) => {
  const errors = [];
  const check = (field, label) => {
    const value = application?.[field];
    if (!hasValue(value)) return;
    const pattern = fieldPattern(field);
    if (pattern && !pattern.test(String(value).trim())) {
      errors.push({ field, message: label });
    }
  };
  check("filer_name", "नाम केवल अक्षर और स्थान में होना चाहिए।");
  check("fath_husb_name", "पिता/पति का नाम केवल अक्षर और स्थान में होना चाहिए।");
  check("dob", "जन्म तिथि YYYY-MM-DD प्रारूप में होनी चाहिए।");
  check("age", "आयु 1 से 100 के बीच होनी चाहिए।");
  check("filer_mob", "मोबाइल नंबर 10 अंकों का होना चाहिए।");
  check("filer_adhar", "आधार नंबर 12 अंकों का होना चाहिए।");
  check("edu_qual", "शैक्षिक योग्यता चुनें।");
  check("filer_email", "ईमेल आईडी केवल छोटे अक्षरों में होनी चाहिए।");
  check("district", "जनपद चुनें।");
  check("project", "परियोजना/ब्लॉक चुनें।");
  check("awc_center", "आंगनवाड़ी केंद्र का नाम केवल अक्षर और स्थान में होना चाहिए।");
  check("awc_name", "आंगनवाड़ी केंद्र का नाम केवल अक्षर और स्थान में होना चाहिए।");
  check("joining_date", "योगदान तिथि YYYY-MM-DD प्रारूप में होनी चाहिए।");
  check("village", "गांव/क्षेत्र का नाम केवल अक्षर और स्थान में होना चाहिए।");
  check("city", "शहर का नाम केवल अक्षर और स्थान में होना चाहिए।");
  check("address", "पता केवल अक्षर, संख्या और स्थान में होना चाहिए।");
  check("pincode", "पिन कोड 6 अंकों का होना चाहिए।");
  check("acc_holder", "खाताधारक का नाम केवल अक्षर और स्थान में होना चाहिए।");
  check("acc_no", "बैंक खाता संख्या 9 से 18 अंकों के बीच होनी चाहिए।");
  check("acc_ifsc", "IFSC कोड SBIN0001234 प्रारूप में होना चाहिए।");
  check("bank_name", "बैंक का नाम केवल अक्षर और स्थान में होना चाहिए।");
  check("pancard", "पैन कार्ड ABCDE1234F प्रारूप में होना चाहिए।");
  return formatValidationErrors(errors);
};

export const getStepTwoFormatErrors = (application) => {
  const errors = [];
  const checkNumeric = (field, label) => {
    const value = application?.[field];
    if (!hasValue(value)) return;
    if (!PATTERNS.numeric.test(String(value).trim())) {
      errors.push({ field, message: label });
    }
  };
  checkNumeric("pmmvy_tot", "पात्र लाभार्थी संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("pmmvy_obt", "आवेदन संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("cmmk_tot", "पात्र लाभार्थी संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("cmmk_obt", "लाभार्थी संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("nanda1_tot", "जन्मी बालिकाओं की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("nanda1_obt", "भरे गए आवेदनों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("nanda2_tot", "12वीं उत्तीर्ण लाभार्थियों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("nanda2_obt", "भरे गए आवेदनों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("pt_tot", "पंजीकृत बच्चों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("pt_obt", "औसत उपस्थिति केवल संख्या में होनी चाहिए।");
  checkNumeric("survey_obt", "गृह भ्रमण की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("ann_tot", "पात्र लाभार्थी संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("ann_obt", "अन्नप्राशन लाभार्थी संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("pt_group_obt", "समुदाय आधारित गतिविधियों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("sandharbh_obt", "संदर्भित महिलाओं की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("sam_tot", "पंजीकृत लाभार्थियों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("sam_obt", "कुपोषण मुक्त लाभार्थियों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("vhsnd_obt", "VHSND की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("pt_ben_tot", "पंजीकृत लाभार्थियों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("pt_ben_obt", "आधार नामांकित लाभार्थियों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("abhilekh_tot", "अभिलेखों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("abhilekh_obt", "भरे गए अभिलेखों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("krimi_tot", "बच्चों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("krimi_obt", "दवा खिलाए गए बच्चों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("poshan_week_tot", "रैलियों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("poshan_week_obt", "प्रतिभागियों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("sam_6mon_tot", "बच्चों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("sam_6yr_tot", "बच्चों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("mam_6mon_tot", "बच्चों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("gambhir_tot", "बच्चों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("gambhir_detail", "उपचारित लाभार्थियों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("rbsk_obt", "भ्रमणों की संख्या केवल संख्या में होनी चाहिए।");
  checkNumeric("rbsk_surv_obt", "स्वास्थ्य जांच किए गए बच्चों की संख्या केवल संख्या में होनी चाहिए।");
  return formatValidationErrors(errors);
};

export const getStepThreeFormatErrors = (application) => {
  const errors = [];
  const check = (field, label) => {
    const value = application?.[field];
    if (!hasValue(value)) return;
    const str = String(value).trim();
    if (str.startsWith("http://") || str.startsWith("https://")) return;
    if (/^[^\s]+\.(jpg|jpeg|png|pdf)$/i.test(str)) return;
    errors.push({ field, message: label });
  };
  check("aharta1", "प्रमाण-पत्र फाइल URL या पथ वैध होना चाहिए।");
  check("aharta2", "प्रमाण-पत्र फाइल URL या पथ वैध होना चाहिए।");
  check("aharta3", "प्रमाण-पत्र फाइल URL या पथ वैध होना चाहिए।");
  check("aharta4", "प्रमाण-पत्र फाइल URL या पथ वैध होना चाहिए।");
  check("photo_img", "फोटो फाइल URL या पथ वैध होना चाहिए।");
  check("signature", "हस्ताक्षर फाइल URL या पथ वैध होना चाहिए।");
  if (application.declarationAccepted !== true) {
    errors.push({ field: "declarationAccepted", message: "घोषणा स्वीकार करें।" });
  }
  return formatValidationErrors(errors);
};

const STEP_ONE_REQUIRED_FIELDS = [
  "filer_name",
  "fath_husb_name",
  "dob",
  "filer_mob",
  "filer_adhar",
  "edu_qual",
  "district",
  "project",
  "sector",
  "awc_center",
  "awc_name",
  "joining_date",
  "village",
  "address",
  "city",
  "pincode",
  "acc_holder",
  "acc_no",
  "acc_ifsc",
  "bank_name",
  "pancard",
];

export const getMissingAnganwadiStepOneFields = (application) =>
  STEP_ONE_REQUIRED_FIELDS.filter((field) => !hasValue(application?.[field]));

export const getAnganwadiApplication = async (account) => {
  const key = String(
    getAccountField(account, "unique_id", "phone", "mobile_no") || "user",
  );
  const initialApplication = createInitialApplication(account);
  let stepOneData = {};
  let stepOneStatus = "step0";
  try {
    const stepOneResponse = await requestApplication(1);
    stepOneData = stepOneResponse.data || {};
    stepOneStatus = normalizeStatus(stepOneResponse.status);
  } catch (stepOneError) {
    console.warn("Step 1 load failed, starting fresh:", stepOneError.message);
  }
  let application = {
    ...initialApplication,
    ...normalizeApplicationData(stepOneData),
    applicant_id: initialApplication.applicant_id,
    status: stepOneStatus,
  };

  const district = application.district || getAccountField(account, "district");
  const project = application.project || getAccountField(account, "project");
  const sector = getAccountField(account, "sector");
  if (application.awc_center && !application.awc_name) {
    try {
      application.awc_name = await resolveAwcName(
        application.awc_center,
        district,
        project,
        sector,
      );
    } catch (resolveError) {
      console.warn("AWC name resolution failed:", resolveError.message);
    }
  }

  if (getMissingAnganwadiStepOneFields(application).length === 0) {
    try {
      const stepTwoResponse = await requestApplication(2);
      application = {
        ...application,
        ...normalizeApplicationData(stepTwoResponse.data || {}),
        applicant_id: initialApplication.applicant_id,
        status: normalizeStatus(stepTwoResponse.status || application.status),
      };
    } catch (stepTwoError) {
      console.warn("Step 2 load failed:", stepTwoError);
    }
  } else if (application.status === "step1") {
    application.status = "step0";
  }

  let stepTwoLoaded = false;
  if (getMissingAnganwadiStepOneFields(application).length === 0) {
    try {
      const stepTwoResponse = await requestApplication(2);
      stepTwoLoaded = true;
      application = {
        ...application,
        ...normalizeApplicationData(stepTwoResponse.data || {}),
        applicant_id: initialApplication.applicant_id,
        status: normalizeStatus(stepTwoResponse.status || application.status),
      };
    } catch (stepTwoError) {
      console.warn("Step 2 load failed:", stepTwoError);
    }
  } else if (application.status === "step1") {
    application.status = "step0";
  }

  if (stepTwoLoaded || ["step2", "step3", "final"].includes(application.status)) {
    try {
      const stepThreeResponse = await requestApplication(3);
      application = {
        ...application,
        ...(stepThreeResponse.data || {}),
        applicant_id: stepThreeResponse.form_id || application.applicant_id,
        status: normalizeStatus(stepThreeResponse.status || application.status),
      };
    } catch (stepThreeError) {
      console.warn("Step 3 load failed:", stepThreeError);
    }
  }

  return { key, application };
};

const buildStepOnePayload = (application) => ({
  filer_name: application.filer_name,
  fath_husb_name: application.fath_husb_name,
  dob: application.dob,
  age: application.age === "" ? "" : Number(application.age),
  filer_mob: application.filer_mob,
  filer_email: application.filer_email,
  filer_adhar: application.filer_adhar,
  edu_qual: application.edu_qual,
  awc_name: application.awc_name || application.filer_name,
  awc_center: application.awc_center,
  district: application.district,
  project: application.project,
  sector: application.sector || "",
  joining_date: application.joining_date,
  village: application.village,
  address: application.address,
  city: application.city,
  pincode: application.pincode,
  acc_holder: application.acc_holder,
  acc_no: application.acc_no,
  acc_ifsc: application.acc_ifsc,
  bank_name: application.bank_name,
  pancard: application.pancard,
});

const STEP_TWO_FIELDS = [
  "pmmvy_tot",
  "pmmvy_obt",
  "cmmk_tot",
  "cmmk_obt",
  "nanda1_tot",
  "nanda1_obt",
  "nanda2_tot",
  "nanda2_obt",
  "pt_tot",
  "pt_obt",
  "survey_tot",
  "survey_obt",
  "ann_tot",
  "ann_obt",
  "pt_group_tot",
  "pt_group_obt",
  "sandharbh_tot",
  "sandharbh_obt",
  "sam_tot",
  "sam_obt",
  "sam_detail",
  "vhsnd_tot",
  "vhsnd_obt",
  "pt_ben_tot",
  "pt_ben_obt",
  "abhilekh_tot",
  "abhilekh_obt",
  "saaf_ans",
  "krimi_tot",
  "krimi_obt",
  "poshan_week_tot",
  "poshan_week_obt",
  "sam_6mon_tot",
  "sam_6yr_tot",
  "mam_6mon_tot",
  "gambhir_tot",
  "gambhir_detail",
  "rbsk_tot",
  "rbsk_obt",
  "rbsk_surv_obt",
  "other_work_detail",
  "dept_work_detail",
  "per_work_detail",
  "ach_work",
];

const STEP_TWO_FILE_FIELDS = [
  "pt_group_img",
  "sam_img",
  "sandharbh_img",
  "gambhir_img",
  "mam_6mon_img",
  "sam_6yr_img",
  "sam_6mon_img",
  "other_work_img",
];

const STEP_TWO_NUMERIC_FIELDS = STEP_TWO_FIELDS.filter(
  (field) => field !== "saaf_ans" && !field.endsWith("_detail") && field !== "ach_work",
);

const STEP_TWO_REQUIRED_FIELDS = [
  "pmmvy_tot",
  "pmmvy_obt",
  "cmmk_tot",
  "cmmk_obt",
  "nanda1_tot",
  "nanda1_obt",
  "nanda2_tot",
  "nanda2_obt",
  "pt_tot",
  "pt_obt",
  "survey_obt",
  "ann_tot",
  "ann_obt",
  "pt_group_obt",
  "sandharbh_obt",
  "sam_tot",
  "sam_obt",
  "sam_detail",
  "vhsnd_obt",
  "pt_ben_tot",
  "pt_ben_obt",
  "abhilekh_tot",
  "abhilekh_obt",
  "saaf_ans",
  "krimi_tot",
  "krimi_obt",
  "poshan_week_tot",
  "poshan_week_obt",
  "sam_6mon_tot",
  "sam_6yr_tot",
  "mam_6mon_tot",
  "gambhir_tot",
  "gambhir_detail",
  "rbsk_obt",
  "rbsk_surv_obt",
  "other_work_detail",
  "dept_work_detail",
  "per_work_detail",
  "ach_work",
];

export const getMissingAnganwadiStepTwoFields = (application) =>
  STEP_TWO_REQUIRED_FIELDS.filter((field) => !hasValue(application?.[field]));

const STEP_THREE_REQUIRED_FIELDS = [
  "aharta1",
  "aharta2",
  "aharta3",
  "aharta4",
  "photo_img",
  "signature",
];

export const getMissingAnganwadiStepThreeFields = (application) =>
  STEP_THREE_REQUIRED_FIELDS.filter((field) => !hasValue(application?.[field]));

const buildStepTwoPayload = (application, files) => {
  const payload = Object.fromEntries(
    STEP_TWO_FIELDS.map((field) => [
      field,
      field === "saaf_ans"
        ? application[field] || []
        : STEP_TWO_NUMERIC_FIELDS.includes(field)
          ? Number(application[field] || 0)
          : application[field] ?? "",
    ]),
  );
  Object.assign(payload, FIXED_ASSESSMENT_TARGETS);
  [...new Set(STEP_TWO_FILE_FIELDS)].forEach((field) => {
    payload[field] = files[field] || null;
  });
  return payload;
};

const buildStepThreePayload = (files) =>
  Object.fromEntries(
    [
      "aharta1",
      "aharta2",
      "aharta3",
      "aharta4",
      "photo_img",
      "signature",
      "manak1",
      "manak2",
      "manak3a",
      "manak3b",
      "manak4",
    ].map((field) => [field, files[field] || null]),
  );

const sendStepPayload = (step, payload) => {
  const hasFiles = Object.values(payload).some(
    (value) => typeof File !== "undefined" && value instanceof File,
  );
  if (!hasFiles) {
    return requestApplication(step, "PUT", payload, "application/json");
  }

  const body = new FormData();
  Object.entries(payload).forEach(([field, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => body.append(field, item));
    } else {
      body.append(field, value);
    }
  });
  return requestApplication(step, "PUT", body);
};

export const saveAnganwadiApplicationStep = async (
  _key,
  application,
  step,
  selectedFiles = {},
) => {
  if (step === 1) {
    const missingStepOne = getMissingAnganwadiStepOneFields(application);
    if (missingStepOne.length) {
      throw new Error(
        `चरण 1 के आवश्यक विवरण पूरे नहीं हैं: ${missingStepOne.join(", ")}`,
      );
    }
    const formatErrorStepOne = getStepOneFormatErrors(application);
    if (formatErrorStepOne) {
      throw new Error(`चरण 1 प्रारूप त्रुटि: ${formatErrorStepOne}`);
    }
    const response = await requestApplication(
      1,
      "PUT",
      buildStepOnePayload(application),
      "application/json",
    );
    return {
      ...application,
      ...normalizeApplicationData(response.data || {}),
      applicant_id: application.applicant_id,
      status: normalizeStatus(response.status || "step-1"),
    };
  }

  if (step === 2) {
    const missingStepTwo = getMissingAnganwadiStepTwoFields(application);
    if (missingStepTwo.length) {
      throw new Error(
        `चरण 2 के आवश्यक विवरण पूरे नहीं हैं: ${missingStepTwo.join(", ")}`,
      );
    }
    const formatErrorStepTwo = getStepTwoFormatErrors(application);
    if (formatErrorStepTwo) {
      throw new Error(`चरण 2 प्रारूप त्रुटि: ${formatErrorStepTwo}`);
    }
    const response = await sendStepPayload(
      2,
      buildStepTwoPayload(application, selectedFiles),
    );
    return {
      ...application,
      ...normalizeApplicationData(response.data || {}),
      applicant_id: response.form_id || application.applicant_id,
      status: normalizeStatus(response.status || "step2"),
    };
  }

  if (step === 3) {
    const missingStepThree = getMissingAnganwadiStepThreeFields(application);
    if (missingStepThree.length) {
      throw new Error(
        `चरण 3 के आवश्यक दस्तावेज़ पूरे नहीं हैं: ${missingStepThree.join(", ")}`,
      );
    }
    const formatErrorStepThree = getStepThreeFormatErrors(application);
    if (formatErrorStepThree) {
      throw new Error(`चरण 3 प्रारूप त्रुटि: ${formatErrorStepThree}`);
    }
    const response = await sendStepPayload(
      3,
      buildStepThreePayload(selectedFiles),
    );
    return {
      ...application,
      ...(response.data || {}),
      applicant_id:
        response.form_id || application.applicant_id,
      status: normalizeStatus(response.status || "step3"),
      editable: response.editable ?? false,
    };
  }

  throw new Error("इस चरण के लिए सेव API उपलब्ध नहीं है।");
};

export const submitAnganwadiApplication = async (_key, application) => {
  const response = await cookieFetch(
    `${APPLICATION_API_BASE}/preview/`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "final_submit" }),
    },
  );
  const data = await readApiResponse(
    response,
    "अंतिम सबमिशन का उत्तर पढ़ा नहीं जा सका।",
  );
  if (!response.ok || data.success === false) {
    throw new Error(
      `${formatApiError(
        data,
        "आवेदन अंतिम रूप से जमा नहीं हो सका।",
      )} (HTTP ${response.status})`,
    );
  }
  return {
    ...application,
    ...(data.data || {}),
    applicant_id: data.form_id || application.applicant_id,
    status: normalizeStatus(data.status || "step3"),
    editable: data.editable ?? false,
  };
};

export const editAnganwadiApplication = async (_key, application) => {
  const response = await cookieFetch(
    `${APPLICATION_API_BASE}/preview/`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "edit" }),
    },
  );
  const data = await readApiResponse(
    response,
    "संपादन अनुरोध का उत्तर पढ़ा नहीं जा सका।",
  );
  if (!response.ok || data.success === false) {
    throw new Error(
      `${formatApiError(
        data,
        "आवेदन संपादन के लिए खोला नहीं जा सका।",
      )} (HTTP ${response.status})`,
    );
  }
  return {
    ...application,
    ...(data.data || {}),
    applicant_id: data.form_id || application.applicant_id,
    status: normalizeStatus(data.status || "step3"),
    editable: data.editable ?? true,
  };
};
