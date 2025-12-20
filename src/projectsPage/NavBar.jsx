import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./NavBar.css";
import logoImg from "../image/logo-dark.png";

const NavBar = () => {
  const [menuActive, setMenuActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuToggle = () => {
    setMenuActive(!menuActive);
  };

  const handleMenuClose = () => {
    setMenuActive(false);
  };

  // Функция для скролла к блоку Mens
  const scrollToMens = () => {
    handleMenuClose();
    
    if (location.pathname === "/home" || location.pathname === "/") {
      const mensSection = document.getElementById('mens-section');
      if (mensSection) {
        mensSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      navigate('/home#mens-section');
    }
  };

  // Функция для скролла к Contact секции
  const scrollToContact = () => {
    handleMenuClose();
    
    if (location.pathname === "/home" || location.pathname === "/") {
      const contactSection = document.getElementById('contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      navigate('/home#contact-section');
    }
  };

  // Закрытие меню при нажатии Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        handleMenuClose();
      }
    };

    // Предотвращение скролла при открытом меню
    if (menuActive) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [menuActive]);

  // Эффект для автоматического скролла при загрузке страницы с хэшем
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

  return (
    <div className="header-wrapper">
      {/* НАВИГАЦИЯ */}
      <header className="main-header">
        {/* Бургер-меню для мобильных */}
        <button 
          className="burger-menu" 
          onClick={handleMenuToggle} 
          aria-label={menuActive ? "Close menu" : "Open menu"}
          aria-expanded={menuActive}
        >
          {menuActive ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L19 19M19 1L1 19" stroke="black" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 12L0 10H18V12H0ZM0 7L0 5H18V7H0ZM0 2L0 0H18V2H0Z" fill="black"/>
            </svg>
          )}
        </button>
        
        {/* Десктопная навигация - ЛЕВАЯ ЧАСТЬ */}
        <div className="header-section header-section--left">
          <div className="nav-links-container">
            <Link to="/real-estate" className="nav-link">
              DIRECTIONS
            </Link>
            <Link to="/projects" className="nav-link">
              PROJECTS
            </Link>
          </div>
        </div>
        
        {/* Логотип с ссылкой на домашнюю страницу */}
        <div className="brand-logo">
          <Link to="/home" className="brand-logo__link">
            <img src={logoImg} alt="Logo" className="brand-logo__image" />
          </Link>
        </div>
        
        {/* Десктопная навигация - ПРАВАЯ ЧАСТЬ */}
        <div className="header-section header-section--right">
          <div className="nav-links-container">
            <Link 
              to="/home#mens-section" 
              className="nav-link"
              onClick={(e) => {
                if (location.pathname === "/home" || location.pathname === "/") {
                  e.preventDefault();
                  scrollToMens();
                }
              }}
            >
              ABOUT
            </Link>
            <button 
              className="chat-action-button"
              onClick={scrollToContact}
            >
              CHAT WITH US
            </button>
          </div>
        </div>
        
        {/* Мобильная кнопка чата */}
        <button 
          className="mobile-chat-button" 
          aria-label="Chat with us"
          onClick={() => {
            handleMenuClose();
            scrollToContact();
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.2 0H1.8C0.81 0 0 0.81 0 1.8V18L3.6 14.4H16.2C17.19 14.4 18 13.59 18 12.6V1.8C18 0.81 17.19 0 16.2 0ZM16.2 12.6H2.88L1.8 13.68V1.8H16.2V12.6Z" fill="black"/>
          </svg>
        </button>
        
        {/* Мобильное выпадающее меню */}
        <div className={`mobile-dropdown ${menuActive ? 'active' : ''}`}>
          {menuActive && (
            <>

              
              <Link 
                to="/real-estate" 
                className="mobile-nav-item"
                onClick={handleMenuClose}
              >
                DIRECTIONS
              </Link>
              <Link 
                to="/projects" 
                className="mobile-nav-item"
                onClick={handleMenuClose}
              >
                PROJECTS
              </Link>
              <Link 
                to="/home#mens-section" 
                className="mobile-nav-item"
                onClick={(e) => {
                  handleMenuClose();
                  if (location.pathname === "/home" || location.pathname === "/") {
                    e.preventDefault();
                    scrollToMens();
                  }
                }}
              >
                ABOUT
              </Link>

            </>
          )}
        </div>
      </header>
    </div>
  );
};

export default NavBar;