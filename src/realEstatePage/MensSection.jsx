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

  // Функция для перехода на real-estate страницу
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
    // На мобильных устройствах не запускаем анимацию скролла
    if (isMobile) return;

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

      const sectionCenter = rect.top + rect.height / 2;
      const windowCenter = windowHeight / 2;
      let progress = (windowCenter - sectionCenter) / (windowHeight / 2);
      progress = Math.max(-1, Math.min(1, progress));

      const normalizedProgress = (progress + 1) / 2;
      const smoothProgress = normalizedProgress < 0.5
        ? 2 * normalizedProgress * normalizedProgress
        : 1 - Math.pow(-2 * normalizedProgress + 2, 2) / 2;

      // Анимация ширины фото
      const minPhotoWidth = 30;
      const centerPhotoWidth = 50;
      const maxPhotoWidth = 80;
      let photoWidth;
      if (smoothProgress < 0.5) {
        photoWidth = minPhotoWidth + (smoothProgress * 2 * (centerPhotoWidth - minPhotoWidth));
      } else {
        photoWidth = centerPhotoWidth + ((smoothProgress - 0.5) * 2 * (maxPhotoWidth - centerPhotoWidth));
      }
      
      photoContainerRef.current.style.width = `${photoWidth}%`;

      // Определяем отступы в зависимости от ширины экрана
      let mainTextOffset, dateTextOffset, buttonOffset;
      
      if (windowWidth <= 1024) {
        // Для планшетов
        mainTextOffset = 40;
        dateTextOffset = 40;
        buttonOffset = 20;
      } else if (windowWidth <= 1440) {
        // Для 1440px
        mainTextOffset = 40;
        dateTextOffset = 40;
        buttonOffset = 20;
      } else {
        // Для широких экранов
        mainTextOffset = 187; // Основной текст: 187px от фото
        dateTextOffset = 187; // Второй текст: 187px от фото
        buttonOffset = 147;   // Кнопка: 147px от фото
      }

      // Позиционирование текста относительно фото
      const mainTextRightPosition = `calc(${photoWidth}% + ${mainTextOffset}px)`;
      const dateTextRightPosition = `calc(${photoWidth}% + ${dateTextOffset}px)`;
      const buttonRightPosition = `calc(${photoWidth}% + ${buttonOffset}px)`;
      
      dateTextRef.current.style.right = dateTextRightPosition;
      textContainerRef.current.style.right = mainTextRightPosition;
      secondaryContainerRef.current.style.right = buttonRightPosition;
    };

    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isMobile]);

  // ОБНОВЛЕНО: Добавлен id для навигации
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
            Movie park is an international production studio creating unique visual solutions across video, marketing, and event industries. Our portfolio spans commercial and creative projects for brands, private clients, and major companies.
            </p>
          </div>

          {/* Кнопка - выровнена по левому краю основного текста */}
          {/* ОБНОВЛЕНО: Кнопка теперь ведет на /real-estate */}
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