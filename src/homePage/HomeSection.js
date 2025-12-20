// Обновленный компонент HomeSection.js
import React, { useState, useEffect, useRef } from "react";
import "./HomeSection.css";
import logo from "../image/logo.png";

const HomeSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const sectionRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Определяем iOS устройство
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      setIsIOS(isIOSDevice || (isSafari && !window.MSStream));
    };

    checkIOS();

    // Функция для создания Intersection Observer
    const createObserver = () => {
      // Разные настройки для iOS и других устройств
      const threshold = isIOS ? 0.1 : 0.2;
      const rootMargin = isIOS ? "100px" : "50px";

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // На iOS используем requestAnimationFrame для плавности
            if (isIOS) {
              requestAnimationFrame(() => {
                setIsVisible(entry.isIntersecting);
              });
            } else {
              setIsVisible(entry.isIntersecting);
            }
          });
        },
        {
          threshold,
          rootMargin,
          root: null
        }
      );

      observerRef.current = observer;

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }

      return observer;
    };

    const observer = createObserver();

    // Обработчик для изменения ориентации на iOS
    const handleOrientationChange = () => {
      if (isIOS) {
        // Пересоздаем observer при смене ориентации на iOS
        setTimeout(() => {
          createObserver();
        }, 300);
      }
    };

    // Обработчик изменения размера с debounce
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        createObserver();
      }, 150);
    };

    // iOS-specific обработчики
    if (isIOS) {
      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleResize);
      
      // Предотвращаем bounce-scroll на iOS
      document.body.style.overscrollBehaviorY = 'none';
    }

    window.addEventListener('resize', handleResize);

    return () => {
      if (isIOS) {
        window.removeEventListener('orientationchange', handleOrientationChange);
        document.body.style.overscrollBehaviorY = 'auto';
      }
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isIOS]);

  // Обработчик клика для iOS с улучшенной обратной связью
  const handleButtonClick = (e) => {
    if (isIOS) {
      // Добавляем визуальную обратную связь для iOS
      const button = e.currentTarget;
      button.style.transform = 'scale(0.95)';
      button.style.transition = 'transform 0.1s ease';
      
      setTimeout(() => {
        button.style.transform = '';
        window.location.href = "#/real-estate";
      }, 100);
    } else {
      window.location.href = "#/real-estate";
    }
  };

  return (
    <section 
      className="home-section" 
      ref={sectionRef}
      // iOS-specific атрибуты
      {...(isIOS && {
        'data-ios': 'true',
        style: { 
          WebkitOverflowScrolling: 'touch',
          overflowX: 'hidden'
        }
      })}
    >
      <div className="home-section-background"></div>
      
      <div className="home-section-content">
        <div className={`home-logo ${isVisible ? 'animate-in' : 'animate-out'}`}>
          <img 
            src={logo} 
            alt="Home Logo" 
            loading="lazy"
            decoding="async"
          />
        </div>
        
        <div className="home-text">
          <h1 className="home-title">
            <div className={`title-line ${isVisible ? 'animate-in' : 'animate-out'}`}>
              <span>Complex work for a real</span>
            </div>
            
            <div className={`title-line ${isVisible ? 'animate-in' : 'animate-out'}`}>
              <span>estate developers in Dubai</span>
            </div>
          </h1>
        
          <div className="home-button-container">
            <button 
              className={`read-more-button ${isVisible ? 'animate-in' : 'animate-out'}`}
              onClick={handleButtonClick}
              aria-label="Read more about real estate developers in Dubai"
              // iOS-specific атрибуты
              {...(isIOS && {
                'data-ios-button': 'true',
                onTouchStart: (e) => {
                  // Улучшенная обратная связь при касании на iOS
                  e.currentTarget.style.opacity = '0.8';
                },
                onTouchEnd: (e) => {
                  e.currentTarget.style.opacity = '';
                }
              })}
            >
              <span className="button-text">READ MORE</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;