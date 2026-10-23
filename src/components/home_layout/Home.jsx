import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import childAwardImage from "../../assets/images/images-9.jpeg";
import womenAwardImage from "../../assets/images/images-11.jpeg";
import anganwadiAwardImage from "../../assets/images/images-5.jpeg";
import outreachImage from "../../assets/images/image-1.jpeg";
import childrenMealImage from "../../assets/images/images-3.jpeg";
import anganwadiChildrenImage from "../../assets/images/images-4.jpeg";
import communityMealImage from "../../assets/images/images-6.jpeg";
import chiefMinisterImage from "../../assets/images/cm.png";
import rekhaImage from "../../assets/images/rekha.png";
import secretaryImage from "../../assets/images/sec.png";
import directorImage from "../../assets/images/director-wecd.png";
import "./Home.css";

const HERO_IMAGES = [
  outreachImage,
  childrenMealImage,
  anganwadiChildrenImage,
  communityMealImage,
];

const AWARDS = [
  {
    id: "baal-veerta",
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
    title: {
      en: "Anganwadi Worker Awards",
      hi: "आंगनवाड़ी कार्यकर्ता पुरस्कार",
    },
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
    eyebrow: "GOVERNMENT OF UTTARAKHAND · AWARDS & RECOGNITION",
    title: "Honouring those who",
    titleAccent: "make a difference.",
    description:
      "Discover Uttarakhand’s award and recognition programmes celebrating courage, outstanding achievement and dedicated service to society.",
    register: "Register",
    login: "Login",
    explore: "Explore recognition programmes",
    awardsLabel: "RECOGNITION PROGRAMMES",
    awardsTitle: "A tradition of honouring excellence",
    awardsDescription:
      "Learn about award programmes that recognise remarkable contributions, achievement and service across Uttarakhand.",
    leadershipLabel: "DEPARTMENTAL LEADERSHIP",
    leadershipTitle: "Guided by dedicated leadership",
    leadershipDescription:
      "The leaders supporting Uttarakhand’s Women Empowerment & Child Development Department.",
    leaders: [
      {
        title: "Hon’ble Chief Minister, Uttarakhand",
        image: chiefMinisterImage,
        imageAlt: "Portrait of the Chief Minister of Uttarakhand",
      },
      {
        title: "Cabinet Minister, Women & Child Development",
        image: rekhaImage,
        imageAlt: "Portrait of Cabinet Minister Rekha Arya",
      },
      {
        title: "Secretary, Women Empowerment & Child Development",
        image: secretaryImage,
        imageAlt: "Portrait of the Secretary",
      },
      {
        title: "Director, Women Empowerment & Child Development",
        image: directorImage,
        imageAlt: "Portrait of the Director",
      },
    ],
    featureLabel: "A PORTAL FOR RECOGNITION",
    featureTitle: "Every meaningful contribution deserves to be seen.",
    featureDescription:
      "From acts of extraordinary courage to years of dedicated community service, Uttarakhand’s award programmes celebrate people whose work creates a lasting difference.",
    featureItems: [
      ["Courage", "Recognising bravery, compassion and responsible action."],
      ["Achievement", "Celebrating women whose efforts inspire progress."],
      [
        "Community",
        "Honouring care and service that strengthen local communities.",
      ],
    ],
    processLabel: "GETTING STARTED",
    processTitle: "Find your award. Take the next step.",
    processDescription:
      "Choose the relevant award programme, then continue to its registration or login portal. Available options may vary by programme.",
    processSteps: [
      [
        "01",
        "Choose a programme",
        "Review the award descriptions and select the programme relevant to you.",
      ],
      [
        "02",
        "Select an action",
        "Use Register or Login to open the options for your selected award.",
      ],
      [
        "03",
        "Continue securely",
        "Follow the on-screen instructions in the selected award portal.",
      ],
    ],
    footer: "Women Empowerment & Child Development Department",
    dialogRegister: "Register for an award",
    dialogLogin: "Login to your award portal",
    dialogDescription: "Choose the award portal you want to continue to.",
    continue: "Continue",
    cancel: "Cancel",
    choose: "Choose award",
    unavailable: "Registration and login for this award are not available yet.",
  },
  hi: {
    eyebrow: "उत्तराखंड सरकार · पुरस्कार एवं सम्मान",
    title: "उनका सम्मान, जो",
    titleAccent: "बदलाव लाते हैं।",
    description:
      "उत्तराखंड की पुरस्कार एवं सम्मान योजनाओं की जानकारी प्राप्त करें, जो साहस, उत्कृष्ट उपलब्धियों और समाज के प्रति समर्पित सेवा का सम्मान करती हैं।",
    register: "पंजीकरण करें",
    login: "लॉगिन करें",
    explore: "सम्मान योजनाएँ देखें",
    awardsLabel: "सम्मान योजनाएँ",
    awardsTitle: "उत्कृष्ट योगदानों का सम्मान",
    awardsDescription:
      "उत्तराखंड में उल्लेखनीय योगदान, उपलब्धियों और जनसेवा को सम्मानित करने वाली पुरस्कार योजनाओं के बारे में जानें।",
    leadershipLabel: "विभागीय नेतृत्व",
    leadershipTitle: "समर्पित नेतृत्व का मार्गदर्शन",
    leadershipDescription:
      "उत्तराखंड के महिला सशक्तिकरण एवं बाल विकास विभाग का मार्गदर्शन करने वाले नेतृत्व।",
    leaders: [
      {
        title: "माननीय मुख्यमंत्री, उत्तराखंड",
        image: chiefMinisterImage,
        imageAlt: "उत्तराखंड के मुख्यमंत्री का चित्र",
      },
      {
        title: "कैबिनेट मंत्री, महिला एवं बाल विकास",
        image: rekhaImage,
        imageAlt: "कैबिनेट मंत्री रेखा आर्य का चित्र",
      },
      {
        title: "सचिव, महिला सशक्तिकरण एवं बाल विकास",
        image: secretaryImage,
        imageAlt: "सचिव का चित्र",
      },
      {
        title: "निदेशक, महिला सशक्तिकरण एवं बाल विकास",
        image: directorImage,
        imageAlt: "निदेशक का चित्र",
      },
    ],
    featureLabel: "सम्मान का एक साझा मंच",
    featureTitle: "हर सार्थक योगदान सम्मान के योग्य है।",
    featureDescription:
      "असाधारण साहसिक कार्यों से लेकर समुदाय की वर्षों की समर्पित सेवा तक, उत्तराखंड की पुरस्कार योजनाएँ उन लोगों का सम्मान करती हैं जिनका कार्य स्थायी बदलाव लाता है।",
    featureItems: [
      ["साहस", "वीरता, करुणा और जिम्मेदार कार्यों का सम्मान।"],
      ["उपलब्धि", "प्रगति की प्रेरणा देने वाली महिलाओं का अभिनंदन।"],
      ["समुदाय", "स्थानीय समुदायों को सशक्त करने वाली सेवा का सम्मान।"],
    ],
    processLabel: "शुरुआत कैसे करें",
    processTitle: "पुरस्कार चुनें। अगला कदम बढ़ाएँ।",
    processDescription:
      "संबंधित पुरस्कार योजना चुनें और फिर उसके पंजीकरण या लॉगिन पोर्टल पर आगे बढ़ें। उपलब्ध विकल्प योजना के अनुसार अलग हो सकते हैं।",
    processSteps: [
      [
        "01",
        "योजना चुनें",
        "पुरस्कारों का विवरण देखें और अपने लिए उपयुक्त योजना चुनें।",
      ],
      [
        "02",
        "विकल्प चुनें",
        "चयनित पुरस्कार के विकल्प देखने के लिए पंजीकरण या लॉगिन चुनें।",
      ],
      [
        "03",
        "सुरक्षित रूप से आगे बढ़ें",
        "चयनित पुरस्कार पोर्टल पर दिए गए निर्देशों का पालन करें।",
      ],
    ],
    footer: "महिला सशक्तिकरण एवं बाल विकास विभाग",
    dialogRegister: "पुरस्कार के लिए पंजीकरण",
    dialogLogin: "अपने पुरस्कार पोर्टल में लॉगिन करें",
    dialogDescription: "आगे बढ़ने के लिए पुरस्कार पोर्टल चुनें।",
    continue: "आगे बढ़ें",
    cancel: "रद्द करें",
    choose: "पुरस्कार चुनें",
    unavailable:
      "इस पुरस्कार के लिए पंजीकरण और लॉगिन सुविधा अभी उपलब्ध नहीं है।",
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

const AWARD_REGISTER_ROUTES = {
  "baal-veerta": BAAL_VEERTA_ROUTES.register,
  "telu-rauteli": "/TiluRauteliLogin",
  anganwadi: "/AnganwadiLogin",
};

export default function Home({ onSelectAward, awardRoutes = {} }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [dialogAction, setDialogAction] = useState(null);
  const [selectedAward, setSelectedAward] = useState(AWARDS[0].id);
  const [heroSlide, setHeroSlide] = useState(0);

  const t = COPY[language];
  const isHindi = language === "hi";
  const isSelectedAwardAvailable =
    Boolean(onSelectAward) ||
    Boolean(awardRoutes?.[selectedAward]?.[dialogAction]) ||
    (dialogAction === "login" && Boolean(AWARD_LOGIN_ROUTES[selectedAward])) ||
    (dialogAction === "register" && Boolean(AWARD_REGISTER_ROUTES[selectedAward]));

  useEffect(() => {
    if (!dialogAction) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setDialogAction(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogAction]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const slideTimer = window.setInterval(() => {
      setHeroSlide((currentSlide) => (currentSlide + 1) % HERO_IMAGES.length);
    }, 4500);

    return () => window.clearInterval(slideTimer);
  }, []);

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
        : AWARD_REGISTER_ROUTES[award.id]);
    if (route) {
      closeDialog();
      navigate(
        route,
        dialogAction === "register" && ["telu-rauteli", "anganwadi"].includes(award.id)
          ? { state: { openRegistration: true } }
          : undefined,
      );
    }
  };

  return (
    <main
      className={`awards-home ${isHindi ? "lang-hi" : "lang-en"}`}
      lang={language}
    >
      <section className="leadership-section" aria-labelledby="leadership-title">
        <div className="leadership-grid">
          <div className="leadership-government">
            {t.leaders.slice(0, 2).map((leader) => (
              <article className="leader-card" key={leader.title}>
                <img
                  className="leader-photo"
                  src={leader.image}
                  alt={leader.imageAlt}
                  loading="lazy"
                />
                <h3>{leader.title}</h3>
              </article>
            ))}
          </div>
          <div className="leadership-heading">
            <div className="section-kicker">{t.leadershipLabel}</div>
            <h2 id="leadership-title">{t.leadershipTitle}</h2>
          </div>
          <div className="leadership-officers">
            {t.leaders.slice(2).map((leader) => (
              <article className="leader-card" key={leader.title}>
                <img
                  className="leader-photo"
                  src={leader.image}
                  alt={leader.imageAlt}
                  loading="lazy"
                />
                <h3>{leader.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hero">
        <div className="hero-art" aria-hidden="true">
          <div
            className="hero-slides"
            style={{ transform: `translateX(-${heroSlide * 25}%)` }}
          >
            {HERO_IMAGES.map((image, index) => (
              <div className="hero-slide" key={image}>
                <img
                  className="hero-photo"
                  src={image}
                  alt=""
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
          <div className="hero-art-caption">
            <span className="caption-line" />
            <span>
              {isHindi ? "देवभूमि उत्तराखंड" : "DEV BHOOMI UTTARAKHAND"}
            </span>
          </div>
        </div>

        <div className="hero-inner">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              {t.eyebrow}
            </div>
            <h1>
              {t.title}
              <br />
              <span>{t.titleAccent}</span>
            </h1>
            <p className="hero-description">{t.description}</p>
            <div className="hero-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() => openDialog("register")}
              >
                {t.register}
                <span aria-hidden="true">↗</span>
              </button>
              <button
                type="button"
                className="button button-light"
                onClick={() => openDialog("login")}
              >
                {t.login}
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <a className="explore-link" href="#awards">
              {t.explore}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className="hero-index" aria-hidden="true">
          RECOGNITION · SERVICE · COURAGE
        </div>
      </section>

      <div
        className="recognition-ribbon"
        aria-label={isHindi ? "सम्मान के क्षेत्र" : "Areas of recognition"}
      >
        {t.featureItems.map(([title]) => (
          <span className="ribbon-item" key={title}>
            <span aria-hidden="true">✦</span>
            {title}
          </span>
        ))}
        <span className="ribbon-department">
          {isHindi ? "उत्तराखंड सरकार" : "GOVERNMENT OF UTTARAKHAND"}
        </span>
      </div>

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
                <span className="award-number">{award.tag[language]}</span>
                <span className="award-symbol" aria-hidden="true">
                  {award.symbol}
                </span>
              </div>
              <img
                className="award-photo"
                src={award.image}
                alt={award.imageAlt[language]}
                loading="lazy"
              />
              <div className="award-card-body">
                <h3>{award.title[language]}</h3>
                <p>{award.subtitle[language]}</p>
              </div>
              <div className="award-card-watermark" aria-hidden="true">
                {award.symbol}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="recognition-section">
        <div className="recognition-section-inner">
          <div className="recognition-copy">
            <div className="section-kicker">{t.featureLabel}</div>
            <h2>{t.featureTitle}</h2>
            <p>{t.featureDescription}</p>
          </div>
          <div className="recognition-pillars">
            {t.featureItems.map(([title, description], index) => (
              <article className="recognition-pillar" key={title}>
                <span className="pillar-symbol" aria-hidden="true">
                  {["✦", "❋", "❖"][index]}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="process-section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">{t.processLabel}</div>
            <h2>{t.processTitle}</h2>
          </div>
          <p>{t.processDescription}</p>
        </div>
        <div className="process-grid">
          {t.processSteps.map(([number, title, description]) => (
            <article className="process-card" key={number}>
              <span className="process-number">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="footer-mark" aria-hidden="true">
            ✦
          </span>
          <div>
            <strong>{t.footer}</strong>
            <span>
              {isHindi ? "उत्तराखंड सरकार" : "Government of Uttarakhand"}
            </span>
          </div>
        </div>
        <span className="footer-region">
          {isHindi ? "देवभूमि उत्तराखंड, भारत" : "Devbhoomi Uttarakhand, India"}
        </span>
      </footer>

      {dialogAction && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            className="award-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="award-dialog-title"
          >
            <button
              type="button"
              className="dialog-close"
              onClick={closeDialog}
              aria-label={t.cancel}
            >
              ×
            </button>
            <div className="dialog-emblem" aria-hidden="true">
              ✦
            </div>
            <div className="section-kicker">{t.choose}</div>
            <h2 id="award-dialog-title">
              {dialogAction === "register" ? t.dialogRegister : t.dialogLogin}
            </h2>
            <p className="dialog-description">{t.dialogDescription}</p>
            <label className="award-label" htmlFor="award-select">
              {t.choose}
            </label>
            <select
              id="award-select"
              value={selectedAward}
              onChange={(event) => setSelectedAward(event.target.value)}
            >
              {AWARDS.map((award) => (
                <option key={award.id} value={award.id}>
                  {award.title[language]}
                </option>
              ))}
            </select>
            {!isSelectedAwardAvailable && (
              <p className="dialog-unavailable" role="status">
                {t.unavailable}
              </p>
            )}
            <button
              type="button"
              className="button button-primary dialog-continue"
              onClick={continueToAward}
              disabled={!isSelectedAwardAvailable}
            >
              {t.continue}
              <span aria-hidden="true">↗</span>
            </button>
            <button
              type="button"
              className="dialog-cancel"
              onClick={closeDialog}
            >
              {t.cancel}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
