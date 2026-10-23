import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaKey, FaMobileAlt, FaUserShield } from "react-icons/fa";
import { useAuth } from "../login/AuthContext";
import womenImage from "../../assets/images/images-11.jpeg";
import { loginAwardPortal } from "./awardPortalLogin";
import AwardPasswordRecovery from "./AwardPasswordRecovery";
import "./TiluRauteliLogin.css";

export default function TiluRauteliLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
    </main>
  );
}
