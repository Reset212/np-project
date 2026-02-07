import React, { useState, useEffect, useRef, useCallback } from "react";
import "./HomeSection.css";
import logo from "../image/logo.png";

// Вынесем константы для лучшей производительности
const ROOT_MARGINS = {
  MOBILE: "20px",
  TABLET: "30px",
  DESKTOP: "50px"
};

const BREAKPOINTS = {
  MOBILE: 390,
  TABLET: 768
};

// Мемоизированная проверка iOS
const checkIfIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

const HomeSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const observerRef = useRef(null);
  const resizeTimerRef = useRef(null);
  const isIOS = useRef(checkIfIOS());

  // Мемоизированная функция получения rootMargin
  const getRootMargin = useCallback(() => {
    const width = window.innerWidth;
    if (width <= BREAKPOINTS.MOBILE) {
      return ROOT_MARGINS.MOBILE;
    } else if (width <= BREAKPOINTS.TABLET) {
      return ROOT_MARGINS.TABLET;
    }
    return ROOT_MARGINS.DESKTOP;
  }, []);

  // Мемоизированный обработчик IntersectionObserver
  const handleIntersection = useCallback((entries) => {
    entries.forEach((entry) => {
      setIsVisible(entry.isIntersecting);
    });
  }, []);

  // Функция создания/обновления observer
  const createOrUpdateObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const newObserver = new IntersectionObserver(handleIntersection, {
      threshold: 0.2,
      rootMargin: getRootMargin()
    });

    observerRef.current = newObserver;

    if (sectionRef.current) {
      newObserver.observe(sectionRef.current);
    }
  }, [handleIntersection, getRootMargin]);

  // Мемоизированный обработчик ресайза с debounce
  const handleResize = useCallback(() => {
    if (resizeTimerRef.current) {
      clearTimeout(resizeTimerRef.current);
    }

    resizeTimerRef.current = setTimeout(() => {
      createOrUpdateObserver();
    }, 150); // Увеличен debounce для производительности
  }, [createOrUpdateObserver]);

  // Основные эффекты
  useEffect(() => {
    createOrUpdateObserver();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [createOrUpdateObserver, handleResize]);

  // Мемоизированный обработчик клика/нажатия клавиши
  const handleButtonClick = useCallback(() => {
    window.location.href = "#/real-estate";
  }, []);

  const handleButtonKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = "#/real-estate";
    }
  }, []);

  // Мемоизированный рендер элементов
  const titleLines = [
    { text: "Complex work for a real", delay: 0 },
    { text: "estate developers in Dubai", delay: 0.2 }
  ];

  return (
    <section className="home-section" ref={sectionRef}>
      <div className="home-section-background"></div>
      
      <div className={`home-section-content ${isIOS.current ? 'ios-device' : ''}`}>
        <div className={`home-logo ${isVisible ? 'animate-in' : 'animate-out'}`}>
          <img 
            src={logo} 
            alt="Home Logo" 
            loading="lazy"
            width="150"
            height="50"
          />
        </div>
        
        <div className="home-text">
          <h1 className="home-title">
            {titleLines.map((line, index) => (
              <div 
                key={index}
                className={`title-line ${isVisible ? 'animate-in' : 'animate-out'}`}
                style={{ 
                  animationDelay: isVisible ? `${line.delay}s` : '0s' 
                }}
              >
                <span>{line.text}</span>
              </div>
            ))}
          </h1>
        
          <div className="home-button-container">
            <div 
              className={`read-more-button ${isVisible ? 'animate-in' : 'animate-out'}`}
              onClick={handleButtonClick}
              onKeyDown={handleButtonKeyDown}
              role="button"
              tabIndex={0}
              aria-label="Read more about real estate projects"
            >
              <span className="button-text">READ MORE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Используем React.memo для предотвращения лишних перерисовок
export default React.memo(HomeSection);