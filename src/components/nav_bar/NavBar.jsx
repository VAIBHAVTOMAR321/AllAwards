import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ulLogo from "../../assets/images/uk_logo.jpeg";
import "../../assets/css/navbar.css";
import { useLanguage } from "../../context/LanguageContext";

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isHindi = language === "hi";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const openAwardPortal = (awardAction) => {
    navigate("/", { state: { awardAction } });
  };

  return (
    <Navbar
      expand="lg"
      className={`drc-navbar ${location.pathname === "/" ? "awards-navbar" : ""} ${scrolled ? "navbar-scrolled" : ""}`}
      fixed="top"
    >
      <Container className="main-container-style">
        <Navbar.Brand as={Link} to="/">
          <img
            src={ulLogo}
            height="30"
            className="d-inline-block align-top me-2"
            alt="Child Development Logo"
          />
          {isHindi ? (
            <>महिला सशक्तिकरण<br />एवं बाल विकास विभाग</>
          ) : (
            <>Women Empowerment<br />&amp; Child Development</>
          )}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="align-items-center">
            <button
              type="button"
              className="navbar-language-toggle"
              onClick={toggleLanguage}
              aria-label={isHindi ? "Switch language to English" : "Switch language to Hindi"}
            >
              <span aria-hidden="true">文</span>
              {isHindi ? "English" : "हिन्दी"}
            </button>
            <Nav.Link
              as="button"
              type="button"
              className="nav-link-custom nav-action-register"
              onClick={() => openAwardPortal("register")}
            >
              {isHindi ? "पंजीकरण करें" : "Register"}
            </Nav.Link>
            <Nav.Link
              as="button"
              type="button"
              className="nav-link-custom nav-action-login"
              onClick={() => openAwardPortal("login")}
            >
              {isHindi ? "लॉगिन करें" : "Login"}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;