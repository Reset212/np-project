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
    ? "Founded in 2013 by Fedor Balvanovich and Stanislav Kasatov, Movie Park is a creative studio specializing in comprehensive marketing, branding and visual production for Dubai developers."
    : "Since 2013, the founders Fedor Balvanovich and Stanislav Kasatov have been running Movie Park, creating bold and enduring stories for the industry.";

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
                Movie Park is a creative studio specializing in comprehensive marketing, branding and visual production for Dubai developers. We create hype around projects that generate desire, increase recognition, and lead to sales — all thanks to striking visual solutions that stand out on the global stage.
              </p>
            </div>
            
            {/* Текст даты - изменяется в зависимости от устройства */}
            <div className="text-date">
              <p className="date-text">
                {dateText}
              </p>
            </div>
            
            <div className="text-button">
              {/* <button className="action-button" onClick={goToRealEstate}>
                <span className="btn-text">READ MORE</span>
              </button> */}
            </div>
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