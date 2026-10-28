import React from "react";
import { Button, Col, Container, Dropdown, Row } from "react-bootstrap";
import { FaBars, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../../login/AuthContext";
import "./AnganwadiTopNav.css";

const AnganwadiTopNav = ({ sidebarOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const account = user?.user || user || {};
  return (
    <header className="anganwadi-dashboard-header">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto">
            <Button
              variant="light"
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "साइडबार बंद करें" : "साइडबार खोलें"}
            >
              <FaBars />
            </Button>
          </Col>
          <Col>
            {!sidebarOpen && (
              <span className="anganwadi-topnav-title">Anganwadi Panel</span>
            )}
          </Col>
          <Col xs="auto">
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="anganwadi-profile-button d-flex align-items-center"
              >
                <FaUserCircle className="me-2" />
                {account.username || account.full_name || account.name || "आवेदक"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={logout}>
                  <FaSignOutAlt className="me-2" />लॉगआउट
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </Container>
    </header>
  );
};

export default AnganwadiTopNav;
