import React, { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { FaEnvelope, FaMapMarkerAlt, FaPhone, FaUserCircle } from "react-icons/fa";
import TiluRauteliLeftNav from "./TiluRauteliLeftNav";
import TiluRauteliTopNav from "./TiluRauteliTopNav";
import { useAuth } from "../../../login/AuthContext";
import "../DPO_cell/DPODashboard.css";

const TiluRauteliUserDashboard = () => {
  const { user } = useAuth();
  const account = user?.user || user || {};
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

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
      <TiluRauteliLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <TiluRauteliTopNav
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen((open) => !open)}
        />
        <Container fluid className="dashboard-box">
          <section className="dashboard-header-section">
            <h1 className="dashboard-main-title h4 mb-2">
              तीलू रौतेली पुरस्कार आवेदक पैनल
            </h1>
            <p className="dashboard-subtitle mb-0">
              आपका पंजीकरण सफल है। आवेदन अनुभाग उपलब्ध होने पर यहां दिखाई देगा।
            </p>
          </section>
          <section className="mt-4" aria-labelledby="tilu-account-title">
            <h2 id="tilu-account-title" className="section-title">
              आवेदक प्रोफ़ाइल
            </h2>
            <Row className="g-3 mt-1">
              <Col sm={6} xl={3}>
                <Card className="h-100"><Card.Body className="d-flex align-items-center gap-3">
                  <FaUserCircle className="text-primary fs-3" />
                  <div><div className="text-muted small">नाम</div><strong>{account.username || account.full_name || "आवेदक"}</strong></div>
                </Card.Body></Card>
              </Col>
              <Col sm={6} xl={3}>
                <Card className="h-100"><Card.Body className="d-flex align-items-center gap-3">
                  <FaPhone className="text-primary fs-3" />
                  <div><div className="text-muted small">मोबाइल</div><strong>{account.phone || "उपलब्ध नहीं"}</strong></div>
                </Card.Body></Card>
              </Col>
              <Col sm={6} xl={3}>
                <Card className="h-100"><Card.Body className="d-flex align-items-center gap-3">
                  <FaEnvelope className="text-primary fs-3" />
                  <div><div className="text-muted small">ईमेल</div><strong>{account.email || "उपलब्ध नहीं"}</strong></div>
                </Card.Body></Card>
              </Col>
              <Col sm={6} xl={3}>
                <Card className="h-100"><Card.Body className="d-flex align-items-center gap-3">
                  <FaMapMarkerAlt className="text-primary fs-3" />
                  <div><div className="text-muted small">जनपद</div><strong>{account.district || "उपलब्ध नहीं"}</strong></div>
                </Card.Body></Card>
              </Col>
            </Row>
          </section>
        </Container>
      </div>
    </div>
  );
};

export default TiluRauteliUserDashboard;
