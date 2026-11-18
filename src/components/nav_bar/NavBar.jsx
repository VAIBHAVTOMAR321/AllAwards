import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ulLogo from "../../assets/images/uk_logo.jpeg";
import "../../assets/css/navbar.css";

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const usesAwardsNavbar = [
    "/",
    "/Login",
    "/LoginPortal",
    "/StudentRegistration",
    "/TiluRauteliLogin",
    "/AnganwadiLogin",
    "/loginit",
  ].includes(location.pathname);

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
      className={`drc-navbar ${usesAwardsNavbar ? "awards-navbar" : ""} ${scrolled ? "navbar-scrolled" : ""}`}
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
          <span className="navbar-brand-text">
           
            Women Empowerment &amp; Child Development
             <span className="navbar-brand-uttarakhand">Uttarakhand</span>
        
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="navbar-actions">
            <Nav.Link
              as="button"
              type="button"
              className="nav-link-custom nav-action-register"
              onClick={() => openAwardPortal("register")}
            >
              Register
            </Nav.Link>
            <Nav.Link
              as="button"
              type="button"
              className="nav-link-custom nav-action-login"
              onClick={() => openAwardPortal("login")}
            >
              Login
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;