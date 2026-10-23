import React from "react";
import "./Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-dept">महिला सशक्तिकरण एवं बाल विकास विभाग</div>
          <div className="footer-govt">उत्तराखण्ड सरकार</div>
        </div>
        <div className="footer-divider" />
        <div className="footer-copy">
          © {year} मुख्यमंत्री राज्य बाल वीरता पुरस्कार. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
