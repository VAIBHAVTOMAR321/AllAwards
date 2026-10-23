const API_BASE =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api";

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

export async function loginAwardPortal(phone, password, login) {
  const data = await postAwardPortalApi(
    "/login/",
    { phone, password, role: "user" },
    "लॉगिन विफल। कृपया क्रेडेंशियल जांचें।",
  );
  login(data);
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
