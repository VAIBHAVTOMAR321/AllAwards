import React, { useEffect, useState } from "react";
import DPOLeftNav from "./DPOLeftNav";
import DPOTopNav from "./DPOTopNav";
import "./DPODashboard.css";
import "./DPOAnganwadi2026-27.css";

const DPOAnganwadi2026_27 = () => {
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
    <div className="dashboard-container dpo-anganwadi-dashboard">
      <DPOLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <DPOTopNav
          toggleSidebar={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
        />
        <main className="dpo-anganwadi-page">
          <header className="dpo-anganwadi-heading">
            <p>District Programme Officer Panel</p>
            <h1>राज्य स्तरीय आंगनवाड़ी कार्यकर्त्री पुरस्कार</h1>
            <span>वर्ष 2026-27</span>
          </header>
        </main>
      </div>
    </div>
  );
};

export default DPOAnganwadi2026_27;
