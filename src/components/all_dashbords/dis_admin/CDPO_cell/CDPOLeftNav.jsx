import React, { useEffect } from "react";
import { Nav, Offcanvas } from "react-bootstrap";
import { FaAward, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../login/AuthContext";
import "../../../../assets/css/dpoleftnav.css";

const CDPOLeftNav = ({
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  isTablet,
}) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const account = user?.user || user || {};

  useEffect(() => {
    if (isMobile || isTablet) setSidebarOpen(false);
  }, [location.pathname, isMobile, isTablet, setSidebarOpen]);

  const menu = (
    <>
      <div className="dpo-profile-card">
        <div className="dpo-profile-avatar">
          <FaAward />
        </div>
        <div className="dpo-profile-info">
          <div className="dpo-profile-name">
            {account.username || account.full_name || "CDPO Officer"}
          </div>
          <div className="dpo-profile-district">
            {account.unique_id || "CDPO Panel"}
          </div>
        </div>
      </div>
      <Nav className="sidebar-nav flex-column">
        <Link
          to="/CDPODashBoard"
          className={`nav-item nav-link ${
            location.pathname === "/CDPODashBoard" ? "active" : ""
          }`}
          onClick={() => setSidebarOpen(false)}
        >
          <span className="nav-icon">
            <FaAward />
          </span>
          <span className="nav-text">Dashboard</span>
        </Link>
      </Nav>
      <div className="sidebar-footer">
        <Nav.Link className="nav-item logout-btn" onClick={logout}>
          <span className="nav-icon">
            <FaSignOutAlt />
          </span>
          <span className="nav-text">Logout</span>
        </Nav.Link>
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`dpo-left-nav ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <div className="sidebar-header">
          {sidebarOpen ? (
            <div className="logo-container">
              <div className="logo">CDPO Panel</div>
            </div>
          ) : (
            <div className="logo-container logo-collapsed">
              <img
                src="/favicon.jpeg"
                alt="Awards portal"
                className="sidebar-collapsed-logo"
              />
            </div>
          )}
        </div>
        {menu}
      </aside>
      <Offcanvas
        show={(isMobile || isTablet) && sidebarOpen}
        onHide={() => setSidebarOpen(false)}
        className="user-mobile-offcanvas"
        placement="start"
        enforceFocus={false}
      >
        <Offcanvas.Header closeButton className="user-offcanvas-header">
          <Offcanvas.Title className="br-off-title">CDPO Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="user-offcanvas-body">{menu}</Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default CDPOLeftNav;
