import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { sendOtpLoginApi, verifyOtpLoginApi } from "../otpsendverify/api";
import { FaMobileAlt, FaShieldAlt } from "react-icons/fa";
import ukLogo from "../../assets/images/uk_logo.jpeg";
import loginImage from "../../assets/images/images-9.jpeg";
import "../otpsendverify/otp.css";

const roleConfig = {
  director: {
    title: "State Login",
    hindi: "निदेशक लॉगिन",
    subtitle: "निदेशक के रूप में लॉगिन करें",
    path: "/DisDashBoard",
  },
  dpo: {
    title: "District Level Login",
    hindi: "जिला कार्यक्रम अधिकारी लॉगिन",
    subtitle: "जिला कार्यक्रम अधिकारी के रूप में लॉगिन करें",
    path: "/DPODashBoard",
  },
  cdpo: {
    title: "CDPO Login",
    hindi: "बाल विकास परियोजना अधिकारी लॉगिन",
    subtitle: "बाल विकास परियोजना अधिकारी के रूप में लॉगिन करें",
    path: "/CDPODashBoard",
  },
};

const SendOTPForm = ({
  show,
  onSent,
  selectedRole,
  phone,
  onRoleChange,
  onPhoneChange,
}) => {
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (show) setError("");
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    if (!phone || phone.length !== 10) {
      setError("कृपया वैध 10 अंकों का फ़ोन नंबर दर्शाएं।");
      return;
    }

    setSending(true);
    try {
      await sendOtpLoginApi(phone, selectedRole);
      onSent();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (!show) return null;

  return (
    <section className="otp-modal otp-step-card" aria-labelledby="otp-send-title">
      <div className="otp-modal-header">
        <span className="otp-modal-icon" aria-hidden="true">
          <FaMobileAlt />
        </span>
        <h3 id="otp-send-title">OTP भेजें</h3>
        <span className="otp-role-badge">{roleConfig[selectedRole]?.hindi}</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="otp-modal-body">
          <p className="otp-hint">
            अपने मोबाइल नंबर पर OTP प्राप्त करने के लिए नीचे दर्शाएं।
          </p>

          <div className="otp-role-selector">
            <label className="otp-role-label">लॉगिन के रूप में</label>
            <div className="otp-role-options">
              {Object.entries(roleConfig).map(([key, config]) => (
                <label
                  key={key}
                  className={`otp-role-option ${
                    selectedRole === key ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={key}
                    checked={selectedRole === key}
                    onChange={() => onRoleChange(key)}
                  />
                  <span className="otp-role-text">{config.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="otp-field">
            <label htmlFor="otp-login-mobile">मोबाइल नंबर</label>
            <input
              id="otp-login-mobile"
              type="tel"
              maxLength={10}
              placeholder="10 अंकों का मोबाइल नंबर"
              value={phone}
              onChange={(e) =>
                onPhoneChange(e.target.value.replace(/\D/g, ""))
              }
              autoFocus
            />
          </div>
          {error && <div className="otp-error" role="alert">{error}</div>}
        </div>
        <div className="otp-modal-footer">
          <button
            type="submit"
            className="otp-btn-primary"
            disabled={sending}
          >
            {sending ? "भेज रहे हैं..." : "OTP भेजें"}
          </button>
        </div>
      </form>
    </section>
  );
};

const VerifyOTPForm = ({
  show,
  onBack,
  onVerified,
  onResend,
  phone,
  selectedRole,
}) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setOtp("");
      setError("");
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("कृपया 6 अंकों का OTP दर्शाएं।");
      return;
    }

    setVerifying(true);
    try {
      const data = await verifyOtpLoginApi(phone, selectedRole, otp);
      onVerified(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    try {
      await onResend();
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  if (!show) return null;

  return (
    <section className="otp-modal otp-step-card" aria-labelledby="otp-verify-title">
      <div className="otp-modal-header">
        <span className="otp-modal-icon" aria-hidden="true">
          <FaShieldAlt />
        </span>
        <h3 id="otp-verify-title">OTP सत्यापन</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="otp-modal-body">
          <p className="otp-hint">
            <strong>{phone}</strong> पर भेजा गया OTP दर्शाएं।
          </p>
          <div className="otp-field">
            <label htmlFor="otp-login-code">OTP</label>
            <input
              id="otp-login-code"
              type="text"
              maxLength={6}
              placeholder="6 अंकों का OTP दर्शाएं"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />
          </div>
          {error && <div className="otp-error" role="alert">{error}</div>}
        </div>
        <div className="otp-modal-footer">
          <button
            type="button"
            className="otp-btn-secondary"
            onClick={onBack}
          >
            वापस
          </button>
          <button
            type="submit"
            className="otp-btn-primary"
            disabled={verifying}
          >
            {verifying ? "सत्यापित कर रहे हैं..." : "सत्यापित करें"}
          </button>
        </div>
        <div className="otp-resend">
          <button
            type="button"
            className="otp-resend-btn"
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? "भेज रहे हैं..." : "OTP पुनः भेजें"}
          </button>
        </div>
      </form>
    </section>
  );
};

function OTPLogin() {
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState("director");
  const [step, setStep] = useState("send");

  const navigate = useNavigate();
  const { login } = useAuth();

  const currentRole = roleConfig[selectedRole];

  const handleSent = useCallback(() => {
    setStep("verify");
  }, []);

  const handleVerified = useCallback(
    async (data) => {
      try {
        const loginData = {
          access: data.access,
          refresh: data.refresh,
          role: data.user?.role || selectedRole,
          user: data.user,
          success: data.success,
          message: data.message,
        };
        login(loginData);
        navigate(roleConfig[selectedRole].path, { replace: true });
      } catch (err) {
        console.error("Login navigation failed:", err);
      }
    },
    [selectedRole, login, navigate]
  );

  const handleResend = useCallback(async () => {
    if (!phone || phone.length !== 10) {
      throw new Error("कृपया वैध फ़ोन नंबर दर्शाएं।");
    }
    await sendOtpLoginApi(phone, selectedRole);
  }, [phone, selectedRole]);

  return (
    <main className="otp-login-page" lang="hi">
      <div className="otp-login-layout">
        <aside className="otp-login-brand">
          <img
            className="otp-login-hero-image"
            src={loginImage}
            alt=""
            aria-hidden="true"
          />
          <div className="otp-login-brand-content">
            <img className="otp-login-logo" src={ukLogo} alt="उत्तराखंड सरकार" />
            <p className="otp-login-department">
              महिला सशक्तिकरण एवं बाल विकास विभाग
            </p>
            <p className="otp-login-department-en">
              Women Empowerment &amp; Child Development
            </p>
            <span className="otp-login-rule" />
            <p className="otp-login-kicker">उत्तराखंड सरकार का आधिकारिक पुरस्कार पोर्टल</p>
            <h1>उत्तराखंड पुरस्कार एवं सम्मान पोर्टल</h1>
            <p className="otp-login-award-en">
              Uttarakhand Awards &amp; Recognition Portal
            </p>
            <div className="otp-login-brand-role">
              <span>पोर्टल भूमिका</span>
              <strong>{currentRole.hindi}</strong>
            </div>
            <p className="otp-login-copyright">© 2026 उत्तराखण्ड सरकार</p>
          </div>
        </aside>

        <section className="otp-login-main">
          <Link className="otp-login-home-link" to="/">
            <span aria-hidden="true">←</span> पुरस्कार पोर्टल पर वापस जाएँ
          </Link>
          <div className="otp-login-form-wrap">
            <div className="otp-login-intro">
              <span className="otp-login-step-label">
                {step === "send" ? "सुरक्षित लॉगिन" : "मोबाइल सत्यापन"}
              </span>
              <h2>{currentRole.title}</h2>
              <p>{currentRole.subtitle}</p>
            </div>

            <ol className="otp-login-progress" aria-label="लॉगिन के चरण">
              <li className={step === "send" ? "active" : "complete"}>
                <span>{step === "verify" ? "✓" : "01"}</span>
                <div>
                  <strong>मोबाइल नंबर</strong>
                  <small>OTP प्राप्त करें</small>
                </div>
              </li>
              <li className={step === "verify" ? "active" : ""}>
                <span>02</span>
                <div>
                  <strong>सत्यापन</strong>
                  <small>सुरक्षित रूप से लॉगिन करें</small>
                </div>
              </li>
            </ol>

            <SendOTPForm
              show={step === "send"}
              onSent={handleSent}
              selectedRole={selectedRole}
              phone={phone}
              onRoleChange={setSelectedRole}
              onPhoneChange={setPhone}
            />
            <VerifyOTPForm
              show={step === "verify"}
              onBack={() => setStep("send")}
              onVerified={handleVerified}
              onResend={handleResend}
              phone={phone}
              selectedRole={selectedRole}
            />
            <p className="otp-login-security-note">
              <FaShieldAlt aria-hidden="true" />
              आपकी जानकारी सुरक्षित OTP सत्यापन के माध्यम से सुरक्षित रखी जाती है।
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default OTPLogin;
