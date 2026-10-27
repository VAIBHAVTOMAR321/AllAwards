import React, { useEffect } from "react";
import { Nav, Offcanvas } from "react-bootstrap";
import { FaAward, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../login/AuthContext";
import "../../../../assets/css/tiluleftnav.css";

const TiluRauteliLeftNav = ({
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
  }, [isMobile, isTablet, location.pathname, setSidebarOpen]);

  const items = (
    <>
      <div className="dpo-profile-card">
        <div className="dpo-profile-avatar"><FaAward /></div>
        <div className="dpo-profile-info">
          <div className="dpo-profile-name">{account.username || account.full_name || "आवेदक"}</div>
          <div className="dpo-profile-district">{account.district || "तीलू रौतेली पुरस्कार"}</div>
        </div>
      </div>
      <Nav className="sidebar-nav flex-column">
        <Link to="/TiluRauteliUserDashboard" className="nav-item nav-link active" onClick={() => setSidebarOpen(false)}>
          <span className="nav-icon"><FaAward /></span>
          <span className="nav-text">डैशबोर्ड</span>
        </Link>
      </Nav>
      <div className="sidebar-footer">
        <Nav.Link className="nav-item logout-btn" onClick={logout}>
          <span className="nav-icon"><FaSignOutAlt /></span>
          <span className="nav-text">लॉगआउट</span>
        </Nav.Link>
      </div>
    </>
  );

  return (
    <>
      <aside className={`tilu-left-nav ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="sidebar-header">
          <div className="logo-container"><div className="logo">{sidebarOpen ? "Tilu Rauteli Panel" : "TR"}</div></div>
        </div>
        {items}
      </aside>
      <Offcanvas
        show={(isMobile || isTablet) && sidebarOpen}
        onHide={() => setSidebarOpen(false)}
        className="user-mobile-offcanvas"
        placement="start"
        enforceFocus={false}
      >
        <Offcanvas.Header closeButton className="user-offcanvas-header">
          <Offcanvas.Title className="br-off-title">Tilu Rauteli</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="user-offcanvas-body">{items}</Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default TiluRauteliLeftNav;
