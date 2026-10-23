import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../login/AuthContext";
import { isUnderAgeAtIncident, UNDER_AGE_MESSAGE } from "./ageEligibility";

const INCIDENT_DATE_RANGE_START = "2024-10-11";
const INCIDENT_DATE_RANGE_END = "2026-10-11";

const natureOptions = ["किसी व्यक्ति के जीवन की रक्षा", "स्वयं के जीवन की रक्षा हेतु साहसिक कार्य", "आपदा/प्राकृतिक आपदा में साहसिक कार्य", "दुर्घटना में बचाव कार्य", "डूबते हुए व्यक्ति को बचाना", "आग/अग्निकांड में बचाव कार्य", "अपराध/आपराधिक घटना के दौरान साहसिक कार्य", "अन्य असाधारण साहसिक कार्य"];

const incidentTypeMap = {
  "किसी व्यक्ति के जीवन की रक्षा": "life_protection",
  "स्वयं के जीवन की रक्षा हेतु साहसिक कार्य": "self_life_protection",
  "आपदा/प्राकृतिक आपदा में साहसिक कार्य": "disaster_rescue",
  "दुर्घटना में बचाव कार्य": "accident_rescue",
  "डूबते हुए व्यक्ति को बचाना": "drowning_rescue",
  "आग/अग्निकांड में बचाव कार्य": "fire_rescue",
  "अपराध/आपराधिक घटना के दौरान साहसिक कार्य": "crime_rescue",
  "अन्य असाधारण साहसिक कार्य": "other",
};

const isPart3Submitted = (record) => {
  const status = String(record?.status || record?.submission_status || "").toLowerCase();
  return ["completed", "submitted"].includes(status) || record?.submitted === true || record?.is_submitted === true;
};

const firstValue = (record, ...keys) => keys.map((key) => record?.[key]).find((value) => value !== undefined && value !== null);
  const normalizePerson = (person) => {
    if (Array.isArray(person)) {
      if (person.length >= 4) {
        const [name, mobile, ageRaw, relation] = person;
        const ageStr = String(ageRaw || "");
        let ageYears = "", ageMonths = "", ageDays = "";
        if (ageStr) {
          if (ageStr.includes("/")) {
            const parts = ageStr.split("/");
            ageYears = parts[0] || "";
            ageMonths = parts[1] || "";
            ageDays = parts[2] || "";
          } else {
            ageYears = ageStr;
          }
        }
        return { name: name || "", mobile: String(mobile || "").replace(/[^0-9]/g, "").slice(0, 10), ageYears, ageMonths, ageDays, relation: relation || "" };
      }
      const [name, ageRaw, relation] = person;
      const ageStr = String(ageRaw || "");
      let ageYears = "", ageMonths = "", ageDays = "";
      if (ageStr) {
        if (ageStr.includes("/")) {
          const parts = ageStr.split("/");
          ageYears = parts[0] || "";
          ageMonths = parts[1] || "";
          ageDays = parts[2] || "";
        } else {
          ageYears = ageStr;
        }
      }
      return { name: name || "", ageYears, ageMonths, ageDays, relation: relation || "" };
    }
    const name = person?.name || "";
    const relation = person?.relation || "";
    const mobile = String(person?.mobile || "").replace(/[^0-9]/g, "").slice(0, 10);
    let ageYears = "", ageMonths = "", ageDays = "";
    if (person?.ageYears !== undefined) {
      ageYears = String(person.ageYears || "");
      ageMonths = String(person.ageMonths || "");
      ageDays = String(person.ageDays || "");
    } else if (person?.age !== undefined) {
      const ageStr = String(person.age || "");
      if (ageStr) {
        if (ageStr.includes("/")) {
          const parts = ageStr.split("/");
          ageYears = parts[0] || "";
          ageMonths = parts[1] || "";
          ageDays = parts[2] || "";
        } else {
          ageYears = ageStr;
        }
      }
    }
    return { name, mobile, ageYears, ageMonths, ageDays, relation };
  };
const normalizeWitness = (witness) => Array.isArray(witness)
  ? { name: witness[0] || "", mobile: witness[1] || "", address: witness[2] || "", relation: witness[3] || "" }
  : { name: witness?.name || "", mobile: witness?.mobile || "", address: witness?.address || "", relation: witness?.relation || "" };

const StepC = ({ data, update, error, onSubmitSuccess, onCompleted, isStepCChecked, externalSubmitTrigger, onErrorsChange }) => {
  const { authFetch } = useAuth();
  const [customTitleActive, setCustomTitleActive] = useState(false);
  const [customTitleText, setCustomTitleText] = useState("");
  const [customTitleError, setCustomTitleError] = useState("");
  const [rescuedPeople, setRescuedPeople] = useState(data.rescuedDetails?.people?.length ? data.rescuedDetails.people : [{ name: "", mobile: "", ageYears: "", ageMonths: "", ageDays: "", relation: "" }]);
  const [witnesses, setWitnesses] = useState(data.witnesses?.length ? data.witnesses : [{ name: "", mobile: "", address: "", relation: "" }]);
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [isOverAge, setIsOverAge] = useState(false);
  const [isUnderAge, setIsUnderAge] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState(null);
  const [localErrors, setLocalErrors] = useState({}); //   ADD LOCAL ERRORS STATE
  const customTitleRef = useRef(null);
  const fetchDistrictsRef = useRef(false);
  const dataFetchStarted = useRef(false);

  //  COMBINED ERRORS - merge parent errors with local errors
  const combinedErrors = { ...error, ...localErrors };

  const todayDate = new Date();
  const today = new Date(todayDate.getTime() - todayDate.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
  const minIncidentDate = INCIDENT_DATE_RANGE_START;
  const maxIncidentDate = today < INCIDENT_DATE_RANGE_END ? today : INCIDENT_DATE_RANGE_END;

  useEffect(() => {
    if (dataFetchStarted.current) return;
    dataFetchStarted.current = true;
    const fetchPart3Data = async () => {
      try {
        const response = await authFetch("https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part3/");
        if (!response.ok) return;
        const result = await response.json();
        const record = result.success && (Array.isArray(result.data) ? result.data[0] : result.data);
        if (!record) return;

        const fieldMapping = {
          actTitle: firstValue(record, "incident_title", "act_title", "bravery_act_title", "title"),
          actDate: firstValue(record, "incident_date", "act_date"),
          incidentAge: firstValue(record, "age_at_incident", "incident_age"),
          actTime: firstValue(record, "incident_time", "act_time"),
          actPlace: firstValue(record, "incident_location", "act_place"),
          actDistrict: firstValue(record, "incident_district", "act_district"),
          shortDescription: firstValue(record, "incident_description", "short_description"),
          rescuedCount: firstValue(record, "rescued_persons_description", "rescued_count"),
          firRegistered: firstValue(record, "fir_status", "fir_registered"),
          policeStation: firstValue(record, "police_station", "policeStation"),
          firNumber: firstValue(record, "fir_number", "firNumber"),
          firDate: firstValue(record, "fir_date", "firDate"),
          mediaPublished: firstValue(record, "media_report_available", "media_published"),
        };
        Object.entries(fieldMapping).forEach(([name, value]) => {
          if (value !== undefined && value !== null) update({ target: { name, value, type: "text" } });
        });
        const fetchedTitle = fieldMapping.actTitle || "";
        const isCustomTitle = fetchedTitle !== "" && !natureOptions.includes(fetchedTitle);
        setCustomTitleActive(isCustomTitle);
        if (isCustomTitle) {
          setCustomTitleText(fetchedTitle);
        } else {
          setCustomTitleText("");
        }
        const people = Array.isArray(record.rescued_persons) && record.rescued_persons.length
          ? record.rescued_persons.map(normalizePerson)
          : [{ name: "", age: "", relation: "" }];
        const witnessRows = Array.isArray(record.eyewitnesses) && record.eyewitnesses.length
          ? record.eyewitnesses.map(normalizeWitness)
          : [{ name: "", mobile: "", address: "", relation: "" }];
        setRescuedPeople(people);
        setWitnesses(witnessRows);
        update({ target: { name: "rescuedDetails", value: { ...(data.rescuedDetails || {}), people } } });
        update({ target: { name: "witnesses", value: witnessRows } });

        if (isPart3Submitted(record)) {
          setIsCompleted(true);
          if (!isStepCChecked && onCompleted) onCompleted(record);
        }
      } catch (fetchError) {
        console.error("Failed to fetch Step 2 data:", fetchError);
      } finally {
        setLoadingData(false);
      }
    };
    fetchPart3Data();
  }, [authFetch, data.rescuedDetails, isStepCChecked, onCompleted, update]);

  useEffect(() => {
    if (fetchDistrictsRef.current) return;
    fetchDistrictsRef.current = true;
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

  useEffect(() => {
    if (data.firRegistered && data.firRegistered !== "हाँ") {
      update({ target: { name: "policeStation", value: "", type: "text" } });
      update({ target: { name: "firNumber", value: "", type: "text" } });
      update({ target: { name: "firDate", value: "", type: "text" } });
    }
  }, [data.firRegistered, update]);

  useEffect(() => {
    if (data.actDate && data.birthDate) {
      const incident = new Date(data.actDate);
      const dob = new Date(data.birthDate);
      let years = incident.getFullYear() - dob.getFullYear();
      let months = incident.getMonth() - dob.getMonth();
      let days = incident.getDate() - dob.getDate();
      if (days < 0) {
        months--;
        const prevMonth = new Date(incident.getFullYear(), incident.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }
      const formatted = `${years} वर्ष ${months} महीने ${days} दिन`;
      update({ target: { name: "incidentAge", value: formatted } });
      const isOverAge = years > 18 || (years === 18 && (months > 0 || days > 0));
      setIsOverAge(isOverAge);
      setIsUnderAge(years < 6);
    } else {
      setIsOverAge(false);
      setIsUnderAge(false);
    }
  }, [data.actDate, data.birthDate, update]);

  useEffect(() => {
    if (isOverAge) {
      setLocalErrors((prev) => ({
        ...prev,
        incidentAge: "आप 18 वर्ष से अधिक आयु के कारण इस फॉर्म को भरने के लिए पात्र नहीं हैं।",
      }));
    } else if (isUnderAge) {
      setLocalErrors((prev) => ({
        ...prev,
        incidentAge: UNDER_AGE_MESSAGE,
      }));
    } else {
      setLocalErrors((prev) => {
        const next = { ...prev };
        delete next.incidentAge;
        return next;
      });
    }
  }, [isOverAge, isUnderAge]);

  useEffect(() => {
    if (alertInfo) {
      const timer = setTimeout(() => setAlertInfo(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo]);

  //   FIXED: Track previous trigger value to detect actual changes
  const prevTriggerRef = useRef(0);
  useEffect(() => {
    if (externalSubmitTrigger !== undefined && externalSubmitTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = externalSubmitTrigger;
      handleSubmit(true);
    }
  }, [externalSubmitTrigger]);

  const input = (label, name, options = {}) => {
    const value = data[name] || "";
    const isFormLocked = isCompleted && !isEditing;
    const wordCount = options.textarea ? value.trim().split(/\s+/).filter(Boolean).length : 0;
    const wordValidation = options.words || null;
    const isWordValid = wordValidation ? wordCount >= wordValidation.min && wordCount <= wordValidation.max : true;
    const showWordCount = wordValidation && value.trim().length > 0;
    //   USE combinedErrors instead of error
    const fieldError = combinedErrors[name];

    const inputProps = {
      id: `nf-${name}`,
      name,
      type: options.type || "text",
      value,
      onChange: update,
      disabled: isFormLocked || (options.alwaysEnabled ? false : (isOverAge || options.disabled)),
      className: fieldError ? "error-style" : "",
    };
    if (options.type === "date") {
      inputProps.min = options.min || "";
      inputProps.max = options.max || "";
    }

    return (
      <div className={`nf-field ${options.wide ? "nf-wide" : ""} ${options.fieldClassName || ""}`}>
        <label htmlFor={`nf-${name}`}>{label}{options.required && <span> *</span>}</label>
        {options.options ? (
          <select id={`nf-${name}`} name={name} value={value} onChange={update} disabled={isFormLocked || (options.alwaysEnabled ? false : (isOverAge || options.disabled))} className={fieldError ? "error-style" : ""}>
            <option value="">{options.placeholder || "चयन करें"}</option>
            {options.options.map((option) => <option key={option}>{option}</option>)}
          </select>
        ) : options.textarea ? (
          <textarea id={`nf-${name}`} name={name} value={value} onChange={update} rows={options.rows || 4} disabled={isFormLocked || isOverAge} className={fieldError ? "error-style" : ""} />
        ) : (
          <input {...inputProps} />
        )}
        {showWordCount && (
          <small className={`nf-word-count ${!isWordValid ? "nf-invalid" : ""}`}>
            {wordCount} शब्द {!isWordValid && `(कम से कम ${wordValidation.min} और अधिकतम ${wordValidation.max} शब्द आवश्यक)`}
          </small>
        )}
        {fieldError && <small className="nf-error">{fieldError}</small>}
      </div>
    );
  };

  const witnessFields = ["नाम", "मोबाइल नंबर", "पता", "बच्चे से संबंध"];
  const rescuedPeopleFields = ["name", "mobile", "ageYears", "ageMonths", "ageDays", "relation"];
  const witnessRowFields = ["name", "mobile", "address", "relation"];
  //   USE combinedErrors for row errors
  const rowError = (group, index, field) => combinedErrors[`${group}.${index}.${field}`];
  const isFormLocked = isCompleted && !isEditing;

  const syncPeople = (people) => {
    update({ target: { name: "rescuedDetails", value: { ...(data.rescuedDetails || {}), people } } });
  };

  const addPerson = () => {
    const next = [...rescuedPeople, { name: "", mobile: "", ageYears: "", ageMonths: "", ageDays: "", relation: "" }];
    setRescuedPeople(next);
    syncPeople(next);
  };

  const removePerson = (index) => {
    const next = rescuedPeople.filter((_, i) => i !== index);
    setRescuedPeople(next);
    syncPeople(next);
  };

  const updatePerson = (index, field, value) => {
    const next = rescuedPeople.map((person, i) => (i === index ? { ...person, [field]: field === "mobile" ? String(value).replace(/[^0-9]/g, "").slice(0, 10) : value } : person));
    setRescuedPeople(next);
    syncPeople(next);
    //   Clear error for this field on change
    setLocalErrors(prev => {
      const key = `rescuedPeople.${index}.${field}`;
      if (!prev[key]) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[key];
      return nextErrors;
    });
  };

  const syncWitnesses = (rows) => {
    const payload = {};
    rows.forEach((row, idx) => {
      witnessFields.forEach((field) => {
        payload[`witness${idx + 1}${field}`] = row[field];
      });
    });
    update({ target: { name: "witnesses", value: rows } });
    Object.entries(payload).forEach(([name, value]) => {
      update({ target: { name, value } });
    });
  };

  const addWitness = () => {
    const next = [...witnesses, { name: "", mobile: "", address: "", relation: "" }];
    setWitnesses(next);
    syncWitnesses(next);
  };

  const removeWitness = (index) => {
    const next = witnesses.filter((_, i) => i !== index);
    setWitnesses(next);
    syncWitnesses(next);
  };

  const updateWitness = (index, field, value) => {
    const next = witnesses.map((row, i) => (i === index ? { ...row, [field]: field === "mobile" ? String(value).replace(/[^0-9]/g, "").slice(0, 10) : value } : row));
    setWitnesses(next);
    syncWitnesses(next);
    //   Clear error for this field on change
    setLocalErrors(prev => {
      const key = `witnesses.${index}.${field}`;
      if (!prev[key]) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[key];
      return nextErrors;
    });
  };

  const normalizeTime = (time) => {
    if (!time) return "";
    if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
    return time;
  };

  const normalizeDate = (date) => {
    if (!date) return "";
    return date;
  };

  const buildPayload = () => {
    const applicantId = data.applicant_id || data.applicantId || localStorage.getItem("applicantId") || "";

    const actTitle = data.actTitle || "";
    const incidentType = customTitleActive
      ? "other"
      : (incidentTypeMap[actTitle] || "");

    const rescuedPersons = rescuedPeople
      .filter((person) => String(person.name || "").trim() !== "")
      .map((person) => {
        const ageParts = [person.ageYears, person.ageMonths, person.ageDays].filter((part) => part !== "" && part !== undefined);
        const ageStr = ageParts.length > 0 ? ageParts.join("/") : "";
        return [person.name, person.mobile || "", ageStr, person.relation || ""];
      });

   const eyewitnesses = witnesses
  .filter((witness) =>
    ["name", "mobile", "address", "relation"].some(
      (field) => String(witness?.[field] || "").trim() !== ""
    )
  )
  .map((witness) => [
    witness.name || "",
    witness.mobile || "",
    witness.address || "",
    witness.relation || "",
  ]);

    const payload = {
      applicant_id: applicantId,
      incident_title: actTitle,
      incident_type: incidentType,
      incident_date: data.actDate ? normalizeDate(data.actDate) : null,
      age_at_incident: data.incidentAge || "",
      incident_time: data.actTime ? normalizeTime(data.actTime) : null,
      incident_location: data.actPlace || "",
      incident_district: data.actDistrict || "",
      incident_description: data.shortDescription || "",
      rescued_persons_description: data.rescuedCount || "",
      rescued_persons: rescuedPersons.length ? rescuedPersons : null,
      eyewitnesses: eyewitnesses.length ? eyewitnesses : null,
      fir_status: data.firRegistered || "",
      police_station: data.policeStation || "",
      fir_number: data.firNumber || "",
      fir_date: data.firDate ? normalizeDate(data.firDate) : null,
      media_report_available: data.mediaPublished || "",
    };

    return payload;
  };

  const editableFields = ["actTitle", "actDate", "actTime", "actPlace", "actDistrict", "shortDescription", "rescuedCount", "firRegistered", "policeStation", "firNumber", "firDate", "mediaPublished"];

  const handleEdit = () => {
    setEditSnapshot({
      ...Object.fromEntries(editableFields.map((field) => [field, data[field] || ""])),
      rescuedPeople,
      witnesses,
      customTitleActive,
      customTitleText,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (editSnapshot) {
      Object.entries(editSnapshot).forEach(([name, value]) => {
        if (name === "customTitleActive") {
          setCustomTitleActive(value);
        } else if (name === "customTitleText") {
          setCustomTitleText(value || "");
        } else if (name !== "rescuedPeople" && name !== "witnesses") {
          update({ target: { name, value, type: "text" } });
        }
      });
      setRescuedPeople(editSnapshot.rescuedPeople);
      setWitnesses(editSnapshot.witnesses);
    }
    setIsEditing(false);
    setEditSnapshot(null);
    setAlertInfo(null);
  };

  const validateBeforeSubmit = () => {
    const errors = {};
    if (!data.actTitle || data.actTitle.trim() === "") {
      errors.actTitle = "यह फ़ील्ड अनिवार्य है";
    }
    if (!data.actDate) {
      errors.actDate = "यह फ़ील्ड अनिवार्य है";
    }
    if (!data.actPlace || data.actPlace.trim() === "") {
      errors.actPlace = "यह फ़ील्ड अनिवार्य है";
    }
    if (!data.actTime || data.actTime.trim() === "") {
      errors.actTime = "यह फ़ील्ड अनिवार्य है";
    } else if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(data.actTime)) {
      errors.actTime = "समय HH:MM:SS फॉर्मेट में होना चाहिए (24-Hours Minutes आधारित)";
    }
    if (!data.actDistrict) {
      errors.actDistrict = "यह फ़ील्ड अनिवार्य है";
    }
    if (!data.shortDescription || data.shortDescription.trim() === "") {
      errors.shortDescription = "यह फ़ील्ड अनिवार्य है";
    } else {
      const wc = data.shortDescription.trim().split(/\s+/).filter(Boolean).length;
      if (wc < 100 || wc > 300) {
        errors.shortDescription = "विवरण कम से कम 100 और अधिकतम 300 शब्दों में होना चाहिए।";
      }
    }
    if (!data.rescuedCount || data.rescuedCount.trim() === "") {
      errors.rescuedCount = "यह फ़ील्ड अनिवार्य है";
    } else {
      const wc = data.rescuedCount.trim().split(/\s+/).filter(Boolean).length;
      if (wc > 300) {
        errors.rescuedCount = "विवरण अधिकतम 300 शब्दों में होना चाहिए।";
      }
    }
    if (!data.firRegistered) {
      errors.firRegistered = "यह फ़ील्ड अनिवार्य है";
    }
    if (data.firRegistered === "हाँ") {
      if (!data.policeStation || data.policeStation.trim() === "") errors.policeStation = "यह फ़ील्ड अनिवार्य है";
      if (!data.firNumber || data.firNumber.trim() === "") errors.firNumber = "यह फ़ील्ड अनिवार्य है";
      if (!data.firDate) errors.firDate = "यह फ़ील्ड अनिवार्य है";
    }
    if (!data.mediaPublished) {
      errors.mediaPublished = "यह फ़ील्ड अनिवार्य है";
    }

    const validateRescuedRows = (rows) => {
      (rows || []).forEach((row, index) => {
        const name = String(row?.name || "").trim();
        const ageYears = String(row?.ageYears || "").trim();
        const mobile = String(row?.mobile || "").trim();
        if (name || ageYears) {
          if (!name) errors[`rescuedPeople.${index}.name`] = "यह फ़ील्ड अनिवार्य है";
          if (!ageYears) errors[`rescuedPeople.${index}.ageYears`] = "यह फ़ील्ड अनिवार्य है";
          if (String(row?.relation || "").trim() === "") errors[`rescuedPeople.${index}.relation`] = "यह फ़ील्ड अनिवार्य है";
          if (!mobile) errors[`rescuedPeople.${index}.mobile`] = "यह फ़ील्ड अनिवार्य है";
          else if (!/^\d{10}$/.test(mobile)) errors[`rescuedPeople.${index}.mobile`] = "मोबाइल नंबर 10 अंकों का होना चाहिए";
        }
      });
    };

    const validateWitnessRows = (rows) => {
      (rows || []).forEach((row, index) => {
        if (["name", "mobile", "address", "relation"].some((field) => String(row?.[field] || "").trim())) {
          ["name", "mobile", "address", "relation"].forEach((field) => {
            const value = String(row?.[field] || "").trim();
            if (!value) {
              errors[`witnesses.${index}.${field}`] = "यह फ़ील्ड अनिवार्य है";
            } else if (field === "mobile" && !/^\d{10}$/.test(value)) {
              errors[`witnesses.${index}.${field}`] = "मोबाइल नंबर 10 अंकों का होना चाहिए";
            }
          });
        }
      });
    };

    validateRescuedRows(data.rescuedDetails?.people);
    validateWitnessRows(data.witnesses);

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleSubmit = async (moveToNext = true) => {
    if (isCompleted && !isEditing) {
      onSubmitSuccess?.();
      return;
    }
    if (isOverAge) {
      setAlertInfo({ type: "error", message: "आयु 18 वर्ष से अधिक होने के कारण इस फॉर्म को सबमिट नहीं किया जा सकता।" });
      return;
    }
    if (isUnderAgeAtIncident(data.birthDate, data.actDate)) {
      setAlertInfo({ type: "error", message: UNDER_AGE_MESSAGE });
      return;
    }

    setAlertInfo(null);
    const validationErrors = validateBeforeSubmit();
    
    //   CRITICAL FIX: Always set local errors AND call onErrorsChange
    if (validationErrors) {
      console.log("[StepC] Validation errors:", validationErrors);
      setLocalErrors(validationErrors); //   Set local state immediately
      
      //   Also propagate to parent if callback exists
      if (onErrorsChange) {
        onErrorsChange(validationErrors);
      }
      
      //   Scroll to first error
      requestAnimationFrame(() => {
        const firstKey = Object.keys(validationErrors)[0];
        let el = document.getElementById(`nf-${firstKey}`);
        if (!el) {
          const match = firstKey.match(/^(rescuedPeople|witnesses)\.(\d+)\.(.+)$/);
          if (match) {
            el = document.getElementById(`nf-${match[1]}-${match[2]}-${match[3]}`);
          }
        }
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    //   Clear errors on successful validation
    setLocalErrors({});
    if (onErrorsChange) {
      onErrorsChange({});
    }

    const payload = buildPayload();

    if (!payload.applicant_id) {
      setAlertInfo({ type: "error", message: "आवेदक ID नहीं मिली। कृपया पहले Step 1 पूरा करें।" });
      return;
    }

    setSubmitting(true);
    setAlertInfo(null);

    try {
      console.log("[StepC] Submitting payload:", JSON.stringify(payload, null, 2));
      const response = await authFetch(
        "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part3/",
        {
          method: isCompleted && isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const errorMsg =
          (typeof result === "object"
            ? result.detail || result.message || result.error || JSON.stringify(result)
            : result) ||
          `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }

      if (result.success !== true) {
        const errorMsg =
          (typeof result === "object"
            ? result.detail || result.message || result.error || JSON.stringify(result)
            : result) ||
          "सबमिशन में त्रुटि हुई।";
        throw new Error(errorMsg);
      }

      const wasUpdate = isCompleted && isEditing;
      setAlertInfo({ type: "success", message: wasUpdate ? "Step 2 सफलतापूर्वक अपडेट हो गया! " : "Step 2 सफलतापूर्वक सबमिट हो गया!  " });
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (wasUpdate) {
        setIsCompleted(true);
        setIsEditing(false);
        setEditSnapshot(null);
      }
      if (moveToNext) onSubmitSuccess?.();
    } catch (err) {
      console.error("Submit error:", err);
      setAlertInfo({ type: "error", message: err.message || "सबमिशन में त्रुटि हुई। कृपया पुनः प्रयास करें।" });
    } finally {
      setSubmitting(false);
    }
  };

  const witnessRows = witnesses.map((row, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      {witnessFields.map((field, fieldIndex) => (
        <td key={field}>
          <input id={`nf-witnesses-${index}-${witnessRowFields[fieldIndex]}`} type="text" value={row[witnessRowFields[fieldIndex]] || ""} onChange={(e) => updateWitness(index, witnessRowFields[fieldIndex], e.target.value)} disabled={isFormLocked || isOverAge} className={rowError("witnesses", index, witnessRowFields[fieldIndex]) ? "error-style" : ""} />
          {rowError("witnesses", index, witnessRowFields[fieldIndex]) && <small className="nf-error">{rowError("witnesses", index, witnessRowFields[fieldIndex])}</small>}
        </td>
      ))}
      <td><button type="button" className="nf-remove" onClick={() => removeWitness(index)} disabled={isFormLocked || isOverAge}>हटाएं</button></td>
    </tr>
  ));

  const rescuedPeopleRows = rescuedPeople.map((person, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>
        <input
          id={`nf-rescuedPeople-${index}-name`}
          type="text"
          value={person.name || ""}
          onChange={(e) => updatePerson(index, "name", e.target.value)}
          disabled={isFormLocked || isOverAge}
          className={rowError("rescuedPeople", index, "name") ? "error-style" : ""}
        />
        {rowError("rescuedPeople", index, "name") && <small className="nf-error">{rowError("rescuedPeople", index, "name")}</small>}
      </td>
      <td>
        <input
          id={`nf-rescuedPeople-${index}-mobile`}
          type="text"
          value={person.mobile || ""}
          onChange={(e) => updatePerson(index, "mobile", e.target.value)}
          disabled={isFormLocked || isOverAge}
          className={rowError("rescuedPeople", index, "mobile") ? "error-style" : ""}
        />
        {rowError("rescuedPeople", index, "mobile") && <small className="nf-error">{rowError("rescuedPeople", index, "mobile")}</small>}
      </td>
      <td>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <small style={{ fontSize: "10px", color: "#536c7d", lineHeight: 1 }}>वर्ष</small>
            <input
              id={`nf-rescuedPeople-${index}-ageYears`}
              type="number"
              value={person.ageYears || ""}
              onChange={(e) => updatePerson(index, "ageYears", e.target.value)}
              disabled={isFormLocked || isOverAge}
              className={rowError("rescuedPeople", index, "ageYears") ? "error-style" : ""}
              style={{ width: "60px" }}
              min="0"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <small style={{ fontSize: "10px", color: "#536c7d", lineHeight: 1 }}>महीना</small>
            <input
              id={`nf-rescuedPeople-${index}-ageMonths`}
              type="number"
              value={person.ageMonths || ""}
              onChange={(e) => updatePerson(index, "ageMonths", e.target.value)}
              disabled={isFormLocked || isOverAge}
              style={{ width: "50px" }}
              min="0"
              max="11"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <small style={{ fontSize: "10px", color: "#536c7d", lineHeight: 1 }}>दिन</small>
            <input
              id={`nf-rescuedPeople-${index}-ageDays`}
              type="number"
              value={person.ageDays || ""}
              onChange={(e) => updatePerson(index, "ageDays", e.target.value)}
              disabled={isFormLocked || isOverAge}
              style={{ width: "50px" }}
              min="0"
              max="31"
            />
          </div>
        </div>
        {rowError("rescuedPeople", index, "ageYears") && <small className="nf-error">{rowError("rescuedPeople", index, "ageYears")}</small>}
      </td>
      <td>
        <input
          id={`nf-rescuedPeople-${index}-relation`}
          type="text"
          value={person.relation || ""}
          onChange={(e) => updatePerson(index, "relation", e.target.value)}
          disabled={isFormLocked || isOverAge}
          className={rowError("rescuedPeople", index, "relation") ? "error-style" : ""}
        />
        {rowError("rescuedPeople", index, "relation") && <small className="nf-error">{rowError("rescuedPeople", index, "relation")}</small>}
      </td>
      <td><button type="button" className="nf-remove" onClick={() => removePerson(index)} disabled={isFormLocked || isOverAge}>हटाएं</button></td>
    </tr>
  ));

  return (
    <section className="nf-card">
      {/* Alert Box */}
      {alertInfo && (
        <div
          className="nf-alert"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            borderRadius: "8px",
            border: alertInfo.type === "success"
              ? "1px solid #22c55e"
              : "1px solid #ef4444",
            backgroundColor: alertInfo.type === "success"
              ? "#f0fdf4"
              : "#fef2f2",
            color: alertInfo.type === "success" ? "#166534" : "#991b1b",
            fontSize: "1rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            animation: "nfFadeIn 0.3s ease",
          }}
        >
          <span>{alertInfo.message}</span>
          <button
            type="button"
            onClick={() => setAlertInfo(null)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: alertInfo.type === "success" ? "#166534" : "#991b1b",
              fontWeight: "bold",
              lineHeight: 1,
              padding: "0 0.25rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="nf-card-heading">
        <span>Step 2</span>
        <h2>वीरता की घटना का विवरण (Details of Bravery Act)</h2>
        {isCompleted && (
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
            {!isEditing ? (
              <button type="button" className="nf-secondary" onClick={handleEdit}>Edit / संपादित करें</button>
            ) : (
              <>
                <button type="button" className="nf-secondary" onClick={handleCancelEdit} disabled={submitting}>Cancel / रद्द करें</button>
                <button type="button" className="nf-primary" onClick={() => handleSubmit(false)} disabled={submitting}>
                  {submitting ? "अपडेट हो रहा है..." : "Update / अपडेट करें"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="nf-block">
        <div className="nf-grid nf-grid-3">
          <div className="nf-field">
            <label htmlFor="nf-actTitle">1. वीरता की घटना का शीर्षक <span> *</span></label>
            <select
              id="nf-actTitle"
              name="actTitle"
              value={customTitleActive ? "अन्य असाधारण साहसिक कार्य" : (data.actTitle || "")}
              onChange={(e) => {
                const value = e.target.value;
                setCustomTitleActive(value === "अन्य असाधारण साहसिक कार्य");
                if (value === "अन्य असाधारण साहसिक कार्य") {
                  update({ target: { name: "actTitle", value: "" } });
                  setCustomTitleText("");
                  setCustomTitleError("");
                  setTimeout(() => customTitleRef.current?.focus(), 0);
                } else {
                  update(e);
                  setCustomTitleText("");
                  setCustomTitleError("");
                }
                setLocalErrors(prev => {
                  if (!prev.actTitle) return prev;
                  const next = { ...prev };
                  delete next.actTitle;
                  return next;
                });
              }}
              disabled={isFormLocked || isOverAge}
              className={combinedErrors.actTitle ? "error-style" : ""}
            >
              <option value="">चयन करें</option>
              {natureOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
            {customTitleActive && (
              <div style={{ marginTop: "0.5rem" }}>
                <textarea
                  ref={customTitleRef}
                  id="nf-actTitle-custom"
                  name="actTitle"
                  value={customTitleText}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomTitleText(value);
                    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
                    if (wordCount > 20) {
                      setCustomTitleError(`अधिकतम 20 शब्द हो सकते हैं। आपने ${wordCount} शब्द लिखे हैं।`);
                    } else {
                      setCustomTitleError("");
                    }
                    update({ target: { name: "actTitle", value, type: "text" } });
                  }}
                  disabled={isFormLocked || isOverAge}
                  className={combinedErrors.actTitle || customTitleError ? "error-style" : ""}
                  rows={3}
                  placeholder="कृपया अपना स्वयं का शीर्षक लिखें (अधिकतम 20 शब्द)"
                />
                {customTitleText.trim().length > 0 && (
                  <small className={`nf-word-count ${customTitleError ? "nf-invalid" : ""}`}>
                    {customTitleText.trim().split(/\s+/).filter(Boolean).length} / 20 शब्द
                  </small>
                )}
                {customTitleError && <small className="nf-error">{customTitleError}</small>}
              </div>
            )}
            {combinedErrors.actTitle && <small className="nf-error">{combinedErrors.actTitle}</small>}
          </div>
          {input("2. घटना की दिनांक", "actDate", { required: true, type: "date", alwaysEnabled: true, min: minIncidentDate, max: maxIncidentDate })}
          <div className="nf-field">
            <label htmlFor="nf-incidentAge">3. घटना के समय आयु</label>
            <div
              id="nf-incidentAge"
              className="nf-readonly-value"
              style={{ width: "100%", border: "1px solid #bdcbd5", borderRadius: "4px", padding: ".62rem .7rem", background: "#f5f7f8", color: "#17324d" }}
            >
              {data.incidentAge || "-"}
            </div>
            {combinedErrors.incidentAge && <small className="nf-error">{combinedErrors.incidentAge}</small>}
          </div>
        </div>

        <div className="nf-grid nf-grid-3">
          <div className="nf-field">
            <label htmlFor="nf-actTime">4. घटना का समय (Hour.Minutes) <span>*</span></label>
            <p className="nf-hint-note">फ़ॉर्मेट: HH:MM (24-Hour.Minutes आधारित)</p>
            <div style={{ display: "flex", gap: ".35rem", alignItems: "center", flexWrap: "wrap" }}>
              {(() => {
                const parts = data.actTime ? data.actTime.split(":") : ["", "", ""];
                const curHour = String(parts[0] || "").slice(0, 2);
                const curMinute = parts[1] ? String(parts[1]).slice(0, 2) : "";
                return (
                  <>
                    <select
                      id="nf-actHour"
                      value={curHour}
                      onChange={(e) => {
                        const hour = e.target.value;
                        const minute = curMinute || "00";
                        update({ target: { name: "actTime", value: hour ? `${hour}:${minute}:00` : "" } });
                      }}
                      disabled={isFormLocked || isOverAge}
                      className={combinedErrors.actTime ? "error-style" : ""}
                      style={{ flex: 1, minWidth: "80px" }}
                    >
                      <option value="">Hour</option>
                      {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span style={{ fontWeight: "bold", margin: "0 .2rem" }}>:</span>
                    <select
                      id="nf-actMinute"
                      value={curMinute}
                      onChange={(e) => {
                        const minute = e.target.value;
                        const hour = curHour || "00";
                        update({ target: { name: "actTime", value: minute ? `${hour}:${minute}:00` : "" } });
                      }}
                      disabled={isFormLocked || isOverAge}
                      className={combinedErrors.actTime ? "error-style" : ""}
                      style={{ flex: 1, minWidth: "80px" }}
                    >
                      <option value="">Minutes</option>
                      {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </>
                );
              })()}
            </div>
            {data.actTime && (
              <p style={{ marginTop: ".35rem", color: "#217193", fontSize: ".8rem", fontWeight: 600 }}>
                चयनित समय: {data.actTime}
              </p>
            )}
            {combinedErrors.actTime && <small className="nf-error">{combinedErrors.actTime}</small>}
          </div>
          {input("5. घटना का जनपद", "actDistrict", { required: true, options: districts, placeholder: loadingDistricts ? "लोड हो रहा है..." : "जनपद चुनें", disabled: loadingDistricts })}
          {input("6. घटना का स्थान", "actPlace", { required: true })}
        </div>

        {input("7. घटना का संक्षिप्त विवरण", "shortDescription", { required: true, textarea: true, wide: true, words: { min: 100, max: 300 } })}
        <p className="nf-hint">(कम से कम 100 और अधिकतम 300 शब्द)</p>
        <div className="nf-grid">
          {input("8. घटना के दौरान बच्चे द्वारा बचाये गये व्यक्ति/व्यक्तियों/संस्थानों का संक्षिप्त विवरण", "rescuedCount", { required: true, textarea: true, wide: true, words: { min: 0, max: 300 } })}
        </div>
        <p className="nf-hint">(अधिकतम 300 शब्द)</p>
      </div>

      <div className="nf-block">
        <div className="nf-field nf-wide">
          <label>9. बचाये गये व्यक्ति/व्यक्तियों का विवरण (यदि लागू हो)</label>
          <div className="nf-actions">
            <button type="button" className="nf-add" onClick={addPerson} disabled={isOverAge}>+ व्यक्ति जोड़ें</button>
          </div>
          <div className="nf-table-wrap">
            <table className="nf-table">
              <colgroup>
                <col style={{ width: "6%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr>{["क्र.सं.", "नाम", "मोबाइल नंबर", "आयु", "बच्चे से संबंध", "क्रिया"].map((field) => <th key={field}>{field}</th>)}</tr>
              </thead>
              <tbody>{rescuedPeopleRows}</tbody>
            </table>
          </div>
        </div>
        <div className="nf-field nf-wide">
          <label>10. घटना के प्रत्यक्षदर्शियों का विवरण (यदि लागू हो)</label>
          <div className="nf-actions">
            <button type="button" className="nf-add" onClick={addWitness} disabled={isOverAge}>+ प्रत्यक्षदर्शी जोड़ें</button>
          </div>
          <div className="nf-table-wrap">
            <table className="nf-table">
              <colgroup>
                <col style={{ width: "6%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>
              <thead>
                <tr>{["क्र.सं.", ...witnessFields, "क्रिया"].map((field) => <th key={field}>{field}</th>)}</tr>
              </thead>
              <tbody>{witnessRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="nf-block">
        <div className="nf-grid">
          {input("11. घटना के संबंध में पुलिस रिपोर्ट/FIR दर्ज है?", "firRegistered", { required: true, options: ["हाँ", "नहीं", "लागू नहीं"] })}
          {input("12. क्या घटना के संबंध में कोई समाचार/मीडिया रिपोर्ट प्रकाशित हुई है?", "mediaPublished", { required: true, options: ["हाँ, प्रकाशित हुई है।", "नहीं, प्रकाशित नहीं हुई है।", "प्रकाशित हुई है किंतु आवेदन हेतु उपलब्ध नहीं है।"], fieldClassName: "nf-media-field" })}
        </div>
        {data.firRegistered === "हाँ" && <div className="nf-grid nf-conditional">{input("थाना", "policeStation", { required: true })}{input("FIR संख्या", "firNumber", { required: true })}{input("FIR दिनांक", "firDate", { required: true, type: "date", max: today })}</div>}
      </div>

    </section>
  );
};

export default StepC;