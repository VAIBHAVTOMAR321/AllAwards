import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import childAwardImage from "../../assets/images/images-9.jpeg";
import womenAwardImage from "../../assets/images/images-11.jpeg";
import anganwadiAwardImage from "../../assets/images/images-5.jpeg";
import "./Home.css";

const AWARDS = [
  {
    id: "baal-veerta",
    number: "01",
    title: { en: "Baal Veerta Puraskar", hi: "बाल वीरता पुरस्कार" },
    subtitle: {
      en: "Honouring courage, compassion and extraordinary bravery in children.",
      hi: "बच्चों के साहस, करुणा और असाधारण वीरता का सम्मान।",
    },
    tag: { en: "Bravery & Courage", hi: "साहस और वीरता" },
    image: childAwardImage,
    imageAlt: {
      en: "Children learning together in Uttarakhand",
      hi: "उत्तराखंड में एक साथ पढ़ते बच्चे",
    },
    symbol: "✦",
  },
  {
    id: "telu-rauteli",
    number: "02",
    title: { en: "Tilu Rauteli Puraskar", hi: "तीलू रौतेली पुरस्कार" },
    subtitle: {
      en: "Recognising inspiring women for exceptional achievement and service.",
      hi: "उत्कृष्ट उपलब्धियों और सेवा के लिए प्रेरणादायी महिलाओं का सम्मान।",
    },
    tag: { en: "Women of Excellence", hi: "उत्कृष्ट महिलाएँ" },
    image: womenAwardImage,
    imageAlt: {
      en: "Women gathered at a community event in Uttarakhand",
      hi: "उत्तराखंड में सामुदायिक कार्यक्रम में एकत्रित महिलाएँ",
    },
    symbol: "❋",
  },
  {
    id: "anganwadi",
    number: "03",
    title: { en: "Anganwadi Worker Awards", hi: "आंगनवाड़ी कार्यकर्ता पुरस्कार" },
    subtitle: {
      en: "Celebrating dedicated Anganwadi workers nurturing healthier communities.",
      hi: "स्वस्थ समुदायों के निर्माण में समर्पित आंगनवाड़ी कार्यकर्ताओं का सम्मान।",
    },
    tag: { en: "Service & Care", hi: "सेवा और समर्पण" },
    image: anganwadiAwardImage,
    imageAlt: {
      en: "Anganwadi worker caring for children",
      hi: "बच्चों की देखभाल करती आंगनवाड़ी कार्यकर्ता",
    },
    symbol: "❖",
  },
];

const COPY = {
  en: {
    eyebrow: "HONOURING COURAGE · SERVICE · EXCELLENCE",
    title: "Celebrating the people who",
    titleAccent: "make a difference.",
    description:
      "A unified portal to apply for Uttarakhand’s distinguished awards. Choose an award to begin your registration or sign in to continue your application.",
    register: "Register",
    login: "Login",
    explore: "Explore the awards",
    awardsLabel: "THE AWARDS",
    awardsTitle: "One portal. Three honours.",
    awardsDescription:
      "Select the award that best matches your contribution and achievements.",
    footer: "An initiative of the Government of Uttarakhand",
    dialogRegister: "Register for an award",
    dialogLogin: "Login to your award portal",
    dialogDescription: "Choose the award portal you want to continue to.",
    continue: "Continue",
    cancel: "Cancel",
    choose: "Choose award",
    unavailable: "Registration and login for this award are not available yet.",
  },
  hi: {
    eyebrow: "साहस · सेवा · उत्कृष्टता का सम्मान",
    title: "उन लोगों का सम्मान, जो",
    titleAccent: "बदलाव लाते हैं।",
    description:
      "उत्तराखंड के प्रतिष्ठित पुरस्कारों के लिए एकीकृत पोर्टल। पंजीकरण शुरू करने या अपना आवेदन जारी रखने के लिए पुरस्कार चुनें।",
    register: "पंजीकरण करें",
    login: "लॉगिन करें",
    explore: "पुरस्कार देखें",
    awardsLabel: "पुरस्कार",
    awardsTitle: "एक पोर्टल। तीन सम्मान।",
    awardsDescription:
      "अपने योगदान और उपलब्धियों के अनुरूप पुरस्कार चुनें।",
    footer: "उत्तराखंड सरकार की एक पहल",
    dialogRegister: "पुरस्कार के लिए पंजीकरण",
    dialogLogin: "अपने पुरस्कार पोर्टल में लॉगिन करें",
    dialogDescription: "आगे बढ़ने के लिए पुरस्कार पोर्टल चुनें।",
    continue: "आगे बढ़ें",
    cancel: "रद्द करें",
    choose: "पुरस्कार चुनें",
    unavailable: "इस पुरस्कार के लिए पंजीकरण और लॉगिन सुविधा अभी उपलब्ध नहीं है।",
  },
};

const BAAL_VEERTA_ROUTES = {
  register: "/StudentRegistration",
  login: "/LoginPortal",
};

const AWARD_LOGIN_ROUTES = {
  "baal-veerta": "/LoginPortal",
  "telu-rauteli": "/TiluRauteliLogin",
  anganwadi: "/AnganwadiLogin",
};

export default function Home({ onSelectAward, awardRoutes = {} }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [dialogAction, setDialogAction] = useState(null);
  const [selectedAward, setSelectedAward] = useState(AWARDS[0].id);

  const t = COPY[language];
  const isHindi = language === "hi";
  const isSelectedAwardAvailable =
    Boolean(onSelectAward) ||
    Boolean(awardRoutes?.[selectedAward]?.[dialogAction]) ||
    (dialogAction === "login" && Boolean(AWARD_LOGIN_ROUTES[selectedAward])) ||
    (dialogAction === "register" && selectedAward === "baal-veerta");

  useEffect(() => {
    if (["register", "login"].includes(location.state?.awardAction)) {
      setDialogAction(location.state.awardAction);
      setSelectedAward(AWARDS[0].id);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const openDialog = (action) => {
    setDialogAction(action);
    setSelectedAward(AWARDS[0].id);
  };

  const closeDialog = () => setDialogAction(null);

  const continueToAward = () => {
    const award = AWARDS.find((item) => item.id === selectedAward);
    if (!award || !dialogAction) return;

    if (typeof onSelectAward === "function") {
      onSelectAward({ award, action: dialogAction });
      closeDialog();
      return;
    }

    const route =
      awardRoutes?.[award.id]?.[dialogAction] ||
      (dialogAction === "login"
        ? AWARD_LOGIN_ROUTES[award.id]
        : award.id === "baal-veerta"
          ? BAAL_VEERTA_ROUTES[dialogAction]
          : null);
    if (route) {
      closeDialog();
      navigate(route);
    }
  };

  return (
    <main className={`awards-home ${isHindi ? "lang-hi" : "lang-en"}`} lang={language}>
      <section className="hero">
        <div className="hero-art" aria-hidden="true">
          <img className="hero-photo" src={childAwardImage} alt="" />
          <div className="hero-art-caption">
            <span className="caption-line" />
            <span>{isHindi ? "देवभूमि उत्तराखंड" : "DEV BHOOMI UTTARAKHAND"}</span>
          </div>
        </div>

        <div className="hero-content">
          <div className="eyebrow"><span className="eyebrow-dot" />{t.eyebrow}</div>
          <h1>{t.title}<br /><span>{t.titleAccent}</span></h1>
          <p className="hero-description">{t.description}</p>
          <div className="hero-actions">
            <button type="button" className="button button-primary" onClick={() => openDialog("register")}>
              {t.register}<span aria-hidden="true">↗</span>
            </button>
            <button type="button" className="button button-light" onClick={() => openDialog("login")}>
              {t.login}<span aria-hidden="true">→</span>
            </button>
          </div>
          <a className="explore-link" href="#awards">{t.explore}<span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-index" aria-hidden="true">UK / AWARDS</div>
      </section>

      <section className="awards-section" id="awards">
        <div className="section-heading">
          <div>
            <div className="section-kicker">{t.awardsLabel}</div>
            <h2>{t.awardsTitle}</h2>
          </div>
          <p>{t.awardsDescription}</p>
        </div>

        <div className="awards-grid">
          {AWARDS.map((award) => (
            <article className={`award-card award-${award.id}`} key={award.id}>
              <div className="award-card-top">
                <span className="award-number">{award.number}</span>
                <span className="award-symbol" aria-hidden="true">{award.symbol}</span>
              </div>
              <img
                className="award-photo"
                src={award.image}
                alt={award.imageAlt[language]}
                loading="lazy"
              />
              <div className="award-card-body">
                <span className="award-tag">{award.tag[language]}</span>
                <h3>{award.title[language]}</h3>
                <p>{award.subtitle[language]}</p>
              </div>
              <div className="award-card-watermark" aria-hidden="true">{award.symbol}</div>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <span className="footer-mark" aria-hidden="true">✦</span>
        <span>{t.footer}</span>
        <span className="footer-rule" />
        <span className="footer-region">{isHindi ? "उत्तराखंड, भारत" : "Uttarakhand, India"}</span>
      </footer>

      {dialogAction && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}>
          <section
            className="award-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="award-dialog-title"
          >
            <button type="button" className="dialog-close" onClick={closeDialog} aria-label={t.cancel}>×</button>
            <div className="dialog-emblem" aria-hidden="true">✦</div>
            <div className="section-kicker">{t.choose}</div>
            <h2 id="award-dialog-title">
              {dialogAction === "register" ? t.dialogRegister : t.dialogLogin}
            </h2>
            <p className="dialog-description">{t.dialogDescription}</p>
            <label className="award-label" htmlFor="award-select">{t.choose}</label>
            <select
              id="award-select"
              value={selectedAward}
              onChange={(event) => setSelectedAward(event.target.value)}
            >
              {AWARDS.map((award) => (
                <option key={award.id} value={award.id}>{award.title[language]}</option>
              ))}
            </select>
            {!isSelectedAwardAvailable && (
              <p className="dialog-unavailable" role="status">{t.unavailable}</p>
            )}
            <button
              type="button"
              className="button button-primary dialog-continue"
              onClick={continueToAward}
              disabled={!isSelectedAwardAvailable}
            >
              {t.continue}<span aria-hidden="true">↗</span>
            </button>
            <button type="button" className="dialog-cancel" onClick={closeDialog}>{t.cancel}</button>
          </section>
        </div>
      )}
    </main>
  );
}
