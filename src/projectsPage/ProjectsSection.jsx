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
        const sectionTop = rect.top;
        const sectionHeight = section.offsetHeight;
        const totalVisibleHeight = windowHeight + sectionHeight;
        const distanceFromTop = -sectionTop;

        let progress = distanceFromTop / totalVisibleHeight;
        progress = Math.max(0, Math.min(1, progress));

        // Сдвигаем все зоны раньше, особенно "the world"
        const wordZones = [
          { start: 0.10, end: 0.30 },   // "We have done": 10-30%
          { start: 0.32, end: 0.52 },   // "projects around": 32-52%
          { start: 0.54, end: 0.74 },   // "the world": 54-74% (заканчивается на 74% вместо 85%)
        ];

        const newOpacities = [];
        const newTransforms = [];
        const newVisibleWords = [];

        wordZones.forEach((zone, index) => {
          let wordProgress;
          let opacity = 0;
          let translateY = 0;
          let scale = 0.9;
          
          if (progress >= zone.start && progress <= zone.end) {
            // В зоне видимости слова
            wordProgress = (progress - zone.start) / (zone.end - zone.start);
            
            // Для всех слов делаем одинаково быстрые переходы
            if (wordProgress < 0.15) {
              opacity = wordProgress / 0.15; // Быстро появляемся
            } else if (wordProgress > 0.85) {
              opacity = (1 - wordProgress) / 0.15; // Быстро исчезаем
            } else {
              opacity = 1;
            }

            // Быстрая анимация движения
            if (wordProgress < 0.5) {
              const easeIn = wordProgress * 2;
              translateY = 20 * (1 - easeIn); // 20px → 0px (меньше движение)
            } else {
              const easeOut = (wordProgress - 0.5) * 2;
              translateY = 20 * easeOut; // 0px → 20px (меньше движение)
            }

            // Быстрое масштабирование
            if (wordProgress < 0.2) {
              scale = 0.9 + (wordProgress / 0.2) * 0.1; // 0.9 → 1.0
            } else if (wordProgress > 0.8) {
              scale = 1.0 - ((wordProgress - 0.8) / 0.2) * 0.1; // 1.0 → 0.9
            } else {
              scale = 1.0;
            }
          } else {
            opacity = 0;
            if (progress < zone.start) {
              translateY = 20;
              scale = 0.9;
            } else if (progress > zone.end) {
              translateY = -20;
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

      // Логика для ПК и планшетов
      const currentScrollY = window.scrollY;

      if (!hasStartedRef.current) {
        sectionTopRef.current = section.offsetTop;
        hasStartedRef.current = true;
        startScrollYRef.current = currentScrollY;
      }

      const sectionHeight = section.offsetHeight;
      const sectionScroll = currentScrollY - sectionTopRef.current;
      let progress = sectionScroll / sectionHeight;

      progress = Math.max(0, Math.min(1, progress));
      const adjustedProgress = Math.max(0, progress - 0.1) / 0.8;

      scrollProgressRef.current = Math.max(0, Math.min(1, adjustedProgress));

      const baseProgress = scrollProgressRef.current;
      animationStateRef.current.word1.targetProgress = baseProgress;
      animationStateRef.current.word2.targetProgress = Math.max(0, baseProgress - 0.15);
      animationStateRef.current.word3.targetProgress = Math.max(0, baseProgress - 0.3);
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
      currentState.progress = lerp(currentState.progress, targetProgress, 0.06);

      const wordWidth = word.offsetWidth;
      const windowWidth = window.innerWidth;

      let translateX = 0;
      let opacity = 0;
      let scale = 1;

      const progress = currentState.progress;

      if (progress < 0) {
        translateX = windowWidth * 1.5;
        opacity = 0;
        scale = 0.9;
      } else if (progress < 1) {
        const easedProgress = easeOutCubic(progress);
        const startX = windowWidth * 1.5;
        const endX = -windowWidth * 1.5;
        translateX = startX + easedProgress * (endX - startX);

        if (progress < 0.25) {
          opacity = progress / 0.25;
        } else if (progress > 0.75) {
          opacity = 1 - ((progress - 0.75) / 0.25);
        } else {
          opacity = 1;
        }

        if (progress < 0.5) {
          scale = 0.95 + (progress / 0.5) * 0.05;
        } else {
          scale = 1 - ((progress - 0.5) / 0.5) * 0.05;
        }
      } else {
        translateX = -windowWidth * 1.5;
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
  }, [isMobile]);

  return (
    <section
      className="projects-section"
      ref={sectionRef}
      style={{ height: isMobile ? "400vh" : "400vh" }}
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
                    transform: `translateX(200vw)`,
                    willChange: "transform, opacity",
                  }
                : {
                    opacity: wordOpacities[0],
                    transform: wordTransforms[0],
                    transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
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
                    transform: `translateX(200vw)`,
                    willChange: "transform, opacity",
                  }
                : {
                    opacity: wordOpacities[1],
                    transform: wordTransforms[1],
                    transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
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
                    transform: `translateX(200vw)`,
                    willChange: "transform, opacity",
                  }
                : {
                    opacity: wordOpacities[2],
                    transform: wordTransforms[2],
                    transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
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