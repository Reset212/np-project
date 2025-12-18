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
  
  // Рефы для плавности
  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const animationStartTimeRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const lastWordStatesRef = useRef({});

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

  // Основная анимация скролла с исправленной логикой
  useEffect(() => {
    const updateAnimation = () => {
      if (!wrapperRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateAnimation);
        return;
      }

      const wrapper = wrapperRef.current;
      const rect = wrapper.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // ПРОВЕРКА: блок должен быть полностью или частично в области видимости
      const isVisible = rect.bottom > 0 && rect.top < windowHeight;

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

      // ИСПРАВЛЕННЫЙ РАСЧЕТ ПРОГРЕССА:
      // Начинаем анимацию только когда блок полностью вошел в область видимости
      // и заканчиваем когда блок полностью вышел из области видимости сверху
      
      let rawProgress = 0;
      
      if (isMobile) {
        // Для мобильной версии: 
        // 0% - когда нижняя граница блока на уровне нижней границы окна (только появился)
        // 100% - когда верхняя граница блока на уровне верхней границы окна (полностью проскроллен)
        
        // Вычисляем видимую часть блока
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(windowHeight, rect.bottom);
        const visibleHeight = visibleBottom - visibleTop;
        
        // Вычисляем насколько блок "вошел" в окно
        // Когда нижняя граница блока касается нижней границы окна - начало анимации
        const distanceFromBottom = windowHeight - rect.bottom;
        
        if (distanceFromBottom <= 0) {
          // Блок уже полностью вошел в окно
          // Вычисляем насколько он проскроллен
          const scrolledPast = Math.abs(Math.min(0, rect.top));
          const totalScrollable = Math.max(1, rect.height - windowHeight);
          
          if (totalScrollable > 0) {
            rawProgress = Math.min(1, scrolledPast / totalScrollable);
          } else {
            // Если блок меньше окна
            rawProgress = Math.min(1, Math.max(0, (windowHeight - rect.top) / windowHeight));
          }
        } else {
          // Блок еще не полностью вошел в окно - прогресс = 0
          rawProgress = 0;
        }
      } else {
        // Десктопная версия
        if (rect.top <= 0) {
          const scrolled = Math.abs(rect.top);
          const maxScroll = rect.height - windowHeight;
          if (maxScroll > 0) {
            rawProgress = Math.min(1, scrolled / maxScroll);
          }
        }
      }

      // Устанавливаем цель для плавной анимации
      targetProgressRef.current = Math.min(1, Math.max(0, rawProgress));
      
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
      
      // УПРОЩЕННАЯ И БОЛЕЕ ЧЕТКАЯ ЛОГИКА СЕКЦИЙ
      
      if (!isMobile) {
        // Десктопная версия
        if (progress < 0.5) {
          setSection1Visible(true);
          setSection2Visible(false);
          setActiveSection(0);
        } else {
          setSection1Visible(false);
          setSection2Visible(true);
          setActiveSection(1);
        }
        
        // Логика активации слов для десктопа
        const section1Data = sections[0];
        const totalWords1 = section1Data.lines.flat().length;
        let wordsToActivate1 = 0;
        
        const section2Data = sections[1];
        const totalWords2 = section2Data.lines.flat().length;
        let wordsToActivate2 = 0;
        
        if (progress < 0.4) {
          let section1Progress = progress / 0.4;
          wordsToActivate1 = Math.min(
            totalWords1,
            Math.floor(section1Progress * totalWords1 * 1.5)
          );
        } else if (progress < 0.5) {
          let hideProgress = (progress - 0.4) / 0.1;
          wordsToActivate1 = Math.max(
            0,
            Math.floor((1 - hideProgress) * totalWords1)
          );
        }
        
        if (progress >= 0.5 && progress < 0.75) {
          let section2Progress = (progress - 0.5) / 0.25;
          wordsToActivate2 = Math.min(
            totalWords2,
            Math.floor(section2Progress * totalWords2 * 1.5)
          );
        } else if (progress >= 0.75 && progress < 0.85) {
          wordsToActivate2 = totalWords2;
        } else if (progress >= 0.85) {
          let fadeOutProgress = 1 - ((progress - 0.85) / 0.15);
          wordsToActivate2 = Math.max(
            0,
            Math.floor(fadeOutProgress * totalWords2)
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
      } else {
        // МОБИЛЬНАЯ ВЕРСИЯ - БОЛЕЕ ПРОСТАЯ И ПРЕДСКАЗУЕМАЯ ЛОГИКА
        // Первая секция: 0-50%, Вторая секция: 50-100%
        
        if (progress < 0.5) {
          // Первая секция
          setSection1Visible(true);
          setSection2Visible(false);
          setActiveSection(0);
        } else {
          // Вторая секция
          setSection1Visible(false);
          setSection2Visible(true);
          setActiveSection(1);
        }
        
        // Первая секция
        const section1Data = mobileSections[0];
        const totalWords1 = section1Data.lines.flat().length;
        let wordsToActivate1 = 0;
        
        // Вторая секция
        const section2Data = mobileSections[1];
        const totalWords2 = section2Data.lines.flat().length;
        let wordsToActivate2 = 0;
        
        // Первая секция: 0-40% появление, 40-50% исчезновение
        if (progress < 0.4) {
          let section1Progress = progress / 0.4;
          wordsToActivate1 = Math.min(
            totalWords1,
            Math.floor(section1Progress * totalWords1)
          );
        } else if (progress < 0.5) {
          let hideProgress = (progress - 0.4) / 0.1;
          wordsToActivate1 = Math.max(
            0,
            Math.floor((1 - hideProgress) * totalWords1)
          );
        }
        
        // Вторая секция: 50-80% появление, 80-95% держим, 95-100% исчезновение
        if (progress >= 0.5 && progress < 0.8) {
          let section2Progress = (progress - 0.5) / 0.3;
          wordsToActivate2 = Math.min(
            totalWords2,
            Math.floor(section2Progress * totalWords2)
          );
        } else if (progress >= 0.8 && progress < 0.95) {
          wordsToActivate2 = totalWords2;
        } else if (progress >= 0.95) {
          let fadeOutProgress = 1 - ((progress - 0.95) / 0.05);
          wordsToActivate2 = Math.max(
            0,
            Math.floor(fadeOutProgress * totalWords2)
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
  }, [isMobile, section1Visible, section2Visible, smoothProgress]);

  // Рендер десктопной секции
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
                        transitionDelay: `${(lineIdx * line.length + wordIdx) * 0.03}s`,
                        transition: isWordActive 
                          ? 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                          : 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
          {!isMobile && (
            <div className="desktop-sections-container">
              {sections.map((_, idx) => renderDesktopSection(idx))}
            </div>
          )}

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