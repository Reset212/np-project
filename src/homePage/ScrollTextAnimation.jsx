import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ScrollTextAnimation.css";

const ScrollTextAnimation = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [wordStates, setWordStates] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [section1Visible, setSection1Visible] = useState(false);
  const [section2Visible, setSection2Visible] = useState(false);
  const wrapperRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const directionRef = useRef('down');
  
  // Новые рефы для плавности
  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const animationStartTimeRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const lastWordStatesRef = useRef({});

  // Данные для текста - ДЕСКТОП (центрированные как в первом примере)
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
    
    // Используем более плавную кривую для медленного скролла
    const smoothingFactor = Math.min(elapsed / 300, 1); // Увеличиваем время сглаживания
    const easedFactor = 1 - Math.pow(1 - smoothingFactor, 3); // Кубическое замедление
    
    currentProgressRef.current = lerp(currentProgressRef.current, targetProgress, easedFactor * 0.15); // Медленнее
    
    // Если мы близко к цели, заканчиваем анимацию
    if (Math.abs(currentProgressRef.current - targetProgress) < 0.001) {
      currentProgressRef.current = targetProgress;
      isAnimatingRef.current = false;
    } else {
      isAnimatingRef.current = true;
    }
    
    return currentProgressRef.current;
  }, [lerp]);

  // Определение мобильного устройства с планшетной адаптацией
  useEffect(() => {
    const checkMobile = () => {
      // Мобильной считаем только до 480px, как во втором примере
      const mobile = window.innerWidth <= 480;
      setIsMobile(mobile);

      // Инициализация состояний слов
      const initialWordStates = {};
      if (mobile) {
        mobileSections.forEach((section, sectionIdx) => {
          section.lines.forEach((line, lineIdx) => {
            line.forEach((_, wordIdx) => {
              const key = getWordKey(sectionIdx, lineIdx, wordIdx);
              initialWordStates[key] = false;
            });
          });
        });
      } else {
        sections.forEach((section, sectionIdx) => {
          section.lines.forEach((line, lineIdx) => {
            line.forEach((_, wordIdx) => {
              const key = getWordKey(sectionIdx, lineIdx, wordIdx);
              initialWordStates[key] = false;
            });
          });
        });
      }
      
      setWordStates(initialWordStates);
      lastWordStatesRef.current = initialWordStates;
      setActiveSection(0);
      setSection1Visible(false);
      setSection2Visible(false);
      currentProgressRef.current = 0;
      targetProgressRef.current = 0;
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

  // Анимация скролла с поддержкой планшетной адаптивности
  useEffect(() => {
    const updateAnimation = () => {
      if (!wrapperRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateAnimation);
        return;
      }

      const wrapper = wrapperRef.current;
      const rect = wrapper.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      // Определяем направление скролла
      const isScrollingDown = scrollY > lastScrollYRef.current;
      directionRef.current = isScrollingDown ? 'down' : 'up';
      lastScrollYRef.current = scrollY;
      
      // Проверяем, виден ли блок
      const isVisible = rect.top < windowHeight && rect.bottom > 0;

      if (!isVisible) {
        // Если блок не виден, скрываем всё
        if (section1Visible || section2Visible) {
          setActiveSection(0);
          setSection1Visible(false);
          setSection2Visible(false);
          
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
        }
        
        animationFrameRef.current = requestAnimationFrame(updateAnimation);
        return;
      }

      // Вычисляем прогресс скролла внутри блока
      let rawProgress = 0;
      if (rect.top <= 0) {
        const scrolled = Math.abs(rect.top);
        const maxScroll = rect.height - windowHeight;
        if (maxScroll > 0) {
          rawProgress = Math.min(1, scrolled / maxScroll);
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
      
      // Инвертируем прогресс при скролле вверх
      let effectiveProgress = progress;
      if (directionRef.current === 'up') {
        effectiveProgress = 1 - progress;
      }

      // ЛОГИКА ДЛЯ ДЕСКТОПНОЙ ВЕРСИИ (включая планшеты до 480px)
      if (!isMobile) {
        // Управление видимостью секций - с учетом направления
        if (directionRef.current === 'down') {
          // СКРОЛЛ ВНИЗ
          if (progress < 0.45) {
            setSection1Visible(true);
            setSection2Visible(false);
            setActiveSection(0);
          } else if (progress < 0.55) {
            setSection1Visible(false);
            setSection2Visible(true);
            setActiveSection(1);
          } else if (progress < 0.85) {
            setSection1Visible(false);
            setSection2Visible(true);
            setActiveSection(1);
          } else {
            setSection1Visible(false);
            setSection2Visible(true);
            setActiveSection(1);
          }
        } else {
          // СКРОЛЛ ВВЕРХ - ИНВЕРТИРОВАННАЯ ЛОГИКА
          if (effectiveProgress < 0.45) {
            setSection1Visible(false);
            setSection2Visible(true);
            setActiveSection(1);
          } else if (effectiveProgress < 0.55) {
            setSection1Visible(true);
            setSection2Visible(false);
            setActiveSection(0);
          } else if (effectiveProgress < 0.85) {
            setSection1Visible(true);
            setSection2Visible(false);
            setActiveSection(0);
          } else {
            setSection1Visible(true);
            setSection2Visible(false);
            setActiveSection(0);
          }
        }

        // Обновляем состояния слов для ОБЕИХ секций
        const newWordStates = { ...lastWordStatesRef.current };
        let needsUpdate = false;
        
        // ПЕРВАЯ СЕКЦИЯ
        const section1Data = sections[0];
        const totalWords1 = section1Data.lines.flat().length;
        
        // ВТОРАЯ СЕКЦИЯ
        const section2Data = sections[1];
        const totalWords2 = section2Data.lines.flat().length;
        
        let wordsToActivate1 = 0;
        let wordsToActivate2 = 0;
        
        if (directionRef.current === 'down') {
          // СКРОЛЛ ВНИЗ - ОРИГИНАЛЬНАЯ АНИМАЦИЯ
          if (progress < 0.4) {
            let section1Progress = progress / 0.4;
            wordsToActivate1 = Math.min(
              totalWords1,
              Math.floor(section1Progress * totalWords1 * 1.5)
            );
          } else {
            wordsToActivate1 = 0;
          }
          
          // Вторая секция
          if (progress > 0.45 && progress < 0.7) {
            let section2Progress = (progress - 0.45) / 0.25;
            wordsToActivate2 = Math.min(
              totalWords2,
              Math.floor(section2Progress * totalWords2 * 1.5)
            );
          } else if (progress >= 0.7 && progress < 0.85) {
            wordsToActivate2 = totalWords2;
          } else if (progress >= 0.85) {
            let fadeOutProgress = 1 - ((progress - 0.85) / 0.15);
            wordsToActivate2 = Math.max(
              0,
              Math.floor(fadeOutProgress * totalWords2)
            );
          }
        } else {
          // СКРОЛЛ ВВЕРХ - ИНВЕРТИРОВАННАЯ АНИМАЦИЯ
          if (effectiveProgress < 0.4) {
            let section2Progress = effectiveProgress / 0.4;
            wordsToActivate2 = Math.min(
              totalWords2,
              Math.floor(section2Progress * totalWords2 * 1.5)
            );
          } else {
            wordsToActivate2 = 0;
          }
          
          // Первая секция (появляется после второй при скролле вверх)
          if (effectiveProgress > 0.45 && effectiveProgress < 0.7) {
            let section1Progress = (effectiveProgress - 0.45) / 0.25;
            wordsToActivate1 = Math.min(
              totalWords1,
              Math.floor(section1Progress * totalWords1 * 1.5)
            );
          } else if (effectiveProgress >= 0.7 && effectiveProgress < 0.85) {
            wordsToActivate1 = totalWords1;
          } else if (effectiveProgress >= 0.85) {
            let fadeOutProgress = 1 - ((effectiveProgress - 0.85) / 0.15);
            wordsToActivate1 = Math.max(
              0,
              Math.floor(fadeOutProgress * totalWords1)
            );
          }
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

        if (needsUpdate) {
          setWordStates(newWordStates);
          lastWordStatesRef.current = newWordStates;
        }
      } 
      // ЛОГИКА ДЛЯ МОБИЛЬНОЙ ВЕРСИИ (только для экранов ≤ 480px)
      else {
        // Для мобильной версии - аналогичная логика с учетом направления
        if (directionRef.current === 'down') {
          if (progress < 0.45) {
            setSection1Visible(true);
            setSection2Visible(false);
            setActiveSection(0);
          } else if (progress < 0.55) {
            setSection1Visible(false);
            setSection2Visible(true);
            setActiveSection(1);
          } else if (progress < 0.85) {
            setSection1Visible(false);
            setSection2Visible(true);
            setActiveSection(1);
          } else {
            setSection1Visible(false);
            setSection2Visible(true);
            setActiveSection(1);
          }
        } else {
          // СКРОЛЛ ВВЕРХ - ИНВЕРТИРОВАННАЯ ЛОГИКА
          if (effectiveProgress < 0.45) {
            setSection1Visible(false);
            setSection2Visible(true);
            setActiveSection(1);
          } else if (effectiveProgress < 0.55) {
            setSection1Visible(true);
            setSection2Visible(false);
            setActiveSection(0);
          } else if (effectiveProgress < 0.85) {
            setSection1Visible(true);
            setSection2Visible(false);
            setActiveSection(0);
          } else {
            setSection1Visible(true);
            setSection2Visible(false);
            setActiveSection(0);
          }
        }

        // Обновляем состояния слов
        const newWordStates = { ...lastWordStatesRef.current };
        let needsUpdate = false;
        
        // Первая секция
        const section1Data = mobileSections[0];
        const totalWords1 = section1Data.lines.flat().length;
        
        // Вторая секция
        const section2Data = mobileSections[1];
        const totalWords2 = section2Data.lines.flat().length;
        
        let wordsToActivate1 = 0;
        let wordsToActivate2 = 0;
        
        if (directionRef.current === 'down') {
          // СКРОЛЛ ВНИЗ
          if (progress < 0.4) {
            let section1Progress = progress / 0.4;
            wordsToActivate1 = Math.min(
              totalWords1,
              Math.floor(section1Progress * totalWords1 * 1.8)
            );
          } else {
            wordsToActivate1 = 0;
          }
          
          if (progress > 0.45 && progress < 0.7) {
            let section2Progress = (progress - 0.45) / 0.25;
            wordsToActivate2 = Math.min(
              totalWords2,
              Math.floor(section2Progress * totalWords2 * 1.8)
            );
          } else if (progress >= 0.7 && progress < 0.85) {
            wordsToActivate2 = totalWords2;
          } else if (progress >= 0.85) {
            let fadeOutProgress = 1 - ((progress - 0.85) / 0.15);
            wordsToActivate2 = Math.max(
              0,
              Math.floor(fadeOutProgress * totalWords2)
            );
          }
        } else {
          // СКРОЛЛ ВВЕРХ
          if (effectiveProgress < 0.4) {
            let section2Progress = effectiveProgress / 0.4;
            wordsToActivate2 = Math.min(
              totalWords2,
              Math.floor(section2Progress * totalWords2 * 1.8)
            );
          } else {
            wordsToActivate2 = 0;
          }
          
          if (effectiveProgress > 0.45 && effectiveProgress < 0.7) {
            let section1Progress = (effectiveProgress - 0.45) / 0.25;
            wordsToActivate1 = Math.min(
              totalWords1,
              Math.floor(section1Progress * totalWords1 * 1.8)
            );
          } else if (effectiveProgress >= 0.7 && effectiveProgress < 0.85) {
            wordsToActivate1 = totalWords1;
          } else if (effectiveProgress >= 0.85) {
            let fadeOutProgress = 1 - ((effectiveProgress - 0.85) / 0.15);
            wordsToActivate1 = Math.max(
              0,
              Math.floor(fadeOutProgress * totalWords1)
            );
          }
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

        if (needsUpdate) {
          setWordStates(newWordStates);
          lastWordStatesRef.current = newWordStates;
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    };

    animationFrameRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMobile, section1Visible, section2Visible, smoothProgress]);

  // Рендер десктопной секции (центрированная как в первом примере)
  const renderDesktopSection = (sectionIdx) => {
    const section = sections[sectionIdx];
    const isActive = sectionIdx === activeSection;
    const isVisible = sectionIdx === 0 ? section1Visible : section2Visible;

    return (
      <div
        key={`desktop-section-${sectionIdx}`}
        className={`desktop-section ${isVisible ? 'visible' : ''} ${isActive ? 'active' : ''}`}
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
                      className={`desktop-word ${isWordActive ? 'active' : ''} ${sectionIdx === 1 ? 'section-2-word' : ''}`}
                      style={{
                        transitionDelay: `${(lineIdx * line.length + wordIdx) * 0.02}s`,
                        transition: isWordActive 
                          ? 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                          : 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
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
    const isActive = sectionIdx === activeSection;
    const isVisible = sectionIdx === 0 ? section1Visible : section2Visible;

    return (
      <div
        key={`mobile-section-${sectionIdx}`}
        className={`mobile-section ${isVisible ? 'visible' : ''} ${isActive ? 'active' : ''}`}
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
                      className={`mobile-word ${isWordActive ? 'active' : ''} ${sectionIdx === 1 ? 'mobile-word-2' : ''}`}
                      style={{
                        transitionDelay: `${(lineIdx * line.length + wordIdx) * 0.015}s`,
                        transition: isWordActive 
                          ? 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                          : 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
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
      <div className="scroll-text-fixed-container">
        <div className="scroll-text-content">
          {/* Десктопная версия (включая планшеты до 480px) */}
          {!isMobile && (
            <div className="desktop-sections-container">
              {sections.map((_, idx) => renderDesktopSection(idx))}
            </div>
          )}

          {/* Мобильная версия (только для экранов ≤ 480px) */}
          {isMobile && (
            <div className="mobile-sections-container">
              {mobileSections.map((_, idx) => renderMobileSection(idx))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrollTextAnimation;