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
    <main className="login-page itcell-login-page" lang="hi">
      <Container>
        <Row className="g-0 login-container align-items-stretch">
          <Col lg={6} className="login-brand-col itcell-brand-col">
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
                <span className="login-brand-badge">साहस · उत्कृष्टता · समर्पित सेवा</span>
                <h2 className="login-brand-title">
                  उत्तराखंड पुरस्कार एवं सम्मान पोर्टल
                </h2>
                <p className="login-brand-subtitle">
                  Uttarakhand Awards &amp; Recognition Portal
                </p>
              </div>

              <div className="login-brand-role">
                <span>पोर्टल भूमिका :</span> {IT_CELL_ROLE.hindi}
              </div>

              <p className="login-brand-copy">© 2026 उत्तराखण्ड सरकार</p>
            </div>
          </Col>

          <Col
            lg={6}
            className="login-form-col itcell-form-col d-flex align-items-center justify-content-center"
          >
            <div className="login-card itcell-login-card border-0 w-100">
              <div className="itcell-login-card-inner">
                <div className="text-center login-dynamic-header">
                  <FaDatabase
                    className="login-header-icon"
                    aria-hidden="true"
                  />
                  <p className="itcell-login-kicker">सुरक्षित कर्मचारी प्रवेश</p>
                  <h1 className="fw-bold login-role-title">{IT_CELL_ROLE.title}</h1>
                  <p className="login-role-hindi">{IT_CELL_ROLE.hindi}</p>
                  <p className="login-role-subtitle">{IT_CELL_ROLE.subtitle}</p>
                </div>

                <Form className="login-form" onSubmit={handleLogin}>
                  <Form.Group className="itcell-form-group" controlId="formPhone">
                    <Form.Label>
                      <FaUserShield className="me-2" />
                      मोबाइल नंबर / Username
                    </Form.Label>

                    <Form.Control
                      type="text"
                      autoComplete="username"
                      placeholder="अपना पंजीकृत मोबाइल नंबर दर्ज करें"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="itcell-form-group" controlId="formPassword">
                    <Form.Label>
                      <FaKey className="me-2" />
                      पासवर्ड
                    </Form.Label>

                    <div className="login-password-wrap">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="अपना पासवर्ड दर्ज करें"
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

                  {error && (
                    <div
                      className="login-error text-center"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  <div className="itcell-submit-wrap">
                    <Button
                      variant="primary"
                      type="submit"
                      className="login-submit-btn w-100"
                    >
                      <FaUserShield aria-hidden="true" />
                      सुरक्षित लॉगिन
                    </Button>
                  </div>
                </Form>

                <p className="itcell-login-security">
                  <FaUserShield aria-hidden="true" />
                  केवल अधिकृत आईटी सेल अधिकारियों के लिए
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default ITCellLogin;
