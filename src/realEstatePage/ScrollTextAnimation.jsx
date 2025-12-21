// ScrollTextAnimation2.jsx
import React, { useState, useEffect, useRef } from "react";
import "./ScrollTextAnimation.css";

const ScrollTextAnimation2 = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const checkVisibility = () => {
      if (!containerRef.current || hasAnimated) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Вычисляем, какая часть блока видна
      const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const elementHeight = rect.height;
      
      // Процент видимости блока (от 0 до 1)
      const visibilityRatio = Math.max(0, Math.min(1, visibleHeight / elementHeight));
      
      // Запускаем анимацию, когда видно примерно 70% блока
      if (visibilityRatio >= 0.7) {
        setIsVisible(true);
        setHasAnimated(true);
      }
    };

    const handleScroll = () => {
      requestAnimationFrame(checkVisibility);
    };

    // Проверяем сразу при загрузке
    setTimeout(checkVisibility, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [hasAnimated]);

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
                style={{ 
                  '--word-index': index,
                }}
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
                style={{ 
                  '--word-index': index + firstLineWords.length,
                }}
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