import React, { useState, useEffect, useRef } from "react";
import "./ThirdScrollBlock.css";

const ThirdScrollBlock = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const sectionRef = useRef(null);

  const title = "WE DO";
  const items = [
    "COMMERCIAL VIDEO",
    "HYPE & MARKETING", 
    "BRANDING",
    "EVENTS / LAUNCHES",
    "CELEBRITY APPEARANCES",
    "3D"
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Проверяем, мобильное ли устройство
      const isMobile = window.innerWidth <= 768;

      let isInView;

      if (isMobile) {
        // Для мобильных: анимация запускается, когда нижняя часть экрана
        // пересекает верхнюю часть блока
        // windowHeight - это нижняя часть экрана
        // rect.top - это позиция верха блока относительно верха экрана
        // Если нижняя часть экрана (windowHeight) > позиции верха блока (rect.top)
        // значит нижняя часть экрана пересекла верхнюю часть блока
        isInView = windowHeight > rect.top;
        
        // Также добавляем проверку, что блок еще не ушел за верх экрана
        // чтобы анимация не срабатывала при скролле вверх, когда блок уже ушел
        isInView = isInView && rect.bottom > 0;
      } else {
        // Для десктопов: оригинальная логика - блок в центре экрана
        isInView = rect.top < windowHeight * 0.6 && rect.bottom > windowHeight * 0.4;
      }

      if (isInView) {
        setIsVisible(true);
      } else {
        // Скрываем анимацию только на десктопах при скролле вверх
        // На мобильных оставляем видимым, чтобы анимация не сбрасывалась
        if (!isMobile) {
          setIsVisible(false);
        }
      }
    };

    const handleScrollThrottled = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", handleScrollThrottled, { passive: true });
    window.addEventListener("resize", handleScrollThrottled);

    // Проверяем сразу при загрузке
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScrollThrottled);
      window.removeEventListener("resize", handleScrollThrottled);
    };
  }, []);

  // Функция для рендеринга текста с пробелами
  const renderTextWithSpaces = (text, getLetterDelay, type = "item", itemIndex = 0) => {
    const letters = [];
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const key = `${type}-${itemIndex}-${i}`;
      
      if (char === " ") {
        letters.push(
          <span key={key} className="text-space">
            &nbsp;
          </span>
        );
      } else if (char === "&") {
        letters.push(
          <span
            key={key}
            className="text-letter item-letter"
            style={{
              opacity: isVisible ? 1 : 0,
              transitionDelay: `${getLetterDelay(itemIndex, i, isVisible)}ms`,
              fontStyle: 'normal'
            }}
          >
            {char}
          </span>
        );
      } else if (char === "/") {
        letters.push(
          <span
            key={key}
            className="text-letter item-letter"
            style={{
              opacity: isVisible ? 1 : 0,
              transitionDelay: `${getLetterDelay(itemIndex, i, isVisible)}ms`,
              fontStyle: 'normal'
            }}
          >
            {char}
          </span>
        );
      } else {
        letters.push(
          <span
            key={key}
            className="text-letter item-letter"
            style={{
              opacity: isVisible ? 1 : 0,
              transitionDelay: `${getLetterDelay(itemIndex, i, isVisible)}ms`
            }}
          >
            {char}
          </span>
        );
      }
    }
    
    return letters;
  };

  const getTitleLetterDelay = (index, isAppearing, wordIndex = 0) => {
    if (!isAppearing) return 0;
    const letterIndex = wordIndex === 0 ? index : index + 3;
    return letterIndex * 100;
  };

  const getItemLetterDelay = (itemIndex, letterIndex, isAppearing) => {
    if (!isAppearing) return 0;
    return itemIndex * 200 + letterIndex * 20;
  };

  const getButtonLetterDelay = (index, isAppearing) => {
    if (!isAppearing) return 0;
    return index * 40 + 1000;
  };

  const getItemDelay = (index, isAppearing) => {
    if (!isAppearing) return 0;
    return index * 200 + 400;
  };

  const getItemTransform = (isAppearing) => {
    return isAppearing ? "translateX(0)" : "translateX(-3.125em)";
  };

  const getTitleTransform = (isAppearing) => {
    return isAppearing ? "translateX(0)" : "translateX(-3.125em)";
  };

  const getButtonTransform = (isAppearing) => {
    return isAppearing ? "translateY(0)" : "translateY(1.875em)";
  };

  const getOutlineTransform = (isAppearing) => {
    return isAppearing ? "translateX(0)" : "translateX(-3.125em)";
  };

  const handleItemMouseEnter = (index) => {
    setHoveredItem(index);
  };

  const handleItemMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <section
      className={`third-scroll-section ${isVisible ? 'section-visible' : ''}`}
      ref={sectionRef}
    >
      <div className="third-scroll-container">
        {/* Левая часть - основной WE DO (заполненный) */}
        <div className="left-side">
          <div className="third-title-wrapper">
            <h2 className="third-title">
              <div className="desktop-title">
                {title.split("").map((letter, index) => (
                  <React.Fragment key={`desktop-${index}`}>
                    {letter === " " ? (
                      <span className="title-space"></span>
                    ) : (
                      <span
                        className="title-letter"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: getTitleTransform(isVisible),
                          transitionDelay: `${getTitleLetterDelay(index, isVisible)}ms`
                        }}
                      >
                        {letter}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="mobile-title">
                <span className="title-word">
                  {"WE".split("").map((letter, index) => (
                    <span
                      key={`we-${index}`}
                      className="title-letter"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: getTitleTransform(isVisible),
                        transitionDelay: `${getTitleLetterDelay(index, isVisible, 0)}ms`
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </span>
                <span className="title-word">
                  {"DO".split("").map((letter, index) => (
                    <span
                      key={`do-${index}`}
                      className="title-letter"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: getTitleTransform(isVisible),
                        transitionDelay: `${getTitleLetterDelay(index, isVisible, 1)}ms`
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </span>
              </div>
            </h2>
          </div>
        </div>

        {/* Правая часть - список и кнопка */}
        <div className="right-side">
          <div className="items-container">
            <div className="third-items-list">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="third-item"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: getItemTransform(isVisible),
                    transitionDelay: `${getItemDelay(index, isVisible)}ms`,
                    width: "100%",
                  }}
                  onMouseEnter={() => handleItemMouseEnter(index)}
                  onMouseLeave={handleItemMouseLeave}
                >
                  <span 
                    className="item-text"
                    data-text={item}
                  >
                    {renderTextWithSpaces(item, getItemLetterDelay, "item", index)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="button-container">
            <div
              className="third-button-wrapper"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: getButtonTransform(isVisible),
                transitionDelay: isVisible ? "1200ms" : "0ms"
              }}
            >
              {/* Кнопка временно скрыта */}
            </div>
          </div>
        </div>
      </div>

      {/* Контурные буквы WE и DO как фоновые элементы */}
      <div className="outline-letters-wrapper">
        {/* Контур WE слева внизу в углу - ДЕСКТОП */}
        <div className="outline-we-container desktop-outline">
          <h2 className="outline-we">
            {"WE".split("").map((letter, index) => (
              <span
                key={`outline-we-${index}`}
                className="outline-letter"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: getOutlineTransform(isVisible),
                  transitionDelay: `${index * 100 + 500}ms`
                }}
              >
                {letter}
              </span>
            ))}
          </h2>
        </div>

        {/* Контур DO справа (выступает на 33%) - ДЕСКТОП */}
        <div className="outline-do-container desktop-outline">
          <h2 className="outline-do">
            {"DO".split("").map((letter, index) => (
              <span
                key={`outline-do-${index}`}
                className="outline-letter"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: getOutlineTransform(isVisible),
                  transitionDelay: `${index * 100 + 700}ms`
                }}
              >
                {letter}
              </span>
            ))}
          </h2>
        </div>

        {/* Контур DO на уровне кнопки - МОБИЛЬНЫЙ */}
        <div className="outline-do-container mobile-outline do-above-button">
          <h2 className="outline-do">
            {"DO".split("").map((letter, index) => (
              <span
                key={`mobile-outline-do-${index}`}
                className="outline-letter"
                style={{
                  opacity: isVisible ? 0.9 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(1.25em)',
                  transitionDelay: `${index * 100 + 400}ms`,
                  transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {letter}
              </span>
            ))}
          </h2>
        </div>

        {/* Контур WE под кнопкой - МОБИЛЬНЫЙ */}
        <div className="outline-we-container mobile-outline we-below-button">
          <h2 className="outline-we">
            {"WE".split("").map((letter, index) => (
              <span
                key={`mobile-outline-we-${index}`}
                className="outline-letter"
                style={{
                  opacity: isVisible ? 0.9 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(1.25em)',
                  transitionDelay: `${index * 100 + 600}ms`,
                  transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {letter}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </section>
  );
};

export default ThirdScrollBlock;