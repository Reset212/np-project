import React, { useState, useEffect, useRef } from "react";
import "./ScrollTextAnimation.css";

const ScrollTextAnimation = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [wordStates, setWordStates] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [number1Visible, setNumber1Visible] = useState(false);
  const [number2Visible, setNumber2Visible] = useState(false);
  const [section1Visible, setSection1Visible] = useState(false);
  const [section2Visible, setSection2Visible] = useState(false);
  const wrapperRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const lastProgressRef = useRef(0);

  // Данные для текста - ДЕСКТОП
  const sections = [
    {
      lines: [
        ["WE", "BRING", "IDEAS", "TO", "LIFE", "THROUGH"],
        ["BRANDING,", "VISUALS", "AND", "HYPE"]
      ],
      number: 1
    },
    {
      lines: [
        ["EVERY", "PROJECT", "SUCCEEDS"]
      ],
      number: 2
    }
  ];

  // Данные для текста - МОБИЛЬНАЯ ВЕРСИЯ
  const mobileSections = [
    {
      number: "01",
      lines: [
        ["WE", "BRING", "IDEAS", "TO", "LIFE"],
        ["THROUGH", "BRANDING,", "VISUALS", "AND", "HYPE"]
      ]
    },
    {
      number: "02",
      lines: [
        ["EVERY", "PROJECT", "SUCCEEDS"]
      ]
    }
  ];

  const getWordKey = (sectionIdx, lineIdx, wordIdx) =>
    `${sectionIdx}-${lineIdx}-${wordIdx}`;

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 480;
      setIsMobile(mobile);

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
      setActiveSection(0);
      setNumber1Visible(false);
      setNumber2Visible(false);
      setSection1Visible(false);
      setSection2Visible(false);
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

  // ОБЩАЯ АНИМАЦИЯ ДЛЯ ВСЕХ УСТРОЙСТВ
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

      const isVisible = rect.top < windowHeight && rect.bottom > 0;

      if (!isVisible) {
        setActiveSection(0);
        setNumber1Visible(false);
        setNumber2Visible(false);
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

        animationFrameRef.current = requestAnimationFrame(updateAnimation);
        return;
      }

      // Вычисляем прогресс скролла внутри блока (ускорено)
      let progress = 0;
      if (rect.top <= 0) {
        const scrolled = Math.abs(rect.top);
        const maxScroll = rect.height - windowHeight;
        if (maxScroll > 0) {
          progress = Math.min(1, scrolled / maxScroll);
        }
      }

      const isScrollingDown = scrollY > lastScrollYRef.current;
      lastScrollYRef.current = scrollY;

      // ЛОГИКА ДЛЯ МОБИЛЬНОЙ ВЕРСИИ (ускорено)
      if (isMobile) {
        let newActiveSection = 0;
        let sectionProgress = 0;

        if (progress < 0.3) { // Уменьшено с 0.5
          newActiveSection = 0;
          sectionProgress = progress / 0.3; // Ускорено
        } else {
          newActiveSection = 1;
          sectionProgress = (progress - 0.3) / 0.7; // Ускорено
        }

        if (newActiveSection === 0) {
          if (isScrollingDown) {
            setSection1Visible(true);
            setSection2Visible(false);
          } else {
            if (sectionProgress < 0.2) { // Уменьшено с 0.3
              setSection2Visible(false);
            }
            setSection1Visible(true);
          }
        } else {
          if (isScrollingDown) {
            if (sectionProgress > 0.5) { // Уменьшено с 0.7
              setSection1Visible(false);
            }
            setSection2Visible(true);
          } else {
            setSection2Visible(true);
            setSection1Visible(false);
          }
        }

        if (newActiveSection !== activeSection) {
          setActiveSection(newActiveSection);
        }

        if (newActiveSection === 0) {
          const firstWordKey = getWordKey(0, 0, 0);
          const isFirstWordActive = wordStates[firstWordKey] || false;
          setNumber1Visible(isFirstWordActive && sectionProgress > 0.05); // Уменьшено с 0.1
          setNumber2Visible(false);
        } else {
          setNumber1Visible(false);
          const secondWordKey = getWordKey(1, 0, 0);
          const isSecondWordActive = wordStates[secondWordKey] || false;
          setNumber2Visible(isSecondWordActive && sectionProgress > 0.05); // Уменьшено с 0.1
        }

        const activeSectionData = mobileSections[newActiveSection];
        const totalWords = activeSectionData.lines.flat().length;
        const wordsToActivate = Math.min(
          totalWords,
          Math.floor(sectionProgress * totalWords * 3.5) // Увеличено с 2.5
        );

        const newWordStates = { ...wordStates };
        let wordIndex = 0;
        activeSectionData.lines.forEach((line, lineIdx) => {
          line.forEach((_, wordIdx) => {
            const key = getWordKey(newActiveSection, lineIdx, wordIdx);
            newWordStates[key] = (wordIndex < wordsToActivate);
            wordIndex++;
          });
        });

        const inactiveSectionIdx = newActiveSection === 0 ? 1 : 0;
        mobileSections[inactiveSectionIdx].lines.forEach((line, lineIdx) => {
          line.forEach((_, wordIdx) => {
            const key = getWordKey(inactiveSectionIdx, lineIdx, wordIdx);
            newWordStates[key] = false;
          });
        });

        setWordStates(newWordStates);
      }
      // ЛОГИКА ДЛЯ ДЕСКТОПНОЙ ВЕРСИИ (ускорено)
      else {
        let newActiveSection = 0;
        let sectionProgress = 0;

        if (progress < 0.4) { // Уменьшено с 0.6
          newActiveSection = 0;
          sectionProgress = progress / 0.4; // Ускорено
        } else {
          newActiveSection = 1;
          sectionProgress = (progress - 0.4) / 0.6; // Ускорено
        }

        if (newActiveSection !== activeSection) {
          setActiveSection(newActiveSection);
        }

        if (newActiveSection === 0) {
          const firstWordKey = getWordKey(0, 0, 0);
          const isFirstWordActive = wordStates[firstWordKey] || false;
          setNumber1Visible(isFirstWordActive);
          setNumber2Visible(false);
        } else {
          setNumber1Visible(false);
          const secondWordKey = getWordKey(1, 0, 0);
          const isSecondWordActive = wordStates[secondWordKey] || false;
          setNumber2Visible(isSecondWordActive);
        }

        const activeSectionData = sections[newActiveSection];
        const totalWords = activeSectionData.lines.flat().length;
        const wordsToActivate = Math.min(
          totalWords,
          Math.floor(sectionProgress * totalWords * 3.0) // Увеличено с 2.0
        );

        const newWordStates = { ...wordStates };
        let wordIndex = 0;
        activeSectionData.lines.forEach((line, lineIdx) => {
          line.forEach((_, wordIdx) => {
            const key = getWordKey(newActiveSection, lineIdx, wordIdx);
            newWordStates[key] = (wordIndex < wordsToActivate);
            wordIndex++;
          });
        });

        const inactiveSectionIdx = newActiveSection === 0 ? 1 : 0;
        sections[inactiveSectionIdx].lines.forEach((line, lineIdx) => {
          line.forEach((_, wordIdx) => {
            const key = getWordKey(inactiveSectionIdx, lineIdx, wordIdx);
            newWordStates[key] = false;
          });
        });

        setWordStates(newWordStates);
      }

      lastProgressRef.current = progress;
      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    };

    animationFrameRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMobile, activeSection, wordStates]);

  // Рендер десктопной секции
  const renderDesktopSection = (sectionIdx) => {
    const section = sections[sectionIdx];
    const isActive = sectionIdx === activeSection;

    if (sectionIdx === 1) {
      return (
        <div
          key={`section-${sectionIdx}`}
          className={`text-section ${isActive ? 'active' : ''}`}
          data-section-index={sectionIdx}
        >
          <div className="section-content-wrapper">
            <div className={`text-number number-2 ${number2Visible ? 'active' : ''}`}>
              02
            </div>

            {section.lines.map((line, lineIdx) => (
              <div key={`line-${lineIdx}`} className="text-line">
                {line.map((word, wordIdx) => {
                  const key = getWordKey(sectionIdx, lineIdx, wordIdx);
                  const isWordActive = wordStates[key] || false;

                  return (
                    <React.Fragment key={`word-${key}`}>
                      <span
                        className={`text-word ${isWordActive ? 'active' : ''}`}
                        style={{
                          transitionDelay: `${(lineIdx * line.length + wordIdx) * 0.015}s` // Уменьшено с 0.03
                        }}
                      >
                        {word}
                      </span>

                      {wordIdx < line.length - 1 && (
                        <span className="word-space"> </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        key={`section-${sectionIdx}`}
        className={`text-section ${isActive ? 'active' : ''}`}
        data-section-index={sectionIdx}
      >
        {section.lines.map((line, lineIdx) => (
          <div key={`line-${lineIdx}`} className="text-line">
            {line.map((word, wordIdx) => {
              const key = getWordKey(sectionIdx, lineIdx, wordIdx);
              const isWordActive = wordStates[key] || false;

              return (
                <React.Fragment key={`word-${key}`}>
                  <span
                    className={`text-word ${isWordActive ? 'active' : ''}`}
                    style={{
                      transitionDelay: `${(lineIdx * line.length + wordIdx) * 0.015}s` // Уменьшено с 0.03
                    }}
                  >
                    {word}
                  </span>

                  {wordIdx < line.length - 1 && (
                    <span className="word-space"> </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ))}
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
        className={`mobile-section ${isActive && isVisible ? 'active' : ''} ${isVisible ? 'visible' : ''}`}
        data-section-index={sectionIdx}
        data-scroll-direction={sectionIdx === 0 ? 'down' : 'up'}
      >
        <div className={`mobile-section-number ${sectionIdx === 0 ? 'number-1' : 'number-2'} ${(sectionIdx === 0 ? number1Visible : number2Visible) ? 'active' : ''}`}>
          {section.number}
        </div>

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
                        transitionDelay: `${(lineIdx * line.length + wordIdx) * 0.01}s` // Уменьшено с 0.02
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
            <>
              <div className={`text-number number-1 ${number1Visible ? 'active' : ''}`}>
                01
              </div>
              {sections.map((_, idx) => renderDesktopSection(idx))}
            </>
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
