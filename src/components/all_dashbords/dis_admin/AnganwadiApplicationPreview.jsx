import React from "react";
import { FaCheckCircle, FaPrint } from "react-icons/fa";
import "./AnganwadiApplicationPreview.css";

const MEDIA_BASE_URL =
  "https://mahadevaaya.com/wecdallaward/wecdallaward_backend";

const ASSESSMENT_ROWS = [
  { title: "1. प्रधानमंत्री मातृ वंदना योजना की प्रगति", items: [["वर्ष में पात्र लाभार्थी", "pmmvy_tot"], ["लाभार्थी", "pmmvy_obt"]] },
  { title: "2. मुख्यमंत्री महालक्ष्मी किट योजना की प्रगति", items: [["वर्ष में पात्र लाभार्थी", "cmmk_tot"], ["लाभार्थी", "cmmk_obt"]] },
  { title: "3. नंदा गौरा योजना", items: [["वर्ष में जन्म वाली पात्र बालिकाओं की संख्या", "nanda1_tot"], ["लाभार्थी", "nanda1_obt"], ["वर्ष में 12वीं उत्तीर्ण वाली लाभार्थियों की संख्या", "nanda2_tot"], ["लाभार्थी", "nanda2_obt"]] },
  { title: "4. पोषण ट्रैकर ऐप में पूर्व-स्कूली शिक्षा", items: [["स्कूल पूर्व शिक्षा के कुल पंजीकृत बच्चों की संख्या", "pt_tot"], ["वित्तीय वर्ष में पंजीकृत बच्चों की औसत उपस्थिति", "pt_obt"]] },
  { title: "5. वित्तीय वर्ष में कुल गृह भ्रमण का विवरण", items: [["लक्ष्य", "survey_tot"], ["किए गए गृह भ्रमण की संख्या", "survey_obt"]] },
  { title: "6. अन्नप्राशन की गतिविधियों का संचालन", items: [["वर्ष में पात्र लाभार्थी", "ann_tot"], ["जिनका अन्नप्राशन किया गया", "ann_obt"]] },
  { title: "7. पोषण ट्रैकर ऐप में समुदाय आधारित गतिविधियों का विवरण", items: [["वार्षिक लक्ष्य", "pt_group_tot"], ["समुदाय आधारित गतिविधियों (CBE) का विवरण", "pt_group_obt"]], files: [{ key: "pt_group_img", label: "गतिविधियों से संबंधित फोटो" }] },
  { title: "8. संदर्भ सेवाएं", items: [["अतिकुपोषित / कुपोषित हाई-रिस्क पंजीकृत महिलाओं की कुल संख्या", "sandharbh_tot"], ["वित्तीय वर्ष में संदर्भित महिलाओं की कुल संख्या", "sandharbh_obt"]], files: [{ key: "sandharbh_img", label: "संदर्भण पर्ची (Referral Slip)" }] },
  { title: "9. कुपोषित एवं अतिकुपोषित लाभार्थियों की जानकारी", items: [["कुल पंजीकृत लाभार्थियों की संख्या", "sam_tot"], ["इस वित्तीय वर्ष में कुपोषण से मुक्त लाभार्थी", "sam_obt"], ["संदर्भण के अतिरिक्त किए गए विशेष प्रयास", "sam_detail"]], files: [{ key: "sam_img", label: "संबंधित फोटो" }] },
  { title: "10. वित्तीय वर्ष में VHSND (ग्राम स्वच्छता एवं पोषण दिवस)", items: [["कुल लक्ष्य", "vhsnd_tot"], ["आयोजित VHSND की कुल संख्या", "vhsnd_obt"]] },
  { title: "11. पोषण ट्रैकर ऐप में आधार नामांकन", items: [["कुल पंजीकृत लाभार्थियों की संख्या", "pt_ben_tot"], ["आधार नामांकन किए गए लाभार्थियों की संख्या", "pt_ben_obt"]] },
  { title: "12. आंगनवाड़ी केंद्र में अभिलेखों / पंजिकाओं का रखरखाव", items: [["कुल अभिलेख / पंजिकाएं", "abhilekh_tot"], ["पूर्ण रूप से भरे अभिलेख / पंजिकाएं", "abhilekh_obt"]] },
  { title: "13. आंगनवाड़ी केंद्र एवं आसपास की साफ-सफाई", checklist: true },
  { title: "14. राष्ट्रीय कृमि दिवस के अंतर्गत दवा खिलाने का विवरण", items: [["1–6 वर्ष के बच्चों की कुल संख्या", "krimi_tot"], ["दवा खिलाए गए बच्चों की संख्या", "krimi_obt"]] },
  { title: "15. राष्ट्रीय पोषण सप्ताह", items: [["आयोजित रैलियों की कुल संख्या", "poshan_week_tot"], ["रैलियों में प्रतिभागियों की कुल संख्या", "poshan_week_obt"]] },
  { title: "16. कुपोषित बच्चों के स्वास्थ्य के संबंध में की गई कार्यवाही", items: [["अतिकुपोषित श्रेणी के 0–6 वर्ष के बच्चों की कुल संख्या", "sam_6mon_tot"], ["अतिकुपोषित से कुपोषित श्रेणी में आए बच्चों की संख्या", "sam_6yr_tot"], ["कुपोषित से सामान्य श्रेणी में आए बच्चों की संख्या", "mam_6mon_tot"]], files: [{ key: "sam_6mon_img", label: "अतिकुपोषित बच्चों की फोटो" }, { key: "sam_6yr_img", label: "श्रेणी में सुधार वाले बच्चों की फोटो" }, { key: "mam_6mon_img", label: "सामान्य श्रेणी में आए बच्चों की फोटो" }] },
  { title: "17. गंभीर बीमारी से ग्रसित बच्चों का विवरण", items: [["गंभीर बीमारी से ग्रसित बच्चों की कुल संख्या", "gambhir_tot"], ["उपचार कराए गए लाभार्थियों का विवरण", "gambhir_detail"]], files: [{ key: "gambhir_img", label: "संबंधित बच्चों की फोटो" }] },
  { title: "18. RBSK टीम द्वारा केंद्र भ्रमण का विवरण", items: [["वार्षिक लक्ष्य", "rbsk_tot"], ["किए गए भ्रमणों की संख्या", "rbsk_obt"], ["स्वास्थ्य जांच किए गए बच्चों की कुल संख्या", "rbsk_surv_obt"]] },
  { title: "19. अन्य विशिष्ट कार्य (BLO, जनगणना, पल्स पोलियो आदि)", items: [["कार्य का विवरण", "other_work_detail"]], files: [{ key: "other_work_img", label: "आदेश की फोटो" }] },
  { title: "20. विभागीय सहयोग से किए गए कार्यों का विवरण", items: [["कार्य का विवरण", "dept_work_detail"]] },
  { title: "21. व्यक्तिगत प्रयासों से केंद्र को सार्वजनिक भवन में स्थानांतरित करना", items: [["कार्य का विवरण", "per_work_detail"]] },
  { title: "22. अन्य विशिष्ट उपलब्धियां एवं कुपोषण उन्मूलन के प्रयास", items: [["विवरण", "ach_work"]] },
];

const ESSENTIAL_CERTIFICATE_ROWS = [
  { key: "aharta1", label: "1. आंगनबाड़ी कार्यकर्ती / मिनी कार्यकर्ती के रूप में पांच वर्ष की निरंतर सेवा पूर्ण कर ली हो तथा वर्तमान में कार्यरत हों (CDPO द्वारा प्रदत्त प्रमाण-पत्र)" },
  { key: "aharta2", label: "2. ऐसे आंगनबाड़ी केंद्र / मिनी आंगनबाड़ी केंद्र का संचालन करती हों जहां सर्वे अनुसार ग्रामीण क्षेत्रों में न्यूनतम 10 एवं शहरी क्षेत्रों में न्यूनतम 20 बच्चे पंजीकृत हों (क्षेत्रीय सुपरवाइजर द्वारा प्रदत्त प्रमाण-पत्र)" },
  { key: "aharta3", label: "3. संबंधित आंगनबाड़ी केंद्र के समस्त लाभार्थी पोषण ट्रैकर ऐप में पंजीकृत हों (क्षेत्रीय सुपरवाइजर द्वारा प्रदत्त प्रमाण-पत्र)" },
  { key: "aharta4", label: "4. संबंधित आंगनबाड़ी केंद्र के समस्त बच्चों की प्रतिरक्षण दर राज्य स्तरीय दर से कम न होने का प्रमाण-पत्र" },
];

const SELECTION_CERTIFICATE_ROWS = [
  { key: "manak2", label: "1. अन्य विशिष्ट उपलब्धियों, महत्वपूर्ण दिवसों एवं कुपोषण उन्मूलन के प्रयासों के समाचार / अभिलेख" },
  { key: "manak3a", label: "2(i). विभागीय सहयोग से केंद्र को मॉडल बनाने के कार्यों का विवरण" },
  { key: "manak3b", label: "2(ii). व्यक्तिगत प्रयास से केंद्र को मॉडल बनाने के कार्यों का विवरण" },
  { key: "manak4", label: "3. उत्कृष्ट कार्यों हेतु प्राप्त सम्मान, पुरस्कार या प्रमाण-पत्र" },
];

const displayValue = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") return "—";
  return String(value);
};

const formatDate = (value) => {
  if (!value) return "—";
  const dateValue = String(value);
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(dateValue) ? `${dateValue}T00:00:00` : dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const getMediaUrl = (file) => {
  const path = String(file || "").trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${MEDIA_BASE_URL}/${path.replace(/^\/+/, "")}`;
};

const AnganwadiApplicationPreview = ({
  application,
  rolePrefix,
  onClose,
  onPrint,
  children,
}) => {
  if (!application) return null;

  const renderFile = (file, label) => {
    if (!file) {
      return <span className="anganwadi-application-preview-missing">दस्तावेज़ अपलोड नहीं हुआ है / Document Not Uploaded</span>;
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
        <a href={url} target="_blank" rel="noreferrer">{fileName}</a>
      </div>
    );
  };

  const applicantRows = [
    ["आवेदन फार्म संख्या", application.applicant_id || application.form_id || application.id],
    ["आवेदक का नाम", application.filer_name],
    ["पिता / पति का नाम", application.fath_husb_name],
    ["जन्म तिथि", formatDate(application.dob)],
    ["आयु", application.age],
    ["मोबाइल नंबर", application.filer_mob],
    ["ईमेल आईडी", application.filer_email],
    ["आधार नंबर", application.filer_adhar],
    ["शैक्षिक योग्यता", application.edu_qual],
    ["जनपद", application.district],
    ["विकासखंड / परियोजना", application.project],
    ["सेक्टर", application.sector],
    ["आंगनवाड़ी केंद्र / केंद्र कोड", application.awc_center],
    ["आंगनवाड़ी केंद्र का नाम", application.awc_name],
    ["आंगनवाड़ी कार्यकर्त्री के रूप में योगदान तिथि", formatDate(application.joining_date)],
    ["गांव / क्षेत्र", application.village],
    ["शहर", application.city],
    ["पूरा पता", application.address],
    ["पिन कोड", application.pincode],
    ["खाताधारक का नाम", application.acc_holder],
    ["बैंक खाता संख्या", application.acc_no],
    ["IFSC कोड", application.acc_ifsc],
    ["बैंक का नाम", application.bank_name],
    ["PAN कार्ड", application.pancard],
  ];

  const checklistAnswers = Array.isArray(application.saaf_ans)
    ? application.saaf_ans
    : typeof application.saaf_ans === "string" && application.saaf_ans.trim()
      ? application.saaf_ans.split(",").map((answer) => answer.trim()).filter(Boolean)
      : [];

  const renderCertificateRows = (rows) =>
    rows.map(({ key, label }) => (
      <tr key={key}>
        <td>{label}</td>
        <td>{renderFile(application[key], label)}</td>
      </tr>
    ));

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
            <button type="button" className="btn btn-light" aria-label="Close application preview" onClick={onClose}>×</button>
          </div>
        </header>

        <div className="anganwadi-application-preview-content">
          <article className="anganwadi-application-preview-print-area">
            <h1 className="anganwadi-application-preview-department">महिला सशक्तिकरण एवं बाल विकास विभाग</h1>
            <h2 className="anganwadi-application-preview-title">आंगनवाड़ी कार्यकर्त्री पुरस्कार 2026–27 आवेदन पत्र</h2>

            <div className="anganwadi-application-preview-table-wrap">
              <table className="anganwadi-application-preview-table">
                <thead><tr><th>जानकारी का शीर्षक</th><th></th></tr></thead>
                <tbody>
                  {applicantRows.map(([label, value], index) => (
                    <tr key={label}>
                      <td>{label} :-</td>
                      <td>
                        {displayValue(value)}
                        {index === 1 && <div className="anganwadi-application-preview-applicant-photo">{renderFile(application.photo_img, "आवेदक का फोटो")}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="anganwadi-application-preview-table-wrap">
              <table className="anganwadi-application-preview-table">
                <thead><tr><th>मूल्यांकन के लिए प्रश्न</th><th>चुना हुआ उत्तर</th></tr></thead>
                <tbody>
                  {ASSESSMENT_ROWS.map((row) => (
                    <tr key={row.title}>
                      <td>{row.title}</td>
                      <td>
                        {row.items?.map(([label, field]) => (
                          <div className="anganwadi-application-preview-answer" key={field}>
                            {label} - {displayValue(application[field])}
                          </div>
                        ))}
                        {row.checklist && (checklistAnswers.length
                          ? checklistAnswers.map((answer) => <div className="anganwadi-application-preview-check" key={answer}><FaCheckCircle aria-hidden="true" /> {answer}</div>)
                          : <span>—</span>)}
                        {row.files?.map(({ key, label }) => (
                          <div className="anganwadi-application-preview-inline-file" key={key}>
                            <span>{label} - </span>{renderFile(application[key], label)}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="anganwadi-application-preview-section-title">Step 3: अपलोड दस्तावेज़ / प्रमाण पत्र का विवरण</h3>
            <div className="anganwadi-application-preview-table-wrap">
              <table className="anganwadi-application-preview-table">
                <thead><tr><th>अनिवार्य अर्हताओं के सापेक्ष प्रमाण पत्र</th><th>प्रमाण पत्र</th></tr></thead>
                <tbody>{renderCertificateRows(ESSENTIAL_CERTIFICATE_ROWS)}</tbody>
              </table>
            </div>

            <div className="anganwadi-application-preview-table-wrap">
              <table className="anganwadi-application-preview-table">
                <thead><tr><th>चयन मानक संबंधित प्रमाण पत्र</th><th>प्रमाण पत्र</th></tr></thead>
                <tbody>{renderCertificateRows(SELECTION_CERTIFICATE_ROWS)}</tbody>
              </table>
            </div>

            <div className="anganwadi-application-preview-signature">
              <span>आवेदक के हस्ताक्षर</span>
              {renderFile(application.signature, "आवेदक के हस्ताक्षर")}
            </div>
          </article>
          {children && <footer className="anganwadi-application-preview-footer-actions">{children}</footer>}
        </div>
      </section>
    </div>
  );
};

export default AnganwadiApplicationPreview;
