import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import "./ProjectsSection.css";

// Вынесем константы и вспомогательные функции для производительности
const MOBILE_BREAKPOINT = 768;
const WORD_COUNT = 3;

// Мемоизированные easing-функции
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (start, end, factor) => start + (end - start) * factor;

// Конфигурация для мобильных слов
const MOBILE_WORD_ZONES = [
  { start: 0.00, end: 0.10 },
  { start: 0.10, end: 0.30 },
  { start: 0.30, end: 0.50 },
];

// НАСТРОЙКИ ДЛЯ НАЧАЛА АНИМАЦИИ
const ANIMATION_START_CONFIG = {
  PC: 0.40,    // Для ПК начинаем с 0.40
  MOBILE: 0.80 // Для телефонов начинаем с 0.80
};

const ProjectsSection = () => {
  const sectionRef = useRef(null);
  const wordsRef = useRef([]);
  const scrollProgressRef = useRef(0);
  const rafIdRef = useRef(null);
  
  // Объединим несколько refs для лучшей производительности
  const refs = useRef({
    isMounted: true,
    hasStarted: false,
    startScrollY: 0,
    sectionTop: 0,
    animationState: {
      word1: { progress: 0, targetProgress: 0 },
      word2: { progress: 0, targetProgress: 0 },
      word3: { progress: 0, targetProgress: 0 },
    }
  });

  // Объединим состояния для уменьшения ререндеров
  const [isMobile, setIsMobile] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  
  // Одно состояние для всех стилей слов
  const [wordStyles, setWordStyles] = useState(
    Array(WORD_COUNT).fill({
      opacity: 0,
      transform: "translateY(0px) scale(0.9)",
      color: "#000",
      visible: false
    })
  );

  // Мемоизированная функция проверки мобильного
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
  }, []);

  // Оптимизированный useEffect для проверки мобильного
  useEffect(() => {
    checkMobile();
    
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 200);
    };
    
    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [checkMobile]);

  // Мемоизированная функция для цвета на ПК
  const getSmoothColorTransition = useCallback((translateX, windowWidth) => {
    const grayZoneStart = -windowWidth * 0.3;
    const grayZoneEnd = -windowWidth * 0.1;
    const blackZoneStart = windowWidth * 0.2;
    const blackZoneEnd = windowWidth * 0.4;

    if (translateX > windowWidth * 0.4) {
      return "#888";
    }
    
    if (translateX < grayZoneEnd) {
      if (translateX <= grayZoneStart) {
        return "#888";
      } else {
        const progress = (translateX - grayZoneStart) / (grayZoneEnd - grayZoneStart);
        const easedProgress = easeInOutCubic(progress);
        const grayValue = Math.floor(136 * (1 - easedProgress));
        return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      }
    }
    
    if (translateX < blackZoneStart) {
      return "#000";
    }
    
    if (translateX <= blackZoneEnd) {
      const progress = (translateX - blackZoneStart) / (blackZoneEnd - blackZoneStart);
      const easedProgress = easeInOutCubic(progress);
      const grayValue = Math.floor(136 - 136 * easedProgress);
      return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
    }
    
    return "#888";
  }, []);

  // Мемоизированная функция для мобильной анимации
  const updateMobileAnimation = useCallback((progress) => {
    const newStyles = [];
    
    MOBILE_WORD_ZONES.forEach((zone, index) => {
      let wordProgress;
      let opacity = 0;
      let translateY = 0;
      let scale = 0.9;
      let color = "#000";
      
      if (progress >= zone.start && progress <= zone.end) {
        wordProgress = (progress - zone.start) / (zone.end - zone.start);
        
        const fadeInOutRange = 0.25;
        if (wordProgress < fadeInOutRange) {
          opacity = wordProgress / fadeInOutRange;
        } else if (wordProgress > 1 - fadeInOutRange) {
          opacity = (1 - wordProgress) / fadeInOutRange;
        } else {
          opacity = 1;
        }

        // Оптимизированное движение
        const movement = Math.sin(wordProgress * Math.PI);
        translateY = 5 * (wordProgress < 0.5 ? (1 - movement) : movement);

        const scaleRange = 0.15;
        if (wordProgress < scaleRange) {
          scale = 0.9 + (wordProgress / scaleRange) * 0.1;
        } else if (wordProgress > 1 - scaleRange) {
          scale = 1.0 - ((wordProgress - (1 - scaleRange)) / scaleRange) * 0.1;
        } else {
          scale = 1.0;
        }

        const colorRange = 0.3;
        if (wordProgress < colorRange) {
          const colorProgress = wordProgress / colorRange;
          const grayValue = Math.floor(136 - 136 * colorProgress);
          color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        } else if (wordProgress > 1 - colorRange) {
          const colorProgress = (wordProgress - (1 - colorRange)) / colorRange;
          const grayValue = Math.floor(136 * colorProgress);
          color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        } else {
          color = "#000";
        }
      } else {
        opacity = 0;
        color = "#888";
        if (progress < zone.start) {
          translateY = 10;
          scale = 0.9;
        } else if (progress > zone.end) {
          translateY = -10;
          scale = 0.9;
        }
      }

      newStyles.push({
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        color,
        visible: opacity > 0.1
      });
    });

    setWordStyles(newStyles);
  }, []);

  // Оптимизированная функция анимации для ПК
  const animateWordPC = useCallback((word, index, targetProgress) => {
    if (!word || isMobile || !animationStarted) return;

    const currentState = refs.current.animationState[`word${index + 1}`];
    currentState.progress = lerp(currentState.progress, targetProgress, 0.15);

    const windowWidth = window.innerWidth;
    const progress = currentState.progress;

    if (progress <= 0) {
      word.style.transform = `translateX(${windowWidth * 1.2}px) scale(0.9)`;
      word.style.opacity = "0";
      word.style.color = "#888";
    } else if (progress < 1) {
      const easedProgress = easeOutCubic(progress);
      const translateX = windowWidth * (1.2 - easedProgress * 2.4);

      const fadeRange = 0.15;
      let opacity;
      if (progress < fadeRange) {
        opacity = progress / fadeRange;
      } else if (progress > 1 - fadeRange) {
        opacity = 1 - ((progress - (1 - fadeRange)) / fadeRange);
      } else {
        opacity = 1;
      }

      const scaleRange = 0.1;
      let scale = 1;
      if (progress < scaleRange) {
        scale = 0.95 + (progress / scaleRange) * 0.05;
      } else if (progress > 1 - scaleRange) {
        scale = 1 - ((progress - (1 - scaleRange)) / scaleRange) * 0.05;
      }

      const color = getSmoothColorTransition(translateX, windowWidth);

      word.style.transform = `translateX(${translateX}px) scale(${scale})`;
      word.style.opacity = opacity;
      word.style.color = color;
    } else {
      word.style.transform = `translateX(${-windowWidth * 1.2}px) scale(0.9)`;
      word.style.opacity = "0";
      word.style.color = "#888";
    }
  }, [isMobile, animationStarted, getSmoothColorTransition]);

  // Основной useEffect с оптимизациями
  useEffect(() => {
    refs.current.isMounted = true;
    let ticking = false;
    let resizeTimeout;

    const handleScroll = () => {
      if (!sectionRef.current || !refs.current.isMounted) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const shouldStartAnimation = rect.top <= windowHeight * 0.99 && rect.bottom >= 1;
      
      if (!animationStarted && shouldStartAnimation) {
        setAnimationStarted(true);
        refs.current.startScrollY = window.scrollY;
        refs.current.sectionTop = section.offsetTop;
      }

      if (!animationStarted) {
        if (isMobile) {
          setWordStyles(Array(WORD_COUNT).fill({
            opacity: 0,
            transform: "translateY(15px) scale(0.9)",
            color: "#000",
            visible: false
          }));
        } else {
          wordsRef.current.forEach(word => {
            if (word) {
              word.style.opacity = "0";
              word.style.transform = "translateX(120vw) scale(0.9)";
              word.style.color = "#000";
            }
          });
        }
        return;
      }

      if (isMobile) {
        const distanceFromTop = -rect.top;
        const totalVisibleHeight = windowHeight + section.offsetHeight * 0.5;
        
        let progress = distanceFromTop / totalVisibleHeight;
        progress = Math.max(0, Math.min(1, progress));

        if (progress < 0.0001) {
          setWordStyles(Array(WORD_COUNT).fill({
            opacity: 0,
            transform: "translateY(15px) scale(0.9)",
            color: "#888",
            visible: false
          }));
          return;
        }

        const normalizedProgress = (progress - 0.0001) / 0.9999;
        updateMobileAnimation(normalizedProgress);
      } else {
        // Логика для ПК
        const currentScrollY = window.scrollY;

        if (!refs.current.hasStarted) {
          refs.current.sectionTop = section.offsetTop;
          refs.current.hasStarted = true;
          refs.current.startScrollY = currentScrollY;
        }

        // ИСПОЛЬЗУЕМ РАЗНЫЕ НАСТРОЙКИ ДЛЯ ПК И МОБИЛЬНЫХ
        const startAnimationY = refs.current.sectionTop - windowHeight * ANIMATION_START_CONFIG.PC;
        const endAnimationY = refs.current.sectionTop + section.offsetHeight * 0.7;
        
        let progress = (currentScrollY - startAnimationY) / (endAnimationY - startAnimationY);
        progress = Math.max(0, Math.min(1, progress));
        
        const adjustedProgress = Math.max(0, progress - 0.001) / 0.999;
        scrollProgressRef.current = Math.max(0, Math.min(1, adjustedProgress));

        const baseProgress = scrollProgressRef.current;
        
        if (baseProgress > 0) {
          refs.current.animationState.word1.targetProgress = baseProgress;
          refs.current.animationState.word2.targetProgress = Math.max(0, baseProgress - 0.15);
          refs.current.animationState.word3.targetProgress = Math.max(0, baseProgress - 0.25);
        } else {
          refs.current.animationState.word1.targetProgress = 0;
          refs.current.animationState.word2.targetProgress = 0;
          refs.current.animationState.word3.targetProgress = 0;
        }
      }
    };

    // Функция для анимации ПК
    const animatePC = () => {
      if (!refs.current.isMounted || isMobile || !animationStarted) {
        return;
      }

      wordsRef.current.forEach((word, index) => {
        if (!word) return;

        const stateKey = `word${index + 1}`;
        animateWordPC(word, index, refs.current.animationState[stateKey].targetProgress);
      });

      rafIdRef.current = requestAnimationFrame(animatePC);
    };

    const scrollHandler = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
      }
    };

    const handleResize = () => {
      if (sectionRef.current && !isMobile) {
        refs.current.sectionTop = sectionRef.current.offsetTop;
      }
    };

    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("resize", debouncedResize, { passive: true });

    if (sectionRef.current) {
      refs.current.sectionTop = sectionRef.current.offsetTop;
    }

    handleScroll();

    if (!isMobile) {
      rafIdRef.current = requestAnimationFrame(animatePC);
    }

    return () => {
      refs.current.isMounted = false;
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeout);
      
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isMobile, animationStarted, updateMobileAnimation, animateWordPC]);

  // Мемоизированный рендер слов
  const renderWords = useMemo(() => {
    const texts = ["We have done", "projects around", "the world"];
    
    return texts.map((text, index) => {
      const style = isMobile ? {
        opacity: wordStyles[index].opacity,
        transform: wordStyles[index].transform,
        color: wordStyles[index].color,
        transition: `
          opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
          transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
          color 0.6s cubic-bezier(0.42, 0, 0.58, 1)
        `
      } : {
        opacity: 0,
        transform: "translateX(120vw)",
        willChange: "transform, opacity, color"
      };

      return (
        <div
          key={index}
          className={`word word-${index + 1} ${wordStyles[index]?.visible ? "visible" : ""}`}
          ref={(el) => {
            if (el && wordsRef.current[index] !== el) {
              wordsRef.current[index] = el;
            }
          }}
          style={style}
        >
          {text}
        </div>
      );
    });
  }, [isMobile, wordStyles]);

  return (
    <section
      className="projects-section"
      ref={sectionRef}
      style={{ height: isMobile ? "160vh" : "300vh" }}
    >
      <div className="projects-content">
        <div className="words-container">
          {renderWords}
        </div>
      </div>
    </section>
  );
};

export default React.memo(ProjectsSection);