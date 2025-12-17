import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./VideoBackground.css";
import videoSrc from "../video/hero-video.mp4";
import logoImg from "../image/logo.png";
import taglineImg from "../image/tagline.png";
import awardsImg from "../image/awards.png";
import silverImg from "../image/silver.png";
import designfestivalImg from "../image/designfestival.png";

const VideoBackground = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Функция для скролла к блоку Mens
  const scrollToMens = () => {
    closeMenu();
    const mensSection = document.getElementById('mens-section');
    if (mensSection) {
      mensSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Функция для скролла к Contact секции
  const scrollToContact = () => {
    closeMenu();
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Функция для обработки клика на ABOUT
  const handleAboutClick = (e) => {
    e.preventDefault();
    scrollToMens();
  };

  // Закрытие меню при нажатии Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    // Предотвращение скролла при открытом меню
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
    <div className="video-background-container">
      <div className="video-background-overlay"></div>
      
      <video autoPlay playsInline muted loop className="video-background">
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* НАВИГАЦИЯ */}
      <nav className="navigation">
        {/* Десктопная навигация - ЛЕВАЯ ЧАСТЬ */}
        <div className="nav-left">
          {/* Кнопка DIRECTIONS с ссылкой на real-estate страницу */}
          <Link to="/real-estate" className="nav-item directions">
            DIRECTIONS
          </Link>
          {/* Кнопка PROJECTS с ссылкой на projects страницу */}
          <Link to="/projects" className="nav-item projects">
            PROJECTS
          </Link>
        </div>
        
        {/* Логотип с ссылкой на домашнюю страницу */}
        <div className="logo">
          <Link to="/home">
            <img src={logoImg} alt="Logo" className="logo-image" />
          </Link>
        </div>
        
        {/* Десктопная навигация - ПРАВАЯ ЧАСТЬ */}
        <div className="nav-right">
          {/* ОБНОВЛЕНО: About теперь Link как DIRECTIONS и PROJECTS */}
          <Link 
            to="#" 
            className="nav-item about"
            onClick={handleAboutClick}
          >
            ABOUT
          </Link>
          {/* ОБНОВЛЕНО: CHAT WITH US теперь скроллит к ContactSection */}
          <button 
            className="nav-item chat-button"
            onClick={scrollToContact}
          >
            CHAT WITH US
          </button>
        </div>
        
        {/* Мобильная навигация */}
        <button 
          className="burger-menu" 
          onClick={toggleMenu} 
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L19 19M19 1L1 19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 12L0 10H18V12H0ZM0 7L0 5H18V7H0ZM0 2L0 0H18V2H0Z" fill="white"/>
            </svg>
          )}
        </button>
        
        <button 
          className="mobile-chat-button" 
          aria-label="Chat with us"
          onClick={() => {
            closeMenu();
            scrollToContact();
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.2 0H1.8C0.81 0 0 0.81 0 1.8V18L3.6 14.4H16.2C17.19 14.4 18 13.59 18 12.6V1.8C18 0.81 17.19 0 16.2 0ZM16.2 12.6H2.88L1.8 13.68V1.8H16.2V12.6Z" fill="white"/>
          </svg>
        </button>
        
        {/* Мобильное выпадающее меню с эффектом стекла */}
        <div className={`mobile-dropdown ${isMenuOpen ? 'active' : ''}`}>
          {isMenuOpen && (
            <>
              {/* Мобильная версия кнопки DIRECTIONS */}
              <Link 
                to="/real-estate" 
                className="mobile-nav-item"
                onClick={closeMenu}
              >
                DIRECTIONS
              </Link>
              {/* Мобильная версия кнопки PROJECTS */}
              <Link 
                to="/projects" 
                className="mobile-nav-item"
                onClick={closeMenu}
              >
                PROJECTS
              </Link>
              {/* ОБНОВЛЕНО: Мобильная версия ABOUT как Link */}
              <Link 
                to="#" 
                className="mobile-nav-item"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToMens();
                }}
              >
                ABOUT
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* КОНТЕНТ СНИЗУ */}
      <div className="content-wrapper">
        {/* НАГРАДЫ */}
        <div className="awards-row">
          <div className="award-item">
            <div className="award-icon-container icon-1">
              <img src={taglineImg} alt="Tagline" className="award-icon" />
            </div>
            <p className="award-text">1X GOLD<br />Best  <br />video</p>
          </div>
          <div className="award-item">
            <div className="award-icon-container icon-2">
              <img src={awardsImg} alt="Awards" className="award-icon" />
            </div>
            <p className="award-text">4X SILVER<br />Efficiency in business</p>
          </div>
          <div className="award-item">
            <div className="award-icon-container icon-3">
              <img src={silverImg} alt="Mercury" className="award-icon" />
            </div>
            <p className="award-text">2X BRONZE<br />Situational marketing</p>
          </div>
          <div className="award-item">
            <div className="award-icon-container icon-4">
              <img src={designfestivalImg} alt="Festival" className="award-icon" />
            </div>
            <p className="award-text">3X SHORTLIST<br />Visual solutions in video advertising</p>
          </div>
        </div>

        {/* КНОПКА VIEW PROJECT */}
        <button 
          className="view-project-button"
          onClick={() => alert("Viewing project...")}
        >
          VIEW PROJECT
        </button>
      </div>
    </div>
  );
};

export default VideoBackground;