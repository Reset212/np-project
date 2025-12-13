import React from "react";
import "./Footer.css";
import instagramIcon from "../image/instagram-icon.svg"; // переименуем для ясности
import emailIcon from "../image/email-icon.svg";
import vimeoIcon from "../image/vimeo-icon.svg";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span>© 2025 MOVIE PARK</span>
        </div>
        <div className="footer-links">
          <a href="/privacy-policy">PRIVACY POLICY</a>
          <a href="/terms-of-use">TERMS OF USE</a>
          <a href="/accessibility-statement">ACCESSIBILITY STATEMENT</a>
        </div>
        <div className="footer-social">
          <a href="https://instagram.com" aria-label="Instagram">
            <img src={instagramIcon} alt="Instagram" /> {/* исправлено */}
          </a>
          <a href="https://vimeo.com" aria-label="Vimeo">
            <img src={vimeoIcon} alt="Vimeo" /> {/* исправлено: vimeo для vimeo */}
          </a>
          <a href="mailto:contact@example.com" aria-label="Email">
            <img src={emailIcon} alt="Email" /> {/* исправлено: email для email */}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;