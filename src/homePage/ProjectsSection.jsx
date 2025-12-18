import React, { useEffect, useRef, useState } from "react";
import "./ProjectsSection.css";

const ProjectsSection = () => {
  const sectionRef = useRef(null);
  const wordsRef = useRef([]);
  const containerRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const rafIdRef = useRef(null);
  const animationStateRef = useRef({
    word1: { progress: 0, targetProgress: 0, colorProgress: 0, targetColorProgress: 0 },
    word2: { progress: 0, targetProgress: 0, colorProgress: 0, targetColorProgress: 0 },
    word3: { progress: 0, targetProgress: 0, colorProgress: 0, targetColorProgress: 0 },
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
  const [wordColors, setWordColors] = useState(["#000", "#000", "#000"]);
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

      const shouldStartAnimation = rect.top <= windowHeight * 0.99 && rect.bottom >= 1;
      
      if (!animationStarted && shouldStartAnimation) {
        setAnimationStarted(true);
        startScrollYRef.current = window.scrollY;
        sectionTopRef.current = section.offsetTop;
      }

      if (!animationStarted) {
        if (isMobile) {
          setWordOpacities([0, 0, 0]);
          setWordTransforms([
            "translateY(15px) scale(0.9)",
            "translateY(15px) scale(0.9)",
            "translateY(15px) scale(0.9)",
          ]);
          setWordColors(["#000", "#000", "#000"]);
          setVisibleWords([false, false, false]);
        } else {
          wordsRef.current.forEach((word, index) => {
            if (word) {
              word.style.opacity = "0";
              word.style.transform = "translateX(120vw) scale(0.9)";
              word.style.color = "#000";
            }
          });
          animationStateRef.current = {
            word1: { progress: 0, targetProgress: 0, colorProgress: 0, targetColorProgress: 0 },
            word2: { progress: 0, targetProgress: 0, colorProgress: 0, targetColorProgress: 0 },
            word3: { progress: 0, targetProgress: 0, colorProgress: 0, targetColorProgress: 0 },
          };
        }
        return;
      }

      if (isMobile) {
        const sectionTop = rect.top;
        const sectionHeight = section.offsetHeight;
        const totalVisibleHeight = windowHeight + sectionHeight * 0.5;
        
        const distanceFromTop = -sectionTop;

        let progress = distanceFromTop / totalVisibleHeight;
        progress = Math.max(0, Math.min(1, progress));

        if (progress < 0.0001) {
          setWordOpacities([0, 0, 0]);
          setWordTransforms([
            "translateY(15px) scale(0.9)",
            "translateY(15px) scale(0.9)",
            "translateY(15px) scale(0.9)",
          ]);
          setWordColors(["#888", "#888", "#888"]);
          setVisibleWords([false, false, false]);
          return;
        }

        const normalizedProgress = (progress - 0.0001) / 0.9999;

        const wordZones = [
          { start: 0.00, end: 0.20 },
          { start: 0.20, end: 0.40 },
          { start: 0.40, end: 0.60 },
        ];

        const newOpacities = [];
        const newTransforms = [];
        const newColors = [];
        const newVisibleWords = [];

        wordZones.forEach((zone, index) => {
          let wordProgress;
          let opacity = 0;
          let translateY = 0;
          let scale = 0.9;
          let color = "#000";
          
          if (normalizedProgress >= zone.start && normalizedProgress <= zone.end) {
            wordProgress = (normalizedProgress - zone.start) / (zone.end - zone.start);
            
            // Плавное появление и исчезновение
            const fadeInOutRange = 0.25;
            if (wordProgress < fadeInOutRange) {
              opacity = wordProgress / fadeInOutRange;
            } else if (wordProgress > 1 - fadeInOutRange) {
              opacity = (1 - wordProgress) / fadeInOutRange;
            } else {
              opacity = 1;
            }

            // Плавное движение
            if (wordProgress < 0.5) {
              const easeIn = wordProgress * 2;
              translateY = 5 * (1 - easeIn);
            } else {
              const easeOut = (wordProgress - 0.5) * 2;
              translateY = 5 * easeOut;
            }

            // Плавное масштабирование
            const scaleRange = 0.15;
            if (wordProgress < scaleRange) {
              scale = 0.9 + (wordProgress / scaleRange) * 0.1;
            } else if (wordProgress > 1 - scaleRange) {
              scale = 1.0 - ((wordProgress - (1 - scaleRange)) / scaleRange) * 0.1;
            } else {
              scale = 1.0;
            }

            // Плавное изменение цвета на мобильных
            const colorRange = 0.3;
            if (wordProgress < colorRange) {
              // Плавный переход от серого к черному при появлении
              const colorProgress = wordProgress / colorRange;
              const grayValue = Math.floor(136 - 136 * colorProgress);
              color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
            } else if (wordProgress > 1 - colorRange) {
              // Плавный переход от черного к серому при исчезновении
              const colorProgress = (wordProgress - (1 - colorRange)) / colorRange;
              const grayValue = Math.floor(136 * colorProgress);
              color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
            } else {
              color = "#000";
            }
          } else {
            opacity = 0;
            color = "#888";
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
          newColors.push(color);
          newVisibleWords.push(opacity > 0.1);
        });

        setWordOpacities(newOpacities);
        setWordTransforms(newTransforms);
        setWordColors(newColors);
        setVisibleWords(newVisibleWords);

        return;
      }

      // Логика для ПК
      const currentScrollY = window.scrollY;

      if (!hasStartedRef.current) {
        sectionTopRef.current = section.offsetTop;
        hasStartedRef.current = true;
        startScrollYRef.current = currentScrollY;
      }

      const startAnimationY = sectionTopRef.current - windowHeight * 0.80;
      const endAnimationY = sectionTopRef.current + section.offsetHeight * 0.7;
      
      let progress = (currentScrollY - startAnimationY) / (endAnimationY - startAnimationY);
      
      progress = Math.max(0, Math.min(1, progress));
      
      const adjustedProgress = Math.max(0, progress - 0.001) / 0.999;

      scrollProgressRef.current = Math.max(0, Math.min(1, adjustedProgress));

      const baseProgress = scrollProgressRef.current;
      
      if (baseProgress > 0) {
        animationStateRef.current.word1.targetProgress = baseProgress;
        animationStateRef.current.word2.targetProgress = Math.max(0, baseProgress - 0.15);
        animationStateRef.current.word3.targetProgress = Math.max(0, baseProgress - 0.25);
      } else {
        animationStateRef.current.word1.targetProgress = 0;
        animationStateRef.current.word2.targetProgress = 0;
        animationStateRef.current.word3.targetProgress = 0;
      }
    };

    const easeOutCubic = (t) => {
      return 1 - Math.pow(1 - t, 3);
    };

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const lerp = (start, end, factor) => {
      return start + (end - start) * factor;
    };

    // Плавная функция для цвета с буферной зоной
    const getSmoothColorTransition = (translateX, windowWidth) => {
      // Определяем границы буферных зон
      const grayZoneStart = -windowWidth * 0.3; // Начинаем становиться серым за 30% от ширины экрана слева
      const grayZoneEnd = -windowWidth * 0.1;   // Полностью серый на 10% от ширины экрана слева
      
      const blackZoneStart = windowWidth * 0.2;  // Начинаем становиться черным на 20% от ширины экрана справа
      const blackZoneEnd = windowWidth * 0.4;    // Полностью черный на 40% от ширины экрана справа

      // Справа от экрана (появление) - серый
      if (translateX > windowWidth * 0.4) {
        return "#888";
      }
      
      // Левая буферная зона (уход с экрана)
      if (translateX < grayZoneEnd) {
        if (translateX <= grayZoneStart) {
          return "#888"; // Полностью серый
        } else {
          // Плавный переход от черного к серому
          const progress = (translateX - grayZoneStart) / (grayZoneEnd - grayZoneStart);
          const easedProgress = easeInOutCubic(progress);
          const grayValue = Math.floor(136 * (1 - easedProgress));
          return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        }
      }
      
      // Центральная зона (в центре экрана)
      if (translateX < blackZoneStart) {
        return "#000"; // Полностью черный в центре
      }
      
      // Правая буферная зона (появление на экране)
      if (translateX <= blackZoneEnd) {
        // Плавный переход от серого к черному
        const progress = (translateX - blackZoneStart) / (blackZoneEnd - blackZoneStart);
        const easedProgress = easeInOutCubic(progress);
        const grayValue = Math.floor(136 - 136 * easedProgress);
        return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      }
      
      // Справа от правой буферной зоны
      return "#888";
    };

    const animateWord = (word, index, targetProgress) => {
      if (!word || isMobile || !animationStarted) return;

      const currentState = animationStateRef.current[`word${index + 1}`];
      currentState.progress = lerp(currentState.progress, targetProgress, 0.15); // Медленнее для плавности

      const wordWidth = word.offsetWidth;
      const windowWidth = window.innerWidth;

      let translateX = 0;
      let opacity = 0;
      let scale = 1;
      let color = "#000";

      const progress = currentState.progress;

      if (progress <= 0) {
        translateX = windowWidth * 1.2;
        opacity = 0;
        scale = 0.9;
        color = "#888";
      } else if (progress < 1) {
        const easedProgress = easeOutCubic(progress);
        const startX = windowWidth * 1.2;
        const endX = -windowWidth * 1.2;
        translateX = startX + easedProgress * (endX - startX);

        // Плавное появление и исчезновение
        const fadeRange = 0.15;
        if (progress < fadeRange) {
          opacity = progress / fadeRange;
        } else if (progress > 1 - fadeRange) {
          opacity = 1 - ((progress - (1 - fadeRange)) / fadeRange);
        } else {
          opacity = 1;
        }

        // Плавное масштабирование
        const scaleRange = 0.1;
        if (progress < scaleRange) {
          scale = 0.95 + (progress / scaleRange) * 0.05;
        } else if (progress > 1 - scaleRange) {
          scale = 1 - ((progress - (1 - scaleRange)) / scaleRange) * 0.05;
        } else {
          scale = 1;
        }

        // Плавное изменение цвета с буферными зонами
        color = getSmoothColorTransition(translateX, windowWidth);
      } else {
        translateX = -windowWidth * 1.2;
        opacity = 0;
        scale = 0.9;
        color = "#888";
      }

      word.style.transform = `translateX(${translateX}px) scale(${scale})`;
      word.style.opacity = opacity;
      word.style.color = color;
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
      style={{ height: isMobile ? "160vh" : "300vh" }}
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
                    willChange: "transform, opacity, color",
                  }
                : {
                    opacity: wordOpacities[0],
                    transform: wordTransforms[0],
                    color: wordColors[0],
                    transition: `
                      opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      color 0.6s cubic-bezier(0.42, 0, 0.58, 1)
                    `,
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
                    willChange: "transform, opacity, color",
                  }
                : {
                    opacity: wordOpacities[1],
                    transform: wordTransforms[1],
                    color: wordColors[1],
                    transition: `
                      opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      color 0.6s cubic-bezier(0.42, 0, 0.58, 1)
                    `,
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
                    willChange: "transform, opacity, color",
                  }
                : {
                    opacity: wordOpacities[2],
                    transform: wordTransforms[2],
                    color: wordColors[2],
                    transition: `
                      opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      color 0.6s cubic-bezier(0.42, 0, 0.58, 1)
                    `,
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