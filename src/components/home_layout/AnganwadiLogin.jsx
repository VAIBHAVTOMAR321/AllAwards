import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaAddressCard,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaUser,
  FaUserShield,
} from "react-icons/fa";
import { useAuth } from "../login/AuthContext";
import anganwadiImage from "../../assets/images/images-5.jpeg";
import {
  fetchAnganwadiDistrictList,
  fetchAnganwadiProjectSectors,
  loginAnganwadiUser,
  registerAnganwadiUser,
  sendAnganwadiRegistrationOtp,
  verifyAnganwadiRegistrationOtp,
} from "./awardPortalLogin";
import AwardPasswordRecovery from "./AwardPasswordRecovery";
import "./AnganwadiLogin.css";

export default function AnganwadiLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationStep, setRegistrationStep] = useState("details");
  const [registration, setRegistration] = useState({
    name: "",
    phone: "",
    adhar_no: "",
    district: "",
    project: "",
    sector: "",
  });
  const [registrationOtp, setRegistrationOtp] = useState("");
  const [registrationPassword, setRegistrationPassword] = useState("");
  const [registrationConfirmPassword, setRegistrationConfirmPassword] =
    useState("");
  const [districts, setDistricts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
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
      setDistricts(await fetchAnganwadiDistrictList());
    } catch (districtError) {
      setRegistrationError(districtError.message || "जनपद सूची लोड नहीं हो सकी।");
    } finally {
      setDistrictsLoading(false);
    }
  }, [districts.length, districtsLoading]);

  const handleDistrictChange = async (district) => {
    setRegistration((current) => ({
      ...current,
      district,
      project: "",
      sector: "",
    }));
    setProjects([]);
    setRegistrationError("");
    if (!district) return;

    setProjectsLoading(true);
    try {
      setProjects(await fetchAnganwadiProjectSectors(district));
    } catch (projectError) {
      setRegistrationError(
        projectError.message || "परियोजना और सेक्टर सूची लोड नहीं हो सकी।",
      );
    } finally {
      setProjectsLoading(false);
    }
  };

  const selectedProject = projects.find(
    ({ project_name }) => project_name === registration.project,
  );
  const sectors = selectedProject?.sectors || [];

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
    if (!registration.name.trim() || !/^[0-9]{12}$/.test(registration.adhar_no)) {
      setRegistrationError("कृपया नाम और 12 अंकों का आधार नंबर दर्ज करें।");
      return;
    }
    if (
      !registration.district ||
      !registration.project ||
      !registration.sector
    ) {
      setRegistrationError("कृपया जनपद, परियोजना और सेक्टर चुनें।");
      return;
    }

    setRegistrationLoading(true);
    try {
      await sendAnganwadiRegistrationOtp(registration.phone);
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
      await verifyAnganwadiRegistrationOtp(
        registration.phone,
        registrationOtp,
      );
      setRegistrationStep("verified");
    } catch (otpError) {
      setRegistrationError(otpError.message || "OTP सत्यापन विफल।");
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleAnganwadiRegistration = async (event) => {
    event.preventDefault();
    setRegistrationError("");
    if (registrationPassword !== registrationConfirmPassword) {
      setRegistrationError("दोनों पासवर्ड मेल नहीं खाते।");
      return;
    }

    setRegistrationLoading(true);
    let accountCreated = false;
    try {
      await registerAnganwadiUser({
        name: registration.name.trim(),
        phone: registration.phone,
        password: registrationPassword,
        adhar_no: registration.adhar_no,
        district: registration.district,
        project: registration.project,
        sector: registration.sector,
      });
      accountCreated = true;
      const loginData = await loginAnganwadiUser(
        registration.phone,
        registrationPassword,
      );
      const account = loginData.user || loginData;
      login({
        role: account.role || "ang-puruskar-user",
        user: {
          ...account,
          name: account.name || registration.name.trim(),
          district: account.district || registration.district,
          project: account.project || registration.project,
          sector: account.sector || registration.sector,
        },
      });
      setShowRegistration(false);
      navigate("/AnganwadiUserDashboard", { replace: true });
    } catch (registrationSubmitError) {
      if (accountCreated) {
        setShowRegistration(false);
        setPhone(registration.phone);
        setPassword(registrationPassword);
        setError(
          `पंजीकरण सफल हुआ, लेकिन स्वचालित लॉगिन विफल रहा: ${
            registrationSubmitError.message || "कृपया दोबारा लॉगिन करें।"
          }`,
        );
      } else {
        setRegistrationError(
          registrationSubmitError.message || "पंजीकरण पूरा नहीं हो सका।",
        );
      }
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginData = await loginAnganwadiUser(phone.trim(), password);
      const account = loginData.user || loginData;
      login({
        role: account.role || "ang-puruskar-user",
        user: account,
      });
      navigate("/AnganwadiUserDashboard", { replace: true });
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
        

        <div className="anganwadi-login-content">
          <form className="anganwadi-form-panel" onSubmit={handleSubmit}>
            <div className="anganwadi-form-heading">
           
              <h2>आंगनवाड़ी कार्यकर्त्री पुरस्कार</h2>
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
                      : "पासवर्ड बनाएं"}
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
                    कृपया अपना नाम, मोबाइल नंबर, आधार और कार्यक्षेत्र की जानकारी दर्ज करें।
                  </p>
                  <label htmlFor="anganwadi-register-name">कार्यकर्त्री का नाम <span>*</span></label>
                  <div className="anganwadi-registration-input">
                    <FaUser aria-hidden="true" />
                    <input
                      id="anganwadi-register-name"
                      type="text"
                      autoComplete="name"
                      value={registration.name}
                      onChange={(event) =>
                        setRegistration((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="पूरा नाम दर्ज करें"
                      required
                    />
                  </div>

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

                  <label htmlFor="anganwadi-register-adhar">आधार नंबर <span>*</span></label>
                  <div className="anganwadi-registration-input">
                    <FaAddressCard aria-hidden="true" />
                    <input
                      id="anganwadi-register-adhar"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={12}
                      value={registration.adhar_no}
                      onChange={(event) =>
                        setRegistration((current) => ({
                          ...current,
                          adhar_no: event.target.value.replace(/\D/g, "").slice(0, 12),
                        }))
                      }
                      placeholder="12 अंकों का आधार नंबर"
                      required
                    />
                  </div>

                  <label htmlFor="anganwadi-register-district">जनपद <span>*</span></label>
                  <div className="anganwadi-registration-input">
                    <FaMapMarkerAlt aria-hidden="true" />
                    <select
                      id="anganwadi-register-district"
                      value={registration.district}
                      onChange={(event) => handleDistrictChange(event.target.value)}
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

                  <label htmlFor="anganwadi-register-project">परियोजना / ब्लॉक <span>*</span></label>
                  <div className="anganwadi-registration-input">
                    <FaMapMarkerAlt aria-hidden="true" />
                    <select
                      id="anganwadi-register-project"
                      value={registration.project}
                      onChange={(event) =>
                        setRegistration((current) => ({
                          ...current,
                          project: event.target.value,
                          sector: "",
                        }))
                      }
                      disabled={!registration.district || projectsLoading}
                      required
                    >
                      <option value="">
                        {projectsLoading
                          ? "परियोजनाएं लोड हो रही हैं..."
                          : "परियोजना / ब्लॉक चुनें"}
                      </option>
                      {projects.map(({ project_name }) => (
                        <option value={project_name} key={project_name}>
                          {project_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label htmlFor="anganwadi-register-sector">सेक्टर <span>*</span></label>
                  <div className="anganwadi-registration-input">
                    <FaMapMarkerAlt aria-hidden="true" />
                    <select
                      id="anganwadi-register-sector"
                      value={registration.sector}
                      onChange={(event) =>
                        setRegistration((current) => ({
                          ...current,
                          sector: event.target.value,
                        }))
                      }
                      disabled={!registration.project}
                      required
                    >
                      <option value="">सेक्टर चुनें</option>
                      {sectors.map(({ sector }) => (
                        <option value={sector} key={sector}>
                          {sector}
                        </option>
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
                    disabled={
                      registrationLoading ||
                      districtsLoading ||
                      projectsLoading ||
                      !districts.length ||
                      !projects.length
                    }
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
              <form onSubmit={handleAnganwadiRegistration}>
                <div className="anganwadi-registration-body">
                  <p className="anganwadi-registration-success" role="status">
                    मोबाइल नंबर सत्यापित हो गया है। अब अपना पासवर्ड बनाएं।
                  </p>
                  <label htmlFor="anganwadi-verified-name">कार्यकर्त्री का नाम</label>
                  <div className="anganwadi-registration-input">
                    <FaUser aria-hidden="true" />
                    <input id="anganwadi-verified-name" value={registration.name} readOnly />
                  </div>
                  <label htmlFor="anganwadi-verified-phone">मोबाइल नंबर</label>
                  <div className="anganwadi-registration-input">
                    <FaMobileAlt aria-hidden="true" />
                    <input id="anganwadi-verified-phone" value={registration.phone} readOnly />
                  </div>
                  <label htmlFor="anganwadi-verified-district">जनपद</label>
                  <div className="anganwadi-registration-input">
                    <FaMapMarkerAlt aria-hidden="true" />
                    <input id="anganwadi-verified-district" value={registration.district} readOnly />
                  </div>
                  <label htmlFor="anganwadi-verified-project">परियोजना / ब्लॉक</label>
                  <div className="anganwadi-registration-input">
                    <FaMapMarkerAlt aria-hidden="true" />
                    <input id="anganwadi-verified-project" value={registration.project} readOnly />
                  </div>
                  <label htmlFor="anganwadi-verified-sector">सेक्टर</label>
                  <div className="anganwadi-registration-input">
                    <FaMapMarkerAlt aria-hidden="true" />
                    <input id="anganwadi-verified-sector" value={registration.sector} readOnly />
                  </div>
                  <label htmlFor="anganwadi-register-password">पासवर्ड <span>*</span></label>
                  <div className="anganwadi-registration-input">
                    <FaKey aria-hidden="true" />
                    <input
                      id="anganwadi-register-password"
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
                  <label htmlFor="anganwadi-register-confirm-password">
                    पासवर्ड की पुष्टि करें <span>*</span>
                  </label>
                  <div className="anganwadi-registration-input">
                    <FaKey aria-hidden="true" />
                    <input
                      id="anganwadi-register-confirm-password"
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
                    <p className="anganwadi-registration-error" role="alert">
                      {registrationError}
                    </p>
                  )}
                </div>
                <footer className="anganwadi-registration-footer">
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
