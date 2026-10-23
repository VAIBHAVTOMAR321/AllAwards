import React, { useState, useCallback } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import {
  FaDatabase,
  FaUserShield,
  FaKey,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ukLogo from "../../assets/images/uk_logo.jpeg";
import "./Login.css";

/* ---------- Role के अनुसार heading config ---------- */
const roleConfig = {
  director: {
    title: "Director Login",
    hindi: "निदेशक लॉगिन",
    subtitle: "निदेशक के रूप में लॉगिन करें",
    path: "/DirectorDashBoard",
  },
  dpo: {
    title: "DPO Login",
    hindi: "जिला कार्यक्रम अधिकारी लॉगिन",
    subtitle: "जिला कार्यक्रम अधिकारी के रूप में लॉगिन करें",
    path: "/DPODashBoard",
  },
  cdpo: {
    title: "CDPO Login",
    hindi: "बाल विकास परियोजना अधिकारी लॉगिन",
    subtitle: "बाल विकास परियोजना अधिकारी के रूप में लॉगिन करें",
    path: "/CDPODashBoard",
  },
  it_cell: {
    title: "IT Cell Login",
    hindi: "आईटी सेल लॉगिन",
    subtitle: "आईटी सेल के रूप में लॉगिन करें",
    path: "/ITCellDashBoard",
  },
};

function Login() {
  const [phone, setPhone] = useState("");
  const [loginType, setLoginType] = useState("director");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const currentRole = roleConfig[loginType] || roleConfig.director;

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);

      if (!phone) {
        setError("Please enter your phone number.");
        return;
      }

      if (!password) {
        setError("Please enter your password.");
        return;
      }

      try {
        const isITCell = loginType === "it_cell";
        const response = await fetch(
          "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/login/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              isITCell
                ? { username: phone, password, role: "IT-Cell" }
                : { phone, password, role: loginType }
            ),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || data.message || "Login failed. Please check your credentials."
          );
        }

        login(data);

        const path = roleConfig[data.role]?.path || roleConfig[loginType].path;
        navigate(path, { replace: true });
      } catch (err) {
        setError(err.message);
      }
    },
    [phone, password, loginType, navigate, login]
  );

  return (
    <div className="login-page">
      <Container>
        <Row className="g-0 login-container align-items-stretch">

          {/* ================= LEFT PANEL — UK LOGO + HEADINGS ================= */}
          <Col lg={6} className="login-brand-col d-none d-lg-flex">
            <div className="login-brand-overlay">
              {/* UK LOGO — directly imported */}
              <div className="login-logo-circle">
                <img src={ukLogo} alt="Uttarakhand Government Logo" className="login-uk-logo" />
              </div>

              <h4 className="login-brand-dept">महिला सशक्तिकरण एवं बाल विकास</h4>
              <p className="login-brand-dept-en">Women Empowerment &amp; Child Development</p>

              <div className="login-brand-divider" />

              <div className="login-brand-scheme">
                <span className="login-brand-badge">ऑनलाइन नामांकन प्रपत्र</span>
                <h2 className="login-brand-title">मुख्यमंत्री राज्य बाल वीरता पुरस्कार</h2>
                <p className="login-brand-subtitle">Chief Minister State Child Bravery Award</p>
              </div>

              {/* Current selected role — left panel में भी दिखे */}
              <div className="login-brand-role">
                <span>चुनी गई भूमिका :</span> {currentRole.hindi}
              </div>

              <p className="login-brand-copy">© 2026 उत्तराखण्ड सरकार</p>
            </div>
          </Col>

          {/* ================= RIGHT LOGIN FORM ================= */}
          <Col
            lg={6}
            className="login-form-col d-flex align-items-center justify-content-center p-2"
          >
            <div className="login-card border-0 w-100">
              <div className="p-3">

                {/* HEADER — role के अनुसार बदलता है */}
                <div className="text-center mb-4 login-dynamic-header">
                  <FaDatabase
                    size={40}
                    className="text-primary mb-3 login-header-icon"
                  />

                  <h3 className="fw-bold login-role-title">
                    {currentRole.title}
                  </h3>

                  <p className="login-role-hindi">{currentRole.hindi}</p>

                  <p className="text-muted login-role-subtitle">
                    {currentRole.subtitle}
                  </p>
                </div>

                <Form
                  className="login-form"
                  onSubmit={handleLogin}
                >

                  {/* LOGIN AS */}
                  <Form.Group className="mb-3">
                    <Form.Label>Login as</Form.Label>

                    <div className="d-flex flex-wrap login-role-radios">

                      {/* DIRECTOR */}
                      <Form.Check
                        className="me-3 mb-2"
                        label="Director"
                        name="loginType"
                        type="radio"
                        id="director-radio"
                        value="director"
                        checked={loginType === "director"}
                        onChange={(e) => setLoginType(e.target.value)}
                      />

                      {/* DPO */}
                      <Form.Check
                        className="me-3 mb-2"
                        label="DPO"
                        name="loginType"
                        type="radio"
                        id="dpo-radio"
                        value="dpo"
                        checked={loginType === "dpo"}
                        onChange={(e) => setLoginType(e.target.value)}
                      />

                      {/* CDPO */}
                      <Form.Check
                        className="me-3 mb-2"
                        label="CDPO"
                        name="loginType"
                        type="radio"
                        id="cdpo-radio"
                        value="cdpo"
                        checked={loginType === "cdpo"}
                        onChange={(e) => setLoginType(e.target.value)}
                      />

                      {/* IT CELL */}
                      <Form.Check
                        className="mb-2"
                        label="IT Cell"
                        name="loginType"
                        type="radio"
                        id="itcell-radio"
                        value="it_cell"
                        checked={loginType === "it_cell"}
                        onChange={(e) => setLoginType(e.target.value)}
                      />
                    </div>
                  </Form.Group>

                  {/* PHONE */}
                  <Form.Group className="mb-3" controlId="formPhone">
                    <Form.Label>
                      <FaUserShield className="me-2" />
                      Phone
                    </Form.Label>

                    <Form.Control
                      type="text"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* PASSWORD */}
                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>
                      <FaKey className="me-2" />
                      Password
                    </Form.Label>

                    <div className="login-password-wrap">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="login-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </Form.Group>

                  {/* ERROR */}
                  {error && (
                    <div className="login-error text-center" role="alert">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* LOGIN BUTTON */}
                  <div className="text-center mt-4">
                    <Button
                      variant="primary"
                      type="submit"
                      className="login-submit-btn w-100"
                    >
                      Login
                    </Button>
                  </div>

                </Form>
              </div>
            </div>
          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default Login;