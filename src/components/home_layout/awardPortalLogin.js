import { cookieFetch } from "../login/AuthContext";

const API_BASE =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api";
const TELU_API_BASE =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/telu-roteli";
const TILU_DISTRICTS_API =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api/cdpo-dropdown/";

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
