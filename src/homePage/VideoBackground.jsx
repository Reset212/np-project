import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./VideoBackground.css";

import logoImg from "../image/logo.png";
import taglineImg from "../image/tagline.png";
import awardsImg from "../image/awards.png";
import silverImg from "../image/silver.png";
import designfestivalImg from "../image/designfestival.png";
import instagramIcon from "../image/instagram-icon.svg";
import vimeoIcon from "../image/vimeo-icon.svg";
import emailIcon from "../image/email-icon.svg";

// Константы вынесены для производительности
const CLOUD_NAME = "dqlxoijyx";
const DESKTOP_VIDEO_ID = "Brunello_kmrmoo";
const MOBILE_VIDEO_ID = "brun_vert_tb5e9h";

// Предзагрузка URL видео
const desktopVideoUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${DESKTOP_VIDEO_ID}`;
const mobileVideoUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${MOBILE_VIDEO_ID}`;

// Данные наград
const AWARDS_DATA = [
  {
    icon: taglineImg,
    alt: "Tagline",
    count: "1X GOLD",
    description: "Best video",
    className: "icon-1"
  },
  {
    icon: awardsImg,
    alt: "Awards",
    count: "3X SILVER",
    description: "Efficiency in business",
    className: "icon-2"
  },
  {
    icon: silverImg,
    alt: "Mercury",
    count: "2X BRONZE",
    description: "Situational marketing",
    className: "icon-3"
  },
  {
    icon: designfestivalImg,
    alt: "Festival",
    count: "3X SHORTLIST",
    description: "Visual solutions in video advertising",
    className: "icon-4"
  }
];

// Данные социальных иконок
const SOCIAL_ICONS = [
  {
    icon: instagramIcon,
    alt: "Instagram",
    onClick: () => window.open('https://www.instagram.com/movie_park/', '_blank'),
    label: "Instagram"
  },
  {
    icon: vimeoIcon,
    alt: "Vimeo",
    onClick: () => window.open('https://vimeo.com/movieparkco', '_blank'),
    label: "Vimeo"
  },
  {
    icon: emailIcon,
    alt: "Email",
    onClick: () => window.location.href = 'mailto:hello@movieparkpro.com',
    label: "Email"
  }
];

const VideoBackground = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Мемоизированные обработчики
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ: скролл к секции About/Mens
  const scrollToMens = useCallback(() => {
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
  }, [closeMenu, location.pathname, navigate]);

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ: скролл к контактной форме
  const scrollToContact = useCallback(() => {
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
  }, [closeMenu, navigate]);

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
  }, [isMenuOpen, closeMenu]);

  // Рендер иконок наград
  const renderAwards = () => (
    AWARDS_DATA.map((award, index) => (
      <div className="award-item" key={index}>
        <div className={`award-icon-container ${award.className}`}>
          <img 
            src={award.icon} 
            alt={award.alt} 
            className="award-icon" 
            loading="lazy"
            width="24"
            height="24"
          />
        </div>
        <p className="award-text">
          <span className="award-count">{award.count}</span>
          <span className="award-description">{award.description}</span>
        </p>
      </div>
    ))
  );

  // Рендер социальных иконок
  const renderSocialIcons = () => (
    SOCIAL_ICONS.map((social, index) => (
      <button 
        key={index}
        className="social-icon"
        onClick={social.onClick}
        aria-label={social.label}
      >
        <img 
          src={social.icon} 
          alt={social.alt} 
          loading="lazy"
          width="26"
          height="26"
        />
      </button>
    ))
  );

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
          disablePictureInPicture
          disableRemotePlayback
        >
          <source src={desktopVideoUrl} type="video/mp4" />
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
          disablePictureInPicture
          disableRemotePlayback
        >
          <source src={mobileVideoUrl} type="video/mp4" />
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
              <img 
                src={logoImg} 
                alt="Logo" 
                className="logo-image" 
                loading="eager"
                width="120"
                height="40"
              />
            </Link>
          </div>
          
          <div className="nav-right">
            <div></div>
            {/* ИСПРАВЛЕННАЯ ССЫЛКА ABOUT */}
            <Link
              className="nav-item about"
              onClick={scrollToMens}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && scrollToMens()}
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
                    {renderSocialIcons()}
                  </div>
                  
                  {/* Кнопка CHAT WITH US */}
                </div>
              </>
            )}
          </div>
        </nav>

        <div className="content-wrapper">
          <div className="awards-row">
            {renderAwards()}
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

// Используем React.memo для предотвращения лишних перерисовок
export default React.memo(VideoBackground);