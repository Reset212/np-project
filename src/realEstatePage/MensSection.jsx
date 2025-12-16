import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MensSection.css";
import mensPhoto from "../image/mens.png";

const MensSection = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFixed, setIsFixed] = useState(false);
  const sectionRef = useRef(null);
  const photoRef = useRef(null);
  const textRef = useRef(null);
  const navigate = useNavigate();

  const goToRealEstate = () => {
    navigate("/real-estate");
  };

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 1024);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    return () => {
      window.removeEventListener("resize", checkDesktop);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleScroll = () => {
      if (!sectionRef.current || !photoRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Когда верхняя граница секции достигает верха экрана
      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        setIsFixed(true);
        
        // Рассчитываем прогресс от 0 до 2
        const sectionHeight = section.offsetHeight;
        const visibleHeight = windowHeight;
        
        // Сколько пикселей секции уже проскроллено
        const scrolled = Math.abs(rect.top);
        const maxScroll = sectionHeight - visibleHeight;
        
        // Прогресс от 0 до 2 (удваиваем обычный прогресс)
        let progress = Math.min(2, Math.max(0, (scrolled / maxScroll) * 2));
        
        setScrollProgress(progress);
        
        // Применяем анимацию
        if (photoRef.current && textRef.current) {
          const photo = photoRef.current;
          const text = textRef.current;
          
          // ПАРАМЕТРЫ ДЛЯ ФОТО
          const photoStartWidth = -50; // Начальная ширина
          const photoEndWidth = 100;   // Конечная ширина
          
          // ПАРАМЕТРЫ ДЛЯ ТЕКСТА
          const textStartX = 0;        // Начальная позиция
          const textEndX = -340;       // Конечная позиция
          
          // РАСПРЕДЕЛЕНИЕ АНИМАЦИЙ:
          // 0-1: Фото расширяется от -50% до 100%
          // 1-2: Фото поднимается вверх
          
          let photoWidth, photoTranslateY, textTranslateX;
          
          if (progress < 1) {
            // Фаза 1: фото расширяется (0-100% прогресса)
            const expandProgress = progress; // от 0 до 1
            photoWidth = photoStartWidth + (photoEndWidth - photoStartWidth) * expandProgress;
            photoTranslateY = 0;
            // Текст плавно уезжает влево
            textTranslateX = textStartX + (textEndX - textStartX) * expandProgress;
          } else {
            // Фаза 2: фото поднимается (100-200% прогресса)
            photoWidth = photoEndWidth; // Фиксируем на 100%
            
            const liftProgress = progress - 1; // от 0 до 1
            // Поднимаем фото вверх (например, на 100vh)
            photoTranslateY = -liftProgress * 100;
            
            // Текст может оставаться на месте или двигаться дальше
            textTranslateX = textEndX; // или можно добавить дополнительное движение
          }
          
          // Применяем стили
          const photoTranslateX = 0; // Горизонтальное смещение фото
          
          photo.style.transform = `translateX(${photoTranslateX}vw) translateY(${photoTranslateY}vh)`;
          photo.style.width = `${photoWidth}%`;
          photo.style.right = "0";
          photo.style.left = "auto";
          
          text.style.transform = `translateX(${textTranslateX}vh)`;
          
          // ДОПОЛНИТЕЛЬНО: можно добавить эффекты прозрачности или масштабирования
          if (progress > 1.5) {
            // На последних 25% анимации можно добавить fade out или другие эффекты
            const fadeProgress = (progress - 1.5) / 0.5; // 0-1
            // photo.style.opacity = (1 - fadeProgress * 0.5).toString(); // Пример fade
          }
        }
      } else {
        setIsFixed(false);
        // Сбрасываем анимацию, если вышли из зоны
        if (rect.top > 0) {
          // Мы выше секции
          setScrollProgress(0);
          if (photoRef.current) {
            photoRef.current.style.transform = "translateX(0vw) translateY(0vh)";
            photoRef.current.style.width = "-50%";
          }
          if (textRef.current) {
            textRef.current.style.transform = "translateX(0vh)";
          }
        } else if (rect.bottom < windowHeight) {
          // Мы ниже секции
          setScrollProgress(2);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Инициализация
    if (photoRef.current) {
      photoRef.current.style.transform = "translateX(0vw) translateY(0vh)";
      photoRef.current.style.width = "-50%";
      photoRef.current.style.right = "0";
      photoRef.current.style.left = "auto";
    }
    
    if (textRef.current) {
      textRef.current.style.transform = "translateX(0vh)";
    }
    
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDesktop]);

  return (
    <>
      <section 
        className={`mens-section ${isDesktop ? 'desktop' : 'mobile'}`}
        id="mens-section"
        ref={sectionRef}
        data-progress={scrollProgress.toFixed(2)}
        data-fixed={isFixed}
      >
        {/* Для десктопа - анимация */}
        {isDesktop ? (
          <div className="desktop-animation-wrapper">
            {/* Фон для скролла */}
            <div className="animation-background"></div>
            
            {/* Фиксированный контейнер */}
            <div className={`animation-container ${isFixed ? 'fixed' : ''}`}>
              {/* Фото - начинается с шириной -50% */}
              <div 
                className="photo-container"
                ref={photoRef}
                style={{ 
                  width: '0%',
                  right: '0', 
                  left: 'auto',
                  transform: 'translateX(0vw) translateY(0vh)'
                }}
              >
                <img 
                  src={mensPhoto} 
                  alt="Movie Park team" 
                  className="animation-photo"
                />
              </div>
              
              {/* Текст слева от фото */}
              <div 
                className="text-container-left"
                ref={textRef}
                style={{ transform: 'translateX(0vh)' }}
              >
                <div className="text-content-left">
                  <div className="text-date-left">
                    <p className="date-text-left">
                      <span className="highlight-left">Founded in 2013</span> by Fedor Balvanovich and Stanislav Kasatov, Movie Park aims to make a lasting mark in the industry by bringing bold ideas to life and turning them into powerful visual stories that inspire and remain relevant for a long time.
                    </p>
                  </div>
                  
                  <div className="text-main-left">
                    <p className="main-text-left">
                      <span className="reveal-left">Movie park</span> is an international production studio creating unique visual solutions across video, marketing, and event industries. Our portfolio spans commercial and creative projects for brands, private clients, and major companies.
                    </p>
                  </div>
                  
                  <div className="text-button-left">
                    <button className="action-button-left" onClick={goToRealEstate}>
                      <span className="btn-text-left">READ MORE</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Контент под анимацией */}
            <div className="content-after-animation">
              {/* Пустое пространство для скролла анимации - теперь нужно больше места */}
              <div className="animation-space" style={{ height: '400vh' }}></div>
            </div>
          </div>
        ) : (
          /* Оригинальная версия для планшетов/телефонов */
          <div className="original-content">
            <div className="mens-photo-container">
              <img src={mensPhoto} alt="Movie Park team" className="mens-photo" />
            </div>

            <div className="mens-text-container">
              <p className="mens-text-bold">
                <span className="text-reveal">Movie park</span> is an international production studio creating unique visual solutions across video, marketing, and event industries. Our portfolio spans commercial and creative projects for brands, private clients, and major companies.
              </p>
            </div>
            <div className="mens-date-container">
              <p className="mens-date">
                <span className="text-light">Founded in 2013</span> by Fedor Balvanovich and Stanislav Kasatov, Movie Park aims to make a lasting mark in the industry by bringing bold ideas to life and turning them into powerful visual stories that inspire and remain relevant for a long time.
              </p>
            </div>
            <div className="mens-secondary-container">
              <button className="mens-button" onClick={goToRealEstate}>
                <span className="button-text">READ MORE</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default MensSection;