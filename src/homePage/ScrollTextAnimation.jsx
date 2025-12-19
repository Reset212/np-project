// ScrollTextAnimation.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ С БАГОФИКСОМ ДЛЯ ТЕЛЕФОНА
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ScrollTextAnimation.css";

const ScrollTextAnimation = () => {
  const [activeSection, setActiveSection] = useState(0); // Какая секция текста сейчас активна (0 - первая, 1 - вторая)
  const [wordStates, setWordStates] = useState({}); // Состояние каждого слова (видимо/невидимо)
  const [isMobile, setIsMobile] = useState(false); // Флаг мобильной версии
  const [isFixedActive, setIsFixedActive] = useState(false); // Активен ли фиксированный контейнер
  const [scrollProgress, setScrollProgress] = useState(0); // Прогресс скролла от 0 до 1
  const [isReady, setIsReady] = useState(false); // Флаг готовности компонента
  
  const containerRef = useRef(null); // Реф на основной контейнер
  const fixedContainerRef = useRef(null); // Реф на фиксированный контейнер
  const animationFrameRef = useRef(null); // Реф для requestAnimationFrame
  const resizeTimeoutRef = useRef(null); // Реф для таймера ресайза
  
  // Рефы для оптимизации
  const lastScrollYRef = useRef(0); // Последняя позиция скролла
  const lastWordStatesRef = useRef({}); // Предыдущее состояние слов
  const isInViewRef = useRef(false); // Находится ли блок в зоне видимости
  const blockTopRef = useRef(0); // Верхняя граница блока
  const blockHeightRef = useRef(0); // Высота блока
  const hasBeenActivatedRef = useRef(false); // Был ли блок уже активирован
  const initTimeoutRef = useRef(null); // Таймер для инициализации

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
      hasBeenActivatedRef.current = false;
    };

    // Добавляем задержку для инициализации на мобильных устройствах
    const initComponent = () => {
      checkMobile();
      
      // На телефоне даем больше времени на инициализацию DOM
      if (window.innerWidth <= 480) {
        setTimeout(() => {
          setIsReady(true);
        }, 500); // 500ms задержка для мобильных
      } else {
        setIsReady(true);
      }
    };

    initComponent();
    
    // Дебаунс для ресайза
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        checkMobile();
      }, 250);
    };

    window.addEventListener('resize', handleResize);

    // Инициализация после полной загрузки страницы
    const handleLoad = () => {
      setTimeout(() => {
        setIsReady(true);
      }, 300);
    };

    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('load', handleLoad);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [getWordKey]);

  // ОСНОВНАЯ ЛОГИКА СЛЕЖЕНИЯ ЗА ЭКРАНОМ
  useEffect(() => {
    if (!isReady) return; // Не запускаем анимацию пока компонент не готов
    
    const updateScrollAnimation = () => {
      if (!containerRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateScrollAnimation);
        return;
      }

      const container = containerRef.current;
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Получаем позицию блока - исправленная версия для мобильных
      const containerRect = container.getBoundingClientRect();
      
      // На мобильных устройствах иногда getBoundingClientRect() возвращает некорректные значения
      // после перезагрузки, поэтому используем альтернативный метод
      let containerTop, containerHeight, containerBottom;
      
      if (isMobile && !hasBeenActivatedRef.current) {
        // Для первого запуска на мобильных используем более надежный метод
        containerTop = container.offsetTop;
        containerHeight = container.offsetHeight;
        containerBottom = containerTop + containerHeight;
      } else {
        containerTop = containerRect.top + currentScrollY;
        containerHeight = container.offsetHeight;
        containerBottom = containerTop + containerHeight;
      }
      
      // Сохраняем для быстрого доступа
      blockTopRef.current = containerTop;
      blockHeightRef.current = containerHeight;
      
      // Проверяем, находится ли блок в видимой области экрана
      const viewportTop = currentScrollY;
      const viewportBottom = currentScrollY + windowHeight;
      const viewportCenter = currentScrollY + windowHeight * 0.5;
      
      // Центр блока
      const containerCenter = containerTop + containerHeight * 0.5;
      const distanceToCenter = Math.abs(containerCenter - viewportCenter);
      
      // Активируем фиксированный контейнер, когда блок входит в зону видимости
      // НАСТРОЙКА АКТИВАЦИИ - для мобильных делаем зону шире
      const distanceThreshold = isMobile ? windowHeight * 3 : windowHeight * 2.5;
      const shouldBeActive = (
        containerTop <= viewportBottom + (isMobile ? windowHeight * 0.5 : 0) && 
        containerBottom >= viewportTop - (isMobile ? windowHeight * 0.5 : 0) &&
        distanceToCenter < distanceThreshold
      );
      
      // Обновляем состояние активности
      if (shouldBeActive !== isInViewRef.current) {
        setIsFixedActive(shouldBeActive);
        isInViewRef.current = shouldBeActive;
        
        if (shouldBeActive) {
          hasBeenActivatedRef.current = true; // Помечаем, что блок был активирован
        }
        
        // Если блок вышел из зоны видимости - плавно сбрасываем всё
        if (!shouldBeActive) {
          // Задержка для плавного сброса
          setTimeout(() => {
            if (!isInViewRef.current) {
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
              setActiveSection(0);
              setScrollProgress(0);
            }
          }, isMobile ? 400 : 300);
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
      // Для мобильных добавляем буфер для более плавного начала
      const startBuffer = isMobile ? windowHeight * 0.2 : 0;
      const endBuffer = isMobile ? windowHeight * 0.2 : 0;
      
      const relativeScroll = Math.max(0, viewportTop - (containerTop - startBuffer));
      
      // Максимально возможный скролл через блок
      const maxScroll = Math.max(0, (containerHeight + startBuffer + endBuffer) - windowHeight);
      
      if (maxScroll > 0) {
        progress = Math.min(1, Math.max(0, relativeScroll / maxScroll));
      } else {
        // Если блок меньше экрана
        progress = viewportTop >= containerTop ? 1 : 0;
      }
      
      setScrollProgress(progress);
      
      // ОПРЕДЕЛЯЕМ АКТИВНУЮ СЕКЦИЮ
      // МЕНЯЙ ЭТОТ ПАРАМЕТР ДЛЯ НАСТРОЙКИ МОМЕНТА ПЕРЕКЛЮЧЕНИЯ СЕКЦИЙ:
      // Для мобильных делаем переключение позже
      const sectionSwitchPoint = isMobile ? 0.65 : 0.55;
      
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
        sectionProgress = Math.min(1, Math.max(0, progress / sectionSwitchPoint));
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
          // Для мобильных делаем более плавное появление
          const wordAppearMultiplier = isMobile ? 1.8 : 1.55;
          const fadeOutStartPoint = isMobile ? 0.95 : 0.9;
          const fadeOutDuration = isMobile ? 0.05 : 0.1;
          
          let activeWordsCount = 0;
          
          // Разная логика для появления и исчезновения
          if (sectionProgress <= fadeOutStartPoint) {
            // Появление слов с плавным началом
            const easedProgress = Math.pow(sectionProgress, isMobile ? 0.7 : 0.8);
            activeWordsCount = Math.floor(easedProgress * totalWords * wordAppearMultiplier);
          } else {
            // Исчезновение слов
            const fadeOutProgress = (1 - sectionProgress) / fadeOutDuration;
            activeWordsCount = Math.floor(fadeOutProgress * totalWords * (isMobile ? 0.7 : 1));
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
  }, [isReady, activeSection, isMobile, getWordKey]);

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
        style={{
          // Меняем transition для мобильных для более плавной анимации
          transition: isMobile ? 
            'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s cubic-bezier(0.4, 0, 0.2, 1)' :
            'opacity 0.4s ease, visibility 0.4s ease'
        }}
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
                      // Для мобильных делаем задержку больше
                      transitionDelay: isMobile ? 
                        `${(lineIdx * line.length + wordIdx) * 0.03}s` : 
                        `${(lineIdx * line.length + wordIdx) * 0.02}s`,
                      transitionDuration: isMobile ? '0.6s' : '0.5s'
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

  // Если компонент еще не готов, показываем заглушку
  if (!isReady && isMobile) {
    return (
      <div className="scroll-text-container" ref={containerRef}>
        <div className="activation-zone">
          <div style={{ height: '450vh' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll-text-container" ref={containerRef}>
      <div className="activation-zone">
        {/* ФИКСИРОВАННЫЙ КОНТЕЙНЕР - СЛЕДИТ ЗА ЭКРАНОМ */}
        <div 
          className={`text-fixed-container ${isFixedActive ? 'active' : ''}`}
          ref={fixedContainerRef}
          style={{
            // Для мобильных делаем transition дольше
            transition: isMobile ? 
              'opacity 0.5s ease, visibility 0.5s ease' :
              'opacity 0.3s ease, visibility 0.3s ease'
          }}
        >
          <div className="text-boundary">
            <div className={`text-content-wrapper ${isMobile ? 'mobile' : 'desktop'}`}>
              {sections.map((_, idx) => renderSection(idx))}
            </div>
          </div>
        </div>
        
        {/* ПУСТОЕ ПРОСТРАНСТВО ДЛЯ СКРОЛЛА
            МЕНЯЙ ВЫСОТУ ЗДЕСЬ ДЛЯ НАСТРОЙКИ ДЛИТЕЛЬНОСТИ СКРОЛЛА: */}
        <div style={{ height: isMobile ? '450vh' : '150vh' }}></div>
      </div>
    </div>
  );
};

export default ScrollTextAnimation;