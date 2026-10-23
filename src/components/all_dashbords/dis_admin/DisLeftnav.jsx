import React, { useState, useEffect } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaImages,
  FaUsers,
  FaBook,
  FaBuilding,
  FaImage,
  FaTools,
  FaComments, 
  FaCube,
  FaProjectDiagram,
  FaServer,
  FaUserCircle,
  FaCalendarAlt,
  FaPlusSquare,
  FaEdit,
  FaMusic,
  FaGlassCheers,
  FaIndustry,
  FaQuestionCircle,
  FaTrophy,
  FaBriefcase,
  FaGraduationCap, 
  FaUsersCog, // Added for Our Team icon
  FaAward,
  FaTasks,
  FaClock
} from "react-icons/fa";

import "../../../../src/assets/css/adminleftnav.css";


import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../login/AuthContext";
import {
  FaInfoCircle,
  FaBullseye,
  
} from "react-icons/fa";




const DisLeftnav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet, onNavClick }) => {
  
  const { logout } = useAuth();
  const location = useLocation();
  const userRole = null;

 
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  // Automatically close sidebar when navigating on mobile or tablet views
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

 const menuItems = [
      {
        icon: <FaAward />,
        label: "मुख्यमंत्री राज्य बाल वीरता पुरस्कार",
        submenu: [
          {
          
            label: "वर्ष 2026-27",
            path: "/DisDashBoard",
          },
          {
          
            label: "वर्ष 2027-28",
            path: null,
            disabled: true,
          },
        ],
      },
      {
       
        label: "राज्य स्त्री शक्ति तीलू रौतेली पुरस्कार",
        path: null,
        active: false,
        disabled: true,
      },
      {
       
        label: "राज्य स्तरीय आंगनवाड़ी कार्यकर्त्री पुरस्कार",
        path: null,
        active: false,
        disabled: true,
      },
    ];

  const isSubItemActive = (subItem) =>
    Boolean(subItem.path) && subItem.path === location.pathname;

  const renderSubItem = (subItem, subIndex, isMobileView = false) => {
    const textClass = isMobileView ? "nav-text" : "nav-text br-text-sub";
    const icon = subItem.icon ? (
      <span className="submenu-icon">{subItem.icon}</span>
    ) : null;

    if (subItem.disabled) {
      return (
        <span
          key={subIndex}
          className="submenu-item-user nav-link nav-item-disabled"
          aria-disabled="true"
        >
          {icon}
          <span className={textClass}>{subItem.label}</span>
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
        {icon}
        <span className={textClass}>{subItem.label}</span>
      </Link>
    );
  };

  const renderMenuItems = (isMobileView = false) =>
    menuItems
      .filter((item) =>
        item.allowedRoles ? item.allowedRoles.includes(userRole) : true,
      )
      .map((item, index) => {
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
                {item.submenu.map((subItem, subIndex) =>
                  renderSubItem(subItem, subIndex, isMobileView),
                )}
              </div>
            </Collapse>
          </div>
        );
      }

      if (item.disabled) {
        return (
          <span
            key={index}
            className="nav-item nav-link nav-item-disabled"
            aria-disabled="true"
          >
            <span className="nav-icon">{item.icon}</span>
            <span className={textClass}>{item.label}</span>
          </span>
        );
      }

      return (
        <Link
          key={index}
          to={item.path}
          className={`nav-item nav-link ${item.active ? "active" : ""}`}
          onClick={(e) => handleItemClick(e, item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className={textClass}>{item.label}</span>
        </Link>
      );
    });

  //  Auto-close sidebar when switching to mobile or tablet

  const renderProfileCard = (isMobileView = false) => (
    <div
      className={`dis-profile-card ${isMobileView ? "dis-profile-card-mobile" : ""}`}
    >
      <div className="dis-profile-avatar">
        <FaUserCircle />
      </div>
      <div className="dis-profile-info">
        <div className="dis-profile-name">State Login</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`user-left-nav ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          {sidebarOpen ? (
            <div className="logo-container">
              <div className="logo">
                  Directorate Panel
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

      {/*  Mobile / Tablet Sidebar (Offcanvas) */}
  <Offcanvas
  show={(isMobile || isTablet) && sidebarOpen}
  onHide={() => setSidebarOpen(false)}
  className="user-mobile-offcanvas"
  placement="start"
  backdrop={true}
  scroll={false}
  enforceFocus={false} //  ADD THIS LINE — fixes close button focus issue
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

export default DisLeftnav;