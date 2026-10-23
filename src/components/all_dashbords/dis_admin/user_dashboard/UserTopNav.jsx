import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Dropdown,
  Image,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../../login/AuthContext";



function UserTopNav({ toggleSidebar }) {
  const { authFetch, logout } = useAuth();

  // State to track if the API itself failed (404/500)
  const [apiError, setApiError] = useState(null);

  // User Profile State
  const [userDetails, setUserDetails] = useState({
    full_name: "",
    profile_picture: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await authFetch(
          "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part1/"
        );
        if (!response.ok) return;
        const result = await response.json();
        const records = Array.isArray(result?.data)
          ? result.data
          : result?.data
          ? [result.data]
          : [];
        const record = records[0];
        if (record) {
          setUserDetails({
            full_name: record.full_name || "",
            profile_picture: record.profile_picture || null,
          });
        }
      } catch (fetchError) {
        console.error("Failed to fetch user details:", fetchError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [authFetch]);

 

  const getDisplayName = () => {
    return userDetails.full_name || "User";
  };

  const getUserPhotoUrl = () => {
    const profilePicture = userDetails.profile_picture;
    if (profilePicture && !imageError) {
      return profilePicture;
    }
    return null;
  };

  const handleImageError = () => {
    setImageError(true);
  };



  const handleLogout = () => {
    logout();
  };

  return (
    <header className="dashboard-header">
      <Container fluid>
        <Row className="align-items-center">

  {/* LEFT: Sidebar Toggle + Government Branding */}
  <Col>
    <div className="d-flex align-items-center gap-3">

      {/* Sidebar Toggle */}
      <Button
        variant="light"
        className="sidebar-toggle"
        onClick={toggleSidebar}
      >
        <FaBars />
      </Button>

     
    </div>
  </Col>

  {/* CENTER: Error */}
  <Col>
    {error && (
      <Alert variant="warning" className="mb-0 py-1">
        <small>{error}</small>
      </Alert>
    )}
  </Col>

  {/* RIGHT: User Profile */}
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
           
          }}
        >
          {getUserPhotoUrl() ? (
            <Image
              src={getUserPhotoUrl()}
              roundedCircle
              className="user-avatar"
              onError={handleImageError}
             
              alt="User"
            />
          ) : (
            <FaUserCircle
              style={{
                fontSize: 24,
                color: "rgb(250 93 77)",
              }}
            />
          )}

          <span
            style={{
              fontWeight: 500,
              fontSize: "0.85rem",
            }}
          >
            {getDisplayName()}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu>

          <Dropdown.Item onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            Logout
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
  
  export default UserTopNav;