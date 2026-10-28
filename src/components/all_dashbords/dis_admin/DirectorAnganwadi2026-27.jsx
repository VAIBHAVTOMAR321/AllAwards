import React, { useEffect, useState } from "react";
import DisLeftnav from "./DisLeftnav";
import DisTopNav from "./DisTopNav";
import "./DPO_cell/DPODashboard.css";
import "./DirectorAnganwadi2026-27.css";

const DirectorAnganwadi2026_27 = () => {
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
    <div className="dashboard-container director-anganwadi-dashboard">
      <DisLeftnav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <DisTopNav
          toggleSidebar={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
        />
        <main className="director-anganwadi-page">
          <header className="director-anganwadi-heading">
            <p>Directorate Panel</p>
            <h1>राज्य स्तरीय आंगनवाड़ी कार्यकर्त्री पुरस्कार</h1>
            <span>वर्ष 2026-27</span>
          </header>
        </main>
      </div>
    </div>
  );
};

export default DirectorAnganwadi2026_27;
