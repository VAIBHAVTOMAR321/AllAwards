import React, { useEffect, useState } from "react";
import CDPOLeftNav from "./CDPOLeftNav";
import CDPOTopNav from "./CDPOTopNav";
import "../DPO_cell/DPODashboard.css";
import "./CDPOAnganwadi2026-27.css";

const CDPOAnganwadi2026_27 = () => {
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
    <div className="dashboard-container cdpo-anganwadi-dashboard">
      <CDPOLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <CDPOTopNav
          toggleSidebar={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
        />
        <main className="cdpo-anganwadi-page">
          <header className="cdpo-anganwadi-heading">
            <span>बाल विकास परियोजना अधिकारी पैनल</span>
            <h1>राज्य स्तरीय आंगनवाड़ी कार्यकर्त्री पुरस्कार</h1>
            <p>वर्ष 2026-27</p>
          </header>
        </main>
      </div>
    </div>
  );
};

export default CDPOAnganwadi2026_27;
