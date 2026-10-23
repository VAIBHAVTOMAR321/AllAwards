import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../login/AuthContext";

import UserTopNav from "./UserTopNav";
import UserLeftNav from "./UserLeftNav";
import "../../../child_regis/NominationForm/NominationForm.css";
import StepB from "../../../child_regis/NominationForm/StepB";
import StepF from "../../../child_regis/NominationForm/StepF";
import StepE from "../../../child_regis/NominationForm/StepE";
import StepD from "../../../child_regis/NominationForm/StepD";
import StepC from "../../../child_regis/NominationForm/StepC";
import PreviewModal from "../../../child_regis/NominationForm/PreviewModal";

const steps = [
  { letter: "A", title: "नामांकित बच्चे का व्यक्तिगत विवरण", subtitle: "Nominee Details" },
  { letter: "B", title: "वीरता की घटना का विवरण",             subtitle: "Bravery Act Details" },
  { letter: "C", title: "अतिरिक्त जानकारी",                    subtitle: "Additional Information" },
  { letter: "D", title: "आवश्यक अभिलेख अपलोड",                subtitle: "Document Upload" },
  { letter: "E", title: "घोषणा एवं सहमति",                     subtitle: "Declaration" },
];

const requiredByStep = {
  0: [
    "childName", "fatherName", "motherName", "birthDate",
    "gender", "resident",
    "permanentग्राम/मोहल्ला", "permanentतहसील ",
    "permanentविकासखण्ड/नगर निकाय", "permanentजनपद", "permanentपिन कोड",
  ],
  1: [
    "actTitle", "actDate", "actPlace", "actDistrict",
    "actNature", "shortDescription", "detailedDescription", "firRegistered", "mediaPublished",
  ],
   3: ["document0", "document1", "document2", "document3"],
};

const getTableErrors = (formData) => {
  const nextErrors = {};
  const validateRows = (rows, group, fields) => {
    (rows || []).forEach((row, index) => {
      if (fields.some((field) => String(row?.[field] || "").trim())) {
        fields.forEach((field) => {
          if (!String(row?.[field] || "").trim()) nextErrors[`${group}.${index}.${field}`] = "यह फ़ील्ड आवश्यक है";
        });
      }
    });
  };
  validateRows(formData.rescuedDetails?.people, "rescuedPeople", ["name", "age", "relation"]);
  validateRows(formData.witnesses, "witnesses", ["name", "mobile", "address", "relation"]);
  return nextErrors;
};

const UserDashBoard = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { authFetch } = useAuth();
  const [nominator, setNominator] = useState(state?.nominator || null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    ...(state?.nominator || {}),
    applicationNumber: "System Generated",
    submissionDate: "System Generated",
    district: state?.nominator?.address?.जनपद || "",
  });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [topAccepted, setTopAccepted] = useState(false);
  const [isApplicationCompleted, setIsApplicationCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [maxStep, setMaxStep] = useState(0);
  const stepBCheckedRef = useRef(false);
  const stepCCheckedRef = useRef(false);
  const [stepCSubmitTrigger, setStepCSubmitTrigger] = useState(0);
  const stepDCheckedRef = useRef(false);
  const [stepDSubmitTrigger, setStepDSubmitTrigger] = useState(0);
  const stepECheckedRef = useRef(false);
  const [stepESubmitTrigger, setStepESubmitTrigger] = useState(0);
  const authFetchRef = useRef(authFetch);
  authFetchRef.current = authFetch;

  useEffect(() => {
    let isActive = true;
    const fetchNominator = async () => {
      try {
        const response = await authFetchRef.current(
          "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part1/",
        );
        if (!response.ok) {
          throw new Error(`Failed to load registration details (HTTP ${response.status}).`);
        }

        const result = await response.json();
        const record = Array.isArray(result.data) ? result.data[0] : result.data;
        if (isActive && record && typeof record === "object") {
          setNominator(record);
        }
      } catch (error) {
        if (isActive) {
          console.error("Failed to load registration details for preview:", error);
        }
      }
    };

    fetchNominator();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      if (width < 768) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const markStepCompleted = useCallback((stepIndex) => {
    setCompletedSteps((prev) => (prev.includes(stepIndex) ? prev : [...prev, stepIndex]));
  }, []);

  useEffect(() => {
    setMaxStep((prev) => Math.max(prev, step));
  }, [step]);

  const isStepCompleted = useCallback((stepIndex) => {
    return completedSteps.includes(stepIndex);
  }, [completedSteps]);

  const goToStep = useCallback((stepIndex) => {
    if (isApplicationCompleted) return;
    if (isStepCompleted(stepIndex) || stepIndex <= maxStep) {
      setStep(stepIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isStepCompleted, maxStep, isApplicationCompleted]);

  const update = useCallback((event) => {
    const { name, value, type, checked, files } = event.target;
    setData((current) => {
      const nextData = {
        ...current,
        [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
      };
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        Object.keys(nextErrors)
          .filter((key) => key.startsWith("rescuedPeople.") || key.startsWith("witnesses."))
          .forEach((key) => delete nextErrors[key]);
        delete nextErrors[name];
        return { ...nextErrors, ...getTableErrors(nextData) };
      });
      return nextData;
    });
  }, []);

  const validate = (targetStep) => {
    const nextErrors = {};
    (requiredByStep[targetStep] || []).forEach((field) => {
      if (!String(data[field] || "").trim()) nextErrors[field] = "यह फ़ील्ड आवश्यक है";
    });
    if (targetStep === 1) {
      const validateRows = (rows, group, fields) => {
        (rows || []).forEach((row, index) => {
          if (fields.some((field) => String(row?.[field] || "").trim())) {
            fields.forEach((field) => {
              if (!String(row?.[field] || "").trim())
                nextErrors[`${group}.${index}.${field}`] = "यह फ़ील्ड आवश्यक है";
            });
          }
        });
      };
      validateRows(data.rescuedDetails?.people, "rescuedPeople", ["name", "age", "relation"]);
      validateRows(data.witnesses, "witnesses", ["name", "mobile", "address", "relation"]);
    }
    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const next = () => {
    if (isApplicationCompleted) return;
    // Step 2 = अतिरिक्त जानकारी (StepE) → trigger its submit
    if (step === 2) {
      setStepESubmitTrigger((current) => current + 1);
      return;
    }
    // Step 3 = आवश्यक अभिलेख अपलोड (StepD) → trigger its submit
    if (step === 3) {
      setStepDSubmitTrigger((current) => current + 1);
      return;
    }
    if (validate(step)) {
      setStep((current) => Math.min(current + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const previous = () => {
    if (isApplicationCompleted) return;
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveDraft = () => {
    localStorage.setItem(
      "bal-veerata-nomination-draft",
      JSON.stringify({ ...data, savedAt: new Date().toISOString() })
    );
    setNotice("आवेदन ड्राफ्ट के रूप में सुरक्षित किया गया है।");
  };

  const preview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  const finalSubmit = () => {
    if (
      data.declarationAccepted &&
      data.parentDeclarationAccepted &&
      data.declarationDocument &&
      data.parentDeclarationDocument &&
      topAccepted
    )
      setNotice("आवेदन सफलतापूर्वक प्रस्तुत किया गया है।");
  };

  const canSubmit = Boolean(
    data.declarationAccepted &&
      data.parentDeclarationAccepted &&
      data.declarationDocument &&
      data.parentDeclarationDocument &&
      topAccepted
  );

  /* ═══════════════════════════════════════════
     Step 1 — नामांकित बच्चे का व्यक्तिगत विवरण (StepB)
     ═══════════════════════════════════════════ */
  const handleStepBNext = (result) => {
    stepBCheckedRef.current = true;
    markStepCompleted(0);
    setNotice("Step 1 सफलतापूर्वक सबमिट हो गया!");
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepBAlreadyCompleted = (record) => {
    stepBCheckedRef.current = true;
    markStepCompleted(0);
    setNotice("Step 1 पहले ही पूरा हो चुका है, Step 2 पर जा रहे हैं...");
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ═══════════════════════════════════════════
     Step 2 — वीरता की घटना का विवरण (StepC)
     ═══════════════════════════════════════════ */
  const handleStepCSubmitSuccess = () => {
    stepCCheckedRef.current = true;
    markStepCompleted(1);
    setNotice("Step 2 सफलतापूर्वक सबमिट हो गया!");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepCAlreadyCompleted = () => {
    stepCCheckedRef.current = true;
    markStepCompleted(1);
    setNotice("Step 2 पहले ही सबमिट हो चुका है, Step 3 पर जा रहे हैं...");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ═══════════════════════════════════════════
     Step 3 — अतिरिक्त जानकारी (StepE)
     ═══════════════════════════════════════════ */
  const handleStepDSubmitSuccess = () => {
    stepDCheckedRef.current = true;
    markStepCompleted(3);
    setNotice("Step 4 सफलतापूर्वक सबमिट हो गया!");
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepDAlreadyCompleted = (record) => {
    stepDCheckedRef.current = true;
    markStepCompleted(3);
    setNotice("Step 4 पहले ही पूरा हो चुका है, Step 5 पर जा रहे हैं...");
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ═══════════════════════════════════════════
     Step 4 — आवश्यक अभिलेख अपलोड (StepD)
     ═══════════════════════════════════════════ */
  const handleStepESubmitSuccess = () => {
    stepECheckedRef.current = true;
    markStepCompleted(2);
    setNotice("Step 3 सफलतापूर्वक सबमिट हो गया!");
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepEAlreadyCompleted = () => {
    stepECheckedRef.current = true;
    markStepCompleted(2);
    setNotice("Step 3 पहले ही सबमिट हो चुका है, Step 4 पर जा रहे हैं...");
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ═══════════════════════════════════════════
     Step 5 — घोषणा एवं सहमति (StepF)
     ═══════════════════════════════════════════ */
  const handleApplicationCompleted = () => {
    setIsApplicationCompleted(true);
    markStepCompleted(4);
  };

  /* ═══════════════════════════════════════════
     Component mapping — NEW ORDER
     ═══════════════════════════════════════════ */
  const component = [
    /* Step 1 → नामांकित बच्चे का व्यक्तिगत विवरण */
    <StepB
      key="step-b"
      data={data}
      update={update}
      error={errors}
      onNext={handleStepBNext}
      onCompleted={handleStepBAlreadyCompleted}
      isStepBChecked={stepBCheckedRef.current}
    />,
    /* Step 2 → वीरता की घटना का विवरण */
    <StepC
      key="step-c"
      data={data}
      update={update}
      error={errors}
      onSubmitSuccess={handleStepCSubmitSuccess}
      onCompleted={handleStepCAlreadyCompleted}
      isStepCChecked={stepCCheckedRef.current}
      externalSubmitTrigger={stepCSubmitTrigger}
    />,
    /* Step 3 → अतिरिक्त जानकारी */
    <StepE
      key="step-e"
      data={data}
      update={update}
      error={errors}
      onSubmitSuccess={handleStepESubmitSuccess}
      onCompleted={handleStepEAlreadyCompleted}
      isStepEChecked={stepECheckedRef.current}
      externalSubmitTrigger={stepESubmitTrigger}
    />,
    /* Step 4 → आवश्यक अभिलेख अपलोड */
    <StepD
      key="step-d"
      data={data}
      update={update}
      error={errors}
      onSubmitSuccess={handleStepDSubmitSuccess}
      onCompleted={handleStepDAlreadyCompleted}
      isStepDChecked={stepDCheckedRef.current}
      externalSubmitTrigger={stepDSubmitTrigger}
    />,
    /* Step 5 → घोषणा एवं सहमति */
    <StepF
      key="step-f"
      data={data}
      update={update}
      onSave={saveDraft}
      onPreview={preview}
      onSubmit={finalSubmit}
      canSubmit={canSubmit}
      topAccepted={topAccepted}
      onApplicationCompleted={handleApplicationCompleted}
    />,
  ][step];

  return (
    <div className="dashboard-container">
      <UserLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="main-content-dash">
        <UserTopNav toggleSidebar={toggleSidebar} />

        <div className="nf-wrapper">
          {/* ── Form Header ── */}
          <header className="nf-header">
            <div className="nf-brand-mark">
              उत्तराखण्ड<br />
              <small>सरकार</small>
            </div>
            <div className="nf-header-text">
              <p className="nf-kicker">ऑनलाइन नामांकन प्रपत्र</p>
              <h1>मुख्यमंत्री राज्य बाल वीरता पुरस्कार</h1>
              <p className="nf-subtitle">
                Step {step + 1} (चरण {steps[step]?.letter}) : {steps[step]?.title}{" "}
                <span className="nf-subtitle-en">— {steps[step]?.subtitle}</span>
              </p>
            </div>
          </header>

          {/* ── Stepper ── */}
          <nav className="nf-stepper" aria-label="Application steps">
            {steps.map((s, index) => {
              const completed = isStepCompleted(index);
              const isCurrent = index === step;
              const clickable = !isApplicationCompleted && (completed || index <= maxStep);

              return (
                <div
                  className={`nf-step ${isCurrent ? "current" : ""} ${completed ? "complete" : ""} ${
                    clickable ? "clickable" : ""
                  }`}
                  key={s.letter}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  aria-label={`Step ${index + 1} - चरण ${s.letter}: ${s.title}${completed ? " - पूर्ण" : ""}${isCurrent ? " - वर्तमान" : ""}`}
                  onClick={() => goToStep(index)}
                  onKeyDown={(e) => {
                    if (clickable && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      goToStep(index);
                    }
                  }}
                  style={clickable ? { cursor: "pointer" } : undefined}
                >
                  <span className="nf-step-number">
                    {completed && !isCurrent ? "✓" : index + 1}
                  </span>
                  <strong>Step {index + 1}</strong>
                  <small>{s.title}</small>
                </div>
              );
            })}
          </nav>

          {/* ── Notice ── */}
          {notice && (
            <div className="nf-notice" role="status">
              {notice}
              <button
                type="button"
                onClick={() => setNotice("")}
                style={{
                  marginLeft: "12px",
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* ── Form Body ── */}
          <form
            className="nf-form-body"
            onSubmit={(event) => {
              event.preventDefault();
              if (step === 1) {
                setStepCSubmitTrigger((current) => current + 1);
              } else {
                next();
              }
            }}
            noValidate
          >
            <fieldset
              disabled={isApplicationCompleted && step !== 4}
              style={{ border: 0, padding: 0, margin: 0 }}
            >
              {component}
            </fieldset>

            {step !== 0 && (
              <div className="nf-navigation">
                {step > 0 && !isApplicationCompleted && (
                  <button
                    type="button"
                    className="nf-secondary"
                    onClick={previous}
                    disabled={isApplicationCompleted}
                  >
                    ← Previous / पिछला
                  </button>
                )}
                {step < 4 && !isApplicationCompleted && (
                  <button type="submit" className="nf-primary">
                    Next / आगे बढ़ें →
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {showPreview && (
        <PreviewModal
          data={{ ...data, registration: nominator || data.registration }}
          onClose={closePreview}
          topAccepted={topAccepted}
          onTopAcceptedChange={setTopAccepted}
          isApplicationCompleted={isApplicationCompleted}
        />
      )}
    </div>
  );
};

export default UserDashBoard;