import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MensSection.css";
import mensPhoto from "../image/mens.png";

const MensSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  const goToRealEstate = () => {
    navigate("/real-estate");
  };

  useEffect(() => {
    // Проверяем, является ли устройство мобильным
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768); // 768px - точка перехода на мобильную версию
    };

    // Проверяем при монтировании
    checkIfMobile();

    // Слушаем изменения размера окна
    window.addEventListener("resize", checkIfMobile);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.3,
        rootMargin: "50px"
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      window.removeEventListener("resize", checkIfMobile);
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Текст для даты в зависимости от устройства
  const dateText = isMobile 
    ? "Founded in 2013 by Fedor Balvanovich and Stanislav Kasatov, Movie park is an international production studio that creates unique visual solutions across video, marketing, and event industries."
    : "Founded in 2013 by Fedor Balvanovich and Stanislav Kasatov, Movie Park aims to make a lasting mark in the industry by bringing bold ideas to life and turning them into powerful visual stories that inspire and remain relevant for a long time.";

  return (
    <section 
      className="mens-section"
      id="mens-section"
      ref={sectionRef}
    >
      <div 
        className={`mens-content ${isVisible ? 'visible' : ''}`}
        ref={contentRef}
      >
        {/* Левая часть - текст (50%) */}
        <div className="mens-text-part">
          <div className="text-content">
            {/* Основной текст - скрывается на мобильных */}
            <div className="text-main">
              <p className="main-text">
                Movie park is an international production studio creating unique visual solutions across video, marketing, and event industries. Our portfolio spans commercial and creative projects for brands, private clients, and major companies.
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
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MensSection;