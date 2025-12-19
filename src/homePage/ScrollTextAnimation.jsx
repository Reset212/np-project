// ScrollTextAnimation.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ТЕКСТ СЛЕДИТ ЗА ЭКРАНОМ В ПРЕДЕЛАХ БЛОКА
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ScrollTextAnimation.css";

const ScrollTextAnimation = () => {
  const [activeSection, setActiveSection] = useState(0); // Какая секция текста сейчас активна (0 - первая, 1 - вторая)
  const [wordStates, setWordStates] = useState({}); // Состояние каждого слова (видимо/невидимо)
  const [isMobile, setIsMobile] = useState(false); // Флаг мобильной версии
  const [isFixedActive, setIsFixedActive] = useState(false); // Активен ли фиксированный контейнер
  const [scrollProgress, setScrollProgress] = useState(0); // Прогресс скролла от 0 до 1
  
  const containerRef = useRef(null); // Реф на основной контейнер
  const fixedContainerRef = useRef(null); // Реф на фиксированный контейнер
  const animationFrameRef = useRef(null); // Реф для requestAnimationFrame
  
  // Рефы для оптимизации
  const lastScrollYRef = useRef(0); // Последняя позиция скролла
  const lastWordStatesRef = useRef({}); // Предыдущее состояние слов
  const isInViewRef = useRef(false); // Находится ли блок в зоне видимости
  const blockTopRef = useRef(0); // Верхняя граница блока
  const blockHeightRef = useRef(0); // Высота блока

  // Данные для текста
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

  // Генерация уникального ключа для каждого слова
  const getWordKey = useCallback((sectionIdx, lineIdx, wordIdx) =>
    `${sectionIdx}-${lineIdx}-${wordIdx}`, []);

  // Инициализация - определение мобильной версии и начальных состояний
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 480; // БРЕЙКПОИНТ ДЛЯ МОБИЛЬНОЙ ВЕРСИИ (можно изменить)
      setIsMobile(mobile);

      const initialWordStates = {};
      const currentSections = mobile ? mobileSections : sections;
      
      // Инициализация всех слов как неактивных
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
      setIsFixedActive(false);
      setActiveSection(0);
      setScrollProgress(0);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [getWordKey]);

  // ОСНОВНАЯ ЛОГИКА СЛЕЖЕНИЯ ЗА ЭКРАНОМ
  useEffect(() => {
    const updateScrollAnimation = () => {
      if (!containerRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateScrollAnimation);
        return;
      }

      const container = containerRef.current;
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Получаем позицию блока
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top + currentScrollY; // Верх блока относительно документа
      const containerHeight = container.offsetHeight; // Высота блока
      const containerBottom = containerTop + containerHeight; // Низ блока
      
      // Сохраняем для быстрого доступа
      blockTopRef.current = containerTop;
      blockHeightRef.current = containerHeight;
      
      // Проверяем, находится ли блок в видимой области экрана
      const viewportTop = currentScrollY; // Верх viewport
      const viewportBottom = currentScrollY + windowHeight; // Низ viewport
      const viewportCenter = currentScrollY + windowHeight * 0.5; // Центр viewport
      
      // Центр блока
      const containerCenter = containerTop + containerHeight * 0.5;
      const distanceToCenter = Math.abs(containerCenter - viewportCenter);
      
      // Активируем фиксированный контейнер, когда блок входит в зону видимости
      // МЕНЯЙ ЭТИ ПАРАМЕТРЫ ДЛЯ НАСТРОЙКИ АКТИВАЦИИ:
      const distanceThreshold = windowHeight * 2.5; // На каком расстоянии от центра активируется (можно изменить)
      const shouldBeActive = (
        containerTop <= viewportBottom && 
        containerBottom >= viewportTop &&
        distanceToCenter < distanceThreshold
      );
      
      // Обновляем состояние активности
      if (shouldBeActive !== isInViewRef.current) {
        setIsFixedActive(shouldBeActive);
        isInViewRef.current = shouldBeActive;
        
        // Если блок вышел из зоны видимости - сбрасываем всё
        if (!shouldBeActive) {
          setActiveSection(0);
          setScrollProgress(0);
          
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
        }
      }
      
      // Если блок не активен - выходим
      if (!shouldBeActive) {
        animationFrameRef.current = requestAnimationFrame(updateScrollAnimation);
        return;
      }
      
      // ВЫЧИСЛЯЕМ ПРОГРЕСС СКРОЛЛА ЧЕРЕЗ БЛОК
      // Прогресс от 0 (верх блока) до 1 (низ блока)
      let progress = 0;
      
      // Рассчитываем, насколько далеко мы проскроллили блок
      const relativeScroll = Math.max(0, viewportTop - containerTop);
      
      // Максимально возможный скролл через блок
      const maxScroll = Math.max(0, containerHeight - windowHeight);
      
      if (maxScroll > 0) {
        progress = Math.min(1, relativeScroll / maxScroll);
      } else {
        // Если блок меньше экрана
        progress = viewportTop >= containerTop ? 1 : 0;
      }
      
      setScrollProgress(progress);
      
      // ОПРЕДЕЛЯЕМ АКТИВНУЮ СЕКЦИЮ
      // МЕНЯЙ ЭТОТ ПАРАМЕТР ДЛЯ НАСТРОЙКИ МОМЕНТА ПЕРЕКЛЮЧЕНИЯ СЕКЦИЙ:
      const sectionSwitchPoint = 0.55; // При каком прогрессе переключаемся на вторую секцию (0-1)
      
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
      
      // Рассчитываем прогресс внутри активной секции
      let sectionProgress = 0;
      if (targetSection === 0) {
        // Прогресс внутри первой секции от 0 до 1
        sectionProgress = Math.min(1, progress / sectionSwitchPoint);
      } else {
        // Прогресс внутри второй секции от 0 до 1
        sectionProgress = Math.min(1, Math.max(0, (progress - sectionSwitchPoint) / (1 - sectionSwitchPoint)));
      }
      
      // Для каждой секции
      currentSections.forEach((section, sectionIdx) => {
        const isSectionActive = sectionIdx === targetSection;
        
        if (isSectionActive) {
          // Количество слов в секции
          const totalWords = section.lines.flat().length;
          
          // Сколько слов должно быть активно
          // МЕНЯЙ ЭТИ ПАРАМЕТРЫ ДЛЯ НАСТРОЙКИ АНИМАЦИИ СЛОВ:
          const wordAppearMultiplier = 1.55; // Множитель скорости появления слов (чем больше, тем быстрее)
          const fadeOutStartPoint = 0.9; // При каком прогрессе секции начинается исчезновение (0.9 = 90%)
          const fadeOutDuration = 0.1; // Длительность исчезновения (0.1 = 10% прогресса секции)
          
          let activeWordsCount = 0;
          
          // Разная логика для появления и исчезновения
          if (sectionProgress <= fadeOutStartPoint) {
            // Появление слов
            activeWordsCount = Math.floor(sectionProgress * totalWords * wordAppearMultiplier);
          } else {
            // Исчезновение слов
            const fadeOutProgress = (1 - sectionProgress) / fadeOutDuration;
            activeWordsCount = Math.floor(fadeOutProgress * totalWords);
          }
          
          const clampedActiveWords = Math.min(totalWords, Math.max(0, activeWordsCount));
          
          // Обновляем состояния слов
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
          // Для неактивных секций сбрасываем слова
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

    animationFrameRef.current = requestAnimationFrame(updateScrollAnimation);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeSection, isMobile, getWordKey]);

  // Рендер секции
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
                      // МЕНЯЙ ЭТОТ ПАРАМЕТР ДЛЯ НАСТРОЙКИ ЗАДЕРЖКИ МЕЖДУ СЛОВАМИ:
                      transitionDelay: `${(lineIdx * line.length + wordIdx) * 0.02}s`, // 0.02s задержка между словами
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
        {/* ФИКСИРОВАННЫЙ КОНТЕЙНЕР - СЛЕДИТ ЗА ЭКРАНОМ */}
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
        
        {/* ПУСТОЕ ПРОСТРАНСТВО ДЛЯ СКРОЛЛА
            МЕНЯЙ ВЫСОТУ ЗДЕСЬ ДЛЯ НАСТРОЙКИ ДЛИТЕЛЬНОСТИ СКРОЛЛА: */}
        <div style={{ height: '150vh' }}></div>
      </div>
    </div>
  );
};

export default ScrollTextAnimation;