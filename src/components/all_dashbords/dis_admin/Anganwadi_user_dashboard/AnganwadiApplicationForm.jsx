import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import {
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaFileAlt,
  FaPrint,
} from "react-icons/fa";
import {
  getAnganwadiApplication,
  isAnganwadiApplicationDemoMode,
  saveAnganwadiApplicationStep,
  submitAnganwadiApplication,
} from "./anganwadiApplicationApi";
import "./AnganwadiApplicationForm.css";

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "";
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  if (
    Number.isNaN(birthDate.getTime()) ||
    birthDate > today ||
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return "";
  }

  let age = today.getFullYear() - year;
  if (
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day)
  ) {
    age -= 1;
  }
  return String(age);
};

const EDUCATION_OPTIONS = [
  "8th/आठवीं",
  "10th/दसवीं",
  "12th/बारवी",
  "Diploma/डिप्लोमा",
  "Graduation/स्नातक",
  "Post-Graduation/स्नातकोत्तर",
  "P.H.D/पी.एच.डी",
];

const STEP_ONE_GROUPS = [
  {
    title: "व्यक्तिगत जानकारी",
    fields: [
      { name: "filer_name", label: "आवेदक का नाम", readOnly: true },
      { name: "fath_husb_name", label: "पिता / पति का नाम", required: true },
      { name: "dob", label: "जन्म तिथि", type: "date", required: true },
      {
        name: "age",
        label: "आयु (स्वतः गणना)",
        readOnly: true,
        help: "जन्म तिथि चुनने पर आयु अपने आप दिखाई जाएगी।",
      },
      { name: "filer_mob", label: "मोबाइल नंबर", readOnly: true },
      { name: "filer_email", label: "ईमेल आईडी", type: "email" },
      {
        name: "filer_adhar",
        label: "आधार नंबर",
        inputMode: "numeric",
        maxLength: 12,
        pattern: "[0-9]{12}",
        required: true,
      },
      {
        name: "edu_qual",
        label: "शैक्षिक योग्यता",
        type: "select",
        required: true,
        options: EDUCATION_OPTIONS,
      },
    ],
  },
  {
    title: "कार्य विवरण",
    fields: [
      { name: "district", label: "जनपद", readOnly: true },
      { name: "project", label: "विकासखंड / परियोजना", readOnly: true },
      {
        name: "awc_center",
        label: "आंगनवाड़ी केंद्र",
        type: "select",
        required: true,
        options: [
          "डेमो आंगनवाड़ी केंद्र 01 (AWC-DEMO-001)",
          "डेमो आंगनवाड़ी केंद्र 02 (AWC-DEMO-002)",
          "डेमो मिनी आंगनवाड़ी केंद्र (AWC-DEMO-003)",
        ],
      },
      {
        name: "joining_date",
        label: "आंगनवाड़ी कार्यकर्त्री के रूप में योगदान तिथि",
        type: "date",
        required: true,
        help: "सेवा-अवधि और पात्रता की गणना सर्वर द्वारा की जाएगी।",
      },
    ],
  },
  {
    title: "पता विवरण",
    fields: [
      { name: "village", label: "गांव / क्षेत्र", required: true },
      { name: "city", label: "शहर", required: true },
      { name: "address", label: "पूरा पता", required: true },
      {
        name: "pincode",
        label: "पिन कोड",
        inputMode: "numeric",
        maxLength: 6,
        required: true,
      },
    ],
  },
  {
    title: "बैंक विवरण",
    fields: [
      { name: "acc_holder", label: "खाताधारक का नाम", required: true },
      {
        name: "acc_no",
        label: "बैंक खाता संख्या",
        inputMode: "numeric",
        required: true,
      },
      { name: "acc_ifsc", label: "IFSC कोड", required: true },
      { name: "bank_name", label: "बैंक का नाम", required: true },
      { name: "pancard", label: "PAN कार्ड", required: true },
    ],
  },
];

const ASSESSMENT_GROUPS = [
  {
    title: "प्रधानमंत्री मातृ वंदना योजना की प्रगति",
    fields: [
      { name: "pmmvy_tot", label: "वर्ष में पात्र लाभार्थी" },
      { name: "pmmvy_obt", label: "जिनके आवेदन भरवाए गए" },
    ],
  },
  {
    title: "मुख्यमंत्री महालक्ष्मी किट योजना की प्रगति",
    fields: [
      { name: "cmmk_tot", label: "वर्ष में पात्र लाभार्थी" },
      { name: "cmmk_obt", label: "लाभ प्रदान किए गए लाभार्थी" },
    ],
  },
  {
    title: "नंदा गौरा योजना",
    fields: [
      { name: "nanda1_tot", label: "वर्ष में जन्मी पात्र बालिकाएं" },
      { name: "nanda1_obt", label: "भरे गए आवेदन" },
      { name: "nanda2_tot", label: "12वीं उत्तीर्ण पात्र लाभार्थी" },
      { name: "nanda2_obt", label: "भरे गए आवेदन" },
    ],
  },
  {
    title: "पोषण ट्रैकर ऐप में पूर्व-स्कूली शिक्षा",
    fields: [
      { name: "pt_tot", label: "कुल पंजीकृत बच्चे" },
      { name: "pt_obt", label: "वित्तीय वर्ष में बच्चों की औसत उपस्थिति" },
    ],
  },
  {
    title: "वित्तीय वर्ष में गृह भ्रमण",
    fields: [
      { name: "survey_tot", label: "वार्षिक लक्ष्य", readOnly: true },
      { name: "survey_obt", label: "किए गए गृह भ्रमण" },
    ],
  },
  {
    title: "अन्नप्राशन गतिविधियां",
    fields: [
      { name: "ann_tot", label: "वर्ष में पात्र लाभार्थी" },
      { name: "ann_obt", label: "अन्नप्राशन किए गए लाभार्थी" },
    ],
  },
  {
    title: "पोषण ट्रैकर ऐप में समुदाय आधारित गतिविधियां",
    fields: [
      { name: "pt_group_tot", label: "वार्षिक लक्ष्य", readOnly: true },
      { name: "pt_group_obt", label: "आयोजित समुदाय आधारित गतिविधियां (CBE)" },
      {
        name: "pt_group_img",
        label: "गतिविधियों से संबंधित फोटो",
        type: "file",
        accept: "image/*",
        optional: true,
      },
    ],
  },
  {
    title: "संदर्भ सेवाएं",
    fields: [
      {
        name: "sandharbh_tot",
        label: "अतिकुपोषित / कुपोषित बच्चों एवं हाई-रिस्क महिलाओं की संख्या",
      },
      {
        name: "sandharbh_obt",
        label: "वित्तीय वर्ष में संदर्भित महिलाओं की संख्या",
      },
      {
        name: "sandharbh_img",
        label: "संदर्भण पर्ची (Referral Slip)",
        type: "file",
        accept: "image/*,.pdf",
        optional: true,
      },
    ],
  },
  {
    title: "कुपोषित एवं अतिकुपोषित लाभार्थी",
    fields: [
      { name: "sam_tot", label: "कुल पंजीकृत लाभार्थी" },
      { name: "sam_obt", label: "इस वित्तीय वर्ष में कुपोषण से मुक्त लाभार्थी" },
      {
        name: "sam_detail",
        label: "संदर्भण के अतिरिक्त किए गए विशेष प्रयास",
        type: "textarea",
      },
      {
        name: "sam_img",
        label: "संबंधित फोटो",
        type: "file",
        accept: "image/*",
        optional: true,
      },
    ],
  },
  {
    title: "VHSND (ग्राम स्वच्छता एवं पोषण दिवस)",
    fields: [
      { name: "vhsnd_tot", label: "कुल लक्ष्य", readOnly: true },
      { name: "vhsnd_obt", label: "आयोजित VHSND की कुल संख्या" },
    ],
  },
  {
    title: "पोषण ट्रैकर ऐप में आधार नामांकन",
    fields: [
      { name: "pt_ben_tot", label: "कुल पंजीकृत लाभार्थी" },
      { name: "pt_ben_obt", label: "आधार नामांकन किए गए लाभार्थी" },
    ],
  },
  {
    title: "अभिलेखों / पंजिकाओं का रखरखाव",
    fields: [
      { name: "abhilekh_tot", label: "कुल अभिलेख / पंजिकाएं" },
      { name: "abhilekh_obt", label: "पूर्ण रूप से भरे अभिलेख / पंजिकाएं" },
    ],
  },
  {
    title: "आंगनवाड़ी केंद्र एवं आसपास की साफ-सफाई",
    checkboxes: [
      "हाथ धोने का प्रशिक्षण दिया है",
      "बच्चों के नाखून कटे हुए हैं",
      "केंद्र के आसपास सफाई है",
      "केंद्र में पोस्टर लगाए गए हैं",
    ],
  },
  {
    title: "राष्ट्रीय कृमि दिवस",
    description: "1–6 वर्ष तक के बच्चों को दवा खिलाने का विवरण",
    fields: [
      { name: "krimi_tot", label: "बच्चों की कुल संख्या" },
      { name: "krimi_obt", label: "दवा खिलाए गए बच्चे" },
    ],
  },
  {
    title: "राष्ट्रीय पोषण सप्ताह",
    fields: [
      { name: "poshan_week_tot", label: "आयोजित रैलियों की कुल संख्या" },
      { name: "poshan_week_obt", label: "रैलियों में प्रतिभागियों की कुल संख्या" },
    ],
  },
  {
    title: "कुपोषित बच्चों के स्वास्थ्य में सुधार हेतु कार्यवाही",
    fields: [
      { name: "sam_6mon_tot", label: "अतिकुपोषित श्रेणी के 0–6 वर्ष के बच्चे" },
      {
        name: "sam_6mon_img",
        label: "संबंधित बच्चों की फोटो",
        type: "file",
        accept: "image/*",
        optional: true,
      },
      {
        name: "sam_6yr_tot",
        label: "अतिकुपोषित से कुपोषित श्रेणी में आए 0–6 वर्ष के बच्चे",
      },
      {
        name: "sam_6yr_img",
        label: "संबंधित बच्चों की फोटो",
        type: "file",
        accept: "image/*",
        optional: true,
      },
      {
        name: "mam_6mon_tot",
        label: "कुपोषित से सामान्य श्रेणी में आए 0–6 वर्ष के बच्चे",
      },
      {
        name: "mam_6mon_img",
        label: "संबंधित बच्चों की फोटो",
        type: "file",
        accept: "image/*",
        optional: true,
      },
    ],
  },
  {
    title: "गंभीर बीमारी से ग्रसित बच्चों का विवरण",
    fields: [
      { name: "gambhir_tot", label: "गंभीर बीमारी से ग्रसित बच्चों की संख्या" },
      { name: "gambhir_detail", label: "उपचार कराए गए लाभार्थियों की संख्या" },
      {
        name: "gambhir_img",
        label: "संबंधित बच्चों की फोटो",
        type: "file",
        accept: "image/*",
        optional: true,
      },
    ],
  },
  {
    title: "RBSK टीम द्वारा केंद्र भ्रमण",
    fields: [
      { name: "rbsk_tot", label: "वार्षिक लक्ष्य", readOnly: true },
      { name: "rbsk_obt", label: "टीम द्वारा किए गए भ्रमण" },
      { name: "rbsk_surv_obt", label: "स्वास्थ्य जांच किए गए बच्चों की संख्या" },
    ],
  },
  {
    title: "अन्य विशिष्ट कार्य (BLO, जनगणना, पल्स पोलियो आदि)",
    fields: [
      {
        name: "other_work_detail",
        label: "कार्य का विवरण",
        type: "textarea",
      },
      {
        name: "other_work_img",
        label: "आदेश की फोटो",
        type: "file",
        accept: "image/*,.pdf",
        optional: true,
      },
    ],
  },
  {
    title: "विभागीय सहयोग से किए गए कार्य",
    fields: [
      {
        name: "dept_work_detail",
        label: "कार्य का विवरण",
        type: "textarea",
      },
    ],
  },
  {
    title: "व्यक्तिगत प्रयास से केंद्र को सार्वजनिक भवन में स्थानांतरित करना",
    fields: [
      {
        name: "per_work_detail",
        label: "कार्य का विवरण",
        type: "textarea",
      },
    ],
  },
  {
    title: "अन्य विशिष्ट उपलब्धियां एवं कुपोषण उन्मूलन के प्रयास",
    fields: [
      {
        name: "ach_work",
        label: "महत्वपूर्ण दिवस, प्रयास, फोटो और समाचार-पत्रों में प्रकाशित खबरों का विवरण",
        type: "textarea",
      },
    ],
  },
];

const DOCUMENT_GROUPS = [
  {
    title: "अनिवार्य अर्हताओं के प्रमाण पत्र",
    documents: [
      {
        name: "aharta1",
        label:
          "पांच वर्ष की निरंतर सेवा पूर्ण करने एवं वर्तमान में कार्यरत होने का प्रमाण-पत्र (CDPO द्वारा प्रदत्त)",
        required: true,
      },
      {
        name: "aharta2",
        label:
          "केंद्र में ग्रामीण क्षेत्र के न्यूनतम 10 या शहरी क्षेत्र के न्यूनतम 20 बच्चों के पंजीकरण का प्रमाण-पत्र (क्षेत्रीय सुपरवाइजर द्वारा प्रदत्त)",
        required: true,
      },
      {
        name: "aharta3",
        label:
          "केंद्र के सभी लाभार्थियों के पोषण ट्रैकर ऐप में पंजीकृत होने का प्रमाण-पत्र",
        required: true,
      },
      {
        name: "aharta4",
        label:
          "केंद्र के सभी बच्चों की प्रतिरक्षण दर राज्य स्तरीय दर से कम न होने का प्रमाण-पत्र",
        required: true,
      },
    ],
  },
  {
    title: "चयन मानक से संबंधित प्रमाण पत्र",
    documents: [
      {
        name: "manak2",
        label:
          "अन्य विशिष्ट उपलब्धियों, महत्वपूर्ण दिवसों एवं कुपोषण उन्मूलन के प्रयासों के समाचार / अभिलेख",
      },
      {
        name: "manak3a",
        label: "विभागीय सहयोग से केंद्र को मॉडल बनाने के कार्यों का विवरण",
      },
      {
        name: "manak3b",
        label: "व्यक्तिगत प्रयासों से केंद्र को मॉडल बनाने के कार्यों का विवरण",
      },
      {
        name: "manak4",
        label: "उत्कृष्ट कार्यों हेतु प्राप्त सम्मान, पुरस्कार या प्रमाण-पत्र",
      },
    ],
  },
  {
    title: "फोटो एवं हस्ताक्षर",
    documents: [
      { name: "photo_img", label: "आवेदक का फोटो", required: true, image: true },
      { name: "signature", label: "आवेदक के हस्ताक्षर", required: true, image: true },
    ],
  },
];

const PROGRESS_STEPS = [
  "व्यक्तिगत जानकारी",
  "मूल्यांकन प्रारूप",
  "दस्तावेज़ अपलोड",
];

const readOnlyFieldNames = new Set([
  "filer_name",
  "filer_mob",
  "district",
  "project",
]);

const PREVIEW_ASSESSMENT_ROWS = [
  {
    title: "1. प्रधानमंत्री मातृ वंदना योजना की प्रगति",
    items: [
      ["वर्ष में पात्र लाभार्थी", "pmmvy_tot"],
      ["लाभार्थी", "pmmvy_obt"],
    ],
  },
  {
    title: "2. मुख्यमंत्री महालक्ष्मी किट योजना की प्रगति",
    items: [
      ["वर्ष में पात्र लाभार्थी", "cmmk_tot"],
      ["लाभार्थी", "cmmk_obt"],
    ],
  },
  {
    title: "3. नंदा गौरा योजना",
    items: [
      ["वर्ष में जन्म वाली पात्र बालिकाओं की संख्या", "nanda1_tot"],
      ["लाभार्थी", "nanda1_obt"],
      ["वर्ष में 12वीं उत्तीर्ण वाली लाभार्थियों की संख्या", "nanda2_tot"],
      ["लाभार्थी", "nanda2_obt"],
    ],
  },
  {
    title: "4. पोषण ट्रैकर ऐप में पूर्व-स्कूली शिक्षा",
    items: [
      ["स्कूल पूर्व शिक्षा के कुल पंजीकृत बच्चों की संख्या", "pt_tot"],
      ["वित्तीय वर्ष में पंजीकृत बच्चों की औसत उपस्थिति", "pt_obt"],
    ],
  },
  {
    title: "5. वित्तीय वर्ष में कुल गृह भ्रमण का विवरण",
    items: [
      ["लक्ष्य", "survey_tot"],
      ["किए गए गृह भ्रमण की संख्या", "survey_obt"],
    ],
  },
  {
    title: "6. अन्नप्राशन की गतिविधियों का संचालन",
    items: [
      ["वर्ष में पात्र लाभार्थी", "ann_tot"],
      ["जिनका अन्नप्राशन किया गया", "ann_obt"],
    ],
  },
  {
    title: "7. पोषण ट्रैकर ऐप में समुदाय आधारित गतिविधियों का विवरण",
    items: [
      ["वार्षिक लक्ष्य", "pt_group_tot"],
      ["समुदाय आधारित गतिविधियों (CBE) का विवरण", "pt_group_obt"],
    ],
    files: [{ key: "pt_group_img", label: "गतिविधियों से संबंधित फोटो" }],
  },
  {
    title: "8. संदर्भ सेवाएं",
    items: [
      ["अतिकुपोषित / कुपोषित हाई-रिस्क पंजीकृत महिलाओं की कुल संख्या", "sandharbh_tot"],
      ["वित्तीय वर्ष में संदर्भित महिलाओं की कुल संख्या", "sandharbh_obt"],
    ],
    files: [{ key: "sandharbh_img", label: "संदर्भण पर्ची (Referral Slip)" }],
  },
  {
    title: "9. कुपोषित एवं अतिकुपोषित लाभार्थियों की जानकारी",
    items: [
      ["कुल पंजीकृत लाभार्थियों की संख्या", "sam_tot"],
      ["इस वित्तीय वर्ष में कुपोषण से मुक्त लाभार्थी", "sam_obt"],
      ["संदर्भण के अतिरिक्त किए गए विशेष प्रयास", "sam_detail"],
    ],
    files: [{ key: "sam_img", label: "संबंधित फोटो" }],
  },
  {
    title: "10. वित्तीय वर्ष में VHSND (ग्राम स्वच्छता एवं पोषण दिवस)",
    items: [
      ["कुल लक्ष्य", "vhsnd_tot"],
      ["आयोजित VHSND की कुल संख्या", "vhsnd_obt"],
    ],
  },
  {
    title: "11. पोषण ट्रैकर ऐप में आधार नामांकन",
    items: [
      ["कुल पंजीकृत लाभार्थियों की संख्या", "pt_ben_tot"],
      ["आधार नामांकन किए गए लाभार्थियों की संख्या", "pt_ben_obt"],
    ],
  },
  {
    title: "12. आंगनवाड़ी केंद्र में अभिलेखों / पंजिकाओं का रखरखाव",
    items: [
      ["कुल अभिलेख / पंजिकाएं", "abhilekh_tot"],
      ["पूर्ण रूप से भरे अभिलेख / पंजिकाएं", "abhilekh_obt"],
    ],
  },
  {
    title: "13. आंगनवाड़ी केंद्र एवं आसपास की साफ-सफाई",
    checklist: true,
  },
  {
    title: "14. राष्ट्रीय कृमि दिवस के अंतर्गत दवा खिलाने का विवरण",
    items: [
      ["1–6 वर्ष के बच्चों की कुल संख्या", "krimi_tot"],
      ["दवा खिलाए गए बच्चों की संख्या", "krimi_obt"],
    ],
  },
  {
    title: "15. राष्ट्रीय पोषण सप्ताह",
    items: [
      ["आयोजित रैलियों की कुल संख्या", "poshan_week_tot"],
      ["रैलियों में प्रतिभागियों की कुल संख्या", "poshan_week_obt"],
    ],
  },
  {
    title: "16. कुपोषित बच्चों के स्वास्थ्य के संबंध में की गई कार्यवाही",
    items: [
      ["अतिकुपोषित श्रेणी के 0–6 वर्ष के बच्चों की कुल संख्या", "sam_6mon_tot"],
      ["अतिकुपोषित से कुपोषित श्रेणी में आए बच्चों की संख्या", "sam_6yr_tot"],
      ["कुपोषित से सामान्य श्रेणी में आए बच्चों की संख्या", "mam_6mon_tot"],
    ],
    files: [
      { key: "sam_6mon_img", label: "अतिकुपोषित बच्चों की फोटो" },
      { key: "sam_6yr_img", label: "श्रेणी में सुधार वाले बच्चों की फोटो" },
      { key: "mam_6mon_img", label: "सामान्य श्रेणी में आए बच्चों की फोटो" },
    ],
  },
  {
    title: "17. गंभीर बीमारी से ग्रसित बच्चों का विवरण",
    items: [
      ["गंभीर बीमारी से ग्रसित बच्चों की कुल संख्या", "gambhir_tot"],
      ["उपचार कराए गए लाभार्थियों का विवरण", "gambhir_detail"],
    ],
    files: [{ key: "gambhir_img", label: "संबंधित बच्चों की फोटो" }],
  },
  {
    title: "18. RBSK टीम द्वारा केंद्र भ्रमण का विवरण",
    items: [
      ["वार्षिक लक्ष्य", "rbsk_tot"],
      ["किए गए भ्रमणों की संख्या", "rbsk_obt"],
      ["स्वास्थ्य जांच किए गए बच्चों की कुल संख्या", "rbsk_surv_obt"],
    ],
  },
  {
    title: "19. अन्य विशिष्ट कार्य (BLO, जनगणना, पल्स पोलियो आदि)",
    items: [["कार्य का विवरण", "other_work_detail"]],
    files: [{ key: "other_work_img", label: "आदेश की फोटो" }],
  },
  {
    title: "20. विभागीय सहयोग से किए गए कार्यों का विवरण",
    items: [["कार्य का विवरण", "dept_work_detail"]],
  },
  {
    title: "21. व्यक्तिगत प्रयासों से केंद्र को सार्वजनिक भवन में स्थानांतरित करना",
    items: [["कार्य का विवरण", "per_work_detail"]],
  },
  {
    title: "22. अन्य विशिष्ट उपलब्धियां एवं कुपोषण उन्मूलन के प्रयास",
    items: [["विवरण", "ach_work"]],
  },
];

const ESSENTIAL_CERTIFICATE_ROWS = [
  {
    key: "aharta1",
    label:
      "1. आंगनबाड़ी कार्यकर्ती / मिनी कार्यकर्ती के रूप में पांच वर्ष की निरंतर सेवा पूर्ण कर ली हो तथा वर्तमान में कार्यरत हों (CDPO द्वारा प्रदत्त प्रमाण-पत्र)",
  },
  {
    key: "aharta2",
    label:
      "2. ऐसे आंगनबाड़ी केंद्र / मिनी आंगनबाड़ी केंद्र का संचालन करती हों जहां सर्वे अनुसार ग्रामीण क्षेत्रों में न्यूनतम 10 एवं शहरी क्षेत्रों में न्यूनतम 20 बच्चे पंजीकृत हों (क्षेत्रीय सुपरवाइजर द्वारा प्रदत्त प्रमाण-पत्र)",
  },
  {
    key: "aharta3",
    label:
      "3. संबंधित आंगनबाड़ी केंद्र के समस्त लाभार्थी पोषण ट्रैकर ऐप में पंजीकृत हों (क्षेत्रीय सुपरवाइजर द्वारा प्रदत्त प्रमाण-पत्र)",
  },
  {
    key: "aharta4",
    label:
      "4. संबंधित आंगनबाड़ी केंद्र के समस्त बच्चों की प्रतिरक्षण दर राज्य स्तरीय दर से कम न होने का प्रमाण-पत्र",
  },
];

const SELECTION_CERTIFICATE_ROWS = [
  {
    key: "manak2",
    label:
      "1. अन्य विशिष्ट उपलब्धियों, महत्वपूर्ण दिवसों एवं कुपोषण उन्मूलन के प्रयासों के समाचार / अभिलेख",
  },
  {
    key: "manak3a",
    label: "2(i). विभागीय सहयोग से केंद्र को मॉडल बनाने के कार्यों का विवरण",
  },
  {
    key: "manak3b",
    label: "2(ii). व्यक्तिगत प्रयासों से केंद्र को मॉडल बनाने के कार्यों का विवरण",
  },
  {
    key: "manak4",
    label: "3. उत्कृष्ट कार्यों हेतु प्राप्त सम्मान, पुरस्कार या प्रमाण-पत्र",
  },
];

const formatPreviewDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const AnganwadiApplicationForm = ({ account }) => {
  const applicationRef = useRef(null);
  const filePreviewUrlsRef = useRef({});
  const [applicationKey, setApplicationKey] = useState("");
  const [formData, setFormData] = useState(null);
  const [filePreviews, setFilePreviews] = useState({});
  const [confirmEdit, setConfirmEdit] = useState(false);
  const [confirmFinalSubmit, setConfirmFinalSubmit] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const submitted = formData?.status === "final";

  useEffect(
    () => () => {
      Object.values(filePreviewUrlsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
    },
    [],
  );

  useEffect(() => {
    let active = true;
    getAnganwadiApplication(account)
      .then(({ key, application }) => {
        if (!active) return;
        setApplicationKey(key);
        setFormData(application);
        if (application.status === "step1") setCurrentStep(2);
        if (application.status === "step2" || application.status === "step3") {
          setCurrentStep(3);
        }
        if (application.status === "step3" || application.status === "final") {
          setShowPreview(true);
        }
      })
      .catch((loadError) => {
        console.error("Anganwadi demo application load failed:", loadError);
        if (active) setError(loadError.message || "आवेदन लोड नहीं हो सका।");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [account]);

  const currentTitle = PROGRESS_STEPS[currentStep - 1];
  const completedSteps = useMemo(() => {
    if (formData?.status === "step1") return [1];
    if (formData?.status === "step2") return [1, 2];
    if (formData?.status === "step3" || formData?.status === "final") {
      return [1, 2, 3];
    }
    return [];
  }, [formData?.status]);

  const updateField = (name, value) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
    setNotice("");
  };

  const selectFile = (name, file) => {
    if (!file) return;
    const previousUrl = filePreviewUrlsRef.current[name];
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    const url = URL.createObjectURL(file);
    filePreviewUrlsRef.current[name] = url;
    setFilePreviews((previous) => ({
      ...previous,
      [name]: { url, type: file.type, name: file.name },
    }));
    updateField(name, file.name);
  };

  const renderPreviewFile = (name) => {
    const fileName = formData[name];
    if (!fileName) {
      return (
        <span className="anganwadi-preview-missing">
          दस्तावेज़ अपलोड नहीं हुआ है / Document Not Uploaded
        </span>
      );
    }

    const preview = filePreviews[name];
    return (
      <div className="anganwadi-preview-file">
        {preview?.url && preview.type.startsWith("image/") ? (
          <img src={preview.url} alt={fileName} />
        ) : null}
        {preview?.url && preview.type === "application/pdf" ? (
          <iframe title={fileName} src={preview.url} />
        ) : null}
        <span>{fileName}</span>
        <small>डेमो पूर्वावलोकन; फाइल सर्वर पर अपलोड नहीं हुई है।</small>
      </div>
    );
  };

  const saveStep = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = await saveAnganwadiApplicationStep(
        applicationKey,
        formData,
        currentStep,
      );
      setFormData(saved);
      if (currentStep === 3) {
        setShowPreview(true);
        setNotice("डेमो आवेदन पूर्वावलोकन के लिए तैयार है।");
      } else {
        setCurrentStep((step) => step + 1);
        setNotice("डेमो में जानकारी सेव हुई।");
        window.requestAnimationFrame(() => {
          applicationRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
    } catch (saveError) {
      console.error("Anganwadi demo application save failed:", saveError);
      setError(saveError.message || "जानकारी सेव नहीं हो सकी।");
    } finally {
      setSaving(false);
    }
  };

  const finalizeApplication = async () => {
    setSaving(true);
    setError("");
    try {
      const submittedApplication = await submitAnganwadiApplication(
        applicationKey,
        formData,
      );
      setFormData(submittedApplication);
      setNotice("डेमो आवेदन अंतिम रूप से सबमिट किया गया।");
      setConfirmFinalSubmit(false);
      setShowPreview(true);
    } catch (submitError) {
      console.error("Anganwadi demo application submission failed:", submitError);
      setError(submitError.message || "आवेदन सबमिट नहीं हो सका।");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const value =
      field.name === "age"
        ? calculateAge(formData.dob)
        : formData[field.name] ?? "";
    const commonProps = {
      id: `anganwadi-application-${field.name}`,
      name: field.name,
      value,
      required: field.required && !field.optional && !submitted,
      disabled: saving || submitted,
      readOnly: field.readOnly || (readOnlyFieldNames.has(field.name) && Boolean(value)),
      onChange: (event) => {
        const nextValue = event.target.value;
        if (field.name === "filer_adhar") {
          updateField(field.name, nextValue.replace(/\D/g, "").slice(0, 12));
          return;
        }
        if (field.name === "dob") {
          setFormData((previous) => ({
            ...previous,
            dob: nextValue,
            age: calculateAge(nextValue),
          }));
          setNotice("");
          return;
        }
        updateField(field.name, nextValue);
      },
    };

    if (field.type === "file") {
      return (
        <Form.Group
          key={field.name}
          className="anganwadi-application-field"
          as={Col}
          lg={field.fullWidth ? 12 : 3}
        >
          <Form.Label htmlFor={commonProps.id}>{field.label}</Form.Label>
          <Form.Control
            id={commonProps.id}
            type="file"
            accept={field.accept}
            required={field.required && !value && !submitted}
            disabled={saving || submitted}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) selectFile(field.name, file);
            }}
          />
          {value && <Form.Text>चयनित फाइल: {value}</Form.Text>}
          {field.note && <Form.Text>{field.note}</Form.Text>}
        </Form.Group>
      );
    }

    return (
      <Form.Group
        key={field.name}
        className="anganwadi-application-field"
        as={Col}
        lg={field.fullWidth ? 12 : 3}
      >
        <Form.Label htmlFor={commonProps.id}>
          {field.label}
          {field.required && <span className="anganwadi-required"> *</span>}
        </Form.Label>
        {field.type === "select" ? (
          <Form.Select
            {...commonProps}
            onChange={(event) => updateField(field.name, event.target.value)}
          >
            <option value="">विकल्प चुनें</option>
            {field.options.map((option) => (
              <option value={option} key={option}>{option}</option>
            ))}
          </Form.Select>
        ) : field.type === "textarea" ? (
          <Form.Control
            {...commonProps}
            as="textarea"
            rows={4}
            onChange={(event) => updateField(field.name, event.target.value)}
          />
        ) : (
          <Form.Control
            {...commonProps}
            type={field.type || "text"}
            inputMode={field.inputMode}
            maxLength={field.maxLength}
            pattern={field.pattern}
            min={field.type === "number" ? 0 : undefined}
          />
        )}
        {field.help && <Form.Text>{field.help}</Form.Text>}
      </Form.Group>
    );
  };

  const renderStepOne = () => (
    <>
      {STEP_ONE_GROUPS.map((group) => (
        <Card className="anganwadi-form-section" key={group.title}>
          <Card.Header>{group.title}</Card.Header>
          <Card.Body>
            <Row className="g-3">
              {group.fields.map((field) => renderField(field))}
            </Row>
            {group.title === "कार्य विवरण" && (
              <Alert variant="info" className="mt-3 mb-0">
                आंगनवाड़ी केंद्रों की सूची अभी डेमो विकल्पों से दिखाई जा रही है।
                वास्तविक केंद्र सूची API जुड़ने पर विकल्प बदलेंगे।
              </Alert>
            )}
          </Card.Body>
        </Card>
      ))}
    </>
  );

  const renderAssessmentGroup = (group) => (
    <Card className="anganwadi-form-section" key={group.title}>
      <Card.Header>{group.title}</Card.Header>
      <Card.Body>
        {group.description && (
          <p className="anganwadi-assessment-description">{group.description}</p>
        )}
        {group.fields && (
          <Row className="g-3">
            {group.fields.map((field) =>
              renderField({
                ...field,
                type: field.type || "number",
                fullWidth: field.type === "textarea",
                required: !field.readOnly && field.type !== "file",
              }),
            )}
          </Row>
        )}
        {group.checkboxes && (
          <div className="anganwadi-checklist">
            {group.checkboxes.map((label) => {
              const checked = (formData.saaf_ans || []).includes(label);
              return (
                <Form.Check
                  key={label}
                  id={`anganwadi-clean-${group.checkboxes.indexOf(label)}`}
                  type="checkbox"
                  label={label}
                  checked={checked}
                  disabled={saving || submitted}
                  onChange={() =>
                    updateField(
                      "saaf_ans",
                      checked
                        ? formData.saaf_ans.filter((item) => item !== label)
                        : [...formData.saaf_ans, label],
                    )
                  }
                />
              );
            })}
          </div>
        )}
      </Card.Body>
    </Card>
  );

  const renderStepThree = () => (
    <>
      <Alert variant="warning">
        प्रत्येक PDF की अधिकतम सीमा 2 MB तथा फोटो / हस्ताक्षर की अधिकतम सीमा
        100 KB है। डेमो मोड में फाइल का नाम ही रखा जाता है; फाइल सर्वर पर अपलोड
        नहीं होती।
      </Alert>
      {DOCUMENT_GROUPS.map((group) => (
        <Card className="anganwadi-form-section" key={group.title}>
          <Card.Header>{group.title}</Card.Header>
          <Card.Body>
            {group.documents.map((document) => (
              <Row className="g-3 align-items-center anganwadi-document-row" key={document.name}>
                <Col lg={8}>
                  <Form.Label htmlFor={`anganwadi-document-${document.name}`}>
                    {document.label}
                    {document.required && <span className="anganwadi-required"> *</span>}
                  </Form.Label>
                  <div className="anganwadi-document-hint">
                    {document.image ? "JPG / JPEG / PNG" : "PDF"} · अधिकतम{" "}
                    {document.image ? "100 KB" : "2 MB"}
                  </div>
                </Col>
                <Col lg={4}>
                  <Form.Control
                    id={`anganwadi-document-${document.name}`}
                    type="file"
                    accept={document.image ? "image/jpeg,image/png" : ".pdf,application/pdf"}
                    required={document.required && !formData[document.name] && !submitted}
                    disabled={saving || submitted}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) selectFile(document.name, file);
                    }}
                  />
                  {formData[document.name] && (
                    <Form.Text>चयनित फाइल: {formData[document.name]}</Form.Text>
                  )}
                </Col>
              </Row>
            ))}
          </Card.Body>
        </Card>
      ))}
      <Card className="anganwadi-declaration-card">
        <Card.Body>
          <Form.Check
            id="anganwadi-declaration"
            type="checkbox"
            required={!submitted}
            disabled={saving || submitted}
            checked={Boolean(formData.declarationAccepted)}
            onChange={(event) =>
              updateField("declarationAccepted", event.target.checked)
            }
            label={`मैं ${formData.filer_name || "आवेदक"} घोषणा करती हूं कि मेरे विरुद्ध कोई विभागीय कार्यवाही, पुलिस केस, न्यायालयीय वाद, शिकायत या जांच लंबित नहीं है। यदि चयन के बाद ऐसा कोई प्रकरण संज्ञान में आता है, तो पुरस्कार हेतु मेरा चयन निरस्त किया जा सकता है।`}
          />
        </Card.Body>
      </Card>
    </>
  );

  const renderApplicantRows = () => {
    const rows = [
      ["आवेदन फार्म संख्या", formData.applicant_id || "—"],
      ["आवेदक का नाम कु0 / श्रीमती", formData.filer_name || "—"],
      ["पिता / पति का नाम", formData.fath_husb_name],
      ["जन्म तिथि", formatPreviewDate(formData.dob)],
      ["वर्तमान में तैनात आंगनबाड़ी / मिनी आंगनबाड़ी केंद्र का नाम", formData.awc_center],
      ["योगदान तिथि", formatPreviewDate(formData.joining_date)],
      ["शैक्षिक योग्यता", formData.edu_qual],
      ["गांव / क्षेत्र का नाम", formData.village],
      ["पता", formData.address],
      ["शहर", formData.city],
      ["पिन कोड", formData.pincode],
      ["खाताधारक का नाम", formData.acc_holder],
      ["खाता संख्या", formData.acc_no],
      ["IFSC कोड", formData.acc_ifsc],
      ["बैंक का नाम", formData.bank_name],
      ["पैन कार्ड", formData.pancard],
    ];

    return rows.map(([label, value], index) => (
      <tr key={label}>
        <td>{label} :-</td>
        <td>
          {value || "—"}
          {index === 1 && (
            <div className="anganwadi-preview-applicant-photo">
              {renderPreviewFile("photo_img")}
            </div>
          )}
        </td>
      </tr>
    ));
  };

  const renderAssessmentRows = () =>
    PREVIEW_ASSESSMENT_ROWS.map((row) => (
      <tr key={row.title}>
        <td>{row.title}</td>
        <td>
          {row.items?.map(([label, name]) => (
            <div className="anganwadi-preview-answer" key={name}>
              {label} - {formData[name] || "—"}
            </div>
          ))}
          {row.checklist &&
            (formData.saaf_ans || []).length > 0 &&
            formData.saaf_ans.map((answer) => (
              <div className="anganwadi-preview-check" key={answer}>
                <FaCheckCircle aria-hidden="true" /> {answer}
              </div>
            ))}
          {row.checklist && !(formData.saaf_ans || []).length && (
            <span>—</span>
          )}
          {row.files?.map(({ key, label }) => (
            <div className="anganwadi-preview-inline-file" key={key}>
              <span>{label} - </span>
              {renderPreviewFile(key)}
            </div>
          ))}
        </td>
      </tr>
    ));

  const renderCertificateRows = (rows) =>
    rows.map(({ key, label }) => (
      <tr key={key}>
        <td>{label}</td>
        <td>{renderPreviewFile(key)}</td>
      </tr>
    ));

  if (loading || !formData) {
    return (
      <div className="anganwadi-application-loading">
        {loading ? <Spinner animation="border" size="sm" /> : null}
        <span>{loading ? "आवेदन लोड हो रहा है..." : error}</span>
      </div>
    );
  }

  return (
    <section
      ref={applicationRef}
      className="anganwadi-application"
      aria-labelledby="anganwadi-form-title"
    >
      {isAnganwadiApplicationDemoMode && (
        <Alert variant="warning" className="anganwadi-demo-alert">
          डेमो मोड: इस फॉर्म में दर्ज जानकारी केवल इस ब्राउज़र सत्र में अस्थायी
          रूप से रखी जाती है। अभी कोई वास्तविक आवेदन या दस्तावेज़ सर्वर पर जमा
          नहीं होता।
        </Alert>
      )}
      <header className="anganwadi-application-header">
        <div>
          <span>आवेदक आईडी: {formData.applicant_id || "उपलब्ध नहीं"}</span>
          <h2 id="anganwadi-form-title">आंगनवाड़ी कार्यकर्त्री पुरस्कार 2026–27</h2>
          <p>आवेदन के तीन चरण पूरे करें, फिर विवरण देखकर अंतिम सबमिशन करें।</p>
        </div>
        <Badge bg={submitted ? "success" : "secondary"}>
          {submitted ? "अंतिम रूप से जमा" : "ड्राफ्ट"}
        </Badge>
      </header>

      <nav className="anganwadi-application-progress" aria-label="आवेदन चरण">
        {PROGRESS_STEPS.map((label, index) => {
          const step = index + 1;
          return (
            <button
              type="button"
              key={label}
              className={currentStep === step ? "active" : ""}
              disabled={
                saving ||
                submitted ||
                step > (completedSteps.length ? Math.max(...completedSteps) + 1 : 1)
              }
              onClick={() => {
                setCurrentStep(step);
                setError("");
                setNotice("");
              }}
            >
              <span>{completedSteps.includes(step) ? <FaCheckCircle /> : step}</span>
              <strong>{label}</strong>
            </button>
          );
        })}
      </nav>

      {error && <Alert variant="danger" role="alert">{error}</Alert>}
      {notice && <Alert variant="success" role="status">{notice}</Alert>}

      {submitted && (
        <Alert variant="success" className="anganwadi-submitted-alert">
          आपका आवेदन अंतिम रूप से जमा हो चुका है। अब इसमें बदलाव नहीं किया जा सकता।
          <Button
            variant="outline-success"
            size="sm"
            className="ms-2"
            onClick={() => setShowPreview(true)}
          >
            <FaEye className="me-1" /> आवेदन देखें
          </Button>
        </Alert>
      )}

      <Card className="anganwadi-application-card">
        <Card.Header className="anganwadi-step-card-header">
          <div>
            <span>चरण {currentStep} / 3</span>
            <h3>{currentTitle}</h3>
          </div>
          <FaFileAlt aria-hidden="true" />
        </Card.Header>
        <Card.Body>
          <Form onSubmit={saveStep}>
            {currentStep === 1 && renderStepOne()}
            {currentStep === 2 && ASSESSMENT_GROUPS.map(renderAssessmentGroup)}
            {currentStep === 3 && renderStepThree()}
            {!submitted && (
              <div className="anganwadi-step-actions">
                <Button
                  type="button"
                  variant="outline-secondary"
                  disabled={currentStep === 1 || saving}
                  onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
                >
                  <FaChevronLeft className="me-2" /> पिछला चरण
                </Button>
                {currentStep < 3 ? (
                  <Button type="submit" disabled={saving}>
                    {saving ? <Spinner size="sm" className="me-2" /> : null}
                    सेव करें और आगे बढ़ें <FaChevronRight className="ms-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={saving}>
                    {saving ? <Spinner size="sm" className="me-2" /> : null}
                    पूर्वावलोकन देखें <FaEye className="ms-2" />
                  </Button>
                )}
              </div>
            )}
          </Form>
          {submitted && (
            <div className="anganwadi-step-actions">
              <Button variant="outline-primary" onClick={() => setShowPreview(true)}>
                <FaEye className="me-2" /> आवेदन का पूर्वावलोकन
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {showPreview && (
        <div
          className="anganwadi-preview-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowPreview(false);
          }}
        >
          <section
            className="anganwadi-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="anganwadi-preview-title"
          >
            <header className="anganwadi-preview-header">
              <div>
                <h2 id="anganwadi-preview-title">आवेदन का पूर्वावलोकन</h2>
                <p>आंगनवाड़ी कार्यकर्त्री पुरस्कार 2026–27</p>
              </div>
              <div className="anganwadi-preview-actions">
                <Button variant="outline-light" onClick={() => window.print()}>
                  <FaPrint className="me-2" /> प्रिंट / PDF
                </Button>
                <Button
                  variant="light"
                  aria-label="पूर्वावलोकन बंद करें"
                  onClick={() => setShowPreview(false)}
                >
                  ×
                </Button>
              </div>
            </header>
            <div className="anganwadi-preview-content">
              <article className="anganwadi-preview-print-area">
                <h1 className="anganwadi-preview-department">
                  महिला सशक्तिकरण एवं बाल विकास विभाग
                </h1>
                <h2 className="anganwadi-preview-form-title">
                  आंगनवाड़ी कार्यकर्त्री पुरस्कार 2026–27 आवेदन पत्र
                </h2>

                {submitted && (
                  <div className="anganwadi-preview-final-status">
                    आवेदन पत्र अंतिम रूप से जमा हो चुका है, अब संपादन योग्य नहीं है /
                    Application Final Submitted - Not Editable
                  </div>
                )}

                <div className="table-responsive">
                  <table className="table table-bordered anganwadi-preview-table">
                    <thead>
                      <tr>
                        <th>जानकारी का शीर्षक</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>{renderApplicantRows()}</tbody>
                  </table>
                </div>

                <div className="table-responsive">
                  <table className="table table-bordered anganwadi-preview-table anganwadi-preview-assessment-table">
                    <thead>
                      <tr>
                        <th>मूल्यांकन के लिए प्रश्न</th>
                        <th>चुना हुआ उत्तर</th>
                      </tr>
                    </thead>
                    <tbody>{renderAssessmentRows()}</tbody>
                  </table>
                </div>

                <h3 className="anganwadi-preview-section-title">
                  Step 3: अपलोड दस्तावेज़ / प्रमाण पत्र का विवरण
                </h3>
                <div className="table-responsive">
                  <table className="table table-bordered anganwadi-preview-table">
                    <thead>
                      <tr>
                        <th>अनिवार्य अर्हताओं के सापेक्ष प्रमाण पत्र</th>
                        <th>प्रमाण पत्र</th>
                      </tr>
                    </thead>
                    <tbody>{renderCertificateRows(ESSENTIAL_CERTIFICATE_ROWS)}</tbody>
                  </table>
                </div>

                <div className="table-responsive">
                  <table className="table table-bordered anganwadi-preview-table">
                    <thead>
                      <tr>
                        <th>चयन मानक संबंधित प्रमाण पत्र</th>
                        <th>प्रमाण पत्र</th>
                      </tr>
                    </thead>
                    <tbody>{renderCertificateRows(SELECTION_CERTIFICATE_ROWS)}</tbody>
                  </table>
                </div>

                <div className="anganwadi-preview-signature">
                  <span>आवेदक के हस्ताक्षर</span>
                  {renderPreviewFile("signature")}
                </div>
                {isAnganwadiApplicationDemoMode && (
                  <p className="anganwadi-preview-demo-note">
                    डेमो मोड: चयनित फाइलें केवल इस ब्राउज़र सत्र में दिखाई जाती हैं;
                    वास्तविक आवेदन या दस्तावेज़ सर्वर पर जमा नहीं हुए हैं।
                  </p>
                )}
              </article>

              {!submitted ? (
                <div className="anganwadi-preview-decision">
                  <section>
                    <Form.Check
                      id="anganwadi-confirm-edit"
                      type="checkbox"
                      checked={confirmEdit}
                      onChange={(event) => setConfirmEdit(event.target.checked)}
                      label="गलतियों की स्थिति में अंतिम सबमिशन से पहले विवरण संपादित करें।"
                    />
                    <Button
                      variant="warning"
                      disabled={!confirmEdit || saving}
                      onClick={() => {
                        setConfirmEdit(false);
                        setShowPreview(false);
                        setCurrentStep(1);
                      }}
                    >
                      Edit Form
                    </Button>
                  </section>
                  <section>
                    <Form.Check
                      id="anganwadi-confirm-final-submit"
                      type="checkbox"
                      checked={confirmFinalSubmit}
                      onChange={(event) =>
                        setConfirmFinalSubmit(event.target.checked)
                      }
                      label="मैं पुष्टि करती/करता हूं कि विवरण सही हैं और अंतिम सबमिशन के बाद फॉर्म संपादित नहीं किया जा सकेगा।"
                    />
                    <Button
                      variant="danger"
                      disabled={!confirmFinalSubmit || saving}
                      onClick={finalizeApplication}
                    >
                      {saving ? <Spinner size="sm" className="me-2" /> : null}
                      No Mistake! Proceed for Final Submission
                    </Button>
                  </section>
                </div>
              ) : (
                <footer className="anganwadi-preview-footer">
                  <div className="anganwadi-preview-final-status">
                    आवेदन पत्र अंतिम रूप से जमा हो चुका है, अब संपादन योग्य नहीं है /
                    Application Final Submitted - Not Editable
                  </div>
                  <Button variant="info" onClick={() => window.print()}>
                    <FaPrint className="me-2" /> Print
                  </Button>
                </footer>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

export default AnganwadiApplicationForm;
