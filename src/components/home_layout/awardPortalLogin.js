import { cookieFetch } from "../login/AuthContext";

const API_BASE =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api";
const TELU_API_BASE =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/telu-roteli";
const ANGANWADI_API_BASE =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api";
const TILU_DISTRICTS_API =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/cdpo-dropdown/";
const ANGANWADI_SECTOR_API = `${ANGANWADI_API_BASE}/sector-dropdown/`;

const readAnganwadiResponse = async (response, fallbackMessage) => {
  try {
    return await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }
};

const getAnganwadiErrorMessage = (data, fallbackMessage) => {
  if (!data || typeof data !== "object") return fallbackMessage;

  const direct = [data.detail, data.message, data.error, data.msg].find(
    (value) => typeof value === "string" && value.trim(),
  );
  if (direct) return direct;

  const firstValue = Object.values(data).find(
    (value) =>
      value != null &&
      value !== false &&
      !(Array.isArray(value) && value.length === 0),
  );
  if (Array.isArray(firstValue)) {
    const text = firstValue.filter(Boolean).join(", ");
    if (text) return text;
  }
  if (typeof firstValue === "string" && firstValue.trim()) return firstValue;
  if (firstValue && typeof firstValue === "object") {
    const nested = [firstValue.detail, firstValue.message, firstValue.error].find(
      (value) => typeof value === "string" && value.trim(),
    );
    if (nested) return nested;
  }

  return fallbackMessage;
};

export async function fetchDistrictList() {
  const response = await fetch(TILU_DISTRICTS_API, {
    credentials: "omit",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false || !Array.isArray(data.data)) {
    throw new Error(data.message || data.detail || "जनपद सूची लोड नहीं हो सकी।");
  }

  return [
    ...new Set(data.data.map(({ district }) => district).filter(Boolean)),
  ];
}

export async function fetchTiluBlockList(district) {
  if (!district) return [];

  const response = await fetch(
    `${TILU_DISTRICTS_API}?district=${encodeURIComponent(district)}`,
    { credentials: "omit" },
  );
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false || !Array.isArray(data.data)) {
    throw new Error(data.message || data.detail || "ब्लॉक सूची लोड नहीं हो सकी।");
  }

  return [
    ...new Set(data.data.map(({ project_name }) => project_name).filter(Boolean)),
  ];
}

const ANGANWADI_NETWORK_ERROR =
  "सर्वर से संपर्क नहीं हो सका। कृपया इंटरनेट/सर्वर उपलब्धता जांचें।";

export async function fetchAnganwadiDistrictList() {
  let response;
  try {
    response = await fetch(ANGANWADI_SECTOR_API, {
      credentials: "omit",
    });
  } catch {
    throw new Error(ANGANWADI_NETWORK_ERROR);
  }
  const data = await readAnganwadiResponse(
    response,
    "जनपद सूची का उत्तर पढ़ा नहीं जा सका।",
  );

  if (!response.ok || data.success === false || !Array.isArray(data.data)) {
    throw new Error(
      getAnganwadiErrorMessage(data, "जनपद सूची लोड नहीं हो सकी।"),
    );
  }

  return [
    ...new Set(data.data.map(({ district }) => district).filter(Boolean)),
  ];
}

export async function fetchAnganwadiProjectSectors(district) {
  if (!district) return [];

  let response;
  try {
    response = await fetch(
      `${ANGANWADI_SECTOR_API}?district=${encodeURIComponent(district)}`,
      { credentials: "omit" },
    );
  } catch {
    throw new Error(ANGANWADI_NETWORK_ERROR);
  }
  const data = await readAnganwadiResponse(
    response,
    "परियोजना और सेक्टर सूची का उत्तर पढ़ा नहीं जा सका।",
  );

  if (!response.ok || data.success === false || !Array.isArray(data.data)) {
    throw new Error(
      getAnganwadiErrorMessage(
        data,
        "परियोजना और सेक्टर सूची लोड नहीं हो सकी।",
      ),
    );
  }

  return data.data.filter(
    (project) => project.project_name && Array.isArray(project.sectors),
  );
}

const postTiluApi = async (path, body, fallbackMessage) => {
  const response = await cookieFetch(`${TELU_API_BASE}/${path}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.detail || data.message || fallbackMessage);
  }
  return data;
};

export const sendTiluRegistrationOtp = (phone) =>
  postTiluApi("send-otp", { phone }, "OTP भेजने में विफल।");

export const verifyTiluRegistrationOtp = (phone, otp) =>
  postTiluApi("verify-otp", { phone, otp }, "OTP सत्यापन विफल।");

export const registerTiluUser = ({
  email,
  phone,
  password,
  name,
  adhar_no,
  district,
  project,
}) =>
  postTiluApi(
    "register",
    { district, email, phone, password, name, adhar_no, project },
    "पंजीकरण पूरा नहीं हो सका।",
  );

export const loginTiluUser = (phone, password) =>
  postTiluApi(
    "login",
    { phone, password, role: "telu-rautli-user" },
    "लॉगिन विफल। कृपया मोबाइल नंबर और पासवर्ड जांचें।",
  );

const postAnganwadiApi = async (path, body, fallbackMessage) => {
  const response = await cookieFetch(`${ANGANWADI_API_BASE}/${path}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await readAnganwadiResponse(
    response,
    "सर्वर से अमान्य उत्तर मिला।",
  );
  if (!response.ok || data.success === false) {
    throw new Error(getAnganwadiErrorMessage(data, fallbackMessage));
  }
  return data;
};

export const sendAnganwadiRegistrationOtp = (phone) =>
  postAnganwadiApi(
    "ang-puruskar/send-otp",
    { phone },
    "OTP भेजने में विफल।",
  );

export const verifyAnganwadiRegistrationOtp = (phone, otp) =>
  postAnganwadiApi(
    "ang-puruskar/verify-otp",
    { phone, otp },
    "OTP सत्यापन विफल।",
  );

export const registerAnganwadiUser = ({
  name,
  phone,
  password,
  adhar_no,
  district,
  project,
  sector,
}) =>
  postAnganwadiApi(
    "angan-puruskar/register",
    {
      name,
      mobile_no: phone,
      passw: password,
      adhar_no,
      district,
      project,
      sector,
    },
    "पंजीकरण पूरा नहीं हो सका।",
  );

export const loginAnganwadiUser = (phone, password) =>
  postAnganwadiApi(
    "angan-puruskar/login",
    { phone, password, role: "ang-puruskar-user" },
    "लॉगिन विफल। कृपया मोबाइल नंबर और पासवर्ड जांचें।",
  );

async function postAwardPortalApi(path, body, fallbackMessage) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.detail || data.message || fallbackMessage,
    );
  }

  return data;
}

export async function loginAwardPortal(phone, password, login, portal) {
  const data = await postAwardPortalApi(
    "/login/",
    { phone, password, role: "user" },
    "लॉगिन विफल। कृपया क्रेडेंशियल जांचें।",
  );
  login(portal ? { ...data, portal } : data);
}

export async function sendAwardPasswordOtp(phone) {
  return postAwardPortalApi(
    "/send-otp-password-change/",
    { phone, role: "user" },
    "OTP भेजने में विफल।",
  );
}

export async function verifyAwardPasswordOtp(phone, otp) {
  return postAwardPortalApi(
    "/verify-otp-password-change/",
    { phone, otp, role: "user" },
    "OTP सत्यापन विफल।",
  );
}

export async function changeAwardPassword(phone, newPassword) {
  return postAwardPortalApi(
    "/change-password/",
    { phone, role: "user", new_password: newPassword },
    "पासवर्ड बदलने में विफल।",
  );
}
