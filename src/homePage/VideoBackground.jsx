// VideoBackground.jsx - ОБНОВЛЕННЫЙ ФАЙЛ
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./VideoBackground.css";
import videoSrc from "../video/Brunello.mp4";
import mobileVideoSrc from "../video/brun vert.mp4";
import taglineImg from "../image/tagline.png";
import awardsImg from "../image/awards.png";
import silverImg from "../image/silver.png";
import designfestivalImg from "../image/designfestival.png";

const VideoBackground = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoAnimation, setShowLogoAnimation] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const animationPlayedRef = useRef(false);

  useEffect(() => {
    // Проверяем, была ли уже анимация
    if (animationPlayedRef.current) {
      setShowLogoAnimation(false);
      return;
    }

    // Блокируем скролл при показе анимации
    if (showLogoAnimation) {
      document.body.classList.add('no-scroll');
    }

    // Таймер для завершения анимации
    const timer = setTimeout(() => {
      if (showLogoAnimation) {
        setShowLogoAnimation(false);
        document.body.classList.remove('no-scroll');
        animationPlayedRef.current = true;
      }
    }, 2500); // Общее время анимации: 2.5 секунды

    return () => {
      clearTimeout(timer);
    };
  }, [showLogoAnimation]);

  const skipAnimation = () => {
    setShowLogoAnimation(false);
    document.body.classList.remove('no-scroll');
    animationPlayedRef.current = true;
  };

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

  // Компонент для анимированного логотипа (полная версия с текстом)
  const AnimatedLogoSVG = () => (
    <div className="animated-logo-wrapper">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1252.21 298.49"
        className="animated-logo-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Группа логотипа - появляется ПЕРВОЙ */}
        <g className="logo-group">
          {/* Часть логотипа 1 */}
          <path 
            className="logo-part logo-1"
            fill="#ededed" 
            d="m99.97,61.59l7.37-4.25c1.11-.64,2.47-.64,3.58,0l50.72,29.28c1.31.76,1.51,2.57.39,3.59l-29.44,26.89c-1.06.96-2.73.7-3.45-.53l-30-51.92c-.62-1.07-.25-2.44.82-3.06Z"
          />
          
          {/* Часть логотипа 2 */}
          <path 
            className="logo-part logo-2"
            fill="#ededed" 
            d="m28.35,165.39v-61.15c0-.8.43-1.54,1.12-1.94l52.76-30.47c1.07-.62,2.44-.25,3.06.82l32.24,55.84c.53.91.35,2.06-.43,2.77l-47.95,43.81c-.54.49-1.27.69-1.98.53l-37.05-8.03c-1.03-.22-1.76-1.13-1.76-2.19Z"
          />
          
          {/* Часть логотипа 3 */}
          <path 
            className="logo-part logo-3"
            fill="#ededed" 
            d="m156.36,215.34l-45.45,25.83c-1.1.62-2.44.62-3.54,0l-77.89-44.28c-.7-.4-1.13-1.14-1.13-1.95v-8.56c0-1.43,1.32-2.49,2.71-2.19l124.67,27.01c2.01.43,2.42,3.12.63,4.13Z"
          />
          
          {/* Часть логотипа 4 */}
          <path 
            className="logo-part logo-4"
            fill="#ededed" 
            d="m189.94,104.24v90.7c0,.81-.43,1.55-1.13,1.95l-5.29,3c-.77.43-1.66.57-2.52.39l-89.29-19.33c-1.78-.38-2.38-2.61-1.04-3.84l86.98-79.44c.72-.66,1.78-.77,2.63-.29l8.54,4.92c.69.4,1.12,1.14,1.12,1.94Z"
          />
        </g>
        
        {/* Группа букв - появляется ПОСЛЕ логотипа */}
        <g className="letters-group">
          {/* Буква M */}
          <path 
            className="letter-part m-part-1"
            fill="#ededed" 
            d="m288.66,98.53c1.32,0,2.42,1.1,2.64,2.2l2.42,12.76c5.94-10.56,16.06-17.38,30.36-17.38,14.52.22,25.96,7.04,31.9,20.68,6.6-12.54,18.26-20.68,34.1-20.68,21.56.22,36.52,15.62,36.3,45.32l.22,56.32c0,1.32-.88,2.2-2.2,2.2h-17.16c-1.32,0-2.2-.88-2.2-2.2v-53.23c0-18.92-7.7-26.84-20.24-26.84-14.08,0-23.98,12.1-24.2,34.76v45.32c0,1.32-.88,2.2-2.2,2.2h-16.94c-1.32,0-2.2-.88-2.2-2.2v-53.23c0-18.7-7.7-26.84-20.02-26.84-17.38,0-23.98,18.26-24.41,32.78v47.29c0,1.32-.88,2.2-2.2,2.2h-17.16c-1.32,0-2.2-.88-2.2-2.2v-97.01c0-1.32.88-2.2,2.2-2.2h13.2Z"
          />
          
          {/* Буква O */}
          <path 
            className="letter-part o-part"
            fill="#ededed" 
            d="m490.36,96.11c31.68,0,52.8,21.56,52.8,53.02s-21.12,53.02-52.8,53.02-52.57-21.56-52.57-53.02,21.12-53.02,52.57-53.02Zm0,84.69c18.92,0,31.46-12.76,31.46-31.68s-12.54-31.68-31.46-31.68-31.24,12.76-31.24,31.68,12.54,31.68,31.24,31.68Z"
          />
          
          {/* Буква V */}
          <path 
            className="letter-part v-part"
            fill="#ededed" 
            d="m603.77,197.97c-.66,1.32-1.76,1.98-3.08,1.98h-18.92c-1.32,0-2.64-.66-3.08-1.98l-38.94-96.58c-.66-1.76,0-2.86,1.98-2.86h18.92c1.1,0,1.98.66,2.42,1.54l28.16,74.79,27.94-74.57c.44-1.1,1.54-1.76,2.64-1.76h18.91c1.76,0,2.42,1.1,1.76,2.86l-38.72,96.58Z"
          />
          
          {/* Буква I */}
          <path 
            className="letter-part i-part"
            fill="#ededed" 
            d="m670.68,197.74c0,1.32-.88,2.2-2.2,2.2h-17.16c-1.1,0-1.98-.88-1.98-2.2v-97.01c0-1.32.88-2.2,2.2-2.2h16.94c1.32,0,2.2.88,2.2,2.2v97.01Z"
          />
          
          {/* Буква E */}
          <path 
            className="letter-part e-part"
            fill="#ededed" 
            d="m737.39,181.91c11,0,19.8-3.74,25.3-9.02.66-.66,1.32-.88,1.98-.88s1.32.22,1.76.66l11,11.22c.88.88.88,2.2,0,3.08-9.24,10.12-23.54,15.18-40.91,15.18-32.34,0-54.11-21.34-54.11-52.8s21.12-52.79,52.57-52.79,52.58,19.8,52.36,59.39c0,1.54-.66,1.98-2.2,1.98h-80.29c3.08,14.52,14.96,23.98,32.55,23.98Zm27.72-40.48c-2.64-14.74-13.64-24.41-30.14-24.41s-27.72,9.68-30.36,24.41h60.5Z"
          />
          
          {/* Буква P */}
          <path 
            className="letter-part p-part-1"
            fill="#ededed" 
            d="m828.99,239.43V100.73c0-1.32.88-2.2,2.42-2.2h11.66c1.54,0,2.42.88,2.86,2.2l3.08,13.42c7.48-11.22,19.58-17.82,35.42-17.82,30.57,0,51.03,21.56,51.03,53.02s-20.46,53.02-51.03,53.02c-14.96,0-26.62-5.94-33.88-16.06v53.13c0,1.32-.88,2.2-2.2,2.2h-17.16c-1.32,0-2.2-.88-2.2-2.2Zm53.67-58.4c18.92,0,31.46-12.76,31.46-31.68s-12.54-31.68-31.46-31.68-31.9,12.76-31.9,31.68,13.2,31.68,31.9,31.68Z"
          />
          
          {/* Буква A */}
          <path 
            className="letter-part a-part-1"
            fill="#ededed" 
            d="m1031.18,100.51c.44-1.1,1.1-1.98,2.42-1.98h13.64c1.1,0,1.98.88,1.98,2.2v97.01c0,1.32-.88,2.2-2.2,2.2h-13.64c-1.32,0-1.98-.88-2.42-1.98l-2.86-13.2c-7.48,11-19.36,17.38-34.97,17.38-30.58.22-51.03-21.34-51.03-52.8s20.46-52.57,51.03-52.79c15.62,0,27.49,6.38,34.97,17.38l3.08-13.42Zm-36.52,80.51c18.92,0,31.68-12.54,32.12-31.68-.44-18.91-13.2-31.46-32.12-31.46s-31.46,12.54-31.46,31.46,12.76,31.68,31.46,31.68Z"
          />
          
          {/* Буква R */}
          <path 
            className="letter-part r-part"
            fill="#ededed" 
            d="m1107.89,118.11c-8.14,0-15.18,5.5-19.13,14.08v65.55c0,1.32-.66,2.2-2.2,2.2h-17.16c-1.32,0-2.2-.88-2.2-2.2v-97.23c0-1.32.88-1.98,2.2-1.98h11.88c1.54,0,2.42.88,2.64,1.98l1.98,7.7c6.38-6.82,15.4-11.66,26.18-11.66,6.6,0,12.54,1.76,15.62,2.63,1.32.22,1.98,1.32,1.54,2.64l-4.4,17.82c-.22.88-1.1,1.54-1.76,1.54-.44,0-.66,0-1.1-.22-2.86-1.1-8.8-2.86-14.08-2.86Z"
          />
          
          {/* Буква K - ИСПРАВЛЕННАЯ */}
          <path 
            className="letter-part k-part"
            fill="#ededed" 
            d="m1218.93,98.75c2.64,0,2.86,1.1,1.32,2.86l-40.04,44.44,47.07,51.03c1.76,1.98,1.32,2.86-1.32,2.86h-23.1c-1.1,0-2.2-.22-2.86-1.1l-42.46-46.64v45.76c0,1.1-.88,1.98-2.2,1.98h-17.16c-1.32,0-2.2-.88-2.2-1.98v-97.45c0-1.1.88-1.98,2.2-1.98h17.16c1.32,0,2.2.88,2.2,1.98v40.25l35.41-40.91c.66-.66,1.54-1.1,2.42-1.1h23.54Z"
          />
        </g>
      </svg>
    </div>
  );

  // Оригинальный логотип для навигации (маленький)
  const LogoSVG = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 450 220"
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

        {/* Анимация логотипа поверх всего */}
        {showLogoAnimation && (
          <div className="logo-animation-overlay">
            <AnimatedLogoSVG />
            
            {/* Кнопка скипа анимации */}
            <button 
              className="skip-animation-btn"
              onClick={skipAnimation}
              aria-label="Skip animation"
            >
              SKIP
            </button>
          </div>
        )}

        <nav className={`navigation ${showLogoAnimation ? 'hidden' : ''}`}>
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
          
          {/* Бургер-меню */}
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
          
          {/* Выпадающее меню */}
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
                  

                </div>
              </>
            )}
          </div>
        </nav>

        <div className={`content-wrapper ${showLogoAnimation ? 'hidden' : ''}`}>
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