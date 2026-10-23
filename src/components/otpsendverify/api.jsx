const API_BASE = "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api";

const maskMobile = (mobile) => {
  const value = String(mobile || "");
  return value.length >= 4 ? `${value.slice(0, 2)}******${value.slice(-2)}` : "<missing>";
};

const summarizeResponse = (res, data) => ({
  status: res.status,
  ok: res.ok,
  success: data?.success,
  message: data?.detail || data?.message || data?.error,
  responseKeys: Object.keys(data || {}),
  hasAccessToken: Boolean(data?.access),
});

export const sendOtpApi = async (mobile) => {
  console.info("[OTP][send] request", { mobile: maskMobile(mobile), role: "user" });
  try {
    const res = await fetch(`${API_BASE}/send-otp/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: mobile, role: "user" }),
    });
    const data = await res.json().catch(() => ({}));
    console.info("[OTP][send] response", summarizeResponse(res, data));
    if (!res.ok) {
      throw new Error(data.detail || data.message || "OTP भेजने में विफल।");
    }
    if (data.success === false) {
      throw new Error(data.detail || data.message || "OTP भेजने में विफल।");
    }
    return data;
  } catch (error) {
    console.error("[OTP][send] failed", { mobile: maskMobile(mobile), message: error.message, error });
    throw error;
  }
};

export const verifyOtpApi = async (mobile, otp) => {
  console.info("[OTP][verify] request", { mobile: maskMobile(mobile), role: "user" });
  try {
    const res = await fetch(`${API_BASE}/verify-otp-user/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: mobile, otp, role: "user" }),
    });
    const data = await res.json().catch(() => ({}));
    console.info("[OTP][verify] response", summarizeResponse(res, data));
    if (!res.ok) {
      throw new Error(data.detail || data.message || "OTP सत्यापन विफल।");
    }
    if (data.success === false) {
      throw new Error(data.detail || data.message || "OTP सत्यापन विफल।");
    }
    return data;
  } catch (error) {
    console.error("[OTP][verify] failed", { mobile: maskMobile(mobile), message: error.message, error });
    throw error;
  }
};

export const submitNominatorPart1 = async (data, token) => {
  if (!token) {
    throw new Error("OTP token उपलब्ध नहीं है। कृपया OTP फिर से सत्यापित करें।");
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(`${API_BASE}/bravery/nominator-part1/`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  const responseData = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = responseData.detail || responseData.message || JSON.stringify(responseData) || `HTTP ${res.status} ${res.statusText}`;
    console.error("[submitNominatorPart1] Bad Request:", responseData);
    throw new Error(msg);
  }
  if (responseData.success === false) {
    console.error("[submitNominatorPart1] API returned success=false:", responseData);
    throw new Error(responseData.detail || responseData.message || "नामांकनकर्ता पंजीकरण विफल।");
  }
  return responseData;
};

export const sendOtpLoginApi = async (mobile, role) => {
  console.info("[OTP-LOGIN][send] request", { mobile: maskMobile(mobile), role });
  try {
    const res = await fetch(`${API_BASE}/send-otp-login-api/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: mobile, role }),
    });
    const data = await res.json().catch(() => ({}));
    console.info("[OTP-LOGIN][send] response", summarizeResponse(res, data));
    if (!res.ok) {
      throw new Error(data.detail || data.message || "OTP भेजने में विफल।");
    }
    if (data.success === false) {
      throw new Error(data.detail || data.message || "OTP भेजने में विफल।");
    }
    return data;
  } catch (error) {
    console.error("[OTP-LOGIN][send] failed", { mobile: maskMobile(mobile), message: error.message, error });
    throw error;
  }
};

export const verifyOtpLoginApi = async (mobile, role, otp) => {
  console.info("[OTP-LOGIN][verify] request", { mobile: maskMobile(mobile), role });
  try {
    const res = await fetch(`${API_BASE}/verify-otp-login-api/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: mobile, role, otp }),
    });
    const data = await res.json().catch(() => ({}));
    console.info("[OTP-LOGIN][verify] response", summarizeResponse(res, data));
    if (!res.ok) {
      throw new Error(data.detail || data.message || "OTP सत्यापन विफल।");
    }
    if (data.success === false) {
      throw new Error(data.detail || data.message || "OTP सत्यापन विफल।");
    }
    return data;
  } catch (error) {
    console.error("[OTP-LOGIN][verify] failed", { mobile: maskMobile(mobile), message: error.message, error });
    throw error;
  }
};
