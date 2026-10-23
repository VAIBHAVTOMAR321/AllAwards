import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../login/AuthContext";

const addressFields = [
  "ग्राम/मोहल्ला",
  "तहसील ",
  "जनपद",
  "विकासखण्ड/नगर निकाय",
  "पिन कोड",
];

const hasSchoolDetails = (formData) =>
  [formData?.schoolName, formData?.schoolAddress, formData?.currentClass].every(
    (value) => String(value || "").trim(),
  );

const isPart2Submitted = (record) => {
  const status = String(
    record?.status || record?.submission_status || "",
  ).toLowerCase();
  return (
    ["completed", "submitted"].includes(status) ||
    record?.submitted === true ||
    record?.is_submitted === true
  );
};

const StepB = ({
  data,
  update,
  error,
  onNext,
  onCompleted,
  isStepBChecked,
  onErrorsChange,
}) => {
  const { authFetch } = useAuth();
  const [resident, setResident] = useState(data?.resident || "");
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [childMobileError, setChildMobileError] = useState("");
  const [nominator, setNominator] = useState(null);
  const [applicantId, setApplicantId] = useState(data?.applicant_id || "");
  const [districts, setDistricts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentProjects, setCurrentProjects] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState(
    data?.["permanentजनपद"] || "",
  );
  const [currentSelectedDistrict, setCurrentSelectedDistrict] = useState(
    data?.["currentजनपद"] || "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState(null);
  const [localErrors, setLocalErrors] = useState({});
  const fetchStarted = useRef(false);
  const dataFetchStarted = useRef(false);

  const combinedErrors = { ...error, ...localErrors };

  // Bank account holder type options
  const bankAccountHolderOptions = ["स्वयं बालक/बालिका  ", "माता", "पिता", "अभिभावक (माता एवं पिता के न होने की स्थिति में अभिभावक)"];

  useEffect(() => {
    if (dataFetchStarted.current) return;
    dataFetchStarted.current = true;

    const fetchPart2Data = async () => {
      setLoadingData(true);
      try {
        const response = await authFetch(
          "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part2/",
        );

        if (!response.ok) {
          console.log("No existing part2 data or error:", response.status);
          setLoadingData(false);
          return;
        }

        const result = await response.json();
        console.log("Part2 GET response:", result);

        if (
          result.success &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          const record = result.data[0];

          if (isPart2Submitted(record)) {
            console.log("Step B already submitted, skipping to Step C");
            setIsCompleted(true);
            setIsEditing(false);

            const fieldMapping = {
              applicant_id: record.applicant_id,
              childName: record.child_full_name,
              fatherName: record.father_name,
              motherName: record.mother_name,
              guardianName: record.guardian_name,
              birthDate: record.date_of_birth,
              gender: record.gender,
              resident: record.permanent_resident_uttarakhand,
              residence_certificate_number: record.residence_certificate_number,
              bankAccountHolderType: record.bank_nominee_relation || "",
              bankAccountHolderName: record.bank_holder_name || "",
              bankName: record.bank_name || "",
              ifscCode: record.ifsc_code || "",
              bankAccountNumber: record.bank_acc_no || "",
              "permanentग्राम/मोहल्ला": record.permanent_village,
              "permanentतहसील ": record.permanent_post_office,
              "permanentविकासखण्ड/नगर निकाय": record.permanent_block_local_body,
              permanentजनपद: record.permanent_district,
              "permanentपिन कोड": record.permanent_pincode,
              "currentग्राम/मोहल्ला": record.current_village,
              "currentतहसील ": record.current_post_office,
              "currentविकासखण्ड/नगर निकाय": record.current_block_local_body,
              currentजनपद: record.current_district,
              "currentपिन कोड": record.current_pincode,
              schoolName: record.school_name,
              schoolAddress: record.school_address,
              currentClass: record.current_class,
              schoolEnrollmentStatus: hasSchoolDetails({
                schoolName: record.school_name,
                schoolAddress: record.school_address,
                currentClass: record.current_class,
              })
                ? "हाँ"
                : "नहीं",
              childMobile: record.child_guardian_mobile,
            };

            Object.entries(fieldMapping).forEach(([key, value]) => {
              if (value) {
                update({ target: { name: key, value: value, type: "text" } });
              }
            });

            if (record.applicant_id) setApplicantId(record.applicant_id);
            if (record.permanent_resident_uttarakhand)
              setResident(record.permanent_resident_uttarakhand);
            if (record.permanent_district)
              setSelectedDistrict(record.permanent_district);
            if (record.current_district)
              setCurrentSelectedDistrict(record.current_district);

            if (!isStepBChecked) {
              setTimeout(() => {
                if (onCompleted) onCompleted(record);
              }, 500);
            }
          } else {
            const fieldMapping = {
              applicant_id: record.applicant_id,
              childName: record.child_full_name,
              fatherName: record.father_name,
              motherName: record.mother_name,
              guardianName: record.guardian_name,
              birthDate: record.date_of_birth,
              gender: record.gender,
              resident: record.permanent_resident_uttarakhand,
              residence_certificate_number: record.residence_certificate_number,
              bankAccountHolderType: record.bank_nominee_relation || "",
              bankAccountHolderName: record.bank_holder_name || "",
              bankName: record.bank_name || "",
              ifscCode: record.ifsc_code || "",
              bankAccountNumber: record.bank_acc_no || "",
              "permanentग्राम/मोहल्ला": record.permanent_village,
              "permanentतहसील ": record.permanent_post_office,
              "permanentविकासखण्ड/नगर निकाय": record.permanent_block_local_body,
              permanentजनपद: record.permanent_district,
              "permanentपिन कोड": record.permanent_pincode,
              "currentग्राम/मोहल्ला": record.current_village,
              "currentतहसील ": record.current_post_office,
              "currentविकासखण्ड/नगर निकाय": record.current_block_local_body,
              currentजनपद: record.current_district,
              "currentपिन कोड": record.current_pincode,
              schoolName: record.school_name,
              schoolAddress: record.school_address,
              currentClass: record.current_class,
              schoolEnrollmentStatus: hasSchoolDetails({
                schoolName: record.school_name,
                schoolAddress: record.school_address,
                currentClass: record.current_class,
              })
                ? "हाँ"
                : "नहीं",
              childMobile: record.child_guardian_mobile,
            };

            Object.entries(fieldMapping).forEach(([key, value]) => {
              if (value) {
                update({ target: { name: key, value: value, type: "text" } });
              }
            });

            if (record.applicant_id) setApplicantId(record.applicant_id);
            if (record.permanent_resident_uttarakhand)
              setResident(record.permanent_resident_uttarakhand);
            if (record.permanent_district)
              setSelectedDistrict(record.permanent_district);
            if (record.current_district)
              setCurrentSelectedDistrict(record.current_district);
          }
        }
      } catch (err) {
        console.error("Failed to fetch part2 data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPart2Data();
  }, [authFetch, update, onCompleted, isStepBChecked]);

  useEffect(() => {
    if (fetchStarted.current) return;
    fetchStarted.current = true;

    const fetchNominator = async () => {
      try {
        const response = await authFetch(
          "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part1/",
        );
        if (!response.ok) return;

        const result = await response.json();
        const record = Array.isArray(result.data) ? result.data[0] : null;
        if (record) {
          setNominator(record);

          if (record.applicant_id && !applicantId) {
            setApplicantId(record.applicant_id);
            update({
              target: {
                name: "applicant_id",
                value: record.applicant_id,
                type: "text",
              },
            });
          }

          const category = String(
            record.nominator_category || "",
          ).toLowerCase();
          const fieldName = {
            self: "childName",
            "स्वयं बालक / बालिका": "childName",
            mother: "motherName",
            माता: "motherName",
            father: "fatherName",
            पिता: "fatherName",
            legal_guardian: "guardianName",
            "विधिक अभिभावक": "guardianName",
          }[category];
          if (fieldName && record.full_name && !data[fieldName]) {
            update({
              target: {
                name: fieldName,
                value: record.full_name,
                type: "text",
              },
            });
          }

          if (!data.childMobile && record.phone) {
            const mobileValue = String(record.phone || "")
              .replace(/[^0-9]/g, "")
              .slice(0, 10);
            if (mobileValue) {
              update({
                target: {
                  name: "childMobile",
                  value: mobileValue,
                  type: "text",
                },
              });
            }
          }
        }
      } catch (fetchError) {
        console.error("Failed to fetch nominator details:", fetchError);
      }
    };

    fetchNominator();
  }, [update, authFetch, applicantId, data]);

  useEffect(() => {
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const response = await fetch(
          "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/cdpo-dropdown/",
        );
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setDistricts([
            ...new Set(
              result.data.map((item) => item.district).filter(Boolean),
            ),
          ]);
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
    const fetchProjectsForDistrict = async () => {
      if (!selectedDistrict) {
        setProjects([]);
        return;
      }
      setLoadingProjects(true);
      setProjects([]);
      try {
        const response = await fetch(
          `https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/cdpo-dropdown/?district=${encodeURIComponent(selectedDistrict)}`,
        );
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setProjects([
            ...new Set(
              result.data.map((item) => item.project_name).filter(Boolean),
            ),
          ]);
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
    fetchProjectsForDistrict();
  }, [selectedDistrict]);

  useEffect(() => {
    const fetchCurrentProjects = async () => {
      if (!currentSelectedDistrict) {
        setCurrentProjects([]);
        return;
      }
      setLoadingProjects(true);
      try {
        const response = await fetch(
          `https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/cdpo-dropdown/?district=${encodeURIComponent(currentSelectedDistrict)}`,
        );
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setCurrentProjects([
            ...new Set(
              result.data.map((item) => item.project_name).filter(Boolean),
            ),
          ]);
        } else {
          setCurrentProjects([]);
        }
      } catch (error) {
        console.error("Failed to fetch current projects:", error);
        setCurrentProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchCurrentProjects();
  }, [currentSelectedDistrict]);

  useEffect(() => {
    if (data.schoolEnrollmentStatus && data.schoolEnrollmentStatus !== "हाँ") {
      update({ target: { name: "schoolName", value: "", type: "text" } });
      update({ target: { name: "schoolAddress", value: "", type: "text" } });
      update({ target: { name: "currentClass", value: "", type: "text" } });
    }
  }, [data.schoolEnrollmentStatus, update]);

  const nominatorCategory = data?.nominator_category || "";
  const registeredCategory = String(
    nominator?.nominator_category || nominatorCategory,
  ).toLowerCase();
  const nominatorName = nominator?.full_name || data?.full_name || "";

  const isSelf = ["self", "स्वयं", "स्वयं बालक / बालिका"].includes(
    registeredCategory,
  );
  const isMother = ["mother", "माता"].includes(registeredCategory);
  const isFather = ["father", "पिता"].includes(registeredCategory);
  const isLegalGuardian = ["legal_guardian", "विधिक अभिभावक"].includes(
    registeredCategory,
  );

  const today = new Date().toISOString().split("T")[0];

  const nameFields = [
    "childName",
    "fatherName",
    "motherName",
    "guardianName",
    "bankAccountHolderName",
    "bankName",
  ];
  const numericPattern = /[0-9]/g;

  const clearFieldError = (fieldName) => {
    setLocalErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
    if (onErrorsChange) {
      onErrorsChange({ [fieldName]: undefined });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "resident") {
      setResident(value);
    }
    if (name === "schoolEnrollmentStatus" && value === "नहीं") {
      ["schoolName", "schoolAddress", "currentClass"].forEach((field) => {
        update({ target: { name: field, value: "", type: "text" } });
        clearFieldError(field);
      });
    }
    if (name === "childMobile") {
      const numericOnly = value.replace(/[^0-9]/g, "").slice(0, 10);
      update({ target: { name, value: numericOnly, type: "text" } });
      if (numericOnly.length > 0 && numericOnly.length < 10) {
        setChildMobileError("मोबाइल नंबर 10 अंकों का होना चाहिए");
      } else {
        setChildMobileError("");
      }
      clearFieldError("childMobile");
      return;
    }
    if (name === "bankAccountNumber") {
      const numericOnly = value.replace(/[^0-9]/g, "").slice(0, 18);
      update({ target: { name, value: numericOnly, type: "text" } });
      clearFieldError(name);
      return;
    }
    if (name === "ifscCode") {
      const upperValue = value.toUpperCase().slice(0, 11);
      update({ target: { name, value: upperValue, type: "text" } });
      clearFieldError(name);
      return;
    }
    if (name === "permanentजनपद") {
      setSelectedDistrict(value);
      update({
        target: {
          name: "permanentविकासखण्ड/नगर निकाय",
          value: "",
          type: "text",
        },
      });
    }
    if (name === "currentजनपद") {
      setCurrentSelectedDistrict(value);
      update({
        target: { name: "currentविकासखण्ड/नगर निकाय", value: "", type: "text" },
      });
    }
    if (nameFields.includes(name)) {
      const sanitized = value.replace(numericPattern, "");
      update({ target: { name, value: sanitized, type: "text" } });
    } else if (name === "permanentपिन कोड" || name === "currentपिन कोड") {
      const numericOnly = value.replace(/[^0-9]/g, "").slice(0, 6);
      update({ target: { name, value: numericOnly, type: "text" } });
    } else if (
      name &&
      addressFields.some((field) => name === `current${field}`)
    ) {
      setSameAsPermanent(false);
      update(e);
    } else {
      update(e);
    }
    clearFieldError(name);
  };

  const handleSameAsPermanent = (e) => {
    const checked = e.target.checked;
    setSameAsPermanent(checked);
    if (checked) {
      const currentAddressParts = [];
      addressFields.forEach((field) => {
        const permanentValue = data[`permanent${field}`] || "";
        currentAddressParts.push(permanentValue);
        update({
          target: {
            name: `current${field}`,
            value: permanentValue,
            type: "text",
          },
        });
        if (field === "जनपद") {
          setCurrentSelectedDistrict(permanentValue);
        }
      });
      update({
        target: {
          name: "currentAddress",
          value: currentAddressParts.join(", "),
          type: "text",
        },
      });
    } else {
      addressFields.forEach((field) => {
        update({
          target: { name: `current${field}`, value: "", type: "text" },
        });
        if (field === "जनपद") {
          setCurrentSelectedDistrict("");
        }
      });
      update({ target: { name: "currentAddress", value: "", type: "text" } });
    }
  };

  const buildPayload = () => {
    const finalApplicantId =
      applicantId || data?.applicant_id || nominator?.applicant_id || "";

    return {
      applicant_id: finalApplicantId,
      child_full_name: data.childName || "",
      father_name: data.fatherName || "",
      mother_name: data.motherName || "",
      guardian_name: data.guardianName || "",
      date_of_birth: data.birthDate || "",
      gender: data.gender || "",
      permanent_resident_uttarakhand: data.resident || "",
      residence_certificate_number: data.residence_certificate_number || "",
      bank_detail_available: "हाँ",
      bank_nominee_relation: data.bankAccountHolderType || "",
      bank_holder_name: data.bankAccountHolderName || "",
      bank_name: data.bankName || "",
      ifsc_code: data.ifscCode || "",
      bank_acc_no: data.bankAccountNumber || "",
      permanent_village: data["permanentग्राम/मोहल्ला"] || "",
      permanent_post_office: data["permanentतहसील "] || "",
      permanent_block_local_body: data["permanentविकासखण्ड/नगर निकाय"] || "",
      permanent_district: data["permanentजनपद"] || "",
      permanent_pincode: data["permanentपिन कोड"] || "",
      current_village: data["currentग्राम/मोहल्ला"] || "",
      current_post_office: data["currentतहसील "] || "",
      current_district: data["currentजनपद"] || "",
      current_block_local_body: data["currentविकासखण्ड/नगर निकाय"] || "",
      current_pincode: data["currentपिन कोड"] || "",
      school_name: data.schoolName || "",
      school_address: data.schoolAddress || "",
      current_class: data.currentClass || "",
      school_enrolled: schoolEnrollmentStatus,
      child_guardian_mobile: data.childMobile || "",
    };
  };

  const validateForm = () => {
    const errors = {};

    const currentApplicantId =
      applicantId || data?.applicant_id || nominator?.applicant_id;
    if (!currentApplicantId) {
      errors.applicant_id = "Applicant ID not found";
    }

    if (!data.childName?.trim()) errors.childName = "यह फ़ील्ड अनिवार्य है";
    if (!data.fatherName?.trim()) errors.fatherName = "यह फ़ील्ड अनिवार्य है";
    if (!data.motherName?.trim()) errors.motherName = "यह फ़ील्ड अनिवार्य है";
    if (!data.birthDate) errors.birthDate = "यह फ़ील्ड अनिवार्य है";
    if (!data.gender) errors.gender = "यह फ़ील्ड अनिवार्य है";
    if (!data.resident) errors.resident = "यह फ़ील्ड अनिवार्य है";

    // Bank account validation
    if (!data.bankAccountHolderType)
      errors.bankAccountHolderType = "यह फ़ील्ड अनिवार्य है";
    if (!data.bankAccountHolderName?.trim())
      errors.bankAccountHolderName = "यह फ़ील्ड अनिवार्य है";
    if (!data.bankName?.trim()) errors.bankName = "यह फ़ील्ड अनिवार्य है";
    if (!data.ifscCode?.trim()) {
      errors.ifscCode = "यह फ़ील्ड अनिवार्य है";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode)) {
      errors.ifscCode =
        "IFSC कोड सही प्रारूप में नहीं है (जैसे: SBIN0001234)";
    }
    if (!data.bankAccountNumber?.trim()) {
      errors.bankAccountNumber = "यह फ़ील्ड अनिवार्य है";
    } else if (
      data.bankAccountNumber.length < 9 ||
      data.bankAccountNumber.length > 18
    ) {
      errors.bankAccountNumber = "खाता संख्या 9 से 18 अंकों की होना चाहिए";
    }

    if (schoolEnrollmentStatus === "हाँ") {
      if (!data.schoolName?.trim()) errors.schoolName = "यह फ़ील्ड अनिवार्य है";
      if (!data.schoolAddress?.trim())
        errors.schoolAddress = "यह फ़ील्ड अनिवार्य है";
      if (!data.currentClass?.trim())
        errors.currentClass = "यह फ़ील्ड अनिवार्य है";
    }

    if (data.resident === "हाँ") {
      if (!data["permanentग्राम/मोहल्ला"]?.trim())
        errors["permanentग्राम/मोहल्ला"] = "यह फ़ील्ड अनिवार्य है";
      if (!data["permanentतहसील "]?.trim())
        errors["permanentतहसील "] = "यह फ़ील्ड अनिवार्य है";
      if (!data["permanentजनपद"])
        errors["permanentजनपद"] = "यह फ़ील्ड अनिवार्य है";
      if (!data["permanentविकासखण्ड/नगर निकाय"])
        errors["permanentविकासखण्ड/नगर निकाय"] = "यह फ़ील्ड अनिवार्य है";
      if (!data["permanentपिन कोड"]?.trim())
        errors["permanentपिन कोड"] = "यह फ़ील्ड अनिवार्य है";
      else if (!/^\d{6}$/.test(data["permanentपिन कोड"]))
        errors["permanentपिन कोड"] = "पिन कोड 6 अंकों का होना चाहिए";
      if (!data["residence_certificate_number"]?.trim())
        errors["residence_certificate_number"] = "यह फ़ील्ड अनिवार्य है";
    }

    if (!data.childMobile?.trim()) {
      errors.childMobile = "यह फ़ील्ड अनिवार्य है";
    } else if (data.childMobile.length !== 10) {
      errors.childMobile = "मोबाइल नंबर 10 अंकों का होना चाहिए";
    }

    if (!data["currentग्राम/मोहल्ला"]?.trim())
      errors["currentग्राम/मोहल्ला"] = "यह फ़ील्ड अनिवार्य है";
    if (!data["currentतहसील "]?.trim())
      errors["currentतहसील "] = "यह फ़ील्ड अनिवार्य है";
    if (!data["currentजनपद"]) errors["currentजनपद"] = "यह फ़ील्ड अनिवार्य है";
    if (!data["currentविकासखण्ड/नगर निकाय"])
      errors["currentविकासखण्ड/नगर निकाय"] = "यह फ़ील्ड अनिवार्य है";
    if (!data["currentपिन कोड"]?.trim())
      errors["currentपिन कोड"] = "यह फ़ील्ड अनिवार्य है";
    else if (!/^\d{6}$/.test(data["currentपिन कोड"]))
      errors["currentपिन कोड"] = "पिन कोड 6 अंकों का होना चाहिए";

    return errors;
  };

  const editableFields = [
    "childName",
    "fatherName",
    "motherName",
    "guardianName",
    "childMobile",
    "birthDate",
    "gender",
    "resident",
    "residence_certificate_number",
    "bankAccountHolderType",
    "bankAccountHolderName",
    "bankName",
    "ifscCode",
    "bankAccountNumber",
    "permanentग्राम/मोहल्ला",
    "permanentतहसील ",
    "permanentजनपद",
    "permanentविकासखण्ड/नगर निकाय",
    "permanentपिन कोड",
    "currentग्राम/मोहल्ला",
    "currentतहसील ",
    "currentजनपद",
    "currentविकासखण्ड/नगर निकाय",
    "currentपिन कोड",
    "schoolName",
    "schoolAddress",
    "currentClass",
    "schoolEnrollmentStatus",
  ];

  const handleEdit = () => {
    setEditSnapshot(
      Object.fromEntries(
        editableFields.map((field) => [field, data[field] || ""]),
      ),
    );
    setIsEditing(true);
    setSubmitError("");
  };

  const handleCancelEdit = () => {
    if (editSnapshot) {
      Object.entries(editSnapshot).forEach(([name, value]) => {
        update({ target: { name, value, type: "text" } });
      });
      setResident(editSnapshot.resident || "");
      setSelectedDistrict(editSnapshot["permanentजनपद"] || "");
      setCurrentSelectedDistrict(editSnapshot["currentजनपद"] || "");
    }
    setIsEditing(false);
    setEditSnapshot(null);
    setSubmitError("");
    setLocalErrors({});
  };

  const handleSubmit = async (moveToNext = true) => {
    setSubmitError("");

    const currentApplicantId =
      applicantId || data?.applicant_id || nominator?.applicant_id;
    if (!currentApplicantId) {
      setSubmitError("Applicant ID नहीं मिला। कृपया पहले Step 1 पूरा करें।");
      return false;
    }

    if (resident === "नहीं") {
      setSubmitError("आप इस पुरस्कार के लिए eligible नहीं हैं");
      return false;
    }

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      console.log("[StepB] Validation errors:", validationErrors);
      setLocalErrors(validationErrors);

      if (onErrorsChange) {
        onErrorsChange(validationErrors);
      }

      requestAnimationFrame(() => {
        const firstKey = Object.keys(validationErrors)[0];
        const el = document.getElementById(`nf-${firstKey}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return false;
    }

    setLocalErrors({});
    if (onErrorsChange) {
      onErrorsChange({});
    }

    setSubmitting(true);

    try {
      const payload = buildPayload();
      console.log("Submitting payload:", payload);

      const method = isCompleted && isEditing ? "PUT" : "POST";

      const response = await authFetch(
        "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part2/",
        {
          method: method,
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        let errorMsg = "Submission failed";
        try {
          const errorData = await response.json();
          errorMsg =
            errorData.message ||
            errorData.error ||
            errorData.detail ||
            JSON.stringify(errorData) ||
            errorMsg;
        } catch (e) {
          errorMsg = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log("Submit response:", result);

      if (result.success) {
        if (moveToNext && onNext) {
          onNext(result);
        } else {
          alert("Step 1 successfully updated");
          setIsEditing(false);
          setEditSnapshot(null);
          setResident(data.resident || "");
          setSelectedDistrict(data["permanentजनपद"] || "");
          setCurrentSelectedDistrict(data["currentजनपद"] || "");
        }
        return true;
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(err.message || "कुछ गलत हो गया, कृपया पुनः प्रयास करें");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const isNotUttarakhand = resident === "नहीं";
  const schoolEnrollmentStatus =
    data.schoolEnrollmentStatus || (hasSchoolDetails(data) ? "हाँ" : "नहीं");

  const input = (label, name, options = {}) => {
    const isSelect = Array.isArray(options.options);
    const isFormLocked = isCompleted && !isEditing;
    const disabled =
      isFormLocked || (isNotUttarakhand && name !== "resident")
        ? true
        : options.disabled || false;
    let value = data[name] || "";

    if (name === "childName" && isSelf) value = nominatorName;
    if (name === "fatherName" && isFather) value = nominatorName;
    if (name === "motherName" && isMother) value = nominatorName;
    if (name === "guardianName" && isLegalGuardian) value = nominatorName;

    const extraProps = {};
    if (name === "birthDate") {
      extraProps.max = today;
    }

    const fieldError = combinedErrors[name];

    return (
      <div className="nf-field">
        <label htmlFor={`nf-${name}`}>
          {label}
          {options.required && <span> *</span>}
        </label>
        {isSelect ? (
          <select
            id={`nf-${name}`}
            name={name}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={fieldError ? "error-style" : ""}
          >
            <option value="">{options.placeholder || "चयन करें"}</option>
            {options.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`nf-${name}`}
            name={name}
            type={options.type || "text"}
            value={value}
            placeholder={options.placeholder}
            onChange={handleChange}
            disabled={disabled}
            className={fieldError ? "error-style" : ""}
            {...extraProps}
          />
        )}
        {fieldError && <small className="nf-error">{fieldError}</small>}
        {name === "childMobile" && childMobileError && !fieldError && (
          <small className="nf-error">{childMobileError}</small>
        )}
      </div>
    );
  };

  if (loadingData) {
    return (
      <section className="nf-card nf-step-b">
        <div className="nf-card-heading">
          <span>Step 1</span>
          <h2>नामांकित बच्चे का व्यक्तिगत विवरण (Nominee Details)</h2>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "60px 20px",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e0e0e0",
              borderTopColor: "#28a745",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          ></div>
          <p style={{ color: "#666", fontSize: "16px" }}>
            डेटा लोड हो रहा है...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </section>
    );
  }

  return (
    <section className="nf-card nf-step-b">
      <div className="nf-card-heading">
        <span>Step 1</span>
        <h2>नामांकित बच्चे का व्यक्तिगत विवरण (Nominee Details)</h2>
        {isCompleted && (
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
            {!isEditing ? (
              <button
                type="button"
                className="nf-secondary"
                onClick={handleEdit}
              >
                Edit / संपादित करें
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="nf-secondary"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                >
                  Cancel / रद्द करें
                </button>
                <button
                  type="button"
                  className="nf-primary"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                >
                  {submitting ? "अपडेट हो रहा है..." : "Update / अपडेट करें"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {(applicantId || data?.applicant_id || nominator?.applicant_id) && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "#e7f3ff",
            borderRadius: "4px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#0066cc",
          }}
        >
          Applicant ID:{" "}
          {applicantId || data?.applicant_id || nominator?.applicant_id}
        </div>
      )}

      {isNotUttarakhand && (
        <div className="nf-ineligible-message">
          आप इस लिए eligible नहीं हो (केवल उत्तराखण्ड के स्थायी निवासी)
        </div>
      )}
      <div className="nf-grid">
        {input("1. बच्चे का पूरा नाम", "childName", {
          required: true,
          placeholder: "बच्चे का पूरा नाम",
          disabled: isSelf,
        })}
        {input("2. पिता का नाम", "fatherName", {
          required: true,
          placeholder: "पिता का पूरा नाम",
          disabled: isFather,
        })}
        {input("3. माता का नाम", "motherName", {
          required: true,
          placeholder: "माता का पूरा नाम",
          disabled: isMother,
        })}
        {input(
          <>
            4. अभिभावक का नाम{" "}
            <span style={{ color: "red" }}>
              (माता एवं पिता के न होने की स्थिति में अभिभावक)
            </span>
          </>,
          "guardianName",
          {
            placeholder: "अभिभावक का पूरा नाम",
            disabled: isLegalGuardian,
          },
        )}
        {input("5. बच्चे/अभिभावक का मोबाइल नंबर", "childMobile", {
          required: true,
          type: "tel",
          placeholder: "10 अंकों का मोबाइल नंबर",
        })}
        {input("6. जन्म तिथि", "birthDate", {
          required: true,
          type: "date",
        })}
        {input("7. लिंग", "gender", {
          required: true,
          options: ["बालक", "बालिका", "अन्य"],
          placeholder: "लिंग चुनें",
        })}
        {input("8. उत्तराखण्ड का स्थायी निवासी", "resident", {
          required: true,
          options: ["हाँ", "नहीं"],
          placeholder: "चुनें",
        })}
        {input(
          "9. स्थायी निवास प्रमाण पत्र संख्या",
          "residence_certificate_number",
          {
            required: true,
            placeholder: "प्रमाण पत्र संख्या दर्ज करें",
          },
        )}
      </div>

      {/* ============ Bank Account Section (Point 10) ============ */}
      <fieldset className="nf-subsection nf-subsection-left">
        <legend>
          10. बैंक खाता विवरण <span> ( जिसमें पुरस्कार की धनराशि अंतरित की जानी है )*</span>
        </legend>
        <div className="nf-grid nf-address-grid">
          {input("10.1 खाता किसके नाम पर है", "bankAccountHolderType", {
            required: true,
            options: bankAccountHolderOptions,
            placeholder: "चयन करें",
          })}
          {input("10.2 खाताधारक का पूरा नाम", "bankAccountHolderName", {
            required: true,
            placeholder: "खाताधारक का पूरा नाम",
          })}
          {input("10.3 बैंक का नाम", "bankName", {
            required: true,
            placeholder: "बैंक का नाम दर्ज करें",
          })}
          {input("10.4 IFSC कोड", "ifscCode", {
            required: true,
            placeholder: "जैसे: SBIN0001234",
          })}
          {input("10.5 बैंक खाता संख्या", "bankAccountNumber", {
            required: true,
            placeholder: "बैंक खाता संख्या दर्ज करें",
          })}
        </div>
      </fieldset>
      {/* ============ END: Bank Account Section ============ */}

      <fieldset className="nf-subsection nf-subsection-left">
        <legend>
          11. स्थायी निवास का पता <span>*</span>
        </legend>
        <div className="nf-grid nf-address-grid">
          {addressFields.map((field) => {
            if (field === "जनपद") {
              return input("जनपद", `permanent${field}`, {
                required: true,
                options: districts,
                placeholder: loadingDistricts
                  ? "लोड हो रहा है..."
                  : "जनपद चुनें",
                disabled: loadingDistricts,
              });
            }
            if (field === "विकासखण्ड/नगर निकाय") {
              return input("विकासखण्ड/नगर निकाय", `permanent${field}`, {
                required: true,
                options: projects,
                placeholder: !selectedDistrict
                  ? "पहले जनपद चुनें"
                  : loadingProjects
                    ? "लोड हो रहा है..."
                    : projects.length === 0
                      ? "कोई विकासखण्ड उपलब्ध नहीं"
                      : "विकासखण्ड/नगर निकाय चुनें",
                disabled:
                  loadingProjects || !selectedDistrict || projects.length === 0,
              });
            }
            return input(field, `permanent${field}`, {
              required: true,
              placeholder: `${field} दर्ज करें`,
            });
          })}
        </div>
      </fieldset>
      <div className="nf-field nf-checkbox-field">
        <label>
          <input
            type="checkbox"
            checked={sameAsPermanent}
            onChange={handleSameAsPermanent}
            disabled={(isCompleted && !isEditing) || isNotUttarakhand}
          />
          स्थायी पते के समान
        </label>
      </div>
      <fieldset className="nf-subsection nf-subsection-left">
        <legend>12. वर्तमान पता (यदि स्थायी पते से भिन्न हो)</legend>
        <div className="nf-grid nf-address-grid">
          {addressFields.map((field) => {
            if (field === "जनपद") {
              return input("जनपद", `current${field}`, {
                required: true,
                options: districts,
                placeholder: loadingDistricts
                  ? "लोड हो रहा है..."
                  : "जनपद चुनें",
                disabled: loadingDistricts,
              });
            }
            if (field === "विकासखण्ड/नगर निकाय") {
              return input("विकासखण्ड/नगर निकाय", `current${field}`, {
                required: true,
                options: currentProjects,
                placeholder: !currentSelectedDistrict
                  ? "पहले जनपद चुनें"
                  : loadingProjects
                    ? "लोड हो रहा है..."
                    : currentProjects.length === 0
                      ? "कोई विकासखण्ड उपलब्ध नहीं"
                      : "विकासखण्ड/नगर निकाय चुनें",
                disabled:
                  loadingProjects ||
                  !currentSelectedDistrict ||
                  currentProjects.length === 0,
              });
            }
            return input(field, `current${field}`, {
              required: true,
              placeholder: `${field} दर्ज करें`,
            });
          })}
        </div>
      </fieldset>
      <div className="nf-grid">
        {input(
          "13. विद्यालय में नामांकित है या नहीं?",
          "schoolEnrollmentStatus",
          {
            required: true,
            options: ["हाँ", "नहीं"],
            placeholder: "चयन करें",
          },
        )}
        {schoolEnrollmentStatus === "हाँ" && (
          <>
            {input("14. विद्यालय का नाम", "schoolName", {
              required: true,
              placeholder: "विद्यालय का नाम",
            })}
            {input("15. विद्यालय का पता", "schoolAddress", {
              required: true,
              placeholder: "विद्यालय का पता",
            })}
            {input("16. वर्तमान कक्षा", "currentClass", {
              required: true,
              placeholder: "कक्षा दर्ज करें",
            })}
          </>
        )}
      </div>

      {submitError && (
        <div
          className="nf-submit-error"
          style={{
            color: "#dc3545",
            padding: "12px",
            marginTop: "16px",
            backgroundColor: "#f8d7da",
            borderRadius: "4px",
            border: "1px solid #f5c6cb",
          }}
        >
          {submitError}
        </div>
      )}

      <div
        className="nf-step-actions"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "24px",
          gap: "12px",
        }}
      >
        <button
          type="button"
          className="nf-btn nf-btn-next"
          onClick={isCompleted && !isEditing ? onNext : () => handleSubmit()}
          disabled={submitting || (!isCompleted && isNotUttarakhand)}
          style={{
            padding: "12px 32px",
            backgroundColor:
              isNotUttarakhand && !isCompleted
                ? "#ccc"
                : submitting
                  ? "#6c757d"
                  : "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor:
              isNotUttarakhand && !isCompleted
                ? "not-allowed"
                : submitting
                  ? "wait"
                  : "pointer",
            fontSize: "16px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {submitting ? (
            <>
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  border: "2px solid #fff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  display: "inline-block",
                }}
              ></span>
              {isCompleted && !isEditing
                ? "आगे बढ़ रहा है..."
                : "सबमिट हो रहा है..."}
            </>
          ) : (
            <>
              अगला चरण
              <span>→</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default StepB;
