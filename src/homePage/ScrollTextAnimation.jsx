import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./ScrollTextAnimation.css";

// Константы вынесены для производительности
const MOBILE_BREAKPOINT = 480;
const RESIZE_DEBOUNCE = 150;
const FRAME_RATE = 60; // 60fps
const SECTION_SWITCH_POINT = 0.55;
const FADE_OUT_START = 0.9;
const FADE_OUT_DURATION = 0.1;

// Данные секций вынесены из компонента
const SECTIONS_DATA = {
  desktop: [
    {
      lines: [
        ["WE", "BRING", "IDEAS", "TO", "LIFE", "THROUGH"],
        ["", "BRANDING,", "VISUALS", "AND", "HYPE", ""]
      ],
    },
    {
      lines: [
        ["", "", "EVERY", "PROJECT", "SUCCEEDS", "", ""]
      ],
    }
  ],
  mobile: [
    {
      lines: [
        ["WE", "BRING", "IDEAS", "TO", "LIFE"],
        ["", "THROUGH", "BRANDING,", "VISUALS", "AND", "HYPE", ""]
      ]
    },
    {
      lines: [
        ["", "", "EVERY", "PROJECT", "SUCCEEDS", "", ""]
      ]
    }
  ]
};

const ScrollTextAnimation = React.memo(() => {
  // Refs для производительности
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  
  // Refs для хранения данных, не требующих ререндера
  const stateRefs = useRef({
    isInView: false,
    isResizing: false,
    lastScrollY: 0,
    lastWordStates: {},
    blockTop: 0,
    blockHeight: 0,
    windowHeight: 0
  });

  // Состояния для ререндера
  const [activeSection, setActiveSection] = useState(0);
  const [wordStates, setWordStates] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isFixedActive, setIsFixedActive] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Мемоизированные функции
  const getWordKey = useCallback((sectionIdx, lineIdx, wordIdx) =>
    `${sectionIdx}-${lineIdx}-${wordIdx}`, []);

  // Инициализация состояний слов
  const initializeWordStates = useCallback((isMobileView) => {
    const sections = isMobileView ? SECTIONS_DATA.mobile : SECTIONS_DATA.desktop;
    const initialWordStates = {};
    
    sections.forEach((section, sectionIdx) => {
      section.lines.forEach((line, lineIdx) => {
        line.forEach((_, wordIdx) => {
          const key = getWordKey(sectionIdx, lineIdx, wordIdx);
          initialWordStates[key] = false;
        });
      });
    });
    
    setWordStates(initialWordStates);
    stateRefs.current.lastWordStates = initialWordStates;
    return initialWordStates;
  }, [getWordKey]);

  // Проверка мобильного устройства
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
    if (mobile !== isMobile) {
      setIsMobile(mobile);
      initializeWordStates(mobile);
    }
    stateRefs.current.windowHeight = window.innerHeight;
    return mobile;
  }, [isMobile, initializeWordStates]);

  // Инициализация компонента
  useEffect(() => {
    checkMobile();
    setIsReady(true);
    stateRefs.current.windowHeight = window.innerHeight;
    
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      stateRefs.current.isResizing = true;
      
      resizeTimeoutRef.current = setTimeout(() => {
        stateRefs.current.isResizing = false;
        checkMobile();
      }, RESIZE_DEBOUNCE);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [checkMobile]);

  // Основная логика анимации
  const updateScrollAnimation = useCallback(() => {
    if (!isReady || stateRefs.current.isResizing || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const currentScrollY = window.scrollY;
    const windowHeight = stateRefs.current.windowHeight;
    
    // Обновляем высоту окна
    stateRefs.current.windowHeight = window.innerHeight;
    
    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top + currentScrollY;
    const containerHeight = container.offsetHeight;
    const containerBottom = containerTop + containerHeight;
    
    stateRefs.current.blockTop = containerTop;
    stateRefs.current.blockHeight = containerHeight;
    
    const viewportTop = currentScrollY;
    const viewportBottom = currentScrollY + windowHeight;
    
    // Проверяем видимость блока
    const isVisible = (
      containerTop <= viewportBottom && 
      containerBottom >= viewportTop
    );
    
    const viewportCenter = currentScrollY + windowHeight * 0.5;
    const containerCenter = containerTop + containerHeight * 0.5;
    const distanceToCenter = Math.abs(containerCenter - viewportCenter);
    const shouldBeActive = isVisible && distanceToCenter < windowHeight * 2.5;
    
    if (shouldBeActive !== stateRefs.current.isInView) {
      setIsFixedActive(shouldBeActive);
      stateRefs.current.isInView = shouldBeActive;
      
      if (!shouldBeActive) {
        setActiveSection(0);
        setScrollProgress(0);
        initializeWordStates(isMobile);
      }
    }
    
    if (!shouldBeActive) {
      return;
    }
    
    // Вычисляем прогресс скролла
    let progress = 0;
    const relativeScroll = Math.max(0, viewportTop - containerTop);
    const maxScroll = Math.max(0, containerHeight - windowHeight);
    
    if (maxScroll > 0) {
      progress = Math.min(1, relativeScroll / maxScroll);
    } else {
      progress = viewportTop >= containerTop ? 1 : 0;
    }
    
    setScrollProgress(progress);
    
    // Определяем активную секцию
    let targetSection = 0;
    if (progress < SECTION_SWITCH_POINT) {
      targetSection = 0;
    } else {
      targetSection = 1;
    }
    
    if (targetSection !== activeSection) {
      setActiveSection(targetSection);
    }
    
    // Обновляем состояния слов
    const sections = isMobile ? SECTIONS_DATA.mobile : SECTIONS_DATA.desktop;
    const newWordStates = { ...stateRefs.current.lastWordStates };
    let needsUpdate = false;
    
    let sectionProgress = 0;
    if (targetSection === 0) {
      sectionProgress = Math.min(1, progress / SECTION_SWITCH_POINT);
    } else {
      sectionProgress = Math.min(1, Math.max(0, (progress - SECTION_SWITCH_POINT) / (1 - SECTION_SWITCH_POINT)));
    }
    
    sections.forEach((section, sectionIdx) => {
      const isSectionActive = sectionIdx === targetSection;
      
      if (isSectionActive) {
        const totalWords = section.lines.flat().length;
        const wordAppearMultiplier = 1.55;
        
        let activeWordsCount = 0;
        
        if (sectionProgress <= FADE_OUT_START) {
          activeWordsCount = Math.floor(sectionProgress * totalWords * wordAppearMultiplier);
        } else {
          const fadeOutProgress = (1 - sectionProgress) / FADE_OUT_DURATION;
          activeWordsCount = Math.floor(fadeOutProgress * totalWords);
        }
        
        const clampedActiveWords = Math.min(totalWords, Math.max(0, activeWordsCount));
        
        let wordIndex = 0;
        section.lines.forEach((line, lineIdx) => {
          line.forEach((_, wordIdx) => {
            const key = getWordKey(sectionIdx, lineIdx, wordIdx);
            const shouldBeActive = wordIndex < clampedActiveWords;
            
            if (newWordStates[key] !== shouldBeActive) {
              newWordStates[key] = shouldBeActive;
              needsUpdate = true;
            }
            
            wordIndex++;
          });
        });
      } else {
        section.lines.forEach((line, lineIdx) => {
          line.forEach((_, wordIdx) => {
            const key = getWordKey(sectionIdx, lineIdx, wordIdx);
            if (newWordStates[key] !== false) {
              newWordStates[key] = false;
              needsUpdate = true;
            }
          });
        });
      }
    });
    
    if (needsUpdate) {
      setWordStates(newWordStates);
      stateRefs.current.lastWordStates = newWordStates;
    }
    
    stateRefs.current.lastScrollY = currentScrollY;
  }, [isReady, isMobile, activeSection, initializeWordStates, getWordKey]);

  // Effect для управления анимацией
  useEffect(() => {
    if (!isReady) return;

    const startAnimation = () => {
      updateScrollAnimation();
      animationFrameRef.current = requestAnimationFrame(startAnimation);
    };

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(startAnimation);
    }
    
    // Оптимизация: снижаем частоту обновления
    const handleScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      updateScrollAnimation();
      animationFrameRef.current = requestAnimationFrame(startAnimation);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isReady, updateScrollAnimation]);

  // Мемоизированный рендер секции
  const renderSection = useCallback((sectionIdx) => {
    const sections = isMobile ? SECTIONS_DATA.mobile : SECTIONS_DATA.desktop;
    const section = sections[sectionIdx];
    const isVisible = activeSection === sectionIdx && isFixedActive;

    if (!section) return null;

    return (
      <div
        key={`section-${sectionIdx}`}
        className={`text-section-block ${isVisible ? 'active' : ''}`}
      >
        {section.lines.map((line, lineIdx) => (
          <div key={`line-${lineIdx}`} className="text-line-row">
            {line.map((word, wordIdx) => {
              const key = getWordKey(sectionIdx, lineIdx, wordIdx);
              const isWordActive = wordStates[key] || false;

              return (
                <React.Fragment key={`word-${key}`}>
                  <span
                    className={`text-word-item ${isWordActive ? 'active' : ''}`}
                    style={{
                      transitionDelay: `${(lineIdx * line.length + wordIdx) * 0.02}s`,
                    }}
                  >
                    {word}
                  </span>

                  {wordIdx < line.length - 1 && (
                    <span className="text-word-space"> </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
    );
  }, [isMobile, activeSection, isFixedActive, wordStates, getWordKey]);

  // Мемоизированный рендер всех секций
  const renderSections = useMemo(() => {
    const sections = isMobile ? SECTIONS_DATA.mobile : SECTIONS_DATA.desktop;
    return sections.map((_, idx) => renderSection(idx));
  }, [renderSection, isMobile]);

  return (
    <div className="scroll-text-container" ref={containerRef}>
      <div className="activation-zone">
        <div 
          className={`text-fixed-container ${isFixedActive ? 'active' : ''}`}
        >
          <div className="text-boundary">
            <div className={`text-content-wrapper ${isMobile ? 'mobile' : 'desktop'}`}>
              {renderSections}
            </div>
          </div>
        </div>
        
        <div style={{ height: '150vh' }}></div>
      </div>
    </div>
  );
});

ScrollTextAnimation.displayName = "ScrollTextAnimation";

export default ScrollTextAnimation;