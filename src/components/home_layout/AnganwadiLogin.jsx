import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaKey, FaMobileAlt, FaUserShield } from "react-icons/fa";
import { useAuth } from "../login/AuthContext";
import anganwadiImage from "../../assets/images/images-5.jpeg";
import { loginAwardPortal } from "./awardPortalLogin";
import AwardPasswordRecovery from "./AwardPasswordRecovery";
import "./AnganwadiLogin.css";

export default function AnganwadiLogin() {
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
    </main>
  );
}
