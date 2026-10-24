import React from "react";
import { Button, Col, Container, Dropdown, Row } from "react-bootstrap";
import { FaBars, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../../login/AuthContext";

const CDPOTopNav = ({ toggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const account = user?.user || user || {};
  const displayName = account.username || account.full_name || "CDPO Officer";

  return (
    <header className="dpo-dashboard-header">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto">
            <Button
              variant="light"
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
            >
              <FaBars />
            </Button>
          </Col>
          <Col>
            {!sidebarOpen && (
              <span className="dpo-topnav-title">CDPO Panel</span>
            )}
          </Col>
          <Col xs="auto">
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="user-profile-btn d-flex align-items-center"
              >
                <FaUserCircle className="me-2" />
                <span>{displayName}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={logout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </Container>
    </header>
  );
};

export default CDPOTopNav;
