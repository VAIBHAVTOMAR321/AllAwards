import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaUserShield,
} from "react-icons/fa";
import { useAuth } from "../login/AuthContext";
import anganwadiImage from "../../assets/images/images-5.jpeg";
import { loginAwardPortal } from "./awardPortalLogin";
import { sendOtpApi, verifyOtpApi } from "../otpsendverify/api";
import AwardPasswordRecovery from "./AwardPasswordRecovery";
import "./AnganwadiLogin.css";

const DISTRICTS_API =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/cdpo-dropdown/";

export default function AnganwadiLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationStep, setRegistrationStep] = useState("details");
  const [registration, setRegistration] = useState({
    phone: "",
    email: "",
    district: "",
  });
  const [registrationOtp, setRegistrationOtp] = useState("");
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (!showRegistration) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !registrationLoading) {
        setShowRegistration(false);
        setRegistrationError("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showRegistration, registrationLoading]);

  const openRegistration = useCallback(async () => {
    setShowRegistration(true);
    setRegistrationStep("details");
    setRegistrationError("");
    if (districts.length || districtsLoading) return;

    setDistrictsLoading(true);
    try {
      const response = await fetch(DISTRICTS_API);
      const result = await response.json();
      if (!response.ok || result.success === false || !Array.isArray(result.data)) {
        throw new Error(result.message || "जनपद सूची लोड नहीं हो सकी।");
      }
      setDistricts([...new Set(result.data.map((item) => item.district).filter(Boolean))]);
    } catch (districtError) {
      setRegistrationError(districtError.message || "जनपद सूची लोड नहीं हो सकी।");
    } finally {
      setDistrictsLoading(false);
    }
  }, [districts.length, districtsLoading]);

  useEffect(() => {
    if (!location.state?.openRegistration) return;
    openRegistration();
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, openRegistration]);

  const closeRegistration = () => {
    if (registrationLoading) return;
    setShowRegistration(false);
    setRegistrationError("");
  };

  const handleRegistrationSubmit = async (event) => {
    event.preventDefault();
    setRegistrationError("");
    if (!/^[0-9]{10}$/.test(registration.phone)) {
      setRegistrationError("कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।");
      return;
    }

    setRegistrationLoading(true);
    try {
      await sendOtpApi(registration.phone);
      setRegistrationOtp("");
      setRegistrationStep("otp");
    } catch (otpError) {
      setRegistrationError(otpError.message || "OTP भेजने में विफल।");
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleRegistrationOtpSubmit = async (event) => {
    event.preventDefault();
    setRegistrationError("");
    if (!/^[0-9]{6}$/.test(registrationOtp)) {
      setRegistrationError("कृपया 6 अंकों का OTP दर्ज करें।");
      return;
    }

    setRegistrationLoading(true);
    try {
      await verifyOtpApi(registration.phone, registrationOtp);
      setRegistrationStep("verified");
    } catch (otpError) {
      setRegistrationError(otpError.message || "OTP सत्यापन विफल।");
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginAwardPortal(phone.trim(), password, login);
      navigate("/UserDashBoard");
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="anganwadi-login-page" lang="hi">
      <header className="anganwadi-header">
        <Link to="/" className="anganwadi-home-link">← पुरस्कार पोर्टल</Link>
        <span>महिला सशक्तिकरण एवं बाल विकास विभाग</span>
      </header>

      <section className="anganwadi-login-shell">
        <div className="anganwadi-heading">
          <span className="anganwadi-heading-icon" aria-hidden="true">❖</span>
          <div>
            <p>राज्य स्तरीय सम्मान</p>
            <h1>आंगनवाड़ी कार्यकर्त्री पुरस्कार</h1>
            <span>समर्पित सेवा · सशक्त समुदाय · स्वस्थ भविष्य</span>
          </div>
        </div>

        <div className="anganwadi-login-content">
          <form className="anganwadi-form-panel" onSubmit={handleSubmit}>
            <div className="anganwadi-form-heading">
              <span>आवेदक पोर्टल</span>
              <h2>लॉगिन</h2>
              <p>अपना पंजीकृत मोबाइल नंबर और पासवर्ड दर्ज करें।</p>
            </div>

            <label htmlFor="anganwadi-phone">मोबाइल नंबर</label>
            <div className="anganwadi-input-row">
              <span className="anganwadi-input-icon"><FaMobileAlt aria-hidden="true" /></span>
              <input
                id="anganwadi-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="username"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10 अंकों का मोबाइल नंबर"
                required
              />
            </div>

            <label htmlFor="anganwadi-password">पासवर्ड</label>
            <div className="anganwadi-input-row">
              <span className="anganwadi-input-icon"><FaKey aria-hidden="true" /></span>
              <input
                id="anganwadi-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="पासवर्ड दर्ज करें"
                required
              />
              <button
                type="button"
                className="anganwadi-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "पासवर्ड छिपाएं" : "पासवर्ड दिखाएं"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {error && <p className="anganwadi-login-error" role="alert">{error}</p>}

            <button className="anganwadi-submit-button" type="submit" disabled={loading}>
              <FaUserShield aria-hidden="true" />
              {loading ? "लॉगिन हो रहा है..." : "सुरक्षित लॉगिन"}
            </button>
            <button
              type="button"
              className="anganwadi-register-link"
              onClick={openRegistration}
            >
              नया पंजीकरण करें
              <FaArrowRight aria-hidden="true" />
            </button>
            <button
              type="button"
              className="anganwadi-forgot-link"
              onClick={() => setShowRecovery(true)}
            >
              पासवर्ड भूल गए?
            </button>
            <p className="anganwadi-security-note">
              <FaUserShield aria-hidden="true" />
              सुरक्षित सरकारी लॉगिन
            </p>
          </form>

          <figure className="anganwadi-photo-panel">
            <img
              src={anganwadiImage}
              alt="आंगनवाड़ी केंद्र में बच्चों के साथ कार्यकर्त्री"
            />
            <figcaption>
              <span>देखभाल और पोषण</span>
              <strong>हर बच्चे के बेहतर भविष्य के लिए</strong>
            </figcaption>
          </figure>
        </div>

        <footer className="anganwadi-footer">
          <span>उत्तराखंड सरकार</span>
          <span className="anganwadi-footer-line" />
          <span>आंगनवाड़ी कार्यकर्ताओं के समर्पण को नमन</span>
        </footer>
      </section>
      {showRecovery && (
        <div className="anganwadi-recovery-theme">
          <AwardPasswordRecovery onClose={() => setShowRecovery(false)} />
        </div>
      )}
      {showRegistration && (
        <div
          className="anganwadi-registration-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRegistration();
          }}
        >
          <section
            className="anganwadi-registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="anganwadi-registration-title"
          >
            <header className="anganwadi-registration-header">
              <div>
                <span>आंगनवाड़ी कार्यकर्त्री पोर्टल</span>
                <h2 id="anganwadi-registration-title">
                  {registrationStep === "details"
                    ? "नया पंजीकरण"
                    : registrationStep === "otp"
                      ? "मोबाइल सत्यापन"
                      : "मोबाइल सत्यापित"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeRegistration}
                aria-label="पंजीकरण विंडो बंद करें"
              >
                ×
              </button>
            </header>

            {registrationStep === "details" && (
              <form onSubmit={handleRegistrationSubmit}>
                <div className="anganwadi-registration-body">
                  <p className="anganwadi-registration-hint">
                    कृपया अपना मोबाइल नंबर, ईमेल और जनपद दर्ज करें।
                  </p>
                  <label htmlFor="anganwadi-register-phone">मोबाइल नंबर <span>*</span></label>
                  <div className="anganwadi-registration-input">
                    <FaMobileAlt aria-hidden="true" />
                    <input
                      id="anganwadi-register-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={registration.phone}
                      onChange={(event) =>
                        setRegistration((current) => ({
                          ...current,
                          phone: event.target.value.replace(/\D/g, "").slice(0, 10),
                        }))
                      }
                      placeholder="मोबाइल नंबर दर्ज करें"
                      required
                    />
                  </div>

                  <label htmlFor="anganwadi-register-email">ईमेल पता <span>*</span></label>
                  <div className="anganwadi-registration-input">
                    <span aria-hidden="true">@</span>
                    <input
                      id="anganwadi-register-email"
                      type="email"
                      autoComplete="email"
                      value={registration.email}
                      onChange={(event) =>
                        setRegistration((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="ईमेल पता दर्ज करें"
                      required
                    />
                  </div>

                  <label htmlFor="anganwadi-register-district">जनपद <span>*</span></label>
                  <div className="anganwadi-registration-input">
                    <FaMapMarkerAlt aria-hidden="true" />
                    <select
                      id="anganwadi-register-district"
                      value={registration.district}
                      onChange={(event) =>
                        setRegistration((current) => ({
                          ...current,
                          district: event.target.value,
                        }))
                      }
                      disabled={districtsLoading}
                      required
                    >
                      <option value="">
                        {districtsLoading ? "जनपद लोड हो रहे हैं..." : "जनपद चुनें"}
                      </option>
                      {districts.map((district) => (
                        <option value={district} key={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                  {registrationError && (
                    <p className="anganwadi-registration-error" role="alert">
                      {registrationError}
                    </p>
                  )}
                </div>
                <footer className="anganwadi-registration-footer">
                  <button
                    type="submit"
                    disabled={registrationLoading || districtsLoading || !districts.length}
                  >
                    {registrationLoading ? "OTP भेज रहे हैं..." : "पंजीकरण जारी रखें"}
                    <FaArrowRight aria-hidden="true" />
                  </button>
                </footer>
              </form>
            )}

            {registrationStep === "otp" && (
              <form onSubmit={handleRegistrationOtpSubmit}>
                <div className="anganwadi-registration-body">
                  <p className="anganwadi-registration-hint">
                    <strong>{registration.phone}</strong> पर भेजा गया 6 अंकों का OTP दर्ज करें।
                  </p>
                  <label htmlFor="anganwadi-register-otp">OTP <span>*</span></label>
                  <div className="anganwadi-registration-input">
                    <FaKey aria-hidden="true" />
                    <input
                      id="anganwadi-register-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={registrationOtp}
                      onChange={(event) =>
                        setRegistrationOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="6 अंकों का OTP दर्ज करें"
                      required
                    />
                  </div>
                  {registrationError && (
                    <p className="anganwadi-registration-error" role="alert">
                      {registrationError}
                    </p>
                  )}
                </div>
                <footer className="anganwadi-registration-footer">
                  <button type="submit" disabled={registrationLoading}>
                    {registrationLoading ? "सत्यापन हो रहा है..." : "OTP सत्यापित करें"}
                    <FaArrowRight aria-hidden="true" />
                  </button>
                </footer>
              </form>
            )}

            {registrationStep === "verified" && (
              <div className="anganwadi-registration-body">
                <p className="anganwadi-registration-success" role="status">
                  मोबाइल नंबर सत्यापित हो गया है।
                </p>
                <p className="anganwadi-registration-hint">
                  इस परियोजना में पंजीकरण पूरा करने के लिए खाता बनाने की सेवा अभी उपलब्ध नहीं है।
                </p>
                <button
                  type="button"
                  className="anganwadi-registration-done"
                  onClick={closeRegistration}
                >
                  बंद करें
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
