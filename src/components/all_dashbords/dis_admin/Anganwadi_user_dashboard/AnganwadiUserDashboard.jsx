import React, { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import {
  FaAddressCard,
  FaMapMarkerAlt,
  FaPhone,
  FaUserCircle,
} from "react-icons/fa";
import AnganwadiLeftNav from "./AnganwadiLeftNav";
import AnganwadiTopNav from "./AnganwadiTopNav";
import { useAuth } from "../../../login/AuthContext";
import "./AnganwadiUserDashboard.css";

const AnganwadiUserDashboard = () => {
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
    <div className="dashboard-container anganwadi-dashboard-shell">
      <AnganwadiLeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
      <div className="main-content-dash">
        <AnganwadiTopNav sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main className="anganwadi-dashboard-content">
          <Container fluid>
            <section className="anganwadi-dashboard-hero">
              <span>आंगनवाड़ी कार्यकर्त्री पुरस्कार · 2026-27</span>
              <h1>आवेदक डैशबोर्ड</h1>
              <p>आपका पुरस्कार पोर्टल खाता सफलतापूर्वक लॉगिन है।</p>
            </section>
            <section className="anganwadi-account-section" aria-labelledby="anganwadi-account-title">
              <h2 id="anganwadi-account-title">आवेदक प्रोफ़ाइल</h2>
              <Row className="g-3">
                <Col sm={6} xl={3}>
                  <Card className="anganwadi-account-card h-100">
                    <Card.Body>
                      <FaUserCircle />
                      <div><span>नाम</span><strong>{account.username || account.full_name || account.name || "आवेदक"}</strong></div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6} xl={3}>
                  <Card className="anganwadi-account-card h-100">
                    <Card.Body>
                      <FaPhone />
                      <div><span>मोबाइल</span><strong>{account.phone || account.mobile_no || "उपलब्ध नहीं"}</strong></div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6} xl={3}>
                  <Card className="anganwadi-account-card h-100">
                    <Card.Body>
                      <FaMapMarkerAlt />
                      <div><span>जनपद / परियोजना</span><strong>{[account.district, account.project].filter(Boolean).join(" / ") || "उपलब्ध नहीं"}</strong></div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6} xl={3}>
                  <Card className="anganwadi-account-card h-100">
                    <Card.Body>
                      <FaAddressCard />
                      <div><span>पंजीकरण आईडी</span><strong>{account.unique_id || "उपलब्ध नहीं"}</strong></div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              {account.sector && (
                <Card className="anganwadi-sector-card mt-3">
                  <Card.Body>
                    <span>सेक्टर</span>
                    <strong>{account.sector}</strong>
                  </Card.Body>
                </Card>
              )}
            </section>
          </Container>
        </main>
      </div>
    </div>
  );
};

export default AnganwadiUserDashboard;
