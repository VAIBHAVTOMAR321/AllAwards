import React, { useEffect, useState } from "react";
import ITCellLeftNav from "./ITCellLeftNav";
import ITCellTopNav from "./ITCellTopNav";
import "../DPO_cell/DPODashboard.css";
import "./ITCellAnganwadi2026-27.css";

const ITCellAnganwadi2026_27 = () => {
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
    <div className="dashboard-container it-anganwadi-dashboard">
      <ITCellLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <ITCellTopNav
          toggleSidebar={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
        />
        <main className="it-anganwadi-page">
          <header className="it-anganwadi-heading">
            <div className="it-anganwadi-accent" aria-hidden="true" />
            <div>
              <p>IT Cell Panel</p>
              <h1>राज्य स्तरीय आंगनवाड़ी कार्यकर्त्री पुरस्कार</h1>
              <span>वर्ष 2026-27</span>
            </div>
          </header>
        </main>
      </div>
    </div>
  );
};

export default ITCellAnganwadi2026_27;
