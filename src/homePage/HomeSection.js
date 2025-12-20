// Обновленный компонент HomeSection.js с улучшенной детекцией iOS
import React, { useState, useEffect, useRef } from "react";
import "./HomeSection.css";
import logo from "../image/logo.png";

const HomeSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const sectionRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Улучшенная детекция iOS устройств
    const checkIOS = () => {
      const platform = window.navigator.platform;
      const userAgent = window.navigator.userAgent.toLowerCase();
      
      // Проверяем различные признаки iOS
      const isIPad = /ipad/.test(userAgent);
      const isIPhone = /iphone/.test(userAgent);
      const isIPod = /ipod/.test(userAgent);
      const isIOSDevice = isIPad || isIPhone || isIPod;
      
      // Проверяем Safari (только на iOS)
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      // Проверяем платформу
      const isAppleDevice = /(Mac|iPhone|iPod|iPad)/i.test(platform);
      
      // Если это iOS устройство или Safari на Apple устройстве
      const detectedIOS = isIOSDevice || (isSafari && isAppleDevice && !window.MSStream);
      
      console.log('iOS detection:', {
        platform,
        userAgent,
        isIOSDevice,
        isSafari,
        isAppleDevice,
        detectedIOS
      });
      
      setIsIOS(detectedIOS);
      
      // Добавляем класс к body для CSS-детекции
      if (detectedIOS) {
        document.body.classList.add('ios-device');
      } else {
        document.body.classList.add('non-ios-device');
      }
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

    // Добавляем класс к section для стилизации
    if (sectionRef.current) {
      if (isIOS) {
        sectionRef.current.classList.add('ios-platform');
        sectionRef.current.classList.remove('windows-platform');
      } else {
        sectionRef.current.classList.add('windows-platform');
        sectionRef.current.classList.remove('ios-platform');
      }
    }

    const handleOrientationChange = () => {
      if (isIOS) {
        setTimeout(() => {
          createObserver();
        }, 300);
      }
    };

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        createObserver();
        // Перепроверяем iOS при ресайзе (может измениться user agent в эмуляторе)
        checkIOS();
      }, 150);
    };

    if (isIOS) {
      window.addEventListener('orientationchange', handleOrientationChange);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      if (isIOS) {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Убираем классы с body
      document.body.classList.remove('ios-device', 'non-ios-device');
    };
  }, [isIOS]);

  const handleButtonClick = (e) => {
    if (isIOS) {
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
      className={`home-section ${isIOS ? 'ios-platform' : 'windows-platform'}`} 
      ref={sectionRef}
      data-platform={isIOS ? 'ios' : 'windows'}
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
              data-platform={isIOS ? 'ios' : 'windows'}
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