import React, { useState, useEffect, useRef } from "react";
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
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../../login/AuthContext";

const DISTRICT_PROFILE_URL =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/district-profile/";

function DPOTopNav({ toggleSidebar, sidebarOpen }) {
  const { logout, authFetch } = useAuth();

  const [userDetails, setUserDetails] = useState({
    full_name: "",
    district: "",
    code: "",
    phone: "",
    profile_picture: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  const authFetchRef = useRef(authFetch);
  authFetchRef.current = authFetch;

  useEffect(() => {
    let isMounted = true;

    const fetchUserDetails = async () => {
      try {
        const request = authFetchRef.current
          ? authFetchRef.current(DISTRICT_PROFILE_URL)
          : fetch(DISTRICT_PROFILE_URL, {
              headers: {
                "Content-Type": "application/json",
                ...(localStorage.getItem("accessToken")
                  ? {
                      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    }
                  : {}),
              },
            });

        const response = await request;
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (isMounted && result.success && result.data) {
          setUserDetails((prev) => ({ ...prev, ...result.data }));
        }
      } catch (err) {
        console.error("Failed to fetch DPO profile:", err);
        if (isMounted) {
          setError("Profile details unavailable");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserDetails();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  const getDisplayName = () => {
    return userDetails.full_name || "DPO Officer";
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
    <header className="dpo-dashboard-header">
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
              <span className="dpo-topnav-title">DPO Panel</span>
            )}
            {error && (
              <Alert variant="warning" className="mb-0 py-1">
                <small>{error}</small>
              </Alert>
            )}
          </Col>

          <Col xs="auto">
            <div className="header-actions d-flex align-items-center">
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
                      onError={handleImageError}
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
                  <span style={{ fontWeight: 500, fontSize: "0.85rem" }} className="">
                    {isLoading ? "Loading..." : getDisplayName()}
                  </span>
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

export default DPOTopNav;