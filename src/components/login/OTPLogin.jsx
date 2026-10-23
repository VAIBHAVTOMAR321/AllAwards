import React, { useState, useCallback, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { sendOtpLoginApi, verifyOtpLoginApi } from "../otpsendverify/api";
import { FaMobileAlt, FaShieldAlt } from "react-icons/fa";
import ukLogo from "../../assets/images/uk_logo.jpeg";
import "./Login.css";
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
};

const SendOTPModal = ({
  show,
  onClose,
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

  return createPortal(
    <div className="otp-modal-overlay" onClick={onClose}>
      <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="otp-modal-header">
          <span className="otp-modal-icon" aria-hidden="true">
            <FaMobileAlt />
          </span>
          <h3>OTP भेजें</h3>
          <span className="otp-role-badge">{roleConfig[selectedRole]?.hindi}</span>
          <button
            className="otp-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
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
      </div>
    </div>,
    document.body
  );
};

const VerifyOTPModal = ({
  show,
  onClose,
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

  return createPortal(
    <div className="otp-modal-overlay" onClick={onClose}>
      <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="otp-modal-header">
          <span className="otp-modal-icon" aria-hidden="true">
            <FaShieldAlt />
          </span>
          <h3>OTP सत्यापन</h3>
          <button
            className="otp-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
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
      </div>
    </div>,
    document.body
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
    <div className="login-page">
      <Container>
        <Row className="g-0 login-container align-items-stretch">
          {/* LEFT PANEL — UK LOGO + HEADINGS */}
          <Col lg={6} className="login-brand-col d-none d-lg-flex">
            <div className="login-brand-overlay">
              <div className="login-logo-circle">
                <img
                  src={ukLogo}
                  alt="Uttarakhand Government Logo"
                  className="login-uk-logo"
                />
              </div>

              <h4 className="login-brand-dept">महिला सशक्तिकरण एवं बाल विकास</h4>
              <p className="login-brand-dept-en">
                Women Empowerment &amp; Child Development
              </p>

              <div className="login-brand-divider" />

              <div className="login-brand-scheme">
                <span className="login-brand-badge">ऑनलाइन नामांकन प्रपत्र</span>
                <h2 className="login-brand-title">
                  मुख्यमंत्री राज्य बाल वीरता पुरस्कार
                </h2>
                <p className="login-brand-subtitle">
                  Chief Minister State Child Bravery Award
                </p>
              </div>

              <div className="login-brand-role">
                <span>चुनी गई भूमिका :</span> {currentRole.hindi}
              </div>

              <p className="login-brand-copy">© 2026 उत्तराखण्ड सरकार</p>
            </div>
          </Col>

          {/* RIGHT PANEL — OTP Login Info */}
          <Col
            lg={6}
            className="login-form-col d-flex align-items-center justify-content-center p-2"
          >
            <div className="login-card border-0 w-100">
              <div className="p-3">
                <div className="text-center mb-4 login-dynamic-header">
                  <h3 className="fw-bold login-role-title">
                    {currentRole.title}
                  </h3>
                  <p className="login-role-hindi">{currentRole.hindi}</p>
                  <p className="text-muted login-role-subtitle">
                    {currentRole.subtitle}
                  </p>
                </div>

                <div className="text-center mt-4">
                  <Button
                    variant="primary"
                    className="login-submit-btn w-100"
                    onClick={() => setStep("send")}
                  >
                    OTP लॉगिन प्रारंभ करें
                  </Button>
                </div>

                <p
                  className="text-center mt-3"
                  style={{ fontSize: "0.85rem", color: "#667085" }}
                >
                  डायरेक्टर और DPO के लिए OTP आधारित लॉगिन
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Send OTP Modal — auto opens when page loads */}
      <SendOTPModal
        show={step === "send"}
        onClose={() => setStep("send")}
        onSent={handleSent}
        selectedRole={selectedRole}
        phone={phone}
        onRoleChange={setSelectedRole}
        onPhoneChange={setPhone}
      />

      {/* Verify OTP Modal */}
      <VerifyOTPModal
        show={step === "verify"}
        onClose={() => setStep("send")}
        onBack={() => setStep("send")}
        onVerified={handleVerified}
        onResend={handleResend}
        phone={phone}
        selectedRole={selectedRole}
      />
    </div>
  );
}

export default OTPLogin;
