import React from "react";
import { Button, Col, Container, Dropdown, Row } from "react-bootstrap";
import { FaBars, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../../login/AuthContext";

const TiluRauteliTopNav = ({ sidebarOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const account = user?.user || user || {};

  return (
    <header className="dpo-dashboard-header">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto"><Button variant="light" className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle navigation"><FaBars /></Button></Col>
          <Col>{!sidebarOpen && <span className="dpo-topnav-title">Tilu Rauteli Panel</span>}</Col>
          <Col xs="auto">
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" className="user-profile-btn d-flex align-items-center">
                <FaUserCircle className="me-2" />{account.username || account.full_name || "आवेदक"}
              </Dropdown.Toggle>
              <Dropdown.Menu><Dropdown.Item onClick={logout}><FaSignOutAlt className="me-2" />लॉगआउट</Dropdown.Item></Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </Container>
    </header>
  );
};

export default TiluRauteliTopNav;
