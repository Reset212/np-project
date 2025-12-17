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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Функция для запуска видео
  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setIsVideoPlaying(true);
          setShowPlayButton(false);
          console.log("Video started playing successfully");
        })
        .catch(error => {
          console.log("Video play failed:", error);
          // Показываем кнопку воспроизведения только на мобильных
          if (window.innerWidth <= 768) {
            setShowPlayButton(true);
          }
        });
    }
  };

  // Обработчик пользовательского взаимодействия
  const handleUserInteraction = () => {
    playVideo();
  };

  // Инициализация видео при загрузке
  useEffect(() => {
    // Пытаемся запустить видео после небольшой задержки
    const timer = setTimeout(() => {
      playVideo();
    }, 300);

    // Проверяем, является ли устройство мобильным
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // На мобильных добавляем больше обработчиков
      const interactionEvents = ['touchstart', 'click', 'scroll', 'mousedown'];
      
      const handleInteraction = () => {
        playVideo();
        // Удаляем обработчики после успешного запуска
        interactionEvents.forEach(event => {
          document.removeEventListener(event, handleInteraction);
        });
      };

      interactionEvents.forEach(event => {
        document.addEventListener(event, handleInteraction, { once: true });
      });

      return () => {
        interactionEvents.forEach(event => {
          document.removeEventListener(event, handleInteraction);
        });
        clearTimeout(timer);
      };
    }

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Проверяем статус видео через интервалы
  useEffect(() => {
    const checkVideoStatus = () => {
      if (videoRef.current) {
        const isPlaying = !videoRef.current.paused && !videoRef.current.ended && 
                         videoRef.current.readyState > 2;
        
        if (!isPlaying && window.innerWidth <= 768) {
          setShowPlayButton(true);
        } else {
          setShowPlayButton(false);
        }
      }
    };

    const interval = setInterval(checkVideoStatus, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

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

  // Кнопка для ручного запуска видео на мобильных
  const VideoPlayButton = () => {
    if (!showPlayButton) return null;

    return (
      <button 
        className="mobile-video-play-button"
        onClick={playVideo}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          animation: 'pulse 2s infinite'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
    );
  };

  return (
    <>
      <div 
        className="video-background-container" 
        ref={containerRef}
        onClick={handleUserInteraction}
      >
        <div className="video-background-overlay"></div>
        
        {/* Кнопка воспроизведения для мобильных */}
        <VideoPlayButton />
        
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          webkit-playsinline="true"
          preload="auto"
          className="video-background"
          onClick={handleUserInteraction}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* НАВИГАЦИЯ */}
        <nav className="navigation">
          {/* Десктопная навигация - ЛЕВАЯ ЧАСТЬ */}
          <div className="nav-left">
            <Link to="/real-estate" className="nav-item directions" onClick={handleUserInteraction}>
              DIRECTIONS
            </Link>
            <Link to="/projects" className="nav-item projects" onClick={handleUserInteraction}>
              PROJECTS
            </Link>
          </div>
          
          {/* Логотип */}
          <div className="logo">
            <Link to="/home" onClick={handleUserInteraction}>
              <img src={logoImg} alt="Logo" className="logo-image" />
            </Link>
          </div>
          
          {/* Десктопная навигация - ПРАВАЯ ЧАСТЬ */}
          <div className="nav-right">
            <Link 
              to="/home#mens-section" 
              className="nav-item about"
              onClick={(e) => {
                handleUserInteraction();
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
              onClick={() => {
                handleUserInteraction();
                scrollToContact();
              }}
            >
              CHAT WITH US
            </button>
          </div>
          
          {/* Мобильная навигация */}
          <button 
            className="burger-menu" 
            onClick={() => {
              handleUserInteraction();
              toggleMenu();
            }} 
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
              handleUserInteraction();
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
                <Link 
                  to="/real-estate" 
                  className="mobile-nav-item"
                  onClick={() => {
                    handleUserInteraction();
                    closeMenu();
                  }}
                >
                  DIRECTIONS
                </Link>
                <Link 
                  to="/projects" 
                  className="mobile-nav-item"
                  onClick={() => {
                    handleUserInteraction();
                    closeMenu();
                  }}
                >
                  PROJECTS
                </Link>
                <Link 
                  to="/home#mens-section" 
                  className="mobile-nav-item"
                  onClick={(e) => {
                    handleUserInteraction();
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

          {/* КНОПКА VIEW PROJECT */}
          <button 
            className="view-project-button"
            onClick={() => {
              handleUserInteraction();
              alert("Viewing project...");
            }}
          >
            VIEW PROJECT
          </button>
        </div>
      </div>
    </>
  );
};

export default VideoBackground;