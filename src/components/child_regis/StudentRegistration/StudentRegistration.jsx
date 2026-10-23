import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentRegistration.css";
import { SendOTP } from "../../otpsendverify/SendOTP";
import { VerifyOTP } from "../../otpsendverify/VerifyOTP";
import { submitNominatorPart1 } from "../../otpsendverify/api";
import { getOtpSession } from "../../otpsendverify/otpSession";

const APPLICATION_CUTOFF = new Date("2026-10-17T17:00:00+05:30");
const APPLICATION_CLOSED_MESSAGE =
  "17 अक्टूबर 2026, सायं 05:00 बजे आवेदन बंद हो गए हैं।";

const nominatorCategories = ["स्वयं बालक / बालिका", "माता", "पिता", "विधिक अभिभावक", "विद्यालय के प्रधानाचार्य/प्रधानाध्यापक", "जिलाधिकारी"];
const idTypes = ["आधार कार्ड", "पैन कार्ड", "ड्राइविंग लाइसेंस", "पहचान पत्र (फोटो के साथ)", "पासपोर्ट", "मतदाता पहचान पत्र"];

const validatePassword = (pwd) => {
  const issues = [];
  if (pwd.length > 0 && pwd.length < 8) issues.push("कम से कम 8 अक्षर");
  if (pwd.length > 0 && !/[A-Z]/.test(pwd)) issues.push("कम से कम एक बड़ा अक्षर");
  if (pwd.length > 0 && !/^[a-zA-Z0-9]*$/.test(pwd)) issues.push("केवल अक्षर और संख्या (Alphanumeric)");
  return issues;
};

const StudentRegistration = () => {
  const navigate = useNavigate();
  const isApplicationClosed = new Date() >= APPLICATION_CUTOFF;
  const [form, setForm] = useState({
    category: "",
    name: "",
    relation: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    idType: "",
    idNumber: "",
    address: {
      "ग्राम/मोहल्ला": "",
      "तहसील ": "",
      "विकासखण्ड/नगर निकाय": "",
      "जनपद": "",
      "पिन कोड": "",
    },
  });
  const [errors, setErrors] = useState({});
  const [showSendOtp, setShowSendOtp] = useState(false);
  const [showVerifyOtp, setShowVerifyOtp] = useState(false);
  const [otpMobile, setOtpMobile] = useState("");
  const [districts, setDistricts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);
  const [childDob, setChildDob] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eligibilityMessage, setEligibilityMessage] = useState("");
  const [eligibilityStatus, setEligibilityStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneCheckError, setPhoneCheckError] = useState("");
  const [phoneRegistered, setPhoneRegistered] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const idTypeRef = React.useRef(form.idType);
  const phoneCheckTimerRef = useRef(null);

  useEffect(() => {
    idTypeRef.current = form.idType;
  }, [form.idType]);

  useEffect(() => {
    return () => {
      if (phoneCheckTimerRef.current) clearTimeout(phoneCheckTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phoneCheckTimerRef.current) clearTimeout(phoneCheckTimerRef.current);
    const mobile = form.mobile.trim();
    if (!/^[0-9]{10}$/.test(mobile)) {
      setPhoneCheckError("");
      setPhoneRegistered(false);
      return;
    }
    phoneCheckTimerRef.current = setTimeout(async () => {
      setCheckingPhone(true);
      setPhoneCheckError("");
      try {
        const response = await fetch(`https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/check-phone/?phone=${encodeURIComponent(mobile)}`);
        const data = await response.json();
        if (data.success && data.registered) {
          setPhoneCheckError(data.message || "फ़ोन नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।");
          setPhoneRegistered(true);
        } else {
          setPhoneCheckError("");
          setPhoneRegistered(false);
        }
      } catch (err) {
        setPhoneCheckError("");
        setPhoneRegistered(false);
      } finally {
        setCheckingPhone(false);
      }
    }, 600);
  }, [form.mobile]);

  /* ---------- जनपद (District) list from API ---------- */
  useEffect(() => {
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const response = await fetch("https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/cdpo-dropdown/");
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setDistricts([...new Set(result.data.map((item) => item.district).filter(Boolean))]);
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, []);

  /* ---------- विकासखण्ड (Project) list — जनपद के अनुसार ---------- */
  const fetchProjects = async (district) => {
    if (!district) {
      setProjects([]);
      return;
    }
    setLoadingProjects(true);
    setProjects([]); // old list clear
    try {
      const response = await fetch(
        `https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/cdpo-dropdown/?district=${encodeURIComponent(district)}`
      );
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setProjects([...new Set(result.data.map((item) => item.project_name).filter(Boolean))]);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const update = (event) => {
    let { name, value } = event.target;
    let hadNumbers = false;

    if ((name === "name" || name === "relation") && /[0-9]/.test(value)) {
      hadNumbers = true;
      value = value.replace(/[0-9]/g, "");
    }

    if (name === "idNumber" && idTypeRef.current === "आधार कार्ड") {
      value = value.replace(/[^0-9]/g, "").slice(0, 12);
    }

    if (name.startsWith("address.")) {
      const fieldName = name.slice(8);
      setForm((current) => {
        const nextAddress = { ...current.address, [fieldName]: value };
        // जनपद बदलने पर विकासखण्ड रीसेट करें
        if (fieldName === "जनपद") {
          nextAddress["विकासखण्ड/नगर निकाय"] = "";
        }
        return { ...current, address: nextAddress };
      });
      if (fieldName === "जनपद") {
        fetchProjects(value);
      }
    } else {
      setForm((current) => {
        const next = { ...current, [name]: value };
        if (name === "category") {
          if (value === "स्वयं बालक / बालिका") {
            next.relation = "स्वयं";
          } else if (value === "माता" || value === "पिता") {
            next.relation = value;
          } else {
            next.relation = "";
          }
        }
        return next;
      });
    }

    setErrors((current) => {
      const next = { ...current, [name]: "" };
      if (name === "category") {
        next.relation = "";
      }
      if (hadNumbers) {
        next[name] = "केवल अक्षर दर्ज करें, नंबर नहीं।";
      }
      if (name === "mobile" || name === "address.mobile") {
        // Re-enable the form as soon as the number is edited; the debounced
        // check above re-validates it once it is 10 digits again.
        if (name === "mobile") {
          setPhoneCheckError("");
          setPhoneRegistered(false);
        }
        if (!/^[0-9]{10}$/.test(value)) {
          next.mobile = value.length > 0 ? "मोबाइल नंबर 10 अंकों का होना चाहिए" : "";
        }
      }
      if (name === "email" || name === "address.email") {
        if (value && !/^\S+@\S+\.\S+$/.test(value)) {
          next.email = "कृपया मान्य ई-मेल आईडी दर्ज करें";
        }
      }
      if (name === "confirmPassword" && value && form.password && value !== form.password) {
        next.confirmPassword = "पासवर्ड और कन्फर्म पासवर्ड समान होना चाहिए";
      }
      if (name === "password") {
        const pwdIssues = validatePassword(value);
        if (pwdIssues.length > 0) {
          next.password = pwdIssues.join(", ");
        }
      }
      if (name === "idNumber" && idTypeRef.current === "आधार कार्ड") {
        const aadhaarValue = String(value || "").trim();
        if (aadhaarValue && !/^[0-9]{12}$/.test(aadhaarValue)) {
          next.idNumber = "आधार कार्ड संख्या 12 अंकों की होनी चाहिए";
        }
      }
      if (name === "idType" && value !== "आधार कार्ड") {
        next.idNumber = "";
      }
      return next;
    });
  };

  const submit = (event) => {
    event.preventDefault();

    if (isApplicationClosed) return;

    // A number that is already registered must never reach the OTP step.
    if (phoneRegistered) {
      setErrors((current) => ({
        ...current,
        mobile: phoneCheckError || "यह मोबाइल नंबर पहले से पंजीकृत है। कृपया दूसरा नंबर दर्ज करें।",
      }));
      return;
    }
    if (checkingPhone) return;

    const nextErrors = {};
    ["category", "name", "mobile", "password", "confirmPassword", "idType", "idNumber"].forEach((fieldName) => {
      if (!form[fieldName].trim()) nextErrors[fieldName] = "यह फ़ील्ड आवश्यक है";
    });
    if (form.category !== "माता" && form.category !== "पिता" && !form.relation.trim()) {
      nextErrors.relation = "यह फ़ील्ड आवश्यक है";
    }
    Object.keys(form.address).forEach((fieldName) => {
      if (!form.address[fieldName].trim()) nextErrors[`address.${fieldName}`] = "यह फ़ील्ड आवश्यक है";
    });
    if (!/^[0-9]{10}$/.test(form.mobile)) nextErrors.mobile = "मोबाइल नंबर 10 अंकों का होना चाहिए";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "कृपया मान्य ई-मेल आईडी दर्ज करें";
    if (form.address["पिन कोड"] && !/^[0-9]{6}$/.test(form.address["पिन कोड"])) {
      nextErrors["address.पिन कोड"] = "पिन कोड 6 अंकों का होना चाहिए";
    }
    if (form.password && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "पासवर्ड और कन्फर्म पासवर्ड समान होना चाहिए";
    }
    if (form.password && !nextErrors.password) {
      const pwdIssues = validatePassword(form.password);
      if (pwdIssues.length > 0) {
        nextErrors.password = pwdIssues.join(", ");
      }
    }
    if (form.idType === "आधार कार्ड" && form.idNumber && !/^[0-9]{12}$/.test(form.idNumber.trim())) {
      nextErrors.idNumber = "आधार कार्ड संख्या 12 अंकों की होनी चाहिए";
    }
     setErrors(nextErrors);
     if (!Object.keys(nextErrors).length) {
       const session = getOtpSession();
       if (session.sentAt && session.mobile === form.mobile) {
         console.info("[StudentRegistration] Resuming in-memory OTP verification");
         setOtpMobile(session.mobile);
         setShowVerifyOtp(true);
       } else {
         setOtpMobile(form.mobile);
         setShowSendOtp(true);
       }
     }
   };

  const handleOtpSuccess = async (res) => {
    setLoading(true);
    try {
      if (!res?.access) {
        throw new Error("OTP सत्यापन से access token प्राप्त नहीं हुआ।");
      }
      const idTypeMap = {
        "आधार कार्ड": "aadhaar",
        "पैन कार्ड": "pan",
        "ड्राइविंग लाइसेंस": "driving_license",
        "पहचान पत्र (फोटो के साथ)": "pehchan_patraw",
        "पासपोर्ट": "passport",
        "मतदाता पहचान पत्र": "voter_id",
      };

      const payload = {
        nominator_category: form.category,
        full_name: form.name,
        relat_with_child: form.relation,
        email: form.email,
        password: form.password,
        id_proof_type: idTypeMap[form.idType] || form.idType,
        id_proof_no: form.idNumber,
        village: form.address["ग्राम/मोहल्ला"],
        post_office: form.address["तहसील "],
        project: form.address["विकासखण्ड/नगर निकाय"],
        district: form.address["जनपद"],
        pincode: form.address["पिन कोड"],
        id_proof_type_other: null,
      };

      console.log("[StudentRegistration] Submitting payload:", payload);
      console.log("[StudentRegistration] Using token:", res?.access);

      await submitNominatorPart1(payload, res?.access);
      console.info("[StudentRegistration] OTP verified; registration submitted");
      navigate("/", { state: { registrationSuccess: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = () => {
    if (!childDob) {
      setEligibilityMessage("कृपया बच्चे की जन्म तिथि दर्ज करें।");
      setEligibilityStatus("error");
      return;
    }
    if (!eventDate) {
      setEligibilityMessage("कृपया वीरता की घटना की तारीख दर्ज करें।");
      setEligibilityStatus("error");
      return;
    }

    const dob = new Date(childDob);
    const event = new Date(eventDate);
    const eighteenthBirthday = new Date(dob);
    eighteenthBirthday.setFullYear(dob.getFullYear() + 18);

    if (event < eighteenthBirthday) {
      setEligibilityMessage("बच्चा पात्र है। घटना के समय उम्र 18 वर्ष से कम थी।");
      setEligibilityStatus("success");
    } else {
      setEligibilityMessage("बच्चा पात्र नहीं है। घटना के समय उम्र 18 वर्ष या उससे अधिक थी।");
      setEligibilityStatus("error");
    }
  };

  const field = (label, name, options = {}) => {
    const value = name.startsWith("address.") ? form.address[name.slice(8)] : form[name];

    /* Array हो तो हमेशा SELECT render होगा (खाली होने पर भी) */
    if (Array.isArray(options.options)) {
      return (
        <div className="sr-field">
          <label htmlFor={`sr-${name}`}>
            {label}
            {options.required && <span aria-hidden="true"> *</span>}
          </label>
          <select
            id={`sr-${name}`}
            name={name}
            value={value}
            onChange={update}
            aria-invalid={Boolean(errors[name])}
            disabled={options.disabled}
          >
            <option value="">{options.placeholder || "चयन करें"}</option>
            {options.options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors[name] && <span className="sr-error" role="alert">{errors[name]}</span>}
        </div>
      );
    }

    return (
      <div className="sr-field">
        <label htmlFor={`sr-${name}`}>
          {label}
          {options.required && <span aria-hidden="true"> *</span>}
        </label>
        <input
          id={`sr-${name}`}
          name={name}
          type={options.type || "text"}
          value={value}
          onChange={update}
          maxLength={options.maxLength}
          placeholder={options.placeholder}
          disabled={options.disabled}
          aria-invalid={Boolean(errors[name])}
        />
        {errors[name] && <span className="sr-error" role="alert">{errors[name]}</span>}
      </div>
    );
  };

  const selectedDistrict = form.address["जनपद"];

  return (
    <main className="sr-page">
      <header className="sr-header">
        <div className="sr-emblem" aria-hidden="true">उत्तराखण्ड<br /><small>सरकार</small></div>
        <div>
          <p className="sr-kicker">ऑनलाइन नामांकन प्रपत्र</p>
          <h1>मुख्यमंत्री राज्य बाल वीरता पुरस्कार</h1>
          <p>प्रथम स्क्रीन : नामांकनकर्ता का विवरण</p>
        </div>
      </header>

      <div className="sr-form-wrapper">
      <form className="sr-shell" onSubmit={submit} noValidate>
        <fieldset className="sr-form-fieldset" disabled={isApplicationClosed}>
        <section className="sr-card">
          <div className="sr-section-title">
            <span className="sr-badge-year">आवेदन वर्ष 2026-27</span>
            <div className="sr-section-center">
              <span className="sr-section-badge">भाग–A</span>
              <div>
                <h2>नामांकनकर्ता (Nominator) का विवरण</h2>
                <p>कृपया सभी आवश्यक जानकारी दर्ज करें</p>
              </div>
            </div>
          
          </div>

          {showEligibility && (
            <div className="sr-eligibility-box">
              <h4>बच्चे की पात्रता जांच</h4>
              <div className="sr-field">
                <label htmlFor="child-dob">बच्चे की जन्म तिथि</label>
                <input
                  id="child-dob"
                  type="date"
                  value={childDob}
                  onChange={(e) => setChildDob(e.target.value)}
                  max={today}
                />
              </div>
              <div className="sr-field">
                <label htmlFor="event-date">वीरता की घटना की तारीख</label>
                <input
                  id="event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  max={today}
                />
              </div>
              <button type="button" className="sr-eligibility-check-btn" onClick={checkEligibility}>
                जांचें
              </button>
              {eligibilityMessage && (
                <div className={`sr-eligibility-message ${eligibilityStatus}`}>
                  {eligibilityMessage}
                </div>
              )}
            </div>
          )}

          <div className="sr-grid">
            {field("1. नामांकनकर्ता की श्रेणी", "category", { required: true, options: nominatorCategories })}
            {field("2. नामांकनकर्ता का पूरा नाम", "name", { required: true, placeholder: "पूरा नाम दर्ज करें" })}
            {(() => {
              const isSelf = form.category === "स्वयं बालक / बालिका";
              const isParent = form.category === "माता" || form.category === "पिता";
              const relationOpts = {
                disabled: isSelf || isParent,
                placeholder: isSelf ? "स्वयं" : isParent ? "" : "संबंध दर्ज करें",
              };
              if (isSelf || !isParent) relationOpts.required = true;
              return field("3. बच्चे से संबंध", "relation", relationOpts);
            })()}
            {(() => {
              const mobileField = field("4. मोबाइल नंबर", "mobile", { required: true, type: "tel", maxLength: 10, placeholder: "10 अंकों का मोबाइल नंबर" });
              return (
                <div>
                  {mobileField}
                  {phoneCheckError && <span className="sr-error" role="alert">{phoneCheckError}</span>}
                  {checkingPhone && <span className="sr-error" role="alert" style={{ color: "#217193" }}>जांच रहे हैं...</span>}
                </div>
              );
            })()}
            {field("5. ई-मेल आईडी", "email", { type: "email", placeholder: "ई-मेल आईडी दर्ज करें" })}

            <div className="sr-field">
            <label htmlFor="sr-idType">6. <span aria-hidden="true">(नामांकनकर्ता)</span> पहचान पत्र का प्रकार <span aria-hidden="true"> *</span></label>
            <select
              id="sr-idType"
              name="idType"
              value={form.idType}
              onChange={update}
              aria-invalid={Boolean(errors.idType)}
            >
              <option value="">चयन करें</option>
              {idTypes.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.idType && <span className="sr-error" role="alert">{errors.idType}</span>}
          </div>

          <div className="sr-field">
            <label htmlFor="sr-idNumber">7. {form.idType ? `${form.idType} संख्या` : "पहचान पत्र संख्या"} <span aria-hidden="true"> *</span></label>
            <input
              id="sr-idNumber"
              name="idNumber"
              type="text"
              value={form.idNumber}
              onChange={update}
              maxLength={form.idType === "आधार कार्ड" ? 12 : undefined}
              placeholder="पहचान पत्र संख्या दर्ज करें"
              disabled={!form.idType}
              aria-invalid={Boolean(errors.idNumber)}
            />
              {errors.idNumber && <span className="sr-error" role="alert">{errors.idNumber}</span>}
            </div>
          </div>

          <fieldset className="sr-address">
            <legend>8. नामांकनकर्ता का पता <span aria-hidden="true">*</span></legend>
            <div className="sr-grid">
              {field("ग्राम/मोहल्ला/घर का पूरा पता", "address.ग्राम/मोहल्ला", { required: true, placeholder: "ग्राम/मोहल्ला/घर का पूरा पता" })}
              {field("तहसील ", "address.तहसील ", { required: true, placeholder: "तहसील  का नाम" })}

              {field("जनपद", "address.जनपद", {
                required: true,
                options: districts,
                placeholder: loadingDistricts ? "लोड हो रहा है..." : "जनपद चुनें",
                disabled: loadingDistricts,
              })}

              {field("विकासखण्ड/नगर निकाय", "address.विकासखण्ड/नगर निकाय", {
                required: true,
                options: projects,
                placeholder: !selectedDistrict
                  ? "पहले जनपद चुनें"
                  : loadingProjects
                  ? "लोड हो रहा है..."
                  : projects.length === 0
                  ? "कोई विकासखण्ड उपलब्ध नहीं"
                  : "विकासखण्ड/नगर निकाय चुनें",
                disabled: loadingProjects || !selectedDistrict || projects.length === 0,
              })}

              {field("पिन कोड", "address.पिन कोड", { required: true, type: "tel", maxLength: 6, placeholder: "6 अंकों का पिन कोड" })}
            </div>
          </fieldset>

          <div className="sr-grid">
            <div className="sr-field">
              <label htmlFor="sr-password">9. पासवर्ड <span aria-hidden="true"> * (कम से कम 8 अक्षर, एक बड़ा अक्षर और केवल अक्षर-संख्या)</span>
              </label>
              
              <div className="sr-input-wrap">
                <input
                  id="sr-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="पासवर्ड दर्ज करें"
                  value={form.password}
                  onChange={update}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  className="sr-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "पासवर्ड छिपाएं" : "पासवर्ड दिखाएं"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="sr-error" role="alert">{errors.password}</span>}
            </div>
            <div className="sr-field">
              <label htmlFor="sr-confirmPassword">10. पासवर्ड की पुष्टि करें <span aria-hidden="true"> *</span></label>
              <div className="sr-input-wrap">
                <input
                  id="sr-confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="पासवर्ड दोबारा दर्ज करें"
                  value={form.confirmPassword}
                  onChange={update}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
                <button
                  type="button"
                  className="sr-password-toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "पासवर्ड छिपाएं" : "पासवर्ड दिखाएं"}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <span className="sr-error" role="alert">{errors.confirmPassword}</span>}
            </div>
          </div>
        </section>

        {error && (
          <div className="sr-error" role="alert" style={{ textAlign: "center", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <div className="sr-actions">
          <button className="sr-primary" type="submit" disabled={loading || phoneRegistered || checkingPhone || isApplicationClosed}>
            {loading ? "पंजीकरण हो रहा है..." : phoneRegistered ? "पहले से पंजीकृत नंबर" : checkingPhone ? "जांच हो रही है..." : isApplicationClosed ? "आवेदन बंद" : "रजिस्टर करें"}
          </button>
        </div>
        </fieldset>

      </form>
      {isApplicationClosed && (
        <div className="application-closed-overlay" role="alert">
          <h3 className="application-closed-title">आवेदन बंद हो गए हैं</h3>
          <p className="application-closed-text">{APPLICATION_CLOSED_MESSAGE}</p>
        </div>
      )}
      </div>

      <SendOTP
        show={showSendOtp}
        onClose={() => setShowSendOtp(false)}
        defaultMobile={form.mobile}
        onSuccess={(mobile) => {
          console.info("[StudentRegistration] OTP sent; opening verify modal");
          setOtpMobile(mobile);
          setShowSendOtp(false);
          setShowVerifyOtp(true);
        }}
      />
      <VerifyOTP
        show={showVerifyOtp}
        onClose={() => setShowVerifyOtp(false)}
        mobile={otpMobile}
        onSuccess={handleOtpSuccess}
      />
    </main>
  );
};

export default StudentRegistration;