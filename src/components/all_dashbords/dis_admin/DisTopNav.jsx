import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Dropdown,
  Image,
  Alert,
} from "react-bootstrap";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../login/AuthContext";



function DisTopNav({ toggleSidebar, sidebarOpen }) {
  const { logout } = useAuth();

  // User Profile State
  const [userDetails] = useState({
    full_name: "",
    profile_picture: null,
  });
  const [error] = useState(null);
  const [imageError, setImageError] = useState(false);

  const getDisplayName = () => {
    return userDetails.full_name || "State Login";
  };

  const getUserPhotoUrl = () => {
    const profilePicture = userDetails.profile_picture;
    if (profilePicture && !imageError) {
      return profilePicture;
    }
    return null;
  };



  const handleLogout = () => {
    logout();
  };

  return (
    <header className="dashboard-header">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto">
            <Button
              variant="light"
              className="sidebar-toggle"
              onClick={toggleSidebar}
            >
              <FaBars />
            </Button>
          </Col>

          <Col>
            {!sidebarOpen && (
              <span className="dis-topnav-title">State Login</span>
            )}
            {error && (
              <Alert variant="warning" className="mb-0 py-1">
                <small>{error}</small>
              </Alert>
            )}
          </Col>
          
          <Col xs="auto">
            <div className="header-actions d-flex align-items-center">
              {/* User Profile Dropdown */}
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  className="user-profile-btn d-flex align-items-center"
                  style={{
                    gap: "4px",
                    border: "1px solid #e5e7eb",
                    padding: "2px 6px",
                  }}
                >
                  {getUserPhotoUrl() ? (
                    <Image
                      src={getUserPhotoUrl()}
                      roundedCircle
                      className="user-avatar"
                      onError={() => setImageError(true)}
                      style={{
                        width: 28,
                        height: 28,
                        objectFit: "cover",
                      }}
                      alt="User"
                    />
                  ) : (
                    <FaUserCircle style={{ fontSize: 24, color: "rgb(250 93 77)" }} />
                  )}
                  <span style={{ fontWeight: 500, fontSize: "0.85rem" }}>{getDisplayName()}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
          </Row>
        </Container>
      </header>
    );
  }
  
  export default DisTopNav;