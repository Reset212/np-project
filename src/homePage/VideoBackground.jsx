// VideoBackground.jsx - ОБНОВЛЕННЫЙ ФАЙЛ
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./VideoBackground.css";
import videoSrc from "../video/Brunello.mp4";
import mobileVideoSrc from "../video/brun vert.mp4"; // Добавлено для мобильных
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
      navigate('/home#mens-section');
    }
  };

  const scrollToContact = () => {
    closeMenu();
    
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

  // Функции для соцсетей
  const handleInstagramClick = () => {
    window.open('https://instagram.com/moviepark', '_blank');
  };

  const handleVimeoClick = () => {
    window.open('https://vimeo.com/moviepark', '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:info@moviepark.com';
  };

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

// Обновите LogoSVG компонент в VideoBackground.jsx:
const LogoSVG = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 450 220" /* Уменьшил высоту и ширину */
    className="logo-svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <path fill="#ededed" d="M246.65,98.61c1.32,0,2.42,1.1,2.64,2.2l2.42,12.74c5.93-10.54,16.03-17.36,30.31-17.36,14.49.22,25.92,7.03,31.85,20.65,6.59-12.52,18.23-20.65,34.04-20.65,21.53.22,36.46,15.6,36.24,45.24l.22,56.23c0,1.32-.88,2.2-2.19,2.2h-17.14c-1.32,0-2.19-.88-2.19-2.2v-53.15c0-18.89-7.69-26.8-20.21-26.8-14.06,0-23.94,12.08-24.16,34.7v45.24c0,1.32-.88,2.2-2.2,2.2h-16.91c-1.32,0-2.2-.88-2.2-2.2v-53.15c0-18.67-7.68-26.8-19.99-26.8-17.35,0-23.94,18.23-24.38,32.73v47.22c0,1.32-.88,2.2-2.2,2.2h-17.13c-1.32,0-2.2-.88-2.2-2.2v-96.86c0-1.32.88-2.2,2.2-2.2h13.17Z" transform="scale(0.8) translate(-30, -30)"/>
    <path fill="#ededed" d="M404.65,239.29V100.81c0-1.32.88-2.2,2.42-2.2h11.64c1.53,0,2.42.88,2.86,2.2l3.07,13.4c7.47-11.2,19.55-17.79,35.36-17.79,30.52,0,50.95,21.53,50.95,52.93s-20.43,52.93-50.95,52.93c-14.94,0-26.58-5.93-33.82-16.03v53.04c0,1.32-.88,2.2-2.2,2.2h-17.13c-1.32,0-2.2-.88-2.2-2.2Zm53.59-58.31c18.89,0,31.41-12.74,31.41-31.63s-12.52-31.63-31.41-31.63-31.85,12.74-31.85,31.63,13.17,31.63,31.85,31.63Z" transform="scale(0.8) translate(-30, -30)"/>
    <g transform="scale(0.8) translate(-30, -30)">
      <path fill="#ededed" d="M99.86,61.73l7.36-4.25c1.11-.64,2.47-.64,3.57,0l50.64,29.24c1.31.76,1.51,2.57.39,3.58l-29.4,26.85c-1.05.96-2.73.7-3.44-.53l-29.95-51.84c-.62-1.07-.25-2.44.82-3.05Z"/>
      <path fill="#ededed" d="M28.35,165.37v-61.05c0-.8.43-1.54,1.12-1.93l52.67-30.42c1.07-.62,2.43-.25,3.05.82l32.19,55.75c.52.91.35,2.06-.43,2.77l-47.88,43.74c-.53.49-1.27.69-1.98.53l-36.99-8.02c-1.03-.22-1.76-1.13-1.76-2.18Z"/>
      <path fill="#ededed" d="M156.15,215.23l-45.38,25.78c-1.1.62-2.44.62-3.53,0l-77.77-44.21c-.7-.4-1.13-1.14-1.13-1.94v-8.55c0-1.42,1.31-2.48,2.71-2.18l124.47,26.97c2,.43,2.41,3.11.63,4.13Z"/>
      <path fill="#ededed" d="M189.69,104.32v90.55c0,.8-.43,1.55-1.13,1.94l-5.28,3c-.76.43-1.66.57-2.52.39l-89.15-19.3c-1.77-.38-2.37-2.61-1.03-3.83l86.84-79.32c.72-.66,1.78-.77,2.62-.29l8.53,4.92c.69.4,1.12,1.14,1.12,1.94Z"/>
    </g>
  </svg>
);

  return (
    <>
      <div className="video-background-container">
        <div className="video-background-overlay"></div>
        
        {/* Основное видео для десктопов */}
        <video 
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
              <LogoSVG />
            </Link>
          </div>
          
          <div className="nav-right">
          <div></div>
            <Link 
              to="/home#mens-section" 
              className="nav-item about"
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
              className="nav-item chat-button"
              onClick={scrollToContact}
            >
              CHAT WITH US
            </button>
          </div>
          
          {/* ОБНОВЛЕННОЕ БУРГЕР-МЕНЮ */}
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
          
          {/* ОБНОВЛЕННОЕ ВЫПАДАЮЩЕЕ МЕНЮ */}
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
                  <Link 
                    to="/home#mens-section" 
                    className="mobile-nav-item"
                    onClick={(e) => {
                      closeMenu();
                      if (location.pathname === "/home" || location.pathname === "/") {
                        e.preventDefault();
                        scrollToMens();
                      }
                    }}
                  >
                    ABOUT
                  </Link>
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
                        style={{ width: '32px', height: '32px' }}
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
                        style={{ width: '38px', height: '32px' }}
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
                        style={{ width: '30px', height: '24px' }}
                      />
                    </button>
                  </div>
                  
                  {/* Кнопка CHAT WITH US */}
                  <button 
                    className="mobile-nav-item"
                    onClick={() => {
                      closeMenu();
                      scrollToContact();
                    }}
                  >
                    CHAT WITH US
                  </button>
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
        </div>
      </div>
    </>
  );
};

export default VideoBackground;