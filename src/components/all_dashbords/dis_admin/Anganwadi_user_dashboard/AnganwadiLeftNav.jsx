import React, { useEffect } from "react";
import { Nav, Offcanvas } from "react-bootstrap";
import { FaAward, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../login/AuthContext";
import "./AnganwadiLeftNav.css";

const AnganwadiLeftNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const account = user?.user || user || {};
  useEffect(() => {
    if (isMobile || isTablet) setSidebarOpen(false);
  }, [isMobile, isTablet, location.pathname, setSidebarOpen]);

  const items = (
    <>
      <div className="anganwadi-profile-card">
        <div className="anganwadi-profile-avatar"><FaAward /></div>
        <div className="anganwadi-profile-info">
          <div className="anganwadi-profile-name">
            {account.username || account.full_name || account.name || "आवेदक"}
          </div>
          <div className="anganwadi-profile-label">आंगनवाड़ी पुरस्कार</div>
        </div>
      </div>
      <Nav className="anganwadi-sidebar-nav flex-column">
        <Link
          to="/AnganwadiUserDashboard"
          className={`nav-item nav-link ${
            location.pathname === "/AnganwadiUserDashboard" ? "active" : ""
          }`}
          onClick={() => setSidebarOpen(false)}
        >
          <span className="nav-icon"><FaAward /></span><span className="nav-text">डैशबोर्ड</span>
        </Link>
      </Nav>
      <div className="anganwadi-sidebar-footer">
        <Nav.Link className="nav-item logout-btn" onClick={logout}>
          <span className="nav-icon"><FaSignOutAlt /></span>
          <span className="nav-text">लॉगआउट</span>
        </Nav.Link>
      </div>
    </>
  );

  return (
    <>
      <aside className={`anganwadi-left-nav ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="anganwadi-sidebar-header">
          <div className="logo-container">
            <div className="logo">{sidebarOpen ? "Anganwadi Panel" : "AW"}</div>
          </div>
        </div>
        {items}
      </aside>
      <Offcanvas
        show={(isMobile || isTablet) && sidebarOpen}
        onHide={() => setSidebarOpen(false)}
        className="anganwadi-mobile-offcanvas"
        placement="start"
        enforceFocus={false}
      >
        <Offcanvas.Header closeButton className="anganwadi-offcanvas-header">
          <Offcanvas.Title>Anganwadi Panel</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="anganwadi-offcanvas-body">{items}</Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AnganwadiLeftNav;
