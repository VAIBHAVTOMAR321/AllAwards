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
const REFRESH_URL = `${API_BASE}/refresh-token/`;
const LOGOUT_URL = `${API_BASE}/logout/`;
const LEGACY_REFRESH_URL =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/refresh-token/";
const AuthContext = createContext(null);
let cookieRefreshPromise = null;

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
    "/refresh-token/",
    "/logout/",
  ].some((path) => url.includes(path));

const getUserRole = (userData) =>
  (userData?.role || userData?.user?.role || "").toLowerCase().replace(/-/g, "_");

const usesCookieSession = (userData) =>
  [
    "director",
    "dpo",
    "cdpo",
    "it_cell",
    "telu_rautli_user",
    "ang_puruskar_user",
  ].includes(getUserRole(userData));

export const useAuth = () => useContext(AuthContext);

export const getCsrfToken = () => {
  if (typeof document === "undefined") return "";
  const csrfCookie = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("csrftoken="));

  if (!csrfCookie) return "";
  try {
    return decodeURIComponent(csrfCookie.slice("csrftoken=".length));
  } catch (error) {
    console.error("Unable to decode the CSRF cookie:", error);
    return csrfCookie.slice("csrftoken=".length);
  }
};

const rawCookieFetch = async (url, options = {}) => {
  const { requireCsrf = false, ...fetchOptions } = options;
  const headers = new Headers(options.headers || {});
  let csrfToken = getCsrfToken();

  // If CSRF is required but token is missing, attempt to prime it by making a GET request
  if (requireCsrf && !csrfToken) {
    try {
      // Make a GET request to the same URL to trigger CSRF cookie set
      await fetch(url, { credentials: "include" });
      csrfToken = getCsrfToken();
    } catch (error) {
      console.warn("Failed to prime CSRF token:", error);
    }
  }

  const requestUrl =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
    url.startsWith(API_BASE)
      ? `/api${url.slice(API_BASE.length)}`
      : url;

  headers.delete("Authorization");
  if (requireCsrf && !csrfToken) {
    const error = new Error(
      "The backend did not set a readable csrftoken cookie. Refresh and logout are blocked until the backend issues one.",
    );
    error.code = "CSRF_COOKIE_MISSING";
    throw error;
  }
  if (csrfToken) headers.set("X-CSRFToken", csrfToken);
  if (
    fetchOptions.body &&
    !(fetchOptions.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(requestUrl, {
    ...fetchOptions,
    credentials: "include",
    headers,
  });
};

const expireCookieSession = async (reason) => {
  console.error("Cookie session expired:", reason);
  try {
    const response = await rawCookieFetch(LOGOUT_URL, { method: "POST" });
    if (!response.ok) {
      console.error(
        `Backend could not clear expired auth cookies (HTTP ${response.status}).`,
      );
    }
  } catch (error) {
    console.error("Unable to request expired cookie cleanup:", error);
  }
  window.dispatchEvent(new Event("cookie-session-expired"));
};

const refreshCookieSession = async () => {
  if (!cookieRefreshPromise) {
    cookieRefreshPromise = rawCookieFetch(REFRESH_URL, {
      method: "POST",
      requireCsrf: true,
    })
      .then(async (response) => {
        const data = await response.clone().json().catch(() => ({}));
        if (response.ok) {
          if (data.success === false) {
            await expireCookieSession(
              data.detail || data.message || "Refresh response reported an expired session.",
            );
            return false;
          }
          if (response.headers.get("x-auth-cookies-refreshed") === "false") {
            await expireCookieSession(
              "The refresh response did not set both access_token and refresh_token cookies.",
            );
            return false;
          }
          return true;
        }
        if ([400, 401].includes(response.status)) {
          await expireCookieSession(
            data.detail || data.message || `Refresh rejected (HTTP ${response.status}).`,
          );
          return false;
        }
        if (response.status === 403) {
          const detail = data.detail || data.message;
          if (/csrf/i.test(`${detail || ""}`)) {
            throw new Error(
              "Session refresh was rejected because the CSRF token is missing or invalid. The login is preserved; check the csrftoken cookie and X-CSRFToken header.",
            );
          }
          await expireCookieSession(
            detail || "Refresh was forbidden; the session can no longer be renewed.",
          );
          return false;
        }
        throw new Error(
          data.detail ||
            data.message ||
            `Session refresh failed with HTTP ${response.status}.`,
        );
      })
      .finally(() => {
        cookieRefreshPromise = null;
      });
  }
  return cookieRefreshPromise;
};

export const cookieFetch = async (url, options = {}) => {
  const response = await rawCookieFetch(url, options);
  if (response.status !== 401 || isCookieAuthEndpoint(url)) return response;

  const refreshed = await refreshCookieSession();
  if (!refreshed) return response;

  const retriedResponse = await rawCookieFetch(url, options);
  return retriedResponse;
};

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    const parsedUser = JSON.parse(storedUser);
    if (!usesCookieSession(parsedUser)) return parsedUser;

    const { access, refresh, ...safeUserData } = parsedUser;
    if (access || refresh) {
      localStorage.setItem("user", JSON.stringify(safeUserData));
    }
    return safeUserData;
  } catch (error) {
    console.error("Unable to read the saved user session:", error);
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const initialUserRef = useRef(user);
  const navigate = useNavigate();
  const refreshPromiseRef = useRef(null);

  const clearCookieSession = useCallback(() => {
    const role = user?.role || user?.user?.role;
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);

    const normalizedRole = (role || "").toLowerCase().replace(/-/g, "_");
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
    window.addEventListener("cookie-session-expired", clearCookieSession);
    return () =>
      window.removeEventListener("cookie-session-expired", clearCookieSession);
  }, [clearCookieSession]);

  useEffect(() => {
    if (!usesCookieSession(initialUserRef.current)) return;

    refreshCookieSession().catch((error) => {
      console.error("Initial cookie session refresh failed:", error);
    });
  }, []);

  useEffect(() => {
    if (!usesCookieSession(user)) return undefined;

    const intervalId = window.setInterval(() => {
      refreshCookieSession().catch((error) => {
        console.error("Periodic cookie session refresh failed:", error);
      });
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    if (usesCookieSession(user)) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }, [user]);

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
              `Logout failed with HTTP ${response.status}.`,
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

    const normalizedRole = (role || "").toLowerCase().replace(/-/g, "_");
    if (normalizedRole === "it_cell") {
      navigate("/loginit", { replace: true });
    } else if (normalizedRole === "telu_rautli_user") {
      navigate("/TiluRauteliLogin", { replace: true });
    } else if (normalizedRole === "ang_puruskar_user") {
      navigate("/AnganwadiLogin", { replace: true });
    } else if (normalizedRole === "user" && user?.portal === "anganwadi") {
      navigate("/AnganwadiLogin", { replace: true });
    } else if (normalizedRole === "user") {
      navigate("/", { replace: true });
    } else {
      navigate("/Login", { replace: true });
    }
  }, [navigate, user]);

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const refreshRequest = usesCookieSession(user)
      ? cookieFetch(REFRESH_URL, {
          method: "POST",
          requireCsrf: true,
        })
      : (() => {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) return Promise.resolve(null);
          return fetch(LEGACY_REFRESH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });
        })();

    refreshPromiseRef.current = refreshRequest
      .then(async (response) => {
        if (!response) return false;
        if (!response.ok) {
          if (response.status === 401) {
            window.dispatchEvent(new Event("cookie-session-expired"));
            return false;
          }
          if (response.status === 403) {
            const data = await response.clone().json().catch(() => ({}));
            if (/csrf/i.test(`${data.detail || ""} ${data.message || ""}`)) {
              throw new Error(
                "Session refresh was rejected because the CSRF token is missing or invalid.",
              );
            }
          }
          throw new Error(`Session refresh failed with HTTP ${response.status}.`);
        }
        if (!usesCookieSession(user)) {
          return response.json().then(({ access }) => {
            localStorage.setItem("accessToken", access);
            return access;
          });
        }
        return true;
      })
      .catch((error) => {
        console.error("Session refresh failed:", error);
        throw error;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, [user]);

  const login = useCallback((userData) => {
    if (usesCookieSession(userData)) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } else {
      if (userData.access) {
        localStorage.setItem("accessToken", userData.access);
      }
      if (userData.refresh) {
        localStorage.setItem("refreshToken", userData.refresh);
      }
    }
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const authFetch = useCallback(
    async (url, options = {}) => {
      const cookieSession = usesCookieSession(user);
      if (cookieSession) return cookieFetch(url, options);

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
        return fetch(requestUrl, { ...requestOptions, headers });
      };

      let response = await request(url, options);

      if (response.status === 401 && !url.includes("/refresh-token/")) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          throw new Error("Session expired. Please log in again.");
        }
        response = await request(url, options);
      }

      return response;
    },
    [refreshAccessToken, user],
  );

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    authFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
