import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ScrollTextAnimation.css";

const ScrollTextAnimation = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [wordStates, setWordStates] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [section1Visible, setSection1Visible] = useState(false);
  const [section2Visible, setSection2Visible] = useState(false);
  const [isBlockActive, setIsBlockActive] = useState(false);
  const [sectionTransitioning, setSectionTransitioning] = useState(false); // Новое состояние
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Рефы для плавности
  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const animationStartTimeRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const lastWordStatesRef = useRef({});
  const lastScrollYRef = useRef(0);
  const lastScrollDirectionRef = useRef('down');
  const wasActiveRef = useRef(false);
  const lastActiveSectionRef = useRef(0); // Следим за предыдущей секцией

  // Данные для текста - ДЕСКТОП
  const sections = [
    {
      lines: [
        ["WE", "BRING", "IDEAS", "TO", "LIFE", "THROUGH"],
        ["BRANDING,", "VISUALS", "AND", "HYPE"]
      ],
    },
    {
      lines: [
        ["EVERY", "PROJECT", "SUCCEEDS"]
      ],
    }
  ];

  // Данные для текста - МОБИЛЬНАЯ ВЕРСИЯ
  const mobileSections = [
    {
      lines: [
        ["WE", "BRING", "IDEAS", "TO", "LIFE"],
        ["THROUGH", "BRANDING,", "VISUALS", "AND", "HYPE"]
      ]
    },
    {
      lines: [
        ["EVERY", "PROJECT", "SUCCEEDS"]
      ]
    }
  ];

  const getWordKey = (sectionIdx, lineIdx, wordIdx) =>
    `${sectionIdx}-${lineIdx}-${wordIdx}`;

  // Функция для плавной интерполяции
  const lerp = useCallback((start, end, factor) => {
    return start + (end - start) * factor;
  }, []);

  // Функция для плавного обновления прогресса
  const smoothProgress = useCallback((targetProgress) => {
    const now = performance.now();
    const elapsed = now - animationStartTimeRef.current;
    
    const smoothingFactor = Math.min(elapsed / 300, 1);
    const easedFactor = 1 - Math.pow(1 - smoothingFactor, 3);
    
    currentProgressRef.current = lerp(currentProgressRef.current, targetProgress, easedFactor * 0.15);
    
    if (Math.abs(currentProgressRef.current - targetProgress) < 0.001) {
      currentProgressRef.current = targetProgress;
      isAnimatingRef.current = false;
    } else {
      isAnimatingRef.current = true;
    }
    
    return currentProgressRef.current;
  }, [lerp]);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 480;
      setIsMobile(mobile);

      const initialWordStates = {};
      const currentSections = mobile ? mobileSections : sections;
      
      currentSections.forEach((section, sectionIdx) => {
        section.lines.forEach((line, lineIdx) => {
          line.forEach((_, wordIdx) => {
            const key = getWordKey(sectionIdx, lineIdx, wordIdx);
            initialWordStates[key] = false;
          });
        });
      });
      
      setWordStates(initialWordStates);
      lastWordStatesRef.current = initialWordStates;
      setActiveSection(0);
      setSection1Visible(false);
      setSection2Visible(false);
      setIsBlockActive(false);
      setSectionTransitioning(false);
      currentProgressRef.current = 0;
      targetProgressRef.current = 0;
      wasActiveRef.current = false;
      lastActiveSectionRef.current = 0;
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Функция проверки, находится ли блок в видимой области экрана
  const isBlockInView = useCallback((rect, windowHeight, direction) => {
    const blockTop = rect.top;
    const blockBottom = rect.bottom;
    const blockHeight = rect.height;
    
    // Для скролла вниз - блок должен быть в верхней части экрана
    if (direction === 'down') {
      return (
        blockTop < windowHeight * 0.8 && 
        blockBottom > windowHeight * 0.2
      );
    }
    
    // Для скролла вверх - блок должен быть в центральной/нижней части экрана
    if (direction === 'up') {
      return (
        blockTop < windowHeight * 0.4 && 
        blockBottom > windowHeight * 0.1
      );
    }
    
    return false;
  }, []);

  // Основная анимация скролла
  useEffect(() => {
    const updateAnimation = () => {
      if (!wrapperRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateAnimation);
        return;
      }

      const wrapper = wrapperRef.current;
      const rect = wrapper.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const currentScrollY = window.scrollY;
      
      // Определяем направление скролла
      if (currentScrollY > lastScrollYRef.current) {
        lastScrollDirectionRef.current = 'down';
      } else if (currentScrollY < lastScrollYRef.current) {
        lastScrollDirectionRef.current = 'up';
      }
      lastScrollYRef.current = currentScrollY;

      // Проверяем, находится ли блок в правильной позиции на экране
      const isInView = isBlockInView(rect, windowHeight, lastScrollDirectionRef.current);
      
      // Активируем/деактивируем блок в зависимости от видимости
      if (isInView) {
        setIsBlockActive(true);
        wasActiveRef.current = true;
      } else {
        setIsBlockActive(false);
        
        // Если блок был активен, но вышел из зоны видимости, сбрасываем все
        if (wasActiveRef.current) {
          setActiveSection(0);
          setSection1Visible(false);
          setSection2Visible(false);
          setSectionTransitioning(false);
          
          const resetWordStates = {};
          const currentSections = isMobile ? mobileSections : sections;
          currentSections.forEach((section, sectionIdx) => {
            section.lines.forEach((line, lineIdx) => {
              line.forEach((_, wordIdx) => {
                const key = getWordKey(sectionIdx, lineIdx, wordIdx);
                resetWordStates[key] = false;
              });
            });
          });
          setWordStates(resetWordStates);
          lastWordStatesRef.current = resetWordStates;
          currentProgressRef.current = 0;
          targetProgressRef.current = 0;
          isAnimatingRef.current = false;
          lastActiveSectionRef.current = 0;
        }
        
        animationFrameRef.current = requestAnimationFrame(updateAnimation);
        return;
      }

      // Вычисляем прогресс скролла внутри блока (только когда блок активен)
      let rawProgress = 0;
      
      // Для скролла вниз - начинаем анимацию раньше
      if (lastScrollDirectionRef.current === 'down') {
        if (rect.top < windowHeight * 0.8) {
          const scrolled = Math.abs(rect.top - windowHeight * 0.8);
          const maxScroll = rect.height - windowHeight * 0.2;
          if (maxScroll > 0) {
            rawProgress = Math.min(1, scrolled / maxScroll);
          }
        }
      } 
      // Для скролла вверх - начинаем анимацию позже
      else {
        if (rect.top <= 0) {
          const scrolled = Math.abs(rect.top);
          const maxScroll = rect.height - windowHeight;
          if (maxScroll > 0) {
            rawProgress = Math.min(1, scrolled / maxScroll);
          }
        }
      }

      // Устанавливаем цель для плавной анимации
      targetProgressRef.current = rawProgress;
      
      // Запускаем анимацию если нужно
      if (!isAnimatingRef.current) {
        animationStartTimeRef.current = performance.now();
        isAnimatingRef.current = true;
      }
      
      // Получаем плавный прогресс
      const progress = smoothProgress(targetProgressRef.current);
      
      const currentSections = isMobile ? mobileSections : sections;
      const newWordStates = { ...lastWordStatesRef.current };
      let needsUpdate = false;
      
      // ОПРЕДЕЛЯЕМ ТЕКУЩУЮ СЕКЦИЮ
      let targetSection = 0;
      if (progress < 0.5) {
        targetSection = 0;
      } else {
        targetSection = 1;
      }
      
      // ПРОВЕРЯЕМ, ИЗМЕНИЛАСЬ ЛИ СЕКЦИЯ
      const sectionChanged = targetSection !== lastActiveSectionRef.current;
      
      // ЕСЛИ СЕКЦИЯ ИЗМЕНИЛАСЬ - ЗАПУСКАЕМ ПЕРЕХОД
      if (sectionChanged && !sectionTransitioning) {
        setSectionTransitioning(true);
        
        // Быстро скрываем все слова перед сменой секции
        const hideAllWords = {};
        Object.keys(newWordStates).forEach(key => {
          hideAllWords[key] = false;
        });
        setWordStates(hideAllWords);
        lastWordStatesRef.current = hideAllWords;
        
        // Устанавливаем таймер для завершения перехода
        setTimeout(() => {
          setSectionTransitioning(false);
          lastActiveSectionRef.current = targetSection;
        }, 100); // Задержка для скрытия слов перед показом новой секции
      }
      
      // ОБНОВЛЯЕМ ВИДИМОСТЬ СЕКЦИЙ
      if (targetSection === 0) {
        setSection1Visible(true);
        setSection2Visible(false);
      } else {
        setSection1Visible(false);
        setSection2Visible(true);
      }
      setActiveSection(targetSection);
      
      // ЕСЛИ ИДЕТ ПЕРЕХОД - НЕ ОБНОВЛЯЕМ СЛОВА
      if (sectionTransitioning) {
        animationFrameRef.current = requestAnimationFrame(updateAnimation);
        return;
      }
      
      // РАЗНАЯ ЛОГИКА ДЛЯ МОБИЛЬНОЙ И ДЕСКТОПНОЙ ВЕРСИЙ
      
      // ДЕСКТОПНАЯ ВЕРСИЯ (включая планшеты)
      if (!isMobile) {
        // Первая секция
        const section1Data = sections[0];
        const totalWords1 = section1Data.lines.flat().length;
        let wordsToActivate1 = 0;
        
        // Вторая секция
        const section2Data = sections[1];
        const totalWords2 = section2Data.lines.flat().length;
        let wordsToActivate2 = 0;
        
        if (targetSection === 0) {
          // Активация слов для первой секции
          if (progress < 0.4) {
            let section1Progress = progress / 0.4;
            wordsToActivate1 = Math.min(
              totalWords1,
              Math.floor(section1Progress * totalWords1 * 1.5)
            );
          } else if (progress < 0.5) {
            // 40-50%: плавное скрытие при приближении к смене секции
            let hideProgress = (progress - 0.4) / 0.1;
            wordsToActivate1 = Math.max(
              0,
              Math.floor((1 - hideProgress) * totalWords1)
            );
          }
          
          // Применяем состояния для первой секции
          let wordIndex1 = 0;
          section1Data.lines.forEach((line, lineIdx) => {
            line.forEach((_, wordIdx) => {
              const key = getWordKey(0, lineIdx, wordIdx);
              const shouldBeActive = (wordIndex1 < wordsToActivate1);
              if (newWordStates[key] !== shouldBeActive) {
                newWordStates[key] = shouldBeActive;
                needsUpdate = true;
              }
              wordIndex1++;
            });
          });
        } else {
          // Активация слов для второй секции
          let adjustedProgress = (progress - 0.5) / 0.5; // Приводим к диапазону 0-1 для второй секции
          
          if (adjustedProgress < 0.5) {
            wordsToActivate2 = Math.min(
              totalWords2,
              Math.floor(adjustedProgress * 2 * totalWords2)
            );
          } else if (adjustedProgress < 0.9) {
            // 50-90% прогресса во второй секции: полная видимость
            wordsToActivate2 = totalWords2;
          } else {
            // 90-100%: плавное скрытие
            let fadeOutProgress = 1 - ((adjustedProgress - 0.9) / 0.1);
            wordsToActivate2 = Math.max(
              0,
              Math.floor(fadeOutProgress * totalWords2)
            );
          }
          
          // Применяем состояния для второй секции
          let wordIndex2 = 0;
          section2Data.lines.forEach((line, lineIdx) => {
            line.forEach((_, wordIdx) => {
              const key = getWordKey(1, lineIdx, wordIdx);
              const shouldBeActive = (wordIndex2 < wordsToActivate2);
              if (newWordStates[key] !== shouldBeActive) {
                newWordStates[key] = shouldBeActive;
                needsUpdate = true;
              }
              wordIndex2++;
            });
          });
        }
      } 
      // МОБИЛЬНАЯ ВЕРСИЯ (только телефоны)
      else {
        // Первая секция
        const section1Data = mobileSections[0];
        const totalWords1 = section1Data.lines.flat().length;
        let wordsToActivate1 = 0;
        
        // Вторая секция
        const section2Data = mobileSections[1];
        const totalWords2 = section2Data.lines.flat().length;
        let wordsToActivate2 = 0;
        
        if (targetSection === 0) {
          // Активация слов для первой секции (телефон)
          if (progress < 0.5) {
            let section1Progress = progress / 0.5;
            wordsToActivate1 = Math.min(
              totalWords1,
              Math.floor(section1Progress * totalWords1 * 1.2)
            );
          }
          
          // Применяем состояния для первой секции
          let wordIndex1 = 0;
          section1Data.lines.forEach((line, lineIdx) => {
            line.forEach((_, wordIdx) => {
              const key = getWordKey(0, lineIdx, wordIdx);
              const shouldBeActive = (wordIndex1 < wordsToActivate1);
              if (newWordStates[key] !== shouldBeActive) {
                newWordStates[key] = shouldBeActive;
                needsUpdate = true;
              }
              wordIndex1++;
            });
          });
        } else {
          // Активация слов для второй секции (телефон)
          let adjustedProgress = (progress - 0.5) / 0.5;
          
          if (adjustedProgress < 0.6) {
            wordsToActivate2 = Math.min(
              totalWords2,
              Math.floor(adjustedProgress * 1.5 * totalWords2)
            );
          } else if (adjustedProgress < 0.9) {
            // 60-90%: полная видимость
            wordsToActivate2 = totalWords2;
          } else {
            // 90-100%: плавное скрытие
            let fadeOutProgress = 1 - ((adjustedProgress - 0.9) / 0.1);
            wordsToActivate2 = Math.max(
              0,
              Math.floor(fadeOutProgress * totalWords2)
            );
          }
          
          // Применяем состояния для второй секции
          let wordIndex2 = 0;
          section2Data.lines.forEach((line, lineIdx) => {
            line.forEach((_, wordIdx) => {
              const key = getWordKey(1, lineIdx, wordIdx);
              const shouldBeActive = (wordIndex2 < wordsToActivate2);
              if (newWordStates[key] !== shouldBeActive) {
                newWordStates[key] = shouldBeActive;
                needsUpdate = true;
              }
              wordIndex2++;
            });
          });
        }
      }

      if (needsUpdate) {
        setWordStates(newWordStates);
        lastWordStatesRef.current = newWordStates;
      }

      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    };

    animationFrameRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMobile, smoothProgress, isBlockInView, sectionTransitioning]);

  // Рендер десктопной секции
  const renderDesktopSection = (sectionIdx) => {
    const section = sections[sectionIdx];
    const isVisible = sectionIdx === 0 ? section1Visible : section2Visible;
    const isTransitioning = sectionTransitioning && isVisible;

    return (
      <div
        key={`desktop-section-${sectionIdx}`}
        className={`desktop-section ${isVisible ? 'visible' : ''} ${isTransitioning ? 'section-pre-hide' : ''}`}
        data-section-index={sectionIdx}
      >
        <div className="desktop-section-content">
          {section.lines.map((line, lineIdx) => (
            <div key={`desktop-line-${lineIdx}`} className="desktop-line">
              {line.map((word, wordIdx) => {
                const key = getWordKey(sectionIdx, lineIdx, wordIdx);
                const isWordActive = wordStates[key] || false;

                return (
                  <React.Fragment key={`desktop-word-${key}`}>
                    <span
                      className={`desktop-word ${isWordActive ? 'active' : ''}`}
                      style={{
                        transitionDelay: `${(lineIdx * line.length + wordIdx) * 0.02}s`,
                      }}
                    >
                      {word}
                    </span>

                    {wordIdx < line.length - 1 && (
                      <span className="desktop-word-space"> </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Рендер мобильной секции
  const renderMobileSection = (sectionIdx) => {
    const section = mobileSections[sectionIdx];
    const isVisible = sectionIdx === 0 ? section1Visible : section2Visible;
    const isTransitioning = sectionTransitioning && isVisible;

    return (
      <div
        key={`mobile-section-${sectionIdx}`}
        className={`mobile-section ${isVisible ? 'visible' : ''} ${isTransitioning ? 'section-pre-hide' : ''}`}
        data-section-index={sectionIdx}
      >
        <div className="mobile-section-content">
          {section.lines.map((line, lineIdx) => (
            <div key={`mobile-line-${lineIdx}`} className="mobile-line">
              {line.map((word, wordIdx) => {
                const key = getWordKey(sectionIdx, lineIdx, wordIdx);
                const isWordActive = wordStates[key] || false;

                return (
                  <React.Fragment key={`mobile-word-${key}`}>
                    <span
                      className={`mobile-word ${isWordActive ? 'active' : ''}`}
                      style={{
                        transitionDelay: `${(lineIdx * line.length + wordIdx) * 0.03}s`,
                      }}
                    >
                      {word}
                    </span>

                    {wordIdx < line.length - 1 && (
                      <span className="mobile-word-space"> </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="scroll-text-animation-wrapper" ref={wrapperRef}>
      <div className={`scroll-text-fixed-container ${isBlockActive ? 'active' : ''}`} ref={containerRef}>
        <div className="viewport-limiter">
          <div className="scroll-text-content">
            {/* Десктопная версия */}
            {!isMobile && (
              <div className="desktop-sections-container">
                {sections.map((_, idx) => renderDesktopSection(idx))}
              </div>
            )}

            {/* Мобильная версия */}
            {isMobile && (
              <div className="mobile-sections-container">
                {mobileSections.map((_, idx) => renderMobileSection(idx))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollTextAnimation;