// Файл: Footer.jsx
import React from "react";
import "./Footer.css";
import instagramIcon from "../image/instagram-icon.svg";
import emailIcon from "../image/email-icon.svg";
import vimeoIcon from "../image/vimeo-icon.svg";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Стандартная версия для ПК и планшетов */}
        <div className="footer-left">
          <span>© 2025 MOVIE PARK</span>
        </div>
        
        <div className="footer-links">
          <a href="/privacy-policy">PRIVACY POLICY</a>
          <a href="/terms-of-use">TERMS OF USE</a>
          <a href="/accessibility-statement">ACCESSIBILITY STATEMENT</a>
        </div>
        
        <div className="footer-social">
          <a href="https://www.instagram.com/movie_park/"  target="_blank"
            rel="noopener noreferrer" aria-label="Instagram">
            <img src={instagramIcon} alt="Instagram" />
          </a>
          <a href="https://vimeo.com/movieparkco"  target="_blank"
            rel="noopener noreferrer" aria-label="Vimeo">
            <img src={vimeoIcon} alt="Vimeo" />
          </a>
          <a href="mailto:hello@movieparkpro.com"  target="_blank"
            rel="noopener noreferrer" aria-label="Email">
            <img src={emailIcon} alt="Email" />
          </a>
        </div>
        
        {/* Мобильная версия */}
        <div className="footer-mobile">
          {/* 1 строка: SVG иконки */}
          <div className="footer-mobile-social">
            <a href="https://www.instagram.com/movie_park/"  target="_blank"
            rel="noopener noreferrer" aria-label="Instagram">
              <img src={instagramIcon} alt="Instagram" />
            </a>
            <a href="https://vimeo.com/movieparkco"  target="_blank"
            rel="noopener noreferrer" aria-label="Vimeo">
              <img src={vimeoIcon} alt="Vimeo" />
            </a>
            <a href="mailto:hello@movieparkpro.com"  target="_blank"
            rel="noopener noreferrer" aria-label="Email">
              <img src={emailIcon} alt="Email" />
            </a>
          </div>
          
          {/* 2 строка: PRIVACY POLICY TERMS OF USE */}
          <div className="footer-mobile-links-row1">
            <a href="/privacy-policy">PRIVACY POLICY</a>
            <a href="/terms-of-use">TERMS OF USE</a>
          </div>
          
          {/* 3 строка: ACCESSIBILITY STATEMENT */}
          <div className="footer-mobile-links-row2">
            <a href="/accessibility-statement">ACCESSIBILITY STATEMENT</a>
          </div>
          
          {/* 4 строка: © 2025 MOVIE PARK */}
          <div className="footer-mobile-copyright">
            <span>© 2025 MOVIE PARK</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;