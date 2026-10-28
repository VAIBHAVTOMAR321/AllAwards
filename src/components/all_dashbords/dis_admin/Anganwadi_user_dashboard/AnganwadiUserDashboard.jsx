import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import AnganwadiLeftNav from "./AnganwadiLeftNav";
import AnganwadiTopNav from "./AnganwadiTopNav";
import AnganwadiApplicationForm from "./AnganwadiApplicationForm";
import { useAuth } from "../../../login/AuthContext";
import "./AnganwadiUserDashboard.css";

const AnganwadiUserDashboard = () => {
  const { user } = useAuth();
  const account = user?.user || user || {};
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="dashboard-container anganwadi-dashboard-shell">
      <AnganwadiLeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
      <div className="main-content-dash">
        <AnganwadiTopNav sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main className="anganwadi-dashboard-content">
          <Container fluid>
            <AnganwadiApplicationForm account={account} />
          </Container>
        </main>
      </div>
    </div>
  );
};

export default AnganwadiUserDashboard;
