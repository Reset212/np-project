// ScrollTextAnimation2.jsx
import React, { useState, useEffect, useRef } from "react";
import "./ScrollTextAnimation.css";

const ScrollTextAnimation2 = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsVisible(true);
            setHasAnimated(true);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "50px"
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasAnimated]);

  const firstLineWords = "Full brand packaging for real estate developers in Dubai combines strategy".split(" ");
  const secondLineWords = "marketing, events, and celebrity-driven launches to make projects visible, known, and sellable.".split(" ");

  return (
    <div className="scroll-text-container-2" ref={containerRef}>
      <div className="text-block-2">
        <div className={`text-content-2 ${isVisible ? 'visible-2' : ''}`}>
          {/* Первая строка */}
          <div className="text-line-2 first-line-2">
            {firstLineWords.map((word, index) => (
              <span
                key={`first-${index}`}
                className="text-word-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {word}
                {index < firstLineWords.length - 1 && <span className="space-2"> </span>}
              </span>
            ))}
          </div>
          
          {/* Вторая строка с отступом */}
          <div className="text-line-2 second-line-2">
            {secondLineWords.map((word, index) => (
              <span
                key={`second-${index}`}
                className="text-word-2"
                style={{ animationDelay: `${(firstLineWords.length + index) * 0.1}s` }}
              >
                {word}
                {index < secondLineWords.length - 1 && <span className="space-2"> </span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollTextAnimation2;