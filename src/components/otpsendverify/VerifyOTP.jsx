import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { sendOtpApi, verifyOtpApi } from "./api";
import {
  RESEND_COOLDOWN_SECONDS,
  clearOtpSession,
  formatClock,
  getOtpTimings,
  startOtpSession,
  useNow,
  useOtpSession,
} from "./otpSession";
import "./otp.css";

export const VerifyOTP = ({ show, onClose, mobile, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const session = useOtpSession();
  const now = useNow(show);
  const { expiryRemaining, resendRemaining } = useMemo(
    () => getOtpTimings(session, now),
    [session, now],
  );

  useEffect(() => {
    if (show) {
      setOtp("");
      setError("");
      setLoading(false);
    }
  }, [show, mobile]);

  const isExpired = expiryRemaining <= 0;
  const canResend = resendRemaining <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    const masked = mobile ? `${mobile.slice(0, 2)}******${mobile.slice(-2)}` : "<missing>";
    console.info("[VerifyOTP] submit", { mobile: masked, isExpired });
    if (isExpired) {
      console.error("[VerifyOTP] OTP expired", { mobile: masked });
      setError("OTP समाप्त हो गया है। कृपया फिर से OTP भेजें।");
      return;
    }
    if (!/^[0-9]{6}$/.test(otp)) {
      console.error("[VerifyOTP] invalid OTP format", { length: otp.length });
      setError("कृपया 6 अंकों का OTP दर्ज करें।");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtpApi(mobile, otp);
      console.info("[VerifyOTP] success; opening query form", {
        responseKeys: Object.keys(res || {}),
        hasAccessToken: Boolean(res?.access),
      });
      clearOtpSession();
      onSuccess && onSuccess(res);
      onClose();
    } catch (err) {
      console.error("[VerifyOTP] failed", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError("");
    setOtp("");
    setLoading(true);
    try {
      await sendOtpApi(mobile);
      startOtpSession(mobile);
      console.info("[VerifyOTP] resend success", {
        mobile: mobile ? `${mobile.slice(0, 2)}******${mobile.slice(-2)}` : "<missing>",
        cooldown: RESEND_COOLDOWN_SECONDS,
      });
    } catch (err) {
      console.error("[VerifyOTP] resend failed", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return createPortal(
    <div className="otp-modal-overlay" onClick={onClose}>
      <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="otp-modal-header">
          <h3>OTP सत्यापन</h3>
          <button className="otp-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="otp-modal-body">
            <p className="otp-hint">
              <strong>{mobile}</strong> पर भेजा गया OTP दर्ज करें।
            </p>
            <div className="otp-expiry-timer" aria-live="polite">
              {isExpired ? "OTP समाप्त" : `${formatClock(expiryRemaining)} remaining`}
            </div>
            <div className="otp-field">
              <label htmlFor="otp-code">OTP</label>
              <input
                id="otp-code"
                type="text"
                maxLength={6}
                placeholder={isExpired ? "OTP समाप्त हो गया" : "OTP दर्ज करें"}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={isExpired}
              />
            </div>
            {error && <div className="otp-error" role="alert">{error}</div>}
            {isExpired && !error && (
              <div className="otp-error" role="alert">
                OTP समाप्त हो गया है। कृपया नीचे से फिर से OTP भेजें।
              </div>
            )}
          </div>
          <div className="otp-modal-footer">
            <button type="button" className="otp-btn-secondary" onClick={onClose}>रद्द करें</button>
            <button type="submit" className="otp-btn-primary" disabled={loading || isExpired}>
              {loading ? "सत्यापित कर रहे हैं..." : "सत्यापित करें"}
            </button>
          </div>
          <div className="otp-resend">
            {canResend ? (
              <button type="button" className="otp-resend-btn" onClick={handleResend} disabled={loading}>
                OTP पुनः भेजें
              </button>
            ) : (
              <span>पुनः भेजने में {resendRemaining} सेकंड remaining</span>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
