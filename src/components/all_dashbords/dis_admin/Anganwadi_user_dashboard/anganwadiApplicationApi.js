import { cookieFetch } from "../../../login/AuthContext";

const APPLICATION_API_BASE =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/ang-puruskar-2026";

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

const getAccountField = (account, ...fieldNames) => {
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
  awc_center: getAccountField(account, "awc_center"),
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
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(fallback);
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

const STEP_ONE_REQUIRED_FIELDS = [
  "filer_name",
  "fath_husb_name",
  "dob",
  "filer_mob",
  "filer_adhar",
  "edu_qual",
  "district",
  "project",
  "awc_center",
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
  const stepOneResponse = await requestApplication(1);
  const stepOneData = stepOneResponse.data || {};
  let application = {
    ...initialApplication,
    ...normalizeApplicationData(stepOneData),
    applicant_id: initialApplication.applicant_id,
    status: normalizeStatus(stepOneResponse.status),
  };

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
  fath_husb_name: application.fath_husb_name,
  dob: application.dob,
  age: application.age === "" ? "" : Number(application.age),
  filer_email: application.filer_email,
  edu_qual: application.edu_qual,
  awc_name: application.filer_name,
  awc_center: application.awc_center,
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
    const response = await requestApplication(
      1,
      "PUT",
      buildStepOnePayload(application),
    );
    return {
      ...application,
      ...normalizeApplicationData(response.data || {}),
      applicant_id: application.applicant_id,
      status: normalizeStatus(response.status || "step-1"),
    };
  }

  if (step === 2) {
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
    const response = await sendStepPayload(
      3,
      buildStepThreePayload(selectedFiles),
    );
    const savedResponse = await requestApplication(3);
    return {
      ...application,
      ...(savedResponse.data || response.data || {}),
      applicant_id:
        savedResponse.form_id || response.form_id || application.applicant_id,
      status: normalizeStatus(savedResponse.status || response.status || "step3"),
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
