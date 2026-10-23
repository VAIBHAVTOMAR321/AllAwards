import React, { useState } from "react";
import {
  changeAwardPassword,
  sendAwardPasswordOtp,
  verifyAwardPasswordOtp,
} from "./awardPortalLogin";
import "./AwardPasswordRecovery.css";

const STEPS = ["OTP भेजें", "OTP सत्यापित करें", "नया पासवर्ड"];

export default function AwardPasswordRecovery({ onClose }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (step === 1 && phone.length !== 10) {
      setError("कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।");
      return;
    }
    if (step === 2 && otp.length !== 6) {
      setError("कृपया 6 अंकों का OTP दर्ज करें।");
      return;
    }
    if (step === 3) {
      if (password.length < 6) {
        setError("पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।");
        return;
      }
      if (password !== confirmPassword) {
        setError("पासवर्ड मेल नहीं खा रहे।");
        return;
      }
    }

    setLoading(true);
    try {
      if (step === 1) {
        await sendAwardPasswordOtp(phone);
        setStep(2);
        setSuccess("OTP सफलतापूर्वक भेजा गया है।");
      } else if (step === 2) {
        await verifyAwardPasswordOtp(phone, otp);
        setStep(3);
        setSuccess("OTP सत्यापित हो गया है।");
      } else {
        await changeAwardPassword(phone, password);
        setSuccess("पासवर्ड सफलतापूर्वक बदल दिया गया है।");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="award-recovery-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="award-recovery-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="award-recovery-title"
      >
        <header className="award-recovery-header">
          <div>
            <span>खाता सहायता</span>
            <h2 id="award-recovery-title">पासवर्ड बदलें</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="बंद करें">×</button>
        </header>

        <div className="award-recovery-steps">
          {STEPS.map((label, index) => (
            <span
              className={step >= index + 1 ? "active" : ""}
              key={label}
            >
              <b>{index + 1}</b>{label}
            </span>
          ))}
        </div>

        <form onSubmit={submit}>
          {step === 1 && (
            <label className="award-recovery-field">
              मोबाइल नंबर
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                maxLength={10}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
                placeholder="10 अंकों का मोबाइल नंबर"
                required
              />
            </label>
          )}
          {step === 2 && (
            <label className="award-recovery-field">
              OTP
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                maxLength={6}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                placeholder="6 अंकों का OTP"
                required
              />
            </label>
          )}
          {step === 3 && success !== "पासवर्ड सफलतापूर्वक बदल दिया गया है।" && (
            <>
              <label className="award-recovery-field">
                नया पासवर्ड
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <label className="award-recovery-field">
                पासवर्ड पुनः दर्ज करें
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
            </>
          )}

          {error && <p className="award-recovery-message error" role="alert">{error}</p>}
          {success && <p className="award-recovery-message success" role="status">{success}</p>}

          {step === 3 && success === "पासवर्ड सफलतापूर्वक बदल दिया गया है।" ? (
            <button type="button" className="award-recovery-submit" onClick={onClose}>
              लॉगिन पर वापस जाएँ
            </button>
          ) : (
            <button type="submit" className="award-recovery-submit" disabled={loading}>
              {loading
                ? "कृपया प्रतीक्षा करें..."
                : step === 1
                  ? "OTP भेजें"
                  : step === 2
                    ? "OTP सत्यापित करें"
                    : "पासवर्ड बदलें"}
            </button>
          )}
        </form>
      </section>
    </div>
  );
}
