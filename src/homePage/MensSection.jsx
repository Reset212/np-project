import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MensSection.css";
import mensPhoto from "../image/mens.png";

const MensSection = () => {
  const sectionRef = useRef(null);
  const photoContainerRef = useRef(null);
  const dateTextRef = useRef(null);
  const textContainerRef = useRef(null);
  const secondaryContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const goToRealEstate = () => {
    navigate("/real-estate");
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;

    let animationFrameId;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (
        !sectionRef.current ||
        !photoContainerRef.current ||
        !dateTextRef.current ||
        !textContainerRef.current ||
        !secondaryContainerRef.current
      )
        return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;

      // Рассчитываем прогресс анимации
      let progress = 0;
      
      // Когда секция начинает появляться снизу
      if (rect.top < windowHeight && rect.top > -windowHeight) {
        // Прогресс от 0 до 1.5 для более длинной анимации
        progress = 1 - (rect.top / windowHeight);
      } else if (rect.top <= -windowHeight / 2) {
        // Секция уже проскроллена - завершаем анимацию
        progress = 1.5;
      } else if (rect.top >= windowHeight) {
        // Секция еще ниже
        progress = 0;
      }

      progress = Math.max(0, Math.min(1.5, progress));

      // Разные фазы анимации
      const photoExpandPhase = Math.min(1, progress); // Фаза увеличения фото (0-1)
      const textDisappearPhase = Math.max(0, Math.min(1, progress * 1.5)); // Фаза исчезновения текста
      const fullSizePhase = Math.max(0, progress - 1); // Фаза после полного расширения

      // Smooth кривые для плавности
      const smoothPhotoProgress = photoExpandPhase * photoExpandPhase * (3 - 2 * photoExpandPhase);
      const smoothTextProgress = textDisappearPhase * textDisappearPhase * (3 - 2 * textDisappearPhase);

      // АНИМАЦИЯ ФОТО: из маленького угла в полный размер
      const startWidth = 15; // Начальный размер в углу
      const endWidth = 100;  // Полный размер
      
      // Фото расширяется от угла
      const photoWidth = startWidth + (endWidth - startWidth) * smoothPhotoProgress;
      
      // Прозрачность фото
      const photoOpacity = 0.4 + 0.6 * smoothPhotoProgress;
      
      // Позиция фото: начинается в правом верхнем углу
      const startRight = 0;
      const endRight = 0; // Остается справа
      
      // Применяем стили к фото
      photoContainerRef.current.style.width = `${photoWidth}%`;
      photoContainerRef.current.style.opacity = photoOpacity.toString();
      photoContainerRef.current.style.right = `${startRight}px`;
      
      // АНИМАЦИЯ ТЕКСТОВ: плавное исчезновение
      // Текст начинает исчезать раньше, чем фото достигает полного размера
      const textOpacity = Math.max(0, 1 - smoothTextProgress * 1.5);
      const textTranslateX = smoothTextProgress * 100; // Сдвиг вправо при исчезновении
      
      // Определяем отступы для текста в зависимости от размера фото
      let mainTextOffset, dateTextOffset, buttonOffset;
      
      if (windowWidth <= 1024) {
        mainTextOffset = 200;
        dateTextOffset = 200;
        buttonOffset = 200;
      } else if (windowWidth <= 1440) {
        mainTextOffset = 40;
        dateTextOffset = 40;
        buttonOffset = 20;
      } else {
        mainTextOffset = 187;
        dateTextOffset = 187;
        buttonOffset = 147;
      }

      // Позиционирование текста с учетом сдвига при исчезновении
      const photoWidthPercent = Math.min(photoWidth, 50); // Ограничиваем влияние на позицию текста
      const mainTextRightPosition = `calc(${photoWidthPercent}% + ${mainTextOffset}px + ${textTranslateX}px)`;
      const dateTextRightPosition = `calc(${photoWidthPercent}% + ${dateTextOffset}px + ${textTranslateX}px)`;
      const buttonRightPosition = `calc(${photoWidthPercent}% + ${buttonOffset}px + ${textTranslateX}px)`;
      
      // Применяем стили к текстам
      dateTextRef.current.style.right = dateTextRightPosition;
      dateTextRef.current.style.opacity = textOpacity.toString();
      dateTextRef.current.style.transform = `translateX(${textTranslateX * 0.5}px)`;
      
      textContainerRef.current.style.right = mainTextRightPosition;
      textContainerRef.current.style.opacity = textOpacity.toString();
      textContainerRef.current.style.transform = `translateX(${textTranslateX * 0.5}px)`;
      
      secondaryContainerRef.current.style.right = buttonRightPosition;
      secondaryContainerRef.current.style.opacity = textOpacity.toString();
      secondaryContainerRef.current.style.transform = `translateX(${textTranslateX * 0.5}px)`;
      
      // Когда фото полностью развернулось, тексты скрыты
      if (photoExpandPhase >= 0.9 && textOpacity <= 0.1) {
        dateTextRef.current.style.visibility = "hidden";
        textContainerRef.current.style.visibility = "hidden";
        secondaryContainerRef.current.style.visibility = "hidden";
      } else {
        dateTextRef.current.style.visibility = "visible";
        textContainerRef.current.style.visibility = "visible";
        secondaryContainerRef.current.style.visibility = "visible";
      }

      // Управляем sticky поведением
      if (fullSizePhase > 0) {
        // После полного расширения фото, разрешаем скролл
        sectionRef.current.style.pointerEvents = "auto";
      } else {
        sectionRef.current.style.pointerEvents = "auto";
      }
    };

    const scrollHandler = () => {
      const currentScrollY = window.scrollY;
      
      // Используем requestAnimationFrame для плавности
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(() => {
        handleScroll();
        lastScrollY = currentScrollY;
      });
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("resize", handleScroll);
    
    // Инициализация
    const init = () => {
      if (photoContainerRef.current) {
        // Начальное состояние: маленький блок в правом верхнем углу
        photoContainerRef.current.style.width = "15%";
        photoContainerRef.current.style.opacity = "0.4";
        photoContainerRef.current.style.transform = "translateX(0)";
        photoContainerRef.current.style.right = "0";
        photoContainerRef.current.style.top = "0";
      }
      
      // Тексты видимы изначально
      if (dateTextRef.current && textContainerRef.current && secondaryContainerRef.current) {
        dateTextRef.current.style.opacity = "1";
        dateTextRef.current.style.visibility = "visible";
        dateTextRef.current.style.transform = "translateX(0)";
        
        textContainerRef.current.style.opacity = "1";
        textContainerRef.current.style.visibility = "visible";
        textContainerRef.current.style.transform = "translateX(0)";
        
        secondaryContainerRef.current.style.opacity = "1";
        secondaryContainerRef.current.style.visibility = "visible";
        secondaryContainerRef.current.style.transform = "translateX(0)";
      }
      
      handleScroll();
    };

    // Даем время на рендер
    setTimeout(init, 100);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("resize", handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMobile]);

  return (
    <section className="mens-section" id="mens-section" ref={sectionRef}>
      <div className="mens-sticky">
        <div className="mens-content">
          {/* Дата */}
          <div className="mens-date-container" ref={dateTextRef}>
            <p className="mens-date">
              Founded in 2013 by Fedor Balvanovich and Stanislav Kasatov, Movie Park aims to make a lasting mark in the industry by bringing bold ideas to life and turning them into powerful visual stories that inspire and remain relevant for a long time.
            </p>
          </div>

          {/* Основной текст */}
          <div className="mens-text-container" ref={textContainerRef}>
            <p className="mens-text-bold">
              Movie park is an international production studio creating unique visual solutions across video, marketing, and event industries. Our portfolio spans commercial and creative projects for brands, private <br /> clients, and major companies.
            </p>
          </div>

          {/* Кнопка */}
          <div className="mens-secondary-container" ref={secondaryContainerRef}>
            <button className="mens-button" onClick={goToRealEstate}>
              READ MORE
            </button>
          </div>

          {/* Фото */}
          <div className="mens-photo-container" ref={photoContainerRef}>
            <img src={mensPhoto} alt="Movie Park team" className="mens-photo" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MensSection;