import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StepB from "./StepB.jsx";
import StepC from "./StepC.jsx";
import StepD from "./StepD.jsx";
import StepE from "./StepE.jsx";
import StepF from "./StepF.jsx";
import PreviewModal from "./PreviewModal.jsx";
import "./NominationForm.css";

const steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];
const requiredByStep = {
   0: ["childName", "fatherName", "motherName", "birthDate", "gender", "resident"],
   1: ["actTitle", "actDate", "actPlace", "actDistrict", "shortDescription", "firRegistered", "mediaPublished"],
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

const NominationForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ ...(state?.nominator || {}), applicationNumber: "System Generated", submissionDate: "System Generated", district: state?.nominator?.address?.जनपद || "" });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isApplicationCompleted, setIsApplicationCompleted] = useState(false);
  const [topAccepted, setTopAccepted] = useState(Boolean(data.topAccepted));

  // ★ FIX: Track per-step completion with STATE (not just refs) so stepper is accurate
  const [stepCompleted, setStepCompleted] = useState([false, false, false, false, false]);

  const stepBCheckedRef = useRef(false);
  const [stepCSubmitTrigger, setStepCSubmitTrigger] = useState(0);
  const stepCCheckedRef = useRef(false);
  const [stepESubmitTrigger, setStepESubmitTrigger] = useState(0);
  const stepECheckedRef = useRef(false);
  const [stepDSubmitTrigger, setStepDSubmitTrigger] = useState(0);
  const stepDCheckedRef = useRef(false);

  const markStepComplete = (stepIndex) => {
    setStepCompleted((prev) => {
      const next = [...prev];
      next[stepIndex] = true;
      return next;
    });
  };

  const handleStepBComplete = (record) => {
    if (!stepBCheckedRef.current) {
      stepBCheckedRef.current = true;
      markStepComplete(0);
      setStep(1);
    }
  };

  const handleStepCSubmitSuccess = () => {
    stepCCheckedRef.current = true;
    markStepComplete(1);
    setNotice("Step 2 सफलतापूर्वक सबमिट हो गया!");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepCAlreadyCompleted = () => {
    stepCCheckedRef.current = true;
    markStepComplete(1);
    setNotice("Step 2 पहले ही सबमिट हो चुका है, Step 3 पर जा रहे हैं...");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepESubmitSuccess = () => {
    stepECheckedRef.current = true;
    markStepComplete(2);
    setNotice("Step 3 सफलतापूर्वक सबमिट हो गया!");
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepEAlreadyCompleted = () => {
    stepECheckedRef.current = true;
    markStepComplete(2);
    setNotice("Step 3 पहले ही सबमिट हो चुका है, Step 4 पर जा रहे हैं...");
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepDSubmitSuccess = () => {
    stepDCheckedRef.current = true;
    markStepComplete(3);
    setNotice("Step 4 सफलतापूर्वक सबमिट हो गया!");
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepDAlreadyCompleted = () => {
    stepDCheckedRef.current = true;
    markStepComplete(3);
    setNotice("Step 4 पहले ही सबमिट हो चुका है, Step 5 पर जा रहे हैं...");
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplicationCompleted = () => {
    markStepComplete(4);
    setIsApplicationCompleted(true);
  };

  const update = (event) => {
    const { name, value, type, checked, files } = event.target;
    setData((current) => {
      const nextData = { ...current, [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value };
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        Object.keys(nextErrors).filter((key) => key.startsWith("rescuedPeople.") || key.startsWith("witnesses.")).forEach((key) => delete nextErrors[key]);
        delete nextErrors[name];
        return { ...nextErrors, ...getTableErrors(nextData) };
      });
      return nextData;
    });
  };

  const validate = (targetStep) => {
    const nextErrors = {};
    (requiredByStep[targetStep] || []).forEach((field) => { if (!String(data[field] || "").trim()) nextErrors[field] = "यह फ़ील्ड अनिवार्य है"; });
    if (targetStep === 1) {
      const validateRows = (rows, group, fields) => {
        (rows || []).forEach((row, index) => {
          if (fields.some((field) => String(row?.[field] || "").trim())) {
            fields.forEach((field) => {
              if (!String(row?.[field] || "").trim()) nextErrors[`${group}.${index}.${field}`] = "यह फ़ील्ड अनिवार्य है";
            });
          }
        });
      };
      validateRows(data.rescuedDetails?.people, "rescuedPeople", ["name", "age", "relation"]);
      validateRows(data.witnesses, "witnesses", ["name", "mobile", "address", "relation"]);
    }
    if (targetStep === 3) ["document0", "document1", "document2", "document3"].forEach((field) => { if (!data[field]) nextErrors[field] = "यह दस्तावेज़ अनिवार्य है"; });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => {
        const firstKey = Object.keys(nextErrors)[0];
        let el = document.getElementById(`nf-${firstKey}`);
        if (!el) {
          const match = firstKey.match(/^(rescuedPeople|witnesses)\.(\d+)\.(.+)$/);
          if (match) {
            el = document.getElementById(`nf-${match[1]}-${match[2]}-${match[3]}`);
          }
        }
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return false;
    }
    return true;
  };

  const next = () => {
    if (isApplicationCompleted) return;
    if (step === 1) {
      setStepCSubmitTrigger((prev) => prev + 1);
      return;
    }
    if (step === 2) {
      setStepESubmitTrigger((prev) => prev + 1);
      return;
    }
    if (step === 3) {
      setStepDSubmitTrigger((prev) => prev + 1);
      return;
    }
    if (validate(step)) {
      markStepComplete(step);
      setStep((current) => Math.min(current + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const previous = () => {
    if (isApplicationCompleted) return;
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const saveDraft = () => { localStorage.setItem("bal-veerata-nomination-draft", JSON.stringify({ ...data, savedAt: new Date().toISOString() })); setNotice("आवेदन ड्राफ्ट के रूप में सुरक्षित किया गया है।"); };
  const preview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);
  const finalSubmit = () => { if (data.declarationAccepted && data.parentDeclarationAccepted && data.declarationDocument && data.parentDeclarationDocument && topAccepted) setNotice("आवेदन सफलतापूर्वक प्रस्तुत किया गया।"); };
  const canSubmit = Boolean(data.declarationAccepted && data.parentDeclarationAccepted && data.declarationDocument && data.parentDeclarationDocument && topAccepted);

  const component = [
    <StepB data={data} update={update} error={errors} onCompleted={handleStepBComplete} isStepBChecked={stepBCheckedRef.current} onNext={next} onErrorsChange={setErrors} />,
    <StepC data={data} update={update} error={errors} onSubmitSuccess={handleStepCSubmitSuccess} onCompleted={handleStepCAlreadyCompleted} isStepCChecked={stepCCheckedRef.current} externalSubmitTrigger={stepCSubmitTrigger} onErrorsChange={setErrors} />,
    <StepE data={data} update={update} onSubmitSuccess={handleStepESubmitSuccess} onCompleted={handleStepEAlreadyCompleted} isStepEChecked={stepECheckedRef.current} externalSubmitTrigger={stepESubmitTrigger} />,
    <StepD data={data} update={update} error={errors} onSubmitSuccess={handleStepDSubmitSuccess} onCompleted={handleStepDAlreadyCompleted} isStepDChecked={stepDCheckedRef.current} externalSubmitTrigger={stepDSubmitTrigger} onErrorsChange={setErrors} />,
    <StepF data={data} update={update} onSave={saveDraft} onPreview={preview} onSubmit={finalSubmit} canSubmit={canSubmit} topAccepted={topAccepted} onApplicationCompleted={handleApplicationCompleted} />
  ][step];

  // ★ FIX: Stepper now uses stepCompleted state instead of blind `index < step`
  return (
    <main className="nf-page">
      <header className="nf-header">
        <div className="nf-brand-mark">उत्तराखण्ड<br /><small>सरकार</small></div>
        <div>
          <p>ऑनलाइन नामांकन प्रपत्र</p>
          <h1>मुख्यमंत्री राज्य बाल वीरता पुरस्कार</h1>
        </div>
        <button type="button" className="nf-back" onClick={() => navigate("/StudentRegistration")} disabled={isApplicationCompleted}>भाग–A</button>
      </header>
      <div className="nf-shell">
        <nav className="nf-stepper" aria-label="Application steps">
          {steps.map((label, index) => (
            <div
              className={`nf-step ${index === step ? "current" : ""} ${stepCompleted[index] ? "complete" : ""}`}
              key={label}
            >
              <span>{stepCompleted[index] ? "✓" : index + 1}</span>
              <strong>Step {index + 1}</strong>
              <small>{label}</small>
            </div>
          ))}
        </nav>
        {notice && <div className="nf-notice" role="status">{notice}</div>}
        <form onSubmit={(event) => { event.preventDefault(); if (step < 4) next(); }} noValidate>
          <fieldset disabled={isApplicationCompleted && step !== 4} style={{ border: 0, padding: 0, margin: 0 }}>
            {component}
            <div className="nf-navigation">
              {step > 0 && !isApplicationCompleted && <button type="button" className="nf-secondary" onClick={previous}>← Previous / पिछला</button>}
              {step < 4 && !isApplicationCompleted && <button type="submit" className="nf-primary">Next / आगे बढ़ें →</button>}
            </div>
          </fieldset>
        </form>
      </div>
      {showPreview && <PreviewModal data={data} onClose={closePreview} topAccepted={topAccepted} onTopAcceptedChange={setTopAccepted} isApplicationCompleted={isApplicationCompleted} />}
    </main>
  );
};
export default NominationForm;