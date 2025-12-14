import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./VideoBackground.css";
import videoSrc from "../video/Brunello.mp4";
import logoImg from "../image/logo.png";
import taglineImg from "../image/tagline.png";
import awardsImg from "../image/awards.png";
import silverImg from "../image/silver.png";
import designfestivalImg from "../image/designfestival.png";

const VideoBackground = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorColor, setCursorColor] = useState('light');
  const [isCursorExpanded, setIsCursorExpanded] = useState(false);
  const [isCursorClicked, setIsCursorClicked] = useState(false);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Обработка движения мыши
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      
      // Обновляем позиции курсоров
      if (cursorDotRef.current && cursorRingRef.current) {
        cursorDotRef.current.style.left = `${e.clientX}px`;
        cursorDotRef.current.style.top = `${e.clientY}px`;
        cursorRingRef.current.style.left = `${e.clientX}px`;
        cursorRingRef.current.style.top = `${e.clientY}px`;
      }
      
      // Определение цвета курсора на основе позиции
      const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      if (elementUnderCursor) {
        // Проверяем, находится ли курсор над светлым элементом
        const style = window.getComputedStyle(elementUnderCursor);
        const bgColor = style.backgroundColor;
        const isLight = isColorLight(bgColor);
        
        setCursorColor(isLight ? 'dark' : 'light');
        
        // Проверяем, находится ли курсор над интерактивным элементом
        const isInteractive = 
          elementUnderCursor.tagName === 'BUTTON' || 
          elementUnderCursor.tagName === 'A' ||
          elementUnderCursor.tagName === 'INPUT' ||
          elementUnderCursor.tagName === 'TEXTAREA' ||
          elementUnderCursor.closest('button') ||
          elementUnderCursor.closest('a') ||
          elementUnderCursor.classList.contains('nav-item') ||
          elementUnderCursor.classList.contains('view-project-button') ||
          elementUnderCursor.classList.contains('chat-button') ||
          elementUnderCursor.classList.contains('burger-menu') ||
          elementUnderCursor.classList.contains('mobile-chat-button') ||
          elementUnderCursor.classList.contains('mobile-nav-item');
        
        setIsCursorExpanded(isInteractive);
      }
    };

    const handleMouseDown = () => {
      setIsCursorClicked(true);
      setTimeout(() => setIsCursorClicked(false), 150);
    };

    const handleMouseUp = () => {
      // Уже сброшено через таймаут
    };

    // Скрываем курсор при выходе за пределы окна
    const handleMouseLeave = () => {
      if (cursorDotRef.current && cursorRingRef.current) {
        cursorDotRef.current.style.opacity = '0';
        cursorRingRef.current.style.opacity = '0';
      }
    };

    const handleMouseEnter = () => {
      if (cursorDotRef.current && cursorRingRef.current) {
        cursorDotRef.current.style.opacity = '1';
        cursorRingRef.current.style.opacity = '1';
      }
    };

    // Добавляем слушатели
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Функция для определения светлоты цвета
  const isColorLight = (color) => {
    if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
      return false;
    }
    
    const rgb = color.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const r = parseInt(rgb[0]);
      const g = parseInt(rgb[1]);
      const b = parseInt(rgb[2]);
      
      // Формула яркости
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128;
    }
    
    return false;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Функция для скролла к блоку Mens
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

  // Функция для скролла к Contact секции
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

  // Закрытие меню при нажатии Escape
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
        
        <video autoPlay muted loop className="video-background">
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Кастомный курсор */}
        <div 
          ref={cursorDotRef}
          className={`cursor-dot ${cursorColor} ${isCursorExpanded ? 'expanded' : ''} ${isCursorClicked ? 'clicked' : ''}`}
          style={{
            position: 'fixed',
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          ref={cursorRingRef}
          className={`cursor-ring ${cursorColor} ${isCursorExpanded ? 'expanded' : ''} ${isCursorClicked ? 'clicked' : ''}`}
          style={{
            position: 'fixed',
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* НАВИГАЦИЯ */}
        <nav className="navigation">
          {/* Десктопная навигация - ЛЕВАЯ ЧАСТЬ */}
          <div className="nav-left">
            <Link to="/real-estate" className="nav-item directions">
              DIRECTIONS
            </Link>
            <Link to="/projects" className="nav-item projects">
              PROJECTS
            </Link>
          </div>
          
          {/* Логотип */}
          <div className="logo">
            <Link to="/home">
              <img src={logoImg} alt="Logo" className="logo-image" />
            </Link>
          </div>
          
          {/* Десктопная навигация - ПРАВАЯ ЧАСТЬ */}
          <div className="nav-right">
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
          
          {/* Мобильное выпадающее меню */}
          <div className={`mobile-dropdown ${isMenuOpen ? 'active' : ''}`}>
            {isMenuOpen && (
              <>
                <button 
                  className="close-menu"
                  onClick={closeMenu}
                  aria-label="Close menu"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L19 19M19 1L1 19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                
                <Link 
                  to="/real-estate" 
                  className="mobile-nav-item"
                  onClick={closeMenu}
                >
                  DIRECTIONS
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
              <p className="award-text">1X GOLD<br />Best video</p>
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
    </>
  );
};

export default VideoBackground;