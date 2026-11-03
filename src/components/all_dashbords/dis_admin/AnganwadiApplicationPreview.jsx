import React from "react";
import { FaPrint } from "react-icons/fa";
import ukLogo from "../../../assets/images/uk_logo.jpeg";
import "./AnganwadiApplicationPreview.css";

const MEDIA_BASE_URL =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend";

const displayValue = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "—";
  }
  return String(value);
};

const getApplicationValue = (application, ...fields) => {
  for (const field of fields) {
    const value = application[field];
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return value;
    }
  }
  return null;
};

const formatDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return displayValue(value);
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMediaUrl = (file) => {
  const path = String(file || "").trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${MEDIA_BASE_URL}/${path.replace(/^\/+/, "")}`;
};

const PREVIEW_DOCUMENTS = [
  ["1. स्थाई निवास प्रमाण पत्र", ["niwas_img", "aharta1"]],
  ["2. आरक्षित श्रेणी / जाति प्रमाण पत्र", ["caste_img", "aharta2"]],
  ["3. वरीयता प्रमाण पत्र", ["variyata_img", "aharta3"]],
  ["4. अनुभव प्रमाण पत्र", ["workexp_img", "aharta4"]],
  ["5. उपलब्धियों / समाचार अभिलेख", ["manak2"]],
  ["6(i). विभागीय सहयोग से मॉडल केंद्र कार्य", ["manak3a"]],
  ["6(ii). व्यक्तिगत प्रयास से मॉडल केंद्र कार्य", ["manak3b"]],
  ["7. सम्मान, पुरस्कार या प्रमाण-पत्र", ["manak4"]],
  ["पोषण ट्रैकर समूह फोटो", ["pt_group_img"]],
  ["संदर्भण पर्ची", ["sandharbh_img"]],
  ["सामुदायिक गतिविधि", ["sam_img"]],
  ["अतिकुपोषित बच्चों का विवरण", ["sam_6mon_img", "sam_6yr_img"]],
  ["कुपोषित बच्चों का विवरण", ["mam_6mon_img"]],
  ["गंभीर बीमारी से ग्रसित बच्चों का विवरण", ["gambhir_img"]],
  ["अन्य विशिष्ट कार्य का दस्तावेज़", ["other_work_img"]],
];

const EDUCATION_LEVELS = [
  ["दसवीं कक्षा", "high"],
  ["इण्टरमीडियट", "int"],
  ["स्नातक", "grad"],
  ["स्नातकोत्तर", "pgrad"],
];

const hasEducationDetails = (application, prefix) =>
  ["board", "year", "marks", "tot", "per", "img"].some((suffix) => {
    const value = application[`${prefix}_${suffix}`];
    return value !== null && value !== undefined && String(value).trim() !== "" && value !== "0.00";
  });

const AnganwadiApplicationPreview = ({
  application,
  rolePrefix,
  formatStatus,
  merit,
  onClose,
  onPrint,
  children,
}) => {
  if (!application) return null;

  const renderFile = (file, label) => {
    if (!file) {
      return <span className="anganwadi-application-preview-missing">×</span>;
    }
    const path = String(file);
    const url = getMediaUrl(path);
    const fileName = path.split(/[\\/]/).pop() || label;
    const isImage = /\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(path);
    const isPdf = /\.pdf(\?.*)?$/i.test(path);
    return (
      <div className="anganwadi-application-preview-file">
        {isImage && <img src={url} alt={label} loading="lazy" />}
        {isPdf && <iframe title={label} src={url} loading="lazy" />}
        {!isImage && !isPdf && <span>{fileName}</span>}
        <a href={url} target="_blank" rel="noreferrer">{fileName}</a>
      </div>
    );
  };

  const applicantRows = [
    ["आवेदन फार्म संख्या :-", application.form_id],
    ["राजस्व ग्राम का नाम :-", getApplicationValue(application, "rev_vill", "revenue_village", "village")],
    ["आंगनवाड़ी केंद्र का नाम :-", application.awc_name],
    ["आवेदक का नाम कु0/श्रीमती :-", application.filer_name],
    ["आवेदक की पासपोर्ट साइज फोटो :-", application.photo_img, "photo"],
    ["माता का नाम :-", getApplicationValue(application, "moth_name", "mother_name")],
    ["पिता का नाम :-", getApplicationValue(application, "fath_name", "father_name", "fath_husb_name")],
    ["वैवाहिक प्रस्थिति :-", getApplicationValue(application, "marital", "marital_status")],
    ["पति का नाम :-", getApplicationValue(application, "husb_name", "husband_name")],
    ["जन्म तिथि (आयु) :-", `${formatDate(application.dob)} (${displayValue(application.age)})`],
    ["मोबाइल नंबर :-", application.filer_mob],
    ["ई मेल आई0डी0 :-", application.filer_email],
    ["आधार नंबर :-", getApplicationValue(application, "filer_adhar", "aadhaar", "adhar")],
    ["जनपद :-", application.district],
    ["परियोजना :-", application.project],
    ["सेक्टर :-", application.sector],
    ["आंगनवाड़ी केंद्र कोड :-", application.awc_center],
    ["गांव/क्षेत्र का नाम :-", application.village],
    ["पता :-", application.address],
    ["आरक्षित वर्ग :-", application.caste_category],
    [
      "योगदान की तिथि :-",
      formatDate(
        application.past_date && application.past_date !== "0000-00-00"
          ? application.past_date
          : application.joining_date
      ),
    ],
    ["शहर :-", application.city],
    ["पिन कोड :-", application.pincode],
    ["खाताधारक का नाम :-", application.acc_holder],
    ["खाता संख्या :-", application.acc_no],
    ["IFSC कोड :-", application.acc_ifsc],
    ["बैंक का नाम :-", application.bank_name],
    ["पैन कार्ड :-", application.pancard],
  ];

  const educationLevels = EDUCATION_LEVELS.filter(
    ([, prefix]) => prefix === "high" || prefix === "int" || hasEducationDetails(application, prefix)
  );
  const casteCategory = String(application.caste_category || "").toLowerCase();
  const variyata = String(application.variyata || "").trim();
  const normalizedStatus = String(application.status || "").toLowerCase().replace(/[ -]+/g, "_");
  const isFinal = Boolean(normalizedStatus) &&
    !["pending", "draft", "in_progress", "edit"].includes(normalizedStatus);
  const documentRows = PREVIEW_DOCUMENTS.map(([label, fields]) => [
    label,
    getApplicationValue(application, ...fields),
  ]);
  const pastEmploymentRows =
    application.past_date && application.past_date !== "0000-00-00"
      ? [
          ["जनपद", application.past_district],
          ["परियोजना", application.past_project],
          ["आंगनवाड़ी केंद्र", application.past_awc],
        ]
      : [];
  const priorityNumber = applicantRows.length + pastEmploymentRows.length + 1;

  return (
    <div
      className={`${rolePrefix}-anganwadi-preview-overlay anganwadi-application-preview-overlay`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="anganwadi-application-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${rolePrefix}-anganwadi-preview-title`}
      >
        <header className="anganwadi-application-preview-header">
          <div>
            <h2 id={`${rolePrefix}-anganwadi-preview-title`}>आवेदन का पूर्वावलोकन</h2>
            <p>आंगनवाड़ी कार्यकर्त्री पुरस्कार 2026–27</p>
          </div>
          <div className="anganwadi-application-preview-actions">
            <button type="button" className="btn btn-outline-light" onClick={onPrint}>
              <FaPrint className="me-2" /> प्रिंट / PDF
            </button>
            <button type="button" className="btn btn-light" aria-label="Close application preview" onClick={onClose}>
              ×
            </button>
          </div>
        </header>

        <div className="anganwadi-application-preview-content">
          <article className="anganwadi-application-preview-print-area">
            <h1 className="anganwadi-application-preview-department">
              महिला सशक्तिकरण एवं बाल विकास विभाग उत्तराखण्ड
            </h1>
            <div className="anganwadi-application-preview-logo-row">
              <div className="anganwadi-application-preview-icds-logo" aria-label="ICDS">
                <strong>ICDS</strong>
                <span>बाल विकास सेवाएं</span>
              </div>
              <img src={ukLogo} alt="उत्तराखण्ड राज्य" />
            </div>
            <h2 className="anganwadi-application-preview-title">
              आंगनबाड़ी कार्यकर्त्री पुरस्कार चयन वर्ष 2026–27
            </h2>
            <h3 className="anganwadi-application-preview-status">
              {isFinal ? "Form status : FINAL SUBMIT" : "Form Preview : Form Pending"}
              <span> · {formatStatus(application.status)}</span>
              <span> · Merit Marks: {displayValue(merit)}</span>
            </h3>

            <div className="anganwadi-application-preview-table-wrap">
              <table className="anganwadi-application-preview-table">
                <thead>
                  <tr><th>क्रमांक</th><th>शीर्षक</th><th>जानकारी</th></tr>
                </thead>
                <tbody>
                  {applicantRows.map(([label, value, type], index) => (
                    <tr key={label}>
                      <td>{index + 1}</td>
                      <td>{label}</td>
                      <td>
                        {type === "photo"
                          ? renderFile(value, "आवेदक की पासपोर्ट साइज फोटो")
                          : displayValue(value)}
                      </td>
                    </tr>
                  ))}
                  {pastEmploymentRows.length > 0 && (
                    <>
                      <tr className="anganwadi-application-preview-group-row">
                        <td colSpan="3"><strong>वरीयता श्रेणी 1 : पूर्व में कार्यरत आंगनवाड़ी सहायिका</strong></td>
                      </tr>
                      {pastEmploymentRows.map(([label, value], index) => (
                        <tr key={label}>
                          <td>{applicantRows.length + index + 1}</td><td>{label}</td><td>{displayValue(value)}</td>
                        </tr>
                      ))}
                    </>
                  )}
                  <tr className="anganwadi-application-preview-group-row">
                    <td colSpan="3">
                      <strong>वरीयता श्रेणी : {variyata || "NA"}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>{priorityNumber}</td><td>विधवा :-</td>
                    <td>{variyata === "विधवा" ? "हाँ" : "नहीं"}</td>
                  </tr>
                  <tr>
                    <td>{priorityNumber + 1}</td><td>तलाकशुदा :-</td>
                    <td>{variyata.includes("तलाक") || variyata.includes("तलाख") ? "हाँ" : "नहीं"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="anganwadi-application-preview-section-title">
              शैक्षिक सूचना के बारे में दी जानकारी
            </h3>
            <div className="anganwadi-application-preview-table-wrap">
              <table className="anganwadi-application-preview-table">
                <thead>
                  <tr>
                    <th>कक्षा</th><th>बोर्ड/विश्वविद्यालय का नाम</th><th>उत्तीर्ण वर्ष</th>
                    <th>प्राप्तांक</th><th>पूर्णांक</th><th>प्रतिशत अंक</th><th>प्रमाण पत्र</th>
                  </tr>
                </thead>
                <tbody>
                  {application.edu_qual && (
                    <tr>
                      <td>शैक्षिक योग्यता</td><td colSpan="6">{displayValue(application.edu_qual)}</td>
                    </tr>
                  )}
                  {educationLevels.map(([label, prefix]) => (
                    <tr key={prefix}>
                      <td>{label}</td>
                      <td>{displayValue(application[`${prefix}_board`])}</td>
                      <td>{displayValue(application[`${prefix}_year`])}</td>
                      <td>{displayValue(application[`${prefix}_marks`])}</td>
                      <td>{displayValue(application[`${prefix}_tot`])}</td>
                      <td>{displayValue(application[`${prefix}_per`])}</td>
                      <td>{renderFile(application[`${prefix}_img`], `${label} प्रमाण पत्र`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="anganwadi-application-preview-section-title">
              अपलोड किए गए प्रमाण पत्र
            </h3>
            <div className="anganwadi-application-preview-table-wrap">
              <table className="anganwadi-application-preview-table">
                <thead>
                  <tr>
                    <th>अनिवार्य अहर्ताओं के सापेक्ष प्रमाण पत्र</th>
                    <th>प्रमाण पत्र</th>
                  </tr>
                </thead>
                <tbody>
                  {documentRows.map(([label, file]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{label.startsWith("2.") && casteCategory === "un" ? <span className="anganwadi-application-preview-missing">×</span> : renderFile(file, label)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="anganwadi-application-preview-signature">
              <div>{renderFile(application.signature, "आवेदक के हस्ताक्षर")}</div>
              <p>{displayValue(application.filer_name)}</p>
            </div>
          </article>

          <footer className="anganwadi-application-preview-footer">
            <div>
              <strong>आवेदन फार्म संख्या:</strong> {displayValue(application.form_id)}
              <span> · </span>
              <strong>Merit Marks:</strong> {displayValue(merit)}
            </div>
            <div className="anganwadi-application-preview-footer-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>बंद करें</button>
              {children}
              <button type="button" className="btn btn-info" onClick={onPrint}>
                <FaPrint className="me-2" /> Print
              </button>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
};

export default AnganwadiApplicationPreview;
