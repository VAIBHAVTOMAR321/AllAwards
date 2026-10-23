import React, { useState, useEffect, useRef } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaTrophy,
  FaAward,
  FaUserCircle,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../login/AuthContext";
import "../../../../assets/css/dpoleftnav.css";

const DISTRICT_PROFILE_URL =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/district-profile/";

const DPOLeftNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet, onNavClick }) => {
  const { logout, authFetch } = useAuth();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const authFetchRef = useRef(authFetch);
  authFetchRef.current = authFetch;

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setProfileLoading(true);
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
        if (isMounted) {
          setProfile(result.success && result.data ? result.data : null);
        }
      } catch (err) {
        console.error("Failed to fetch district profile:", err);
        if (isMounted) {
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isTablet, setSidebarOpen]);

  const handleItemClick = (e, path) => {
    // Any selection collapses the expanded toggle and the whole sidebar, so the
    // content gets the full width. The top nav toggle reopens it.
    setOpenSubmenu(null);
    if (onNavClick) {
      e.preventDefault();
      onNavClick(path);
    }
    setSidebarOpen(false);
  };

  const renderProfileCard = (isMobileView = false) => {
    if (profileLoading) {
      return (
        <div className="dpo-profile-card dpo-profile-loading">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (!profile) {
      return null;
    }

    const displayName = profile.full_name || "DPO login";
    const districtName = profile.district || "";

    return (
      <div className={`dpo-profile-card ${isMobileView ? "dpo-profile-card-mobile" : ""}`}>
        <div className="dpo-profile-avatar">
          <FaUserCircle />
        </div>
        <div className="dpo-profile-info">
          <div className="dpo-profile-name" title={displayName}>
            {displayName}
          </div>
          {districtName && (
            <div className="dpo-profile-district" title={districtName}>
              {districtName}
            </div>
          )}
          {profile.code && (
            <div className="dpo-profile-code">जिला कोड: {profile.code}</div>
          )}
        </div>
      </div>
    );
  };

  const menuItems = [
    {
      icon: <FaAward />,
      label: "मुख्यमंत्री राज्य बाल वीरता पुरस्कार",
      submenu: [
        {
      
          label: "वर्ष 2026-27",
          path: "/DPODashBoard",
        },
        {
         
          label: "वर्ष 2027-28",
          path: null,
          disabled: true,
        },
      ],
    },
    {
      icon: <FaTrophy />,
      label: "राज्य स्त्री शक्ति तीलू रौतेली पुरस्कार",
      path: null,
      active: false,
      disabled: true,
    },
    {
      icon: <FaTrophy />,
      label: "राज्य स्तरीय आंगनवाड़ी कार्यकर्त्री पुरस्कार",
      path: null,
      active: false,
      disabled: true,
    },
  ];

  const isSubItemActive = (subItem) =>
    Boolean(subItem.path) && subItem.path === location.pathname;

  const renderSubItem = (subItem, subIndex) => {
    const label = (
      <span className="nav-text br-text-sub">{subItem.label}</span>
    );

    if (subItem.disabled) {
      return (
        <span
          key={subIndex}
          className="submenu-item-user nav-link nav-item-disabled"
          aria-disabled="true"
        >
          <span className="submenu-icon">{subItem.icon}</span>
          {label}
        </span>
      );
    }

    return (
      <Link
        key={subIndex}
        to={subItem.path}
        className={`submenu-item-user nav-link ${isSubItemActive(subItem) ? "active" : ""}`}
        onClick={(e) => handleItemClick(e, subItem.path)}
      >
        <span className="submenu-icon">{subItem.icon}</span>
        {label}
      </Link>
    );
  };

  const renderMenuItems = (isMobileView = false) =>
    menuItems.map((item, index) => {
      const textClass = isMobileView ? "nav-text br-nav-text-mob" : "nav-text";

      if (item.submenu) {
        const isOpen = openSubmenu === index;
        const isParentActive = item.submenu.some(isSubItemActive);

        return (
          <div key={index}>
            <Nav.Link
              className={`nav-item ${isParentActive ? "active" : ""}`}
              onClick={() => toggleSubmenu(index)}
              aria-expanded={isOpen}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className={textClass}>{item.label}</span>
              <span className="submenu-arrow">
                {isOpen ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </Nav.Link>

            <Collapse in={isOpen}>
              <div className="submenu-container-user">
                {item.submenu.map(renderSubItem)}
              </div>
            </Collapse>
          </div>
        );
      }

      if (item.disabled) {
        return (
          <div key={index}>
            <span
              className="nav-item nav-link nav-item-disabled"
              aria-disabled="true"
            >
              <span className="nav-icon">{item.icon}</span>
              <span className={textClass}>{item.label}</span>
            </span>
          </div>
        );
      }

      const isActive = location.pathname === item.path;
      return (
        <div key={index}>
          <Link
            to={item.path}
            className={`nav-item nav-link ${isActive ? "active" : ""}`}
            onClick={(e) => handleItemClick(e, item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className={textClass}>{item.label}</span>
          </Link>
        </div>
      );
    });

  return (
    <>
      <div
        className={`dpo-left-nav ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          {sidebarOpen ? (
            <div className="logo-container">
              <div className="logo">
                DPO Panel
              </div>
            </div>
          ) : (
            <div className="logo-container logo-collapsed">
              <img
                src="/favicon.jpeg"
                alt="Bal Virta Award"
                className="sidebar-collapsed-logo"
              />
            </div>
          )}
        </div>

        {sidebarOpen && renderProfileCard()}

        <Nav className="sidebar-nav flex-column">
          {renderMenuItems()}
        </Nav>

        <div className="sidebar-footer">
          <Nav.Link
            className="nav-item logout-btn"
            onClick={() => {
              logout();
            }}
          >
            <span className="nav-icon">
              <FaSignOutAlt />
            </span>
            <span className="nav-text">Logout</span>
          </Nav.Link>
        </div>
      </div>

      <Offcanvas
        show={(isMobile || isTablet) && sidebarOpen}
        onHide={() => setSidebarOpen(false)}
        className="user-mobile-offcanvas"
        placement="start"
        backdrop={true}
        scroll={false}
        enforceFocus={false}
      >
        <Offcanvas.Header closeButton className="user-offcanvas-header">
          <Offcanvas.Title className="br-off-title">Menu</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="user-offcanvas-body">
          {renderProfileCard(true)}
          <Nav className="flex-column">
            {renderMenuItems(true)}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default DPOLeftNav;