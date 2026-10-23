import React, { useState, useCallback } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import {
  FaDatabase,
  FaUserShield,
  FaKey,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ukLogo from "../../assets/images/uk_logo.jpeg";
import "./Login.css";

const IT_CELL_ROLE = {
  title: "IT Cell Login",
  hindi: "आईटी सेल लॉगिन",
  subtitle: "आईटी सेल के रूप में लॉगिन करें",
  path: "/ITCellDashBoard",
};

function ITCellLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

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
        const response = await fetch(
          "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/login/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: phone,
              password,
              role: "IT-Cell",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              data.message ||
              "Login failed. Please check your credentials."
          );
        }

        login(data);

        navigate(IT_CELL_ROLE.path, { replace: true });
      } catch (err) {
        setError(err.message);
      }
    },
    [phone, password, navigate, login]
  );

  return (
    <div className="login-page">
      <Container>
        <Row className="g-0 login-container align-items-stretch">
          {/* LEFT PANEL — UK LOGO + HEADINGS */}
          <Col lg={6} className="login-brand-col d-none d-lg-flex">
            <div className="login-brand-overlay">
              <div className="login-logo-circle">
                <img
                  src={ukLogo}
                  alt="Uttarakhand Government Logo"
                  className="login-uk-logo"
                />
              </div>

              <h4 className="login-brand-dept">महिला सशक्तिकरण एवं बाल विकास</h4>
              <p className="login-brand-dept-en">
                Women Empowerment &amp; Child Development
              </p>

              <div className="login-brand-divider" />

              <div className="login-brand-scheme">
                <span className="login-brand-badge">ऑनलाइन नामांकन प्रपत्र</span>
                <h2 className="login-brand-title">
                  मुख्यमंत्री राज्य बाल वीरता पुरस्कार
                </h2>
                <p className="login-brand-subtitle">
                  Chief Minister State Child Bravery Award
                </p>
              </div>

              <div className="login-brand-role">
                <span>चुनी गई भूमिका :</span> {IT_CELL_ROLE.hindi}
              </div>

              <p className="login-brand-copy">© 2026 उत्तराखण्ड सरकार</p>
            </div>
          </Col>

          {/* RIGHT LOGIN FORM */}
          <Col
            lg={6}
            className="login-form-col d-flex align-items-center justify-content-center p-2"
          >
            <div className="login-card border-0 w-100">
              <div className="p-3">
                {/* HEADER */}
                <div className="text-center mb-4 login-dynamic-header">
                  <FaDatabase
                    size={40}
                    className="text-primary mb-3 login-header-icon"
                  />

                  <h3 className="fw-bold login-role-title">
                    {IT_CELL_ROLE.title}
                  </h3>

                  <p className="login-role-hindi">{IT_CELL_ROLE.hindi}</p>

                  <p className="text-muted login-role-subtitle">
                    {IT_CELL_ROLE.subtitle}
                  </p>
                </div>

                <Form className="login-form" onSubmit={handleLogin}>
                  {/* USERNAME */}
                  <Form.Group className="mb-3" controlId="formPhone">
                    <Form.Label>
                      <FaUserShield className="me-2" />
                      Username (Phone)
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
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        title={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </Form.Group>

                  {/* ERROR */}
                  {error && (
                    <div
                      className="login-error text-center"
                      role="alert"
                    >
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

export default ITCellLogin;
