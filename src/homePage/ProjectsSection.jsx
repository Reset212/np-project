import React, { useEffect, useRef, useState } from "react";
import "./ProjectsSection.css";

const ProjectsSection = () => {
  const sectionRef = useRef(null);
  const wordsRef = useRef([]);
  const containerRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const rafIdRef = useRef(null);
  const animationStateRef = useRef({
    word1: { progress: 0, targetProgress: 0 },
    word2: { progress: 0, targetProgress: 0 },
    word3: { progress: 0, targetProgress: 0 },
  });
  const isMountedRef = useRef(true);
  const hasStartedRef = useRef(false);
  const startScrollYRef = useRef(0);
  const sectionTopRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleWords, setVisibleWords] = useState([false, false, false]);
  const [wordOpacities, setWordOpacities] = useState([0, 0, 0]);
  const [wordTransforms, setWordTransforms] = useState([
    "translateY(0px) scale(0.9)",
    "translateY(0px) scale(0.9)",
    "translateY(0px) scale(0.9)",
  ]);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const handleScroll = () => {
      if (!sectionRef.current || !isMountedRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const isSectionInView = rect.top < windowHeight && rect.bottom > 0;
      setIsInView(isSectionInView);

      if (isMobile) {
        // НАЧАЛО ИСПРАВЛЕНИЯ: Анимация начинается раньше
        const viewportThreshold = windowHeight * 0.8; // 80% высоты окна
        
        // Расстояние от верха секции до низа окна
        const distanceFromTop = windowHeight - rect.top;
        
        // Прогресс начинается, когда секция появляется внизу окна
        let progress = distanceFromTop / (windowHeight + section.offsetHeight);
        progress = Math.max(0, Math.min(1, progress));
        
        // Ускоряем прогресс, чтобы анимация начиналась раньше
        const acceleratedProgress = Math.min(1, progress * 1.5);
        
        // Еще больше сдвигаем зоны анимации вперед
        const wordZones = [
          { start: 0.0, end: 0.25 },    // "We have done": 0-25% (было 0.10-0.30)
          { start: 0.20, end: 0.45 },   // "projects around": 20-45% (было 0.32-0.52)
          { start: 0.40, end: 0.65 },   // "the world": 40-65% (было 0.54-0.74)
        ];

        const newOpacities = [];
        const newTransforms = [];
        const newVisibleWords = [];

        wordZones.forEach((zone, index) => {
          let wordProgress;
          let opacity = 0;
          let translateY = 0;
          let scale = 0.9;
          
          if (acceleratedProgress >= zone.start && acceleratedProgress <= zone.end) {
            // В зоне видимости слова
            wordProgress = (acceleratedProgress - zone.start) / (zone.end - zone.start);
            
            // Делаем переходы более плавными
            if (wordProgress < 0.2) {
              opacity = wordProgress / 0.2;
            } else if (wordProgress > 0.8) {
              opacity = (1 - wordProgress) / 0.2;
            } else {
              opacity = 1;
            }

            // Более плавная анимация движения
            translateY = 15 * Math.sin(wordProgress * Math.PI); // 15px вверх-вниз

            // Плавное масштабирование
            if (wordProgress < 0.3) {
              scale = 0.9 + (wordProgress / 0.3) * 0.1;
            } else if (wordProgress > 0.7) {
              scale = 1.0 - ((wordProgress - 0.7) / 0.3) * 0.1;
            } else {
              scale = 1.0;
            }
          } else {
            opacity = 0;
            if (acceleratedProgress < zone.start) {
              translateY = 15;
              scale = 0.9;
            } else if (acceleratedProgress > zone.end) {
              translateY = -15;
              scale = 0.9;
            }
          }

          newOpacities.push(opacity);
          newTransforms.push(`translateY(${translateY}px) scale(${scale})`);
          newVisibleWords.push(opacity > 0.05);
        });

        setWordOpacities(newOpacities);
        setWordTransforms(newTransforms);
        setVisibleWords(newVisibleWords);

        return;
      }

      // Логика для ПК и планшетов - НАЧАЛО РАНЬШЕ
      const currentScrollY = window.scrollY;

      if (!hasStartedRef.current) {
        sectionTopRef.current = section.offsetTop;
        hasStartedRef.current = true;
        startScrollYRef.current = currentScrollY;
      }

      const sectionHeight = section.offsetHeight;
      const sectionScroll = currentScrollY - sectionTopRef.current;
      
      // Начинаем анимацию сразу при входе в секцию
      let progress = (sectionScroll + windowHeight * 0.3) / (sectionHeight * 0.8);

      progress = Math.max(0, Math.min(1, progress));
      
      // Уменьшаем задержку перед началом анимации
      const adjustedProgress = Math.max(0, progress - 0.05) / 0.9; // Было: -0.1 / 0.8

      scrollProgressRef.current = Math.max(0, Math.min(1, adjustedProgress));

      const baseProgress = scrollProgressRef.current;
      
      // Уменьшаем задержки между словами
      animationStateRef.current.word1.targetProgress = baseProgress;
      animationStateRef.current.word2.targetProgress = Math.max(0, baseProgress - 0.1); // Было: 0.15
      animationStateRef.current.word3.targetProgress = Math.max(0, baseProgress - 0.2); // Было: 0.3
    };

    const easeOutCubic = (t) => {
      return 1 - Math.pow(1 - t, 3);
    };

    const lerp = (start, end, factor) => {
      return start + (end - start) * factor;
    };

    const animateWord = (word, index, targetProgress) => {
      if (!word || isMobile) return;

      const currentState = animationStateRef.current[`word${index + 1}`];
      currentState.progress = lerp(currentState.progress, targetProgress, 0.08); // Увеличили скорость

      const wordWidth = word.offsetWidth;
      const windowWidth = window.innerWidth;

      let translateX = 0;
      let opacity = 0;
      let scale = 1;

      const progress = currentState.progress;

      if (progress < 0) {
        translateX = windowWidth * 1.3; // Меньше начальное смещение
        opacity = 0;
        scale = 0.9;
      } else if (progress < 1) {
        const easedProgress = easeOutCubic(progress);
        const startX = windowWidth * 1.3; // Меньше начальное смещение
        const endX = -windowWidth * 1.3; // Меньше конечное смещение
        translateX = startX + easedProgress * (endX - startX);

        // Более плавные переходы прозрачности
        if (progress < 0.2) { // Было: 0.25
          opacity = progress / 0.2;
        } else if (progress > 0.8) { // Было: 0.75
          opacity = 1 - ((progress - 0.8) / 0.2);
        } else {
          opacity = 1;
        }

        // Более плавное масштабирование
        if (progress < 0.4) { // Было: 0.5
          scale = 0.95 + (progress / 0.4) * 0.05;
        } else {
          scale = 1 - ((progress - 0.4) / 0.6) * 0.05;
        }
      } else {
        translateX = -windowWidth * 1.3; // Меньше конечное смещение
        opacity = 0;
        scale = 0.9;
      }

      word.style.transform = `translateX(${translateX}px) scale(${scale})`;
      word.style.opacity = opacity;
      word.style.transition = "none";
    };

    const animate = () => {
      if (!isMountedRef.current || isMobile) {
        if (isMobile) return;
      }

      wordsRef.current.forEach((word, index) => {
        if (!word) return;

        const stateKey = `word${index + 1}`;
        animateWord(word, index, animationStateRef.current[stateKey].targetProgress);
      });

      if (!isMobile) {
        rafIdRef.current = requestAnimationFrame(animate);
      }
    };

    let ticking = false;
    const scrollHandler = () => {
      if (!ticking && isMountedRef.current) {
        ticking = true;
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
      }
    };

    const handleResize = () => {
      if (sectionRef.current && !isMobile) {
        sectionTopRef.current = sectionRef.current.offsetTop;
      }
    };

    // Слушаем скролл с более высоким приоритетом
    window.addEventListener("scroll", scrollHandler, { passive: true, capture: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Инициализируем позицию секции
    if (sectionRef.current) {
      sectionTopRef.current = sectionRef.current.offsetTop;
      
      // Инициализируем анимацию сразу
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Если секция уже частично видна, запускаем анимацию
      if (rect.top < windowHeight && rect.bottom > 0) {
        handleScroll();
      }
    }

    // Запускаем обработчик скролла сразу
    handleScroll();

    if (!isMobile) {
      rafIdRef.current = requestAnimationFrame(animate);
    }

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isMobile]);

  return (
    <section
      className="projects-section"
      ref={sectionRef}
      style={{ height: isMobile ? "300vh" : "300vh" }} // Уменьшили высоту для более ранней анимации
    >
      <div className="projects-content">
        <div className="words-container" ref={containerRef}>
          <div
            className={`word word-1 ${visibleWords[0] ? "visible" : ""}`}
            ref={(el) => {
              if (isMountedRef.current) wordsRef.current[0] = el;
            }}
            style={
              !isMobile
                ? {
                    opacity: 0,
                    transform: `translateX(130vw)`, // Меньше начальное смещение
                    willChange: "transform, opacity",
                  }
                : {
                    opacity: wordOpacities[0],
                    transform: wordTransforms[0],
                    transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  }
            }
          >
            We have done
          </div>
          <div
            className={`word word-2 ${visibleWords[1] ? "visible" : ""}`}
            ref={(el) => {
              if (isMountedRef.current) wordsRef.current[1] = el;
            }}
            style={
              !isMobile
                ? {
                    opacity: 0,
                    transform: `translateX(130vw)`, // Меньше начальное смещение
                    willChange: "transform, opacity",
                  }
                : {
                    opacity: wordOpacities[1],
                    transform: wordTransforms[1],
                    transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  }
            }
          >
            projects around
          </div>
          <div
            className={`word word-3 ${visibleWords[2] ? "visible" : ""}`}
            ref={(el) => {
              if (isMountedRef.current) wordsRef.current[2] = el;
            }}
            style={
              !isMobile
                ? {
                    opacity: 0,
                    transform: `translateX(130vw)`, // Меньше начальное смещение
                    willChange: "transform, opacity",
                  }
                : {
                    opacity: wordOpacities[2],
                    transform: wordTransforms[2],
                    transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  }
            }
          >
            the world
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;