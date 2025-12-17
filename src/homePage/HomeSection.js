import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./HomeSection.css";
import logo from "../image/logo.png";

const HomeSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "50px"
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="home-section" ref={sectionRef}>
      <div className="home-section-background">
        {/* Фоновое изображение будет через CSS */}
      </div>
      
      <div className="home-section-content">
        <div className={`home-logo ${isVisible ? 'animate-in' : 'animate-out'}`}>
          <img src={logo} alt="Home Logo" />
        </div>
        
        <div className="home-text">
          <h1 className="home-title">
            {/* Первая строка: Complex work for a real */}
            <div className={`title-line ${isVisible ? 'animate-in' : 'animate-out'}`}>
              <span>Complex work for a real</span>
            </div>
            
            {/* Вторая строка: estate developers in Dubai */}
            <div className={`title-line ${isVisible ? 'animate-in' : 'animate-out'}`}>
              <span>estate developers in Dubai</span>
            </div>
          </h1>
        
          {/* Заменяем Link на div для кнопки */}
          <div className="home-button-container">
            <div 
              className={`read-more-button ${isVisible ? 'animate-in' : 'animate-out'}`}
              onClick={() => window.location.href = "/real-estate"}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  window.location.href = "/real-estate";
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