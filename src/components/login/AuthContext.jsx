
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend/api";

const CSRF_URL = `${API_BASE}/csrf/`;
const REFRESH_URL = `${API_BASE}/refresh-token/`;
const LOGOUT_URL = `${API_BASE}/logout/`;

const LEGACY_REFRESH_URL =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/refresh-token/";

const AuthContext = createContext(null);

// Shared locks prevent duplicate requests.
let cookieRefreshPromise = null;
let csrfPrimePromise = null;

const getUserRole = (userData) =>
  (userData?.role || userData?.user?.role || "")
    .toLowerCase()
    .replace(/-/g, "_");

const usesCookieSession = (userData) =>
  [
    "director",
    "dpo",
    "cdpo",
    "it_cell",
    "telu_rautli_user",
    "ang_puruskar_user",
  ].includes(getUserRole(userData));

const isCookieAuthEndpoint = (url) =>
  [
    "/send-otp-login-api/",
    "/verify-otp-login-api/",
    "/telu-roteli/send-otp/",
    "/telu-roteli/verify-otp/",
    "/telu-roteli/register/",
    "/telu-roteli/login/",
    "/ang-puruskar/send-otp/",
    "/ang-puruskar/verify-otp/",
    "/angan-puruskar/register/",
    "/angan-puruskar/login/",
    "/csrf/",
    "/refresh-token/",
    "/logout/",
  ].some((path) => url.includes(path));

export const useAuth = () => useContext(AuthContext);

// Always read CSRF from the browser cookie.
export const getCsrfToken = () => {
  if (typeof document === "undefined") return "";

  const csrfCookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("csrftoken="));

  if (!csrfCookie) return "";

  const value = csrfCookie.substring("csrftoken=".length);

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// Compatibility for any existing imports.
// Never manually store CSRF in memory or localStorage.
export const setCsrfToken = () => {};

// Use Vite proxy during localhost development.
const getRequestUrl = (url) => {
  if (
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
    url.startsWith(API_BASE)
  ) {
    return `/api${url.slice(API_BASE.length)}`;
  }

  return url;
};

// Obtain CSRF cookie from Django.
const ensureCsrfCookie = async () => {
  const existingToken = getCsrfToken();

  if (existingToken) return existingToken;

  if (!csrfPrimePromise) {
    csrfPrimePromise = (async () => {
      const response = await fetch(getRequestUrl(CSRF_URL), {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `CSRF initialization failed: HTTP ${response.status}`
        );
      }

      const token = getCsrfToken();

      if (!token) {
        throw new Error(
          "Django did not set csrftoken cookie. Check the /csrf/ endpoint, Set-Cookie header and Vite proxy."
        );
      }

      return token;
    })().finally(() => {
      csrfPrimePromise = null;
    });
  }

  return csrfPrimePromise;
};

// Common cookie-based API request.
const rawCookieFetch = async (url, options = {}) => {
  const {
    requireCsrf = false,
    ...fetchOptions
  } = options;

  const headers = new Headers(fetchOptions.headers || {});

  // Cookie authentication must not use bearer tokens.
  headers.delete("Authorization");

  if (requireCsrf) {
    let csrfToken = getCsrfToken();

    if (!csrfToken) {
      csrfToken = await ensureCsrfCookie();
    }

    if (!csrfToken) {
      const error = new Error("CSRF cookie is missing.");
      error.code = "CSRF_COOKIE_MISSING";
      throw error;
    }

    headers.set("X-CSRFToken", csrfToken);
  }

  if (
    fetchOptions.body &&
    !(fetchOptions.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(getRequestUrl(url), {
    ...fetchOptions,
    credentials: "include",
    headers,
  });
};

// Clear expired cookie authentication.
const expireCookieSession = async (reason) => {
  console.error("Cookie session expired:", reason);

  try {
    await rawCookieFetch(LOGOUT_URL, {
      method: "POST",
      requireCsrf: true,
    });
  } catch (error) {
    console.error("Cookie cleanup failed:", error);
  }

  window.dispatchEvent(new Event("cookie-session-expired"));
};

// Centralized refresh function.
const refreshCookieSession = async () => {
  if (cookieRefreshPromise) {
    return cookieRefreshPromise;
  }

  cookieRefreshPromise = (async () => {
    const response = await rawCookieFetch(REFRESH_URL, {
      method: "POST",
      requireCsrf: true,
    });

    const data = await response.clone().json().catch(() => ({}));

    if (response.ok) {
      if (data.success === false) {
        await expireCookieSession(
          data.detail || data.message || "Session expired."
        );
        return false;
      }

      if (
        response.headers.get("x-auth-cookies-refreshed") === "false"
      ) {
        await expireCookieSession(
          "Backend did not refresh authentication cookies."
        );
        return false;
      }

      // Django sets updated authentication cookies.
      return true;
    }

    if ([400, 401].includes(response.status)) {
      await expireCookieSession(
        data.detail || data.message || "Session expired."
      );
      return false;
    }

    if (response.status === 403) {
      const detail = data.detail || data.message || "";

      if (/csrf/i.test(detail)) {
        throw new Error(
          "CSRF validation failed. Check csrftoken cookie and X-CSRFToken header."
        );
      }

      await expireCookieSession(
        detail || "Refresh request forbidden."
      );
      return false;
    }

    throw new Error(
      data.detail ||
        data.message ||
        `Refresh failed with HTTP ${response.status}.`
    );
  })().finally(() => {
    cookieRefreshPromise = null;
  });

  return cookieRefreshPromise;
};

// Cookie-based API requests.
// A 401 triggers one refresh and one retry.
export const cookieFetch = async (url, options = {}) => {
  const response = await rawCookieFetch(url, options);

  if (
    response.status !== 401 ||
    isCookieAuthEndpoint(url)
  ) {
    return response;
  }

  const refreshed = await refreshCookieSession();

  if (!refreshed) return response;

  return rawCookieFetch(url, options);
};

// Read saved user.
const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return null;

    const parsedUser = JSON.parse(storedUser);

    if (!usesCookieSession(parsedUser)) {
      return parsedUser;
    }

    const {
      access,
      refresh,
      access_token,
      refresh_token,
      ...safeUserData
    } = parsedUser;

    localStorage.setItem("user", JSON.stringify(safeUserData));

    return safeUserData;
  } catch (error) {
    console.error("Unable to read saved user:", error);
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const navigate = useNavigate();

  const refreshPromiseRef = useRef(null);

  // Handle expired cookie session.
  const clearCookieSession = useCallback(() => {
    const role = user?.role || user?.user?.role;

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setUser(null);

    const normalizedRole = (role || "")
      .toLowerCase()
      .replace(/-/g, "_");

    const loginPath =
      normalizedRole === "it_cell"
        ? "/loginit"
        : normalizedRole === "telu_rautli_user"
          ? "/TiluRauteliLogin"
          : normalizedRole === "ang_puruskar_user"
            ? "/AnganwadiLogin"
            : "/Login";

    navigate(loginPath, { replace: true });
  }, [navigate, user]);

  useEffect(() => {
    window.addEventListener(
      "cookie-session-expired",
      clearCookieSession
    );

    return () => {
      window.removeEventListener(
        "cookie-session-expired",
        clearCookieSession
      );
    };
  }, [clearCookieSession]);

  // Remove old token storage for cookie sessions.
  useEffect(() => {
    if (usesCookieSession(user)) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }, [user]);

  // Login.
  const login = useCallback((userData) => {
    if (usesCookieSession(userData)) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      const {
        access,
        refresh,
        access_token,
        refresh_token,
        ...safeUserData
      } = userData;

      localStorage.setItem("user", JSON.stringify(safeUserData));
      setUser(safeUserData);

      // Backend must issue csrftoken.
      // Initialize it if login did not already issue it.
      if (!getCsrfToken()) {
        ensureCsrfCookie().catch((error) => {
          console.error("CSRF initialization failed:", error);
        });
      }

      return;
    }

    // Existing legacy authentication.
    if (userData.access) {
      localStorage.setItem("accessToken", userData.access);
    }

    if (userData.refresh) {
      localStorage.setItem("refreshToken", userData.refresh);
    }

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  // Logout.
  const logout = useCallback(async () => {
    const role = user?.role || user?.user?.role;

    if (usesCookieSession(user)) {
      try {
        const response = await rawCookieFetch(LOGOUT_URL, {
          method: "POST",
          requireCsrf: true,
        });

        if (!response.ok) {
          const data = await response.clone().json().catch(() => ({}));

          throw new Error(
            data.detail ||
              data.message ||
              `Logout failed with HTTP ${response.status}.`
          );
        }
      } catch (error) {
        console.error("Backend logout failed:", error);
      }
    }

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setUser(null);

    const normalizedRole = (role || "")
      .toLowerCase()
      .replace(/-/g, "_");

    if (normalizedRole === "it_cell") {
      navigate("/loginit", { replace: true });
    } else if (normalizedRole === "telu_rautli_user") {
      navigate("/TiluRauteliLogin", { replace: true });
    } else if (normalizedRole === "ang_puruskar_user") {
      navigate("/AnganwadiLogin", { replace: true });
    } else if (
      normalizedRole === "user" &&
      user?.portal === "anganwadi"
    ) {
      navigate("/AnganwadiLogin", { replace: true });
    } else if (normalizedRole === "user") {
      navigate("/", { replace: true });
    } else {
      navigate("/Login", { replace: true });
    }
  }, [navigate, user]);

  // Legacy refresh remains unchanged in behavior.
  const refreshAccessToken = useCallback(async () => {
    if (usesCookieSession(user)) {
      return refreshCookieSession();
    }

    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) return false;

    refreshPromiseRef.current = fetch(LEGACY_REFRESH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    })
      .then(async (response) => {
        if (!response.ok) return false;

        const data = await response.json();

        if (!data.access) return false;

        localStorage.setItem("accessToken", data.access);

        return true;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, [user]);

  // Authenticated API requests.
  const authFetch = useCallback(
    async (url, options = {}) => {
      if (usesCookieSession(user)) {
        return cookieFetch(url, options);
      }

      const request = (requestUrl, requestOptions) => {
        const headers = new Headers(requestOptions.headers || {});

        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
          headers.set("Authorization", `Bearer ${accessToken}`);
        }

        if (
          requestOptions.body &&
          !(requestOptions.body instanceof FormData) &&
          !headers.has("Content-Type")
        ) {
          headers.set("Content-Type", "application/json");
        }

        return fetch(requestUrl, {
          ...requestOptions,
          headers,
        });
      };

      let response = await request(url, options);

      if (
        response.status === 401 &&
        !url.includes("/refresh-token/")
      ) {
        const refreshed = await refreshAccessToken();

        if (!refreshed) {
          throw new Error("Session expired. Please log in again.");
        }

        response = await request(url, options);
      }

      return response;
    },
    [refreshAccessToken, user]
  );

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    authFetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
