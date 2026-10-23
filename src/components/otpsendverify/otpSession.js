import { useEffect, useState } from "react";

export const OTP_EXPIRY_SECONDS = 5 * 60;
export const RESEND_COOLDOWN_SECONDS = 30;

let session = { mobile: "", sentAt: null };

const listeners = new Set();

const emit = () => {
  const snapshot = { ...session };
  listeners.forEach((listener) => listener(snapshot));
};

export const getOtpSession = () => ({ ...session });

export const startOtpSession = (mobile) => {
  session = { mobile: mobile || "", sentAt: Date.now() };
  emit();
  return { ...session };
};

export const clearOtpSession = () => {
  session = { mobile: "", sentAt: null };
  emit();
};

export const subscribeOtpSession = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const secondsUntil = (deadline, now) =>
  Math.max(0, Math.ceil((deadline - now) / 1000));

export const getOtpTimings = (snapshot = session, now = Date.now()) => {
  if (!snapshot.sentAt) {
    return { active: false, expiryRemaining: 0, resendRemaining: 0 };
  }
  return {
    active: true,
    expiryRemaining: secondsUntil(snapshot.sentAt + OTP_EXPIRY_SECONDS * 1000, now),
    resendRemaining: secondsUntil(snapshot.sentAt + RESEND_COOLDOWN_SECONDS * 1000, now),
  };
};

export const formatClock = (seconds) => {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const useOtpSession = () => {
  const [snapshot, setSnapshot] = useState(getOtpSession);
  useEffect(() => subscribeOtpSession(setSnapshot), []);
  return snapshot;
};

export const useNow = (active, intervalMs = 1000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
};
