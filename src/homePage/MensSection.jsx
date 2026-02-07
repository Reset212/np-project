import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./MensSection.css";
import mensPhoto from "../image/mens.png";

// Константы вынесены для производительности
const MOBILE_BREAKPOINT = 768;
const OBSERVER_OPTIONS = {
  threshold: 0.3,
  rootMargin: "50px"
};

// Тексты вынесены из компонента
const TEXTS = {
  MOBILE: "Founded in 2013 by Fedor Balvanovich and Stanislav Kasatov, Movie park is an international production studio that creates unique visual solutions across video, marketing, and event industries.",
  DESKTOP: "Founded in 2013 by Fedor Balvanovich and Stanislav Kasatov, Movie Park aims to make a lasting mark in the industry by bringing bold ideas to life and turning them into powerful visual stories that inspire and remain relevant for a long time.",
  MAIN: "Movie park is an international production studio creating unique visual solutions across video, marketing, and event industries. Our portfolio spans commercial and creative projects for brands, private clients, and major companies."
};

const MensSection = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);
  const observerRef = useRef(null);
  const navigate = useNavigate();
  const resizeTimerRef = useRef(null);

  // Мемоизированные обработчики
  const goToRealEstate = useCallback(() => {
    navigate("/real-estate");
  }, [navigate]);

  // Функция проверки мобильного устройства с debounce
  const checkIfMobile = useCallback(() => {
    const isMobileNow = window.innerWidth <= MOBILE_BREAKPOINT;
    if (isMobile !== isMobileNow) {
      setIsMobile(isMobileNow);
    }
  }, [isMobile]);

  // Мемоизированный обработчик IntersectionObserver
  const handleIntersection = useCallback((entries) => {
    entries.forEach((entry) => {
      setIsVisible(entry.isIntersecting);
    });
  }, []);

  // Оптимизированный эффект для ресайза
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      resizeTimerRef.current = setTimeout(checkIfMobile, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
    };
  }, [checkIfMobile]);

  // Инициализация при монтировании
  useEffect(() => {
    // Проверяем размер сразу
    checkIfMobile();

    // Создаем observer
    observerRef.current = new IntersectionObserver(
      handleIntersection,
      OBSERVER_OPTIONS
    );

    if (sectionRef.current) {
      observerRef.current.observe(sectionRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [checkIfMobile, handleIntersection]);

  // Мемоизированное значение даты текста
  const dateText = useMemo(() => 
    isMobile ? TEXTS.MOBILE : TEXTS.DESKTOP,
    [isMobile]
  );

  return (
    <section 
      className="mens-section"
      id="mens-section"
      ref={sectionRef}
    >
      <div 
        className={`mens-content ${isVisible ? 'visible' : ''}`}
      >
        {/* Левая часть - текст (50%) */}
        <div className="mens-text-part">
          <div className="text-content">
            {/* Основной текст - скрывается на мобильных */}
            <div className="text-main">
              <p className="main-text">
                {TEXTS.MAIN}
              </p>
            </div>
            
            {/* Текст даты - изменяется в зависимости от устройства */}
            <div className="text-date">
              <p className="date-text">
                {dateText}
              </p>
            </div>
            
            {/* <div className="text-button">
              <button className="action-button" onClick={goToRealEstate}>
                <span className="btn-text">READ MORE</span>
              </button>
            </div> */}
          </div>
        </div>

        {/* Правая часть - фото (50%) */}
        <div className="mens-photo-part">
          <div className="photo-wrapper">
            <img 
              src={mensPhoto} 
              alt="Movie Park team" 
              className="mens-photo"
              loading="lazy"
              width="800"
              height="600"
            />
          </div>
        </div>
      </div>
    </section>
  );
});

MensSection.displayName = "MensSection";

export default MensSection;