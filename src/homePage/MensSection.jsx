import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MensSection.css";
import mensPhoto from "../image/mens.png";

const MensSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("down");
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const lastScrollY = useRef(0);
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

  // Отслеживание направления скролла и прогресса
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection("up");
      }
      
      lastScrollY.current = currentScrollY;
      
      // Рассчитываем прогресс скролла внутри секции
      if (sectionRef.current) {
        const sectionTop = sectionRef.current.offsetTop;
        const sectionHeight = sectionRef.current.offsetHeight;
        const viewportHeight = window.innerHeight;
        const scrollPosition = currentScrollY + viewportHeight;
        
        const progress = Math.max(0, Math.min(1, 
          (scrollPosition - sectionTop) / (sectionHeight * 0.7)
        ));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Инициализация
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
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
    <section 
      className="mens-section" 
      id="mens-section"
      ref={sectionRef}
      data-scroll-direction={scrollDirection}
      data-scroll-progress={scrollProgress}
    >
      <div className="mens-sticky">
        <div 
          className={`mens-content ${isVisible ? 'visible' : 'hidden'}`}
          ref={contentRef}
          style={{
            '--scroll-progress': scrollProgress,
            '--scroll-direction': scrollDirection === 'down' ? 1 : -1
          }}
        >
          {/* Фоновые элементы для динамики */}
          <div className="dynamic-background">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="floating-element floating-1"></div>
            <div className="floating-element floating-2"></div>
          </div>

          {/* Дата */}
          <div className="mens-date-container">
            <p className="mens-date">
              <span className="text-highlight">Founded in 2013</span> by Fedor Balvanovich and Stanislav Kasatov, Movie Park aims to make a lasting mark in the industry by bringing bold ideas to life and turning them into powerful visual stories that inspire and remain relevant for a long time.
            </p>
          </div>

          {/* Основной текст */}
          <div className="mens-text-container">
            <p className="mens-text-bold">
              <span className="text-reveal">Movie park</span> is an international production studio creating unique visual solutions across video, marketing, and event industries. Our portfolio spans commercial and creative projects for brands, private clients, and major companies.
            </p>
          </div>

          {/* Кнопка */}
          <div className="mens-secondary-container">
            <button className="mens-button" onClick={goToRealEstate}>
              <span className="button-text">READ MORE</span>
              <span className="button-hover-effect"></span>
            </button>
          </div>

          {/* Фото */}
          <div className="mens-photo-container">
            <img src={mensPhoto} alt="Movie Park team" className="mens-photo" />
            <div className="photo-overlay"></div>
            <div className="photo-frame"></div>
          </div>

          {/* Дополнительные декоративные элементы */}
          <div className="decorative-line line-top"></div>
          <div className="decorative-line line-bottom"></div>
        </div>
      </div>
    </section>
  );
};

export default MensSection;