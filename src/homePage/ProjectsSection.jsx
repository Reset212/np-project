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
  const [animationStarted, setAnimationStarted] = useState(false);

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

      // МАКСИМАЛЬНО РАННИЙ ЗАПУСК: начинаем когда хоть часть секции видна
      const shouldStartAnimation = rect.top <= windowHeight * 0.99 && rect.bottom >= 1;
      
      if (!animationStarted && shouldStartAnimation) {
        setAnimationStarted(true);
        startScrollYRef.current = window.scrollY;
        sectionTopRef.current = section.offsetTop;
      }

      // Если анимация еще не должна начаться, сбрасываем все состояния
      if (!animationStarted) {
        if (isMobile) {
          setWordOpacities([0, 0, 0]);
          setWordTransforms([
            "translateY(15px) scale(0.9)",
            "translateY(15px) scale(0.9)",
            "translateY(15px) scale(0.9)",
          ]);
          setVisibleWords([false, false, false]);
        } else {
          wordsRef.current.forEach((word, index) => {
            if (word) {
              word.style.opacity = "0";
              word.style.transform = "translateX(120vw) scale(0.9)";
            }
          });
          // Сбрасываем все прогрессы
          animationStateRef.current = {
            word1: { progress: 0, targetProgress: 0 },
            word2: { progress: 0, targetProgress: 0 },
            word3: { progress: 0, targetProgress: 0 },
          };
        }
        return;
      }

      if (isMobile) {
        // Только когда анимация началась, обрабатываем прогресс
        const sectionTop = rect.top;
        const sectionHeight = section.offsetHeight;
        // Уменьшаем общую высоту для более быстрой анимации
        const totalVisibleHeight = windowHeight + sectionHeight * 0.5; // 50% от высоты секции
        
        const distanceFromTop = -sectionTop;

        let progress = distanceFromTop / totalVisibleHeight;
        progress = Math.max(0, Math.min(1, progress));

        // НЕТ начальной задержки - еще быстрее
        if (progress < 0.0001) { // Минимальная задержка
          setWordOpacities([0, 0, 0]);
          setWordTransforms([
            "translateY(15px) scale(0.9)",
            "translateY(15px) scale(0.9)",
            "translateY(15px) scale(0.9)",
          ]);
          setVisibleWords([false, false, false]);
          return;
        }

        // Нормализация практически без смещения
        const normalizedProgress = (progress - 0.0001) / 0.9999;

        // КОРОТКИЕ ЗОНЫ - чтобы "the world" не заезжало на другой блок
        const wordZones = [
          { start: 0.00, end: 0.20 },   // "We have done": очень коротко
          { start: 0.20, end: 0.40 },   // "projects around": очень коротко  
          { start: 0.40, end: 0.60 },   // "the world": очень коротко - заканчивается рано
        ];

        const newOpacities = [];
        const newTransforms = [];
        const newVisibleWords = [];

        wordZones.forEach((zone, index) => {
          let wordProgress;
          let opacity = 0;
          let translateY = 0;
          let scale = 0.9;
          
          if (normalizedProgress >= zone.start && normalizedProgress <= zone.end) {
            wordProgress = (normalizedProgress - zone.start) / (zone.end - zone.start);
            
            // Очень быстрое появление и исчезновение
            if (wordProgress < 0.15) { // Быстро появляется
              opacity = wordProgress / 0.15;
            } else if (wordProgress > 0.85) { // Быстро исчезает
              opacity = (1 - wordProgress) / 0.15;
            } else {
              opacity = 1;
            }

            // Минимальное движение
            if (wordProgress < 0.5) {
              const easeIn = wordProgress * 2;
              translateY = 5 * (1 - easeIn); // Всего 5px движения
            } else {
              const easeOut = (wordProgress - 0.5) * 2;
              translateY = 5 * easeOut;
            }

            // Быстрое масштабирование
            if (wordProgress < 0.1) {
              scale = 0.9 + (wordProgress / 0.1) * 0.1;
            } else if (wordProgress > 0.9) {
              scale = 1.0 - ((wordProgress - 0.9) / 0.1) * 0.1;
            } else {
              scale = 1.0;
            }
          } else {
            opacity = 0;
            if (normalizedProgress < zone.start) {
              translateY = 10;
              scale = 0.9;
            } else if (normalizedProgress > zone.end) {
              translateY = -10;
              scale = 0.9;
            }
          }

          newOpacities.push(opacity);
          newTransforms.push(`translateY(${translateY}px) scale(${scale})`);
          newVisibleWords.push(opacity > 0.1);
        });

        setWordOpacities(newOpacities);
        setWordTransforms(newTransforms);
        setVisibleWords(newVisibleWords);

        return;
      }

      // Логика для ПК и планшетов
      const currentScrollY = window.scrollY;

      if (!hasStartedRef.current) {
        sectionTopRef.current = section.offsetTop;
        hasStartedRef.current = true;
        startScrollYRef.current = currentScrollY;
      }

      // Начинаем анимацию ОЧЕНЬ ДАЛЕКО (когда секция еще ниже окна)
      const startAnimationY = sectionTopRef.current - windowHeight * 0.80; // Очень далеко
      const endAnimationY = sectionTopRef.current + section.offsetHeight * 0.7;
      
      let progress = (currentScrollY - startAnimationY) / (endAnimationY - startAnimationY);
      
      progress = Math.max(0, Math.min(1, progress));
      
      // Практически нет задержки
      const adjustedProgress = Math.max(0, progress - 0.001) / 0.999;

      scrollProgressRef.current = Math.max(0, Math.min(1, adjustedProgress));

      const baseProgress = scrollProgressRef.current;
      
      // Слова появляются почти одновременно
      if (baseProgress > 0) {
        animationStateRef.current.word1.targetProgress = baseProgress;
        animationStateRef.current.word2.targetProgress = Math.max(0, baseProgress - 0.15); // Еще меньше задержки
        animationStateRef.current.word3.targetProgress = Math.max(0, baseProgress - 0.25); // Еще меньше задержки
      } else {
        animationStateRef.current.word1.targetProgress = 0;
        animationStateRef.current.word2.targetProgress = 0;
        animationStateRef.current.word3.targetProgress = 0;
      }
    };

    const easeOutCubic = (t) => {
      return 1 - Math.pow(1 - t, 3);
    };

    const lerp = (start, end, factor) => {
      return start + (end - start) * factor;
    };

    const animateWord = (word, index, targetProgress) => {
      if (!word || isMobile || !animationStarted) return;

      const currentState = animationStateRef.current[`word${index + 1}`];
      currentState.progress = lerp(currentState.progress, targetProgress, 0.2); // Еще быстрее

      const wordWidth = word.offsetWidth;
      const windowWidth = window.innerWidth;

      let translateX = 0;
      let opacity = 0;
      let scale = 1;

      const progress = currentState.progress;

      if (progress <= 0) {
        translateX = windowWidth * 1.2;
        opacity = 0;
        scale = 0.9;
      } else if (progress < 1) {
        const easedProgress = easeOutCubic(progress);
        const startX = windowWidth * 1.2;
        const endX = -windowWidth * 1.2;
        translateX = startX + easedProgress * (endX - startX);

        // Быстрее появление
        if (progress < 0.1) { // Быстрее: 0.1 вместо 0.05
          opacity = progress / 0.1;
        } else if (progress > 0.9) { // Быстрее: 0.9 вместо 0.95
          opacity = 1 - ((progress - 0.9) / 0.1);
        } else {
          opacity = 1;
        }

        // Быстрее масштабирование
        if (progress < 0.15) { // Быстрее: 0.15 вместо 0.1
          scale = 0.95 + (progress / 0.15) * 0.05;
        } else {
          scale = 1 - ((progress - 0.15) / 0.85) * 0.05;
        }
      } else {
        translateX = -windowWidth * 1.2;
        opacity = 0;
        scale = 0.9;
      }

      word.style.transform = `translateX(${translateX}px) scale(${scale})`;
      word.style.opacity = opacity;
      word.style.transition = "none";
    };

    const animate = () => {
      if (!isMountedRef.current || isMobile || !animationStarted) {
        return;
      }

      wordsRef.current.forEach((word, index) => {
        if (!word) return;

        const stateKey = `word${index + 1}`;
        animateWord(word, index, animationStateRef.current[stateKey].targetProgress);
      });

      rafIdRef.current = requestAnimationFrame(animate);
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

    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    if (sectionRef.current) {
      sectionTopRef.current = sectionRef.current.offsetTop;
    }

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
  }, [isMobile, animationStarted]);

  return (
    <section
      className="projects-section"
      ref={sectionRef}
      style={{ height: isMobile ? "160vh" : "300vh" }} // ЕЩЕ БОЛЬШЕ уменьшил высоту для телефона
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
                    transform: `translateX(120vw)`,
                    willChange: "transform, opacity",
                  }
                : {
                    opacity: wordOpacities[0],
                    transform: wordTransforms[0],
                    transition: "opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)", // Еще быстрее
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
                    transform: `translateX(120vw)`,
                    willChange: "transform, opacity",
                  }
                : {
                    opacity: wordOpacities[1],
                    transform: wordTransforms[1],
                    transition: "opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)", // Еще быстрее
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
                    transform: `translateX(120vw)`,
                    willChange: "transform, opacity",
                  }
                : {
                    opacity: wordOpacities[2],
                    transform: wordTransforms[2],
                    transition: "opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)", // Еще быстрее
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