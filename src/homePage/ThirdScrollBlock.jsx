import React, { useState, useEffect, useRef } from "react";
import "./ThirdScrollBlock.css";

const ThirdScrollBlock = () => {
  const [isVisible, setIsVisible] = useState(false);
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
  const buttonText = "VIEW ALL PROJECT";

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const isInView = rect.top < windowHeight * 0.6 && rect.bottom > windowHeight * 0.4;

      if (isInView) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleScrollThrottled = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", handleScrollThrottled, { passive: true });
    window.addEventListener("resize", handleScrollThrottled);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScrollThrottled);
      window.removeEventListener("resize", handleScrollThrottled);
    };
  }, []);

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
    return isAppearing ? "translateX(0)" : "translateX(-50px)";
  };

  const getTitleTransform = (isAppearing) => {
    return isAppearing ? "translateX(0)" : "translateX(-50px)";
  };

  const getButtonTransform = (isAppearing) => {
    return isAppearing ? "translateY(0)" : "translateY(30px)";
  };

  const getOutlineTransform = (isAppearing) => {
    return isAppearing ? "translateX(0)" : "translateX(-50px)";
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
                >
                  <span
                    className="item-text"
                    style={{
                      display: "block",
                    }}
                  >
                    {item.split("").map((letter, letterIndex) => (
                      <span
                        key={letterIndex}
                        className="item-letter"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transitionDelay: `${getItemLetterDelay(index, letterIndex, isVisible)}ms`,
                        }}
                      >
                        {letter}
                      </span>
                    ))}
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
              <button className="third-button">
                {buttonText.split("").map((letter, index) => (
                  <React.Fragment key={index}>
                    {letter === " " ? (
                      <span className="button-space"></span>
                    ) : (
                      <span
                        key={index}
                        className="button-letter"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transitionDelay: `${getButtonLetterDelay(index, isVisible)}ms`
                        }}
                      >
                        {letter}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </button>
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
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
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
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
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