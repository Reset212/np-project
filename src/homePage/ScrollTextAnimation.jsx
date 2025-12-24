// ScrollTextAnimation.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ТЕКСТ СЛЕДИТ ЗА ЭКРАНОМ В ПРЕДЕЛАХ БЛОКА
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ScrollTextAnimation.css";

const ScrollTextAnimation = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [wordStates, setWordStates] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isFixedActive, setIsFixedActive] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const containerRef = useRef(null);
  const fixedContainerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  
  const lastScrollYRef = useRef(0);
  const lastWordStatesRef = useRef({});
  const isInViewRef = useRef(false);
  const blockTopRef = useRef(0);
  const blockHeightRef = useRef(0);
  const windowHeightRef = useRef(0);
  const isResizingRef = useRef(false);

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

  const getWordKey = useCallback((sectionIdx, lineIdx, wordIdx) =>
    `${sectionIdx}-${lineIdx}-${wordIdx}`, []);

  // Инициализация состояний слов
  const initializeWordStates = useCallback((isMobileView) => {
    const initialWordStates = {};
    const currentSections = isMobileView ? mobileSections : sections;
    
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
    return initialWordStates;
  }, [getWordKey]);

  // Инициализация
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 480;
      const prevMobile = isMobile;
      
      if (mobile !== prevMobile) {
        setIsMobile(mobile);
        initializeWordStates(mobile);
        
        // При изменении mobile/desktop перезапускаем анимацию
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        // Даем время на перерисовку DOM
        setTimeout(() => {
          setIsReady(true);
        }, 100);
      }
    };

    checkMobile();
    setIsReady(true);
    
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      isResizingRef.current = true;
      
      resizeTimeoutRef.current = setTimeout(() => {
        isResizingRef.current = false;
        checkMobile();
        windowHeightRef.current = window.innerHeight;
      }, 150);
    };

    windowHeightRef.current = window.innerHeight;
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [initializeWordStates, isMobile]);

  // ОСНОВНАЯ ЛОГИКА СЛЕЖЕНИЯ ЗА ЭКРАНОМ
  useEffect(() => {
    if (!isReady || isResizingRef.current || !containerRef.current) {
      return;
    }

    const updateScrollAnimation = () => {
      if (!containerRef.current || isResizingRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateScrollAnimation);
        return;
      }

      const container = containerRef.current;
      const currentScrollY = window.scrollY;
      const windowHeight = windowHeightRef.current;
      
      // Обновляем высоту окна на случай, если пропустили ресайз
      windowHeightRef.current = window.innerHeight;
      
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top + currentScrollY;
      const containerHeight = container.offsetHeight;
      const containerBottom = containerTop + containerHeight;
      
      blockTopRef.current = containerTop;
      blockHeightRef.current = containerHeight;
      
      const viewportTop = currentScrollY;
      const viewportBottom = currentScrollY + windowHeight;
      const viewportCenter = currentScrollY + windowHeight * 0.5;
      
      const containerCenter = containerTop + containerHeight * 0.5;
      const distanceToCenter = Math.abs(containerCenter - viewportCenter);
      
      // Проверяем, виден ли блок
      const isVisible = (
        containerTop <= viewportBottom && 
        containerBottom >= viewportTop
      );
      
      const shouldBeActive = isVisible && distanceToCenter < windowHeight * 2.5;
      
      if (shouldBeActive !== isInViewRef.current) {
        setIsFixedActive(shouldBeActive);
        isInViewRef.current = shouldBeActive;
        
        if (!shouldBeActive) {
          setActiveSection(0);
          setScrollProgress(0);
          initializeWordStates(isMobile);
        }
      }
      
      if (!shouldBeActive) {
        animationFrameRef.current = requestAnimationFrame(updateScrollAnimation);
        return;
      }
      
      // ВЫЧИСЛЯЕМ ПРОГРЕСС СКРОЛЛА
      let progress = 0;
      const relativeScroll = Math.max(0, viewportTop - containerTop);
      const maxScroll = Math.max(0, containerHeight - windowHeight);
      
      if (maxScroll > 0) {
        progress = Math.min(1, relativeScroll / maxScroll);
      } else {
        progress = viewportTop >= containerTop ? 1 : 0;
      }
      
      setScrollProgress(progress);
      
      // ОПРЕДЕЛЯЕМ АКТИВНУЮ СЕКЦИЮ
      const sectionSwitchPoint = 0.55;
      let targetSection = 0;
      
      if (progress < sectionSwitchPoint) {
        targetSection = 0;
      } else {
        targetSection = 1;
      }
      
      if (targetSection !== activeSection) {
        setActiveSection(targetSection);
      }
      
      // ОБНОВЛЯЕМ СОСТОЯНИЯ СЛОВ
      const currentSections = isMobile ? mobileSections : sections;
      const newWordStates = { ...lastWordStatesRef.current };
      let needsUpdate = false;
      
      let sectionProgress = 0;
      if (targetSection === 0) {
        sectionProgress = Math.min(1, progress / sectionSwitchPoint);
      } else {
        sectionProgress = Math.min(1, Math.max(0, (progress - sectionSwitchPoint) / (1 - sectionSwitchPoint)));
      }
      
      currentSections.forEach((section, sectionIdx) => {
        const isSectionActive = sectionIdx === targetSection;
        
        if (isSectionActive) {
          const totalWords = section.lines.flat().length;
          const wordAppearMultiplier = 1.55;
          const fadeOutStartPoint = 0.9;
          const fadeOutDuration = 0.1;
          
          let activeWordsCount = 0;
          
          if (sectionProgress <= fadeOutStartPoint) {
            activeWordsCount = Math.floor(sectionProgress * totalWords * wordAppearMultiplier);
          } else {
            const fadeOutProgress = (1 - sectionProgress) / fadeOutDuration;
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
        lastWordStatesRef.current = newWordStates;
      }
      
      lastScrollYRef.current = currentScrollY;
      animationFrameRef.current = requestAnimationFrame(updateScrollAnimation);
    };

    // Запускаем анимацию только если она еще не запущена
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateScrollAnimation);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [activeSection, isMobile, isReady, getWordKey, initializeWordStates]);

  const renderSection = (sectionIdx) => {
    const currentSections = isMobile ? mobileSections : sections;
    const section = currentSections[sectionIdx];
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
  };

  return (
    <div className="scroll-text-container" ref={containerRef}>
      <div className="activation-zone">
        <div 
          className={`text-fixed-container ${isFixedActive ? 'active' : ''}`}
          ref={fixedContainerRef}
        >
          <div className="text-boundary">
            <div className={`text-content-wrapper ${isMobile ? 'mobile' : 'desktop'}`}>
              {sections.map((_, idx) => renderSection(idx))}
            </div>
          </div>
        </div>
        
        <div style={{ height: '150vh' }}></div>
      </div>
    </div>
  );
};

export default ScrollTextAnimation;