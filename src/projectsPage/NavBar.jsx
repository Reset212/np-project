// NavBar.jsx - СТРУКТУРА ИДЕНТИЧНАЯ VideoBackground.jsx С ЧЕРНЫМ ТЕКСТОМ
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./NavBar.css";
import logoImg from "../image/logo-dark.png";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // ТОЧНО ТАКАЯ ЖЕ ФУНКЦИЯ КАК В VideoBackground.jsx
  const scrollToMens = () => {
    closeMenu();
    
    if (location.pathname === "/home" || location.pathname === "/") {
      const mensSection = document.getElementById('mens-section');
      if (mensSection) {
        mensSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      const mensSection = document.getElementById('mens-section');
      if (mensSection) {
        mensSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        navigate('/home#mens-section');
      }
    }
  };

  // ТОЧНО ТАКАЯ ЖЕ ФУНКЦИЯ КАК В VideoBackground.jsx
  const scrollToContact = () => {
    closeMenu();
    
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      navigate('/home#contact-section');
    }
  };

  // ТОЧНО ТАКИЕ ЖЕ ФУНКЦИИ КАК В VideoBackground.jsx
  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/movie_park/', '_blank');
  };

  const handleVimeoClick = () => {
    window.open('https://vimeo.com/movieparkco', '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:hello@movieparkpro.com';
  };

  // ТОЧНО ТАКОЙ ЖЕ useEffect КАК В VideoBackground.jsx
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location]);

  // ТОЧНО ТАКОЙ ЖЕ useEffect КАК В VideoBackground.jsx
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <>
        <nav className="navigation"   style={{ boxShadow: 'none' }}>
          <div className="nav-left">
            <Link to="/real-estate" className="nav-link directions">
              REAL ESTATE
            </Link>
            <Link to="/projects" className="nav-link projects">
              PROJECTS
            </Link>
            <div></div>
          </div>
          
          <div className="logo">
            <Link to="/home">
              <img src={logoImg} alt="Logo" className="logo-image" />
            </Link>
          </div>
          
          <div className="nav-right">
            <div></div>
            {/* ИСПРАВЛЕННАЯ ССЫЛКА ABOUT */}
            <button 
              className="nav-link about"
              onClick={scrollToMens}
            >
              ABOUT
            </button>

            {/* ИСПРАВЛЕННАЯ КНОПКА CHAT WITH US */}
            <button 
              className="nav-link chat-action-button"
              onClick={scrollToContact}
            >
              CHAT WITH US
            </button>
          </div>
          
          {/* БУРГЕР-МЕНЮ */}
          <button 
            className="burger-menu" 
            onClick={toggleMenu} 
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L19 19M19 1L1 19" stroke="black" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 12L0 10H18V12H0ZM0 7L0 5H18V7H0ZM0 2L0 0H18V2H0Z" fill="black"/>
              </svg>
            )}
          </button>
          
          <button 
            className="mobile-chat-button" 
            aria-label="Chat with us"
            onClick={scrollToContact}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.2 0H1.8C0.81 0 0 0.81 0 1.8V18L3.6 14.4H16.2C17.19 14.4 18 13.59 18 12.6V1.8C18 0.81 17.19 0 16.2 0ZM16.2 12.6H2.88L1.8 13.68V1.8H16.2V12.6Z" fill="black"/>
            </svg>
          </button>
          
          {/* ВЫПАДАЮЩЕЕ МЕНЮ */}
          <div className={`mobile-dropdown ${isMenuOpen ? 'active' : ''}`}>
            {isMenuOpen && (
              <>
                <div className="mobile-dropdown-content">
                  <Link 
                    to="/real-estate" 
                    className="mobile-nav-item"
                    onClick={closeMenu}
                  >
                    REAL ESTATE
                  </Link>
                  <Link 
                    to="/projects" 
                    className="mobile-nav-item"
                    onClick={closeMenu}
                  >
                    PROJECTS
                  </Link>
                  <button 
                    className="mobile-nav-item"
                    onClick={scrollToMens}
                  >
                    ABOUT
                  </button>
                </div>
                
                {/* Кнопка CHAT WITH US и соцсети */}
                <div className="mobile-dropdown-bottom">
                  {/* Иконки соцсетей */}
                  <div className="social-icons-container">
                    <button 
                      className="social-icon"
                      onClick={handleInstagramClick}
                      aria-label="Instagram"
                    >
                      <img 
                        src={require("../image/instagram-icon.svg").default} 
                        alt="Instagram" 
                        style={{ width: '26px', height: '26px' }}
                      />
                    </button>
                    <button 
                      className="social-icon"
                      onClick={handleVimeoClick}
                      aria-label="Vimeo"
                    >
                      <img 
                        src={require("../image/vimeo-icon.svg").default} 
                        alt="Vimeo" 
                        style={{ width: '26px', height: '26px' }}
                      />
                    </button>
                    <button 
                      className="social-icon"
                      onClick={handleEmailClick}
                      aria-label="Email"
                    >
                      <img 
                        src={require("../image/email-icon.svg").default} 
                        alt="Email" 
                        style={{ width: '26px', height: '26px' }}
                      />
                    </button>
                  </div>
                  
                  {/* Кнопка CHAT WITH US */}
 
                </div>
              </>
            )}
          </div>
        </nav>
    </>
  );
};

export default NavBar;