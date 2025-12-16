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
      
      // Создаем задержку в середине анимации (от 45% до 55%)
      const holdStart = 0.45; // Начинаем задерживать с 45% прогресса
      const holdEnd = 0.55;   // Заканчиваем задержку на 55% прогресса
      
      let smoothProgress;
      if (normalizedProgress < holdStart) {
        // Первая часть анимации до задержки - плавное ускорение
        const t = normalizedProgress / holdStart;
        // Кубическое easing для большей плавности
        smoothProgress = t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
        smoothProgress *= holdStart;
      } else if (normalizedProgress > holdEnd) {
        // Третья часть анимации после задержки - плавное замедление
        const t = (normalizedProgress - holdEnd) / (1 - holdEnd);
        // Кубическое easing для большей плавности
        smoothProgress = t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
        smoothProgress = holdEnd + smoothProgress * (1 - holdEnd);
      } else {
        // Средняя часть - СИЛЬНАЯ ЗАДЕРЖКА вокруг 50%
        // Делаем очень медленное движение в зоне задержки
        const holdCenter = 0.5;
        const distanceFromCenter = Math.abs(normalizedProgress - holdCenter);
        
        if (distanceFromCenter < 0.02) {
          // В самом центре (48%-52%) - почти полная остановка
          smoothProgress = holdCenter;
        } else {
          // Ближе к краям зоны задержки - медленное движение
          const direction = normalizedProgress > holdCenter ? 1 : -1;
          const t = distanceFromCenter / 0.05; // 0.05 = половина зоны задержки
          // Медленный квадратичный easing
          const slowFactor = 0.2; // Замедляем в 5 раз
          smoothProgress = holdCenter + direction * (t * t * slowFactor * 0.05);
        }
      }

      // Анимация ширины фото - больше промежуточных точек
      const minPhotoWidth = 20;
      const step1Width = 30;   // Первая промежуточная точка
      const step2Width = 40;   // Вторая промежуточная точка (центр)
      const step3Width = 50;   // Третья промежуточная точка
      const step4Width = 50;   // Четвертая промежуточная точка
      const maxPhotoWidth = 50;
      
      let photoWidth;
      
      // Разбиваем анимацию на 5 сегментов для большей плавности
      if (smoothProgress < 0.2) {
        // 0% - 20%: от min до step1
        const t = smoothProgress / 0.2;
        photoWidth = minPhotoWidth + t * (step1Width - minPhotoWidth);
      } else if (smoothProgress < 0.4) {
        // 20% - 40%: от step1 до step2
        const t = (smoothProgress - 0.2) / 0.2;
        photoWidth = step1Width + t * (step2Width - step1Width);
      } else if (smoothProgress < 0.6) {
        // 40% - 60%: от step2 до step3 (зона задержки)
        const t = (smoothProgress - 0.4) / 0.2;
        // В зоне задержки делаем более плавное изменение
        const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        photoWidth = step2Width + easedT * (step3Width - step2Width);
      } else if (smoothProgress < 0.8) {
        // 60% - 80%: от step3 до step4
        const t = (smoothProgress - 0.6) / 0.2;
        photoWidth = step3Width + t * (step4Width - step3Width);
      } else {
        // 80% - 100%: от step4 до max
        const t = (smoothProgress - 0.8) / 0.2;
        photoWidth = step4Width + t * (maxPhotoWidth - step4Width);
      }
      
      // Гарантируем, что ширина в пределах границ
      photoWidth = Math.max(minPhotoWidth, Math.min(maxPhotoWidth, photoWidth));
      
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
        mainTextOffset = 187;
        dateTextOffset = 187;
        buttonOffset = 147;
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

          {/* Кнопка - выровнена по левому краю основного текста */}
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