// ScrollTextAnimation2.jsx
import React, { useState, useEffect, useRef } from "react";
import "./ScrollTextAnimation.css";

const ScrollTextAnimation2 = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 860);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const checkVisibility = () => {
      if (!containerRef.current || hasAnimated) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Упрощенная проверка видимости для мобильных
      if (isMobile) {
        // Для мобильных - когда элемент появляется в области видимости
        if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      } else {
        // Для десктопа - оригинальная логика
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        const elementHeight = rect.height;
        const visibilityRatio = Math.max(0, Math.min(1, visibleHeight / elementHeight));
        
        if (visibilityRatio >= 0.7) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      }
    };

    const handleScroll = () => {
      requestAnimationFrame(checkVisibility);
    };

    // Проверяем сразу при загрузке
    const timer = setTimeout(checkVisibility, 300);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [hasAnimated, isMobile]);

  const firstLineWords = "Full brand packaging for real estate developers in Dubai combines strategy".split(" ");
  const secondLineWords = "marketing, events, and celebrity-driven launches to make projects visible, known, and sellable.".split(" ");

  return (
    <div className="scroll-text-container-2" ref={containerRef}>
      <div className="text-block-2">
        <div className={`text-content-2 ${isVisible ? 'visible-2' : ''}`}>
          {/* Первая строка */}
          <div className="text-line-2 first-line-2">
            {firstLineWords.map((word, index) => (
              <span
                key={`first-${index}`}
                className="text-word-2"
                data-word-index={index}
                data-animate={isVisible ? 'true' : 'false'}
              >
                {word}
                {index < firstLineWords.length - 1 && <span className="space-2"> </span>}
              </span>
            ))}
          </div>
          
          {/* Вторая строка с отступом */}
          <div className="text-line-2 second-line-2">
            {secondLineWords.map((word, index) => (
              <span
                key={`second-${index}`}
                className="text-word-2"
                data-word-index={index + firstLineWords.length}
                data-animate={isVisible ? 'true' : 'false'}
              >
                {word}
                {index < secondLineWords.length - 1 && <span className="space-2"> </span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollTextAnimation2;