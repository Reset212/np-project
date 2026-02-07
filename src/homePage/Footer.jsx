import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import instagramIcon from "../image/instagram-icon.svg";
import emailIcon from "../image/email-icon.svg";
import vimeoIcon from "../image/vimeo-icon.svg";

// Мемоизированные константы для социальных ссылок
const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/movie_park/",
    icon: instagramIcon,
    alt: "Instagram",
    label: "Instagram"
  },
  {
    href: "https://vimeo.com/movieparkco",
    icon: vimeoIcon,
    alt: "Vimeo", 
    label: "Vimeo"
  },
  {
    href: "mailto:hello@movieparkpro.com",
    icon: emailIcon,
    alt: "Email",
    label: "Email"
  }
];

// Текстовые ссылки
const TEXT_LINKS = [
  { to: "/privacy-policy", text: "PRIVACY POLICY" },
  { to: "/terms-of-use", text: "TERMS OF USE" },
  { to: "/accessibility-statement", text: "ACCESSIBILITY STATEMENT" }
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Стандартная версия для ПК и планшетов */}
        <div className="footer-left">
          <span>© 2025 MOVIE PARK</span>
        </div>
        
        <div className="footer-links">
          {TEXT_LINKS.map(({ to, text }) => (
            <Link key={to} to={to}>{text}</Link>
          ))}
        </div>
        
        <div className="footer-social">
          {SOCIAL_LINKS.map(({ href, icon, alt, label }) => (
            <a 
              key={href}
              href={href} 
              target="_blank"
              rel="noopener noreferrer" 
              aria-label={label}
            >
              <img 
                src={icon} 
                alt={alt}
                loading="lazy"
                width="20"
                height="20"
              />
            </a>
          ))}
        </div>
        
        {/* Мобильная версия */}
        <div className="footer-mobile">
          {/* 1 строка: SVG иконки */}
          <div className="footer-mobile-social">
            {SOCIAL_LINKS.map(({ href, icon, alt, label }) => (
              <a 
                key={`mobile-${href}`}
                href={href} 
                target="_blank"
                rel="noopener noreferrer" 
                aria-label={label}
              >
                <img 
                  src={icon} 
                  alt={alt}
                  loading="lazy"
                  width="20"
                  height="20"
                />
              </a>
            ))}
          </div>
          
          {/* 2 строка: PRIVACY POLICY TERMS OF USE */}
          <div className="footer-mobile-links-row1">
            <Link to="/privacy-policy">PRIVACY POLICY</Link>
            <Link to="/terms-of-use">TERMS OF USE</Link>
          </div>
          
          {/* 3 строка: ACCESSIBILITY STATEMENT */}
          <div className="footer-mobile-links-row2">
            <Link to="/accessibility-statement">ACCESSIBILITY STATEMENT</Link>
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

// Оптимизируем с помощью React.memo при экспорте
export default React.memo(Footer);