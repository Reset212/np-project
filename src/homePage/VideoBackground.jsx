// VideoBackground.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./VideoBackground.css";
import videoSrc from "../video/Brunello.mp4";
import mobileVideoSrc from "../video/brun vert.mp4";
import logoImg from "../image/logo.png";
import taglineImg from "../image/tagline.png";
import awardsImg from "../image/awards.png";
import silverImg from "../image/silver.png";
import designfestivalImg from "../image/designfestival.png";

const VideoBackground = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ: скролл к секции About/Mens
  const scrollToMens = () => {
    closeMenu();
    
    // Если мы на home странице, ищем секцию на текущей странице
    if (location.pathname === "/home" || location.pathname === "/") {
      const mensSection = document.getElementById('mens-section');
      if (mensSection) {
        mensSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      // Если мы на другой странице (projects, real-estate),
      // ищем секцию на ТЕКУЩЕЙ странице
      const mensSection = document.getElementById('mens-section');
      if (mensSection) {
        mensSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        // Если на текущей странице нет такой секции,
        // переходим на home
        navigate('/home#mens-section');
      }
    }
  };

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ: скролл к контактной форме
  const scrollToContact = () => {
    closeMenu();
    
    // Ищем контактную форму на ТЕКУЩЕЙ странице
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Если на текущей странице нет формы (маловероятно),
      // переходим на home
      navigate('/home#contact-section');
    }
  };

  // Функции для соцсетей
  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/movie_park/', '_blank');
  };

  const handleVimeoClick = () => {
    window.open('https://vimeo.com/movieparkco', '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:hello@movieparkpro.com';
  };

  // Хэш-скроллинг при загрузке страницы
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

  // Обработка ESC для закрытия меню
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
      <div className="video-background-container">
        <div className="video-background-overlay"></div>
        
        {/* Основное видео для десктопов */}
        <video 
        preload="metadata"
          autoPlay 
          muted 
          loop 
          className="video-background desktop-video"
          playsInline
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Видео для мобильных устройств */}
        <video 
        preload="metadata"
          autoPlay 
          muted 
          loop 
          className="video-background mobile-video"
          playsInline
        >
          <source src={mobileVideoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <nav className="navigation">
          <div className="nav-left">
            <Link to="/real-estate" className="nav-item directions">
              REAL ESTATE
            </Link>
            <Link to="/projects" className="nav-item projects">
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
            <Link
              className="nav-item about"
              onClick={scrollToMens}
            >
              ABOUT
              
            </Link>

            {/* ИСПРАВЛЕННАЯ КНОПКА CHAT WITH US */}
            <button 
              className="nav-item chat-button"
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
            onClick={scrollToContact}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.2 0H1.8C0.81 0 0 0.81 0 1.8V18L3.6 14.4H16.2C17.19 14.4 18 13.59 18 12.6V1.8C18 0.81 17.19 0 16.2 0ZM16.2 12.6H2.88L1.8 13.68V1.8H16.2V12.6Z" fill="white"/>
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

        <div className="content-wrapper">
          <div className="awards-row">
            <div className="award-item">
              <div className="award-icon-container icon-1">
                <img src={taglineImg} alt="Tagline" className="award-icon" />
              </div>
              <p className="award-text">
                <span className="award-count">1X GOLD</span>
                <span className="award-description">Best video</span>
              </p>
            </div>
            
            <div className="award-item">
              <div className="award-icon-container icon-2">
                <img src={awardsImg} alt="Awards" className="award-icon" />
              </div>
              <p className="award-text">
                <span className="award-count">3X SILVER</span>
                <span className="award-description">Efficiency in business</span>
              </p>
            </div>
            
            <div className="award-item">
              <div className="award-icon-container icon-3">
                <img src={silverImg} alt="Mercury" className="award-icon" />
              </div>
              <p className="award-text">
                <span className="award-count">2X BRONZE</span>
                <span className="award-description">Situational marketing</span>
              </p>
            </div>
            
            <div className="award-item">
              <div className="award-icon-container icon-4">
                <img src={designfestivalImg} alt="Festival" className="award-icon" />
              </div>
              <p className="award-text">
                <span className="award-count">3X SHORTLIST</span>
                <span className="award-description">Visual solutions in video advertising</span>
              </p>
            </div>
          </div>

          {/* <button 
            className="view-project-button"
            onClick={() => alert("Viewing project...")}
          >
            VIEW PROJECT
          </button> */}
        </div>
      </div>
    </>
  );
};

export default VideoBackground;