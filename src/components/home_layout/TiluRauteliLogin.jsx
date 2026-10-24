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
import womenImage from "../../assets/images/images-11.jpeg";
import {
  fetchDistrictList,
  loginTiluUser,
  registerTiluUser,
  sendTiluRegistrationOtp,
  verifyTiluRegistrationOtp,
} from "./awardPortalLogin";
import AwardPasswordRecovery from "./AwardPasswordRecovery";
import "./TiluRauteliLogin.css";

export default function TiluRauteliLogin() {
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
  const [registrationPassword, setRegistrationPassword] = useState("");
  const [registrationConfirmPassword, setRegistrationConfirmPassword] =
    useState("");
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
    setRegistrationPassword("");
    setRegistrationConfirmPassword("");
    if (districts.length || districtsLoading) return;

    setDistrictsLoading(true);
    try {
      setDistricts(await fetchDistrictList());
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
      await sendTiluRegistrationOtp(registration.phone);
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
      await verifyTiluRegistrationOtp(registration.phone, registrationOtp);
      setRegistrationStep("verified");
    } catch (otpError) {
      setRegistrationError(otpError.message || "OTP सत्यापन विफल।");
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleTiluRegistration = async (event) => {
    event.preventDefault();
    setRegistrationError("");
    if (registrationPassword !== registrationConfirmPassword) {
      setRegistrationError("दोनों पासवर्ड मेल नहीं खाते।");
      return;
    }

    setRegistrationLoading(true);
    try {
      await registerTiluUser({
        ...registration,
        password: registrationPassword,
      });
      const loginData = await loginTiluUser(
        registration.phone,
        registrationPassword,
      );
      const account = loginData.user || loginData;
      login({
        role: account.role || "telu-rautli-user",
        user: account,
      });
      setShowRegistration(false);
      navigate("/TiluRauteliUserDashboard", { replace: true });
    } catch (registrationSubmitError) {
      setRegistrationError(
        registrationSubmitError.message || "पंजीकरण पूरा नहीं हो सका।",
      );
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginData = await loginTiluUser(phone.trim(), password);
      const account = loginData.user || loginData;
      login({
        role: account.role || "telu-rautli-user",
        user: account,
      });
      navigate("/TiluRauteliUserDashboard", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="tilu-login-page" lang="hi">
      <div className="tilu-login-topbar">
        <Link to="/" className="tilu-home-link">
          <span aria-hidden="true">←</span> सभी पुरस्कार
        </Link>
        <span className="tilu-government-label">उत्तराखंड सरकार · आधिकारिक पोर्टल</span>
      </div>

      <div className="tilu-login-layout">
        <section className="tilu-story-panel">
          <img src={womenImage} alt="उत्तराखंड की महिलाएँ सम्मान समारोह में" />
          <div className="tilu-story-shade" />
          <div className="tilu-story-copy">
            <span className="tilu-edition">राज्य स्त्री शक्ति सम्मान</span>
            <h1>तीलू रौतेली पुरस्कार</h1>
            <p>
              उत्तराखंड की उन प्रेरणादायी महिलाओं को सम्मान, जिनकी उपलब्धियाँ
              समाज को आगे बढ़ने की राह दिखाती हैं।
            </p>
            <span className="tilu-story-caption">साहस · नेतृत्व · उत्कृष्टता</span>
          </div>
        </section>

        <section className="tilu-form-panel">
          <div className="tilu-award-mark" aria-hidden="true">✦</div>
          <p className="tilu-form-eyebrow">आवेदक लॉगिन</p>
          <h2>अपने खाते में प्रवेश करें</h2>
          <p className="tilu-form-intro">
            पंजीकृत मोबाइल नंबर और पासवर्ड से आगे बढ़ें।
          </p>

          <form className="tilu-login-form" onSubmit={handleSubmit}>
            <label htmlFor="tilu-phone">मोबाइल नंबर</label>
            <div className="tilu-input-wrap">
              <FaMobileAlt aria-hidden="true" />
              <input
                id="tilu-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="username"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10 अंकों का मोबाइल नंबर"
                required
              />
            </div>

            <label htmlFor="tilu-password">पासवर्ड</label>
            <div className="tilu-input-wrap">
              <FaKey aria-hidden="true" />
              <input
                id="tilu-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="अपना पासवर्ड दर्ज करें"
                required
              />
              <button
                type="button"
                className="tilu-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "पासवर्ड छिपाएं" : "पासवर्ड दिखाएं"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {error && <p className="tilu-login-error" role="alert">{error}</p>}

            <button className="tilu-submit-button" type="submit" disabled={loading}>
              <FaUserShield aria-hidden="true" />
              {loading ? "लॉगिन हो रहा है..." : "लॉगिन करें"}
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="tilu-register-link"
              onClick={openRegistration}
            >
              नया पंजीकरण करें
              <FaArrowRight aria-hidden="true" />
            </button>
            <button
              type="button"
              className="tilu-forgot-link"
              onClick={() => setShowRecovery(true)}
            >
              पासवर्ड भूल गए?
            </button>
          </form>

          <p className="tilu-security-note">
            <FaUserShield aria-hidden="true" />
            सुरक्षित लॉगिन · महिला सशक्तिकरण एवं बाल विकास विभाग
          </p>
        </section>
      </div>
      {showRecovery && (
        <div className="tilu-recovery-theme">
          <AwardPasswordRecovery onClose={() => setShowRecovery(false)} />
        </div>
      )}
      {showRegistration && (
        <div
          className="tilu-registration-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRegistration();
          }}
        >
          <section
            className="tilu-registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tilu-registration-title"
          >
            <header className="tilu-registration-header">
              <div>
                <span>तीलू रौतेली पुरस्कार पोर्टल</span>
                <h2 id="tilu-registration-title">
                  {registrationStep === "details"
                    ? "नया पंजीकरण"
                    : registrationStep === "otp"
                      ? "मोबाइल सत्यापन"
                      : registrationStep === "verified"
                        ? "पासवर्ड बनाएं"
                        : "पंजीकरण पूरा"}
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
                <div className="tilu-registration-body">
                  <p className="tilu-registration-hint">
                    कृपया अपना मोबाइल नंबर, ईमेल और जनपद दर्ज करें।
                  </p>
                  <label htmlFor="tilu-register-phone">मोबाइल नंबर <span>*</span></label>
                  <div className="tilu-registration-input">
                    <FaMobileAlt aria-hidden="true" />
                    <input
                      id="tilu-register-phone"
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

                  <label htmlFor="tilu-register-email">ईमेल पता <span>*</span></label>
                  <div className="tilu-registration-input">
                    <span aria-hidden="true">@</span>
                    <input
                      id="tilu-register-email"
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

                  <label htmlFor="tilu-register-district">जनपद <span>*</span></label>
                  <div className="tilu-registration-input">
                    <FaMapMarkerAlt aria-hidden="true" />
                    <select
                      id="tilu-register-district"
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
                    <p className="tilu-registration-error" role="alert">
                      {registrationError}
                    </p>
                  )}
                </div>
                <footer className="tilu-registration-footer">
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
                <div className="tilu-registration-body">
                  <p className="tilu-registration-hint">
                    <strong>{registration.phone}</strong> पर भेजा गया 6 अंकों का OTP दर्ज करें।
                  </p>
                  <label htmlFor="tilu-register-otp">OTP <span>*</span></label>
                  <div className="tilu-registration-input">
                    <FaKey aria-hidden="true" />
                    <input
                      id="tilu-register-otp"
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
                    <p className="tilu-registration-error" role="alert">
                      {registrationError}
                    </p>
                  )}
                </div>
                <footer className="tilu-registration-footer">
                  <button type="submit" disabled={registrationLoading}>
                    {registrationLoading ? "सत्यापन हो रहा है..." : "OTP सत्यापित करें"}
                    <FaArrowRight aria-hidden="true" />
                  </button>
                </footer>
              </form>
            )}

            {registrationStep === "verified" && (
              <form onSubmit={handleTiluRegistration}>
                <div className="tilu-registration-body">
                  <p className="tilu-registration-success" role="status">
                    मोबाइल नंबर सत्यापित हो गया है। अब अपना पासवर्ड बनाएं।
                  </p>
                  <label htmlFor="tilu-register-password">पासवर्ड <span>*</span></label>
                  <div className="tilu-registration-input">
                    <FaKey aria-hidden="true" />
                    <input
                      id="tilu-register-password"
                      type="password"
                      autoComplete="new-password"
                      value={registrationPassword}
                      onChange={(event) =>
                        setRegistrationPassword(event.target.value)
                      }
                      placeholder="पासवर्ड दर्ज करें"
                      required
                    />
                  </div>
                  <label htmlFor="tilu-register-confirm-password">
                    पासवर्ड की पुष्टि करें <span>*</span>
                  </label>
                  <div className="tilu-registration-input">
                    <FaKey aria-hidden="true" />
                    <input
                      id="tilu-register-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={registrationConfirmPassword}
                      onChange={(event) =>
                        setRegistrationConfirmPassword(event.target.value)
                      }
                      placeholder="पासवर्ड दोबारा दर्ज करें"
                      required
                    />
                  </div>
                  {registrationError && (
                    <p className="tilu-registration-error" role="alert">
                      {registrationError}
                    </p>
                  )}
                </div>
                <footer className="tilu-registration-footer">
                  <button type="submit" disabled={registrationLoading}>
                    {registrationLoading
                      ? "पंजीकरण हो रहा है..."
                      : "पंजीकरण पूरा करें"}
                    <FaArrowRight aria-hidden="true" />
                  </button>
                </footer>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
