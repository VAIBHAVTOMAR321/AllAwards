import React, { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { FaIdBadge, FaPhone, FaUserCircle, FaUserTag } from "react-icons/fa";
import CDPOLeftNav from "./CDPOLeftNav";
import CDPOTopNav from "./CDPOTopNav";
import { useAuth } from "../../../login/AuthContext";
import "../DPO_cell/DPODashboard.css";

const CDPODashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const account = user?.user || user || {};

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="dashboard-container">
      <CDPOLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <CDPOTopNav
          toggleSidebar={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
        />
        <Container fluid className="dashboard-box">
          <section className="dashboard-header-section">
            <h1 className="dashboard-main-title h4 mb-2">CDPO Dashboard</h1>
            <p className="dashboard-subtitle mb-0">
              बाल विकास परियोजना अधिकारी पैनल
            </p>
          </section>

          <section className="mt-4" aria-labelledby="cdpo-account-title">
            <h2 id="cdpo-account-title" className="section-title">
              Account Overview
            </h2>
            <p className="section-subtitle mb-3">
              OTP login succeeded. Your account details are shown below.
            </p>
            <Row className="g-3">
              <Col sm={6} xl={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex align-items-center gap-3">
                    <FaUserCircle className="text-primary fs-3" />
                    <div>
                      <div className="text-muted small">Name</div>
                      <strong>{account.username || account.full_name || "CDPO"}</strong>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col sm={6} xl={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex align-items-center gap-3">
                    <FaIdBadge className="text-primary fs-3" />
                    <div>
                      <div className="text-muted small">Project / ID</div>
                      <strong>{account.unique_id || "Not provided"}</strong>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col sm={6} xl={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex align-items-center gap-3">
                    <FaPhone className="text-primary fs-3" />
                    <div>
                      <div className="text-muted small">Phone</div>
                      <strong>{account.phone || "Not provided"}</strong>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col sm={6} xl={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex align-items-center gap-3">
                    <FaUserTag className="text-primary fs-3" />
                    <div>
                      <div className="text-muted small">Role</div>
                      <strong>{account.role || user?.role || "CDPO"}</strong>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {account.email && (
              <Card className="mt-3">
                <Card.Body>
                  <span className="text-muted me-2">Email</span>
                  <strong>{account.email}</strong>
                </Card.Body>
              </Card>
            )}
          </section>
        </Container>
      </div>
    </div>
  );
};

export default CDPODashboard;
