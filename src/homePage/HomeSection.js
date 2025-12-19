import React, { useState, useEffect, useRef } from "react";
import "./HomeSection.css";
import logo from "../image/logo.png";

const HomeSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Функция для создания нового observer
    const createObserver = () => {
      // Определяем rootMargin в зависимости от размера экрана
      let rootMargin;
      if (window.innerWidth <= 390) { // 390px - мобильные
        rootMargin = "20px";
      } else if (window.innerWidth <= 768) { // 768px - планшеты
        rootMargin = "30px";
      } else {
        rootMargin = "50px";
      }

      // Если уже есть observer, отключаем его
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Создаем новый observer
      const newObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsVisible(entry.isIntersecting);
          });
        },
        {
          threshold: 0.2,
          rootMargin: rootMargin
        }
      );

      // Сохраняем ссылку
      observerRef.current = newObserver;

      // Начинаем наблюдение
      if (sectionRef.current) {
        newObserver.observe(sectionRef.current);
      }

      return newObserver;
    };

    // Создаем первый observer
    const observer = createObserver();

    // Обработчик изменения размера окна
    const handleResize = () => {
      createObserver();
    };

    // Добавляем обработчик с debounce для производительности
    let resizeTimer;
    const debouncedHandleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        handleResize();
      }, 100);
    };

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      // Убираем обработчик
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(resizeTimer);
      
      // Отключаем observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []); // Пустой массив зависимостей - эффект выполняется один раз

  return (
    <section className="home-section" ref={sectionRef}>
      <div className="home-section-background"></div>
      
      <div className="home-section-content">
        <div className={`home-logo ${isVisible ? 'animate-in' : 'animate-out'}`}>
          <img src={logo} alt="Home Logo" />
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
            <div 
              className={`read-more-button ${isVisible ? 'animate-in' : 'animate-out'}`}
              onClick={() => window.location.href = "#/real-estate"}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  window.location.href = "#/real-estate";
                }
              }}
            >
              <span className="button-text">READ MORE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;