import React, { useState, useEffect, useRef } from 'react';
import './GlobalCursor.css';

const GlobalCursor = () => {
  // ========== СОСТОЯНИЯ ==========
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState([]);
  const [showFullLogo, setShowFullLogo] = useState(true);
  const [cursorColor, setCursorColor] = useState("#000000");
  const [targetColor, setTargetColor] = useState("#000000"); // Целевой цвет для плавного перехода
  const [currentColor, setCurrentColor] = useState("#000000"); // Текущий отображаемый цвет
  
  // ========== REF-Ы ==========
  const animationRef = useRef(null);
  const cursorRef = useRef(null);
  const lastTimeRef = useRef(0);
  const isAssemblingRef = useRef(false);
  const forceCenterTimeoutRef = useRef(null);
  const cursorRotationRef = useRef(0);
  const colorCheckIntervalRef = useRef(null);
  const colorAnimationRef = useRef(null); // Ref для анимации цвета

  // ========== КОНСТАНТЫ SVG ==========
  const fullSVG = {
    viewBox: "0 0 298.49 298.49",
    paths: [
      "M140.09,61.73l7.36-4.25c1.11-.64,2.47-.64,3.57,0l50.64,29.24c1.31.76,1.51,2.57.39,3.58l-29.4,26.85c-1.05.96-2.73.7-3.44-.53l-29.95-51.84c-.62-1.07-.25-2.44.82-3.05Z",
      "M68.57,165.37v-61.05c0-.8.43-1.54,1.12-1.93l52.67-30.42c1.07-.62,2.43-.25,3.05.82l32.19,55.75c.52.91.35,2.06-.43,2.77l-47.88,43.74c-.53.49-1.27.69-1.98.53l-36.99-8.02c-1.03-.22-1.76-1.13-1.76-2.18Z",
      "M196.38,215.23l-45.38,25.78c-1.1.62-2.44.62-3.53,0l-77.77-44.21c-.7-.4,-1.13-1.14,-1.13-1.94v-8.55c0-1.42,1.31-2.48,2.71-2.18l124.47,26.97c2,.43,2.41,3.11.63,4.13Z",
      "M229.92,104.32v90.55c0,.8-.43,1.55-1.13,1.94l-5.28,3c-.76.43,-1.66.57,-2.52.39l-89.15-19.3c-1.77-.38,-2.37-2.61,-1.03-3.83l86.84-79.32c.72-.66,1.78-.77,2.62-.29l8.53,4.92c.69.4,1.12,1.14,1.12,1.94Z"
    ]
  };

  // Исходные частицы
  const initialParticles = [
    {
      id: 1,
      path: fullSVG.paths[0],
      x: 0, y: 0, scale: 1, opacity: 1, rotation: 0,
      velocityX: 0, velocityY: 0,
      isStuck: false
    },
    {
      id: 2,
      path: fullSVG.paths[1],
      x: 0, y: 0, scale: 1, opacity: 1, rotation: 0,
      velocityX: 0, velocityY: 0,
      isStuck: false
    },
    {
      id: 3,
      path: fullSVG.paths[2],
      x: 0, y: 0, scale: 1, opacity: 1, rotation: 0,
      velocityX: 0, velocityY: 0,
      isStuck: false
    },
    {
      id: 4,
      path: fullSVG.paths[3],
      x: 0, y: 0, scale: 1, opacity: 1, rotation: 0,
      velocityX: 0, velocityY: 0,
      isStuck: false
    }
  ];

  // ========== ФУНКЦИИ ДЛЯ ЦВЕТА ==========
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r, g, b) => {
    return "#" + 
      ("0" + r.toString(16)).slice(-2) +
      ("0" + g.toString(16)).slice(-2) +
      ("0" + b.toString(16)).slice(-2);
  };

  const interpolateColor = (color1, color2, factor) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
    
    return rgbToHex(r, g, b);
  };

  const getContrastColor = (bgColor) => {
    try {
      const hex = bgColor.replace('#', '');
      
      let r, g, b;
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      } else {
        return "#000000";
      }
      
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? "#000000" : "#ffffff";
    } catch (error) {
      return "#000000";
    }
  };

  const getBackgroundColorAtCursor = (x, y) => {
    try {
      const elements = document.elementsFromPoint(x, y);
      
      for (const element of elements) {
        if (element.classList && element.classList.contains('svg-cursor-container')) {
          continue;
        }
        
        const computedStyle = window.getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;
        const opacity = parseFloat(computedStyle.opacity);
        
        if (backgroundColor && 
            backgroundColor !== 'rgba(0, 0, 0, 0)' && 
            backgroundColor !== 'transparent' &&
            opacity > 0) {
          
          if (backgroundColor.startsWith('rgb')) {
            const rgb = backgroundColor.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
              const r = parseInt(rgb[0]);
              const g = parseInt(rgb[1]);
              const b = parseInt(rgb[2]);
              
              return rgbToHex(r, g, b);
            }
          } else if (backgroundColor.startsWith('#')) {
            return backgroundColor;
          }
        }
      }
      
      const bodyColor = window.getComputedStyle(document.body).backgroundColor;
      if (bodyColor.startsWith('rgb')) {
        const rgb = bodyColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const r = parseInt(rgb[0]);
          const g = parseInt(rgb[1]);
          const b = parseInt(rgb[2]);
          
          return rgbToHex(r, g, b);
        }
      }
      
      return "#ffffff";
    } catch (error) {
      return "#ffffff";
    }
  };

  const updateCursorColor = () => {
    const x = cursorPosition.x;
    const y = cursorPosition.y;
    
    try {
      const bgColor = getBackgroundColorAtCursor(x, y);
      const newTargetColor = getContrastColor(bgColor);
      
      if (newTargetColor !== targetColor) {
        setTargetColor(newTargetColor);
      }
    } catch (error) {
      if (targetColor !== "#000000") {
        setTargetColor("#000000");
      }
    }
  };

  // ========== АНИМАЦИЯ ЦВЕТА ==========
  const animateColorTransition = (timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.033);
    lastTimeRef.current = timestamp;

    // Плавный переход между текущим и целевым цветом
    if (currentColor !== targetColor) {
      const transitionSpeed = 5; // Скорость перехода (чем больше, тем быстрее)
      const factor = Math.min(1, deltaTime * transitionSpeed);
      
      const newColor = interpolateColor(currentColor, targetColor, factor);
      setCurrentColor(newColor);
      
      // Если цвета почти совпадают, устанавливаем точное значение
      if (Math.abs(factor - 1) < 0.01) {
        setCurrentColor(targetColor);
      }
    }

    colorAnimationRef.current = requestAnimationFrame(animateColorTransition);
  };

  // ========== ИНИЦИАЛИЗАЦИЯ ==========
  useEffect(() => {
    setParticles(initialParticles);
    
    // Инициализируем цвет курсора
    updateCursorColor();
    
    // Запускаем интервал для обновления цвета
    colorCheckIntervalRef.current = setInterval(updateCursorColor, 200);
    
    // Запускаем анимацию цвета
    colorAnimationRef.current = requestAnimationFrame(animateColorTransition);
    
    return () => {
      if (colorCheckIntervalRef.current) {
        clearInterval(colorCheckIntervalRef.current);
      }
      if (colorAnimationRef.current) {
        cancelAnimationFrame(colorAnimationRef.current);
      }
    };
  }, []);

  // Обновляем цвет при движении курсора
  useEffect(() => {
    updateCursorColor();
  }, [cursorPosition]);

  // Обновляем cursorColor когда currentColor меняется
  useEffect(() => {
    setCursorColor(currentColor);
  }, [currentColor]);

  // ========== ФУНКЦИЯ РАЗБРОСА ЧАСТИЦ ==========
  const scatterParticles = () => {
    setShowFullLogo(false);
    
    setParticles(prev => prev.map(part => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 800 + Math.random() * 1200;
      
      return {
        ...part,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.3,
        opacity: 0.8,
        isStuck: false
      };
    }));
  };

  // ========== ФУНКЦИЯ СБОРКИ ЧАСТИЦ ==========
  const assembleParticles = () => {
    isAssemblingRef.current = true;
    
    setParticles(prev => prev.map(part => {
      return {
        ...part,
        velocityX: part.velocityX * 0.1 - part.x * 40,
        velocityY: part.velocityY * 0.1 - part.y * 40,
        isStuck: false
      };
    }));
    
    if (forceCenterTimeoutRef.current) {
      clearTimeout(forceCenterTimeoutRef.current);
    }
    forceCenterTimeoutRef.current = setTimeout(() => {
      forceCenterParticles();
    }, 800);
  };

  // ========== ПРИНУДИТЕЛЬНОЕ ЦЕНТРИРОВАНИЕ ==========
  const forceCenterParticles = () => {
    setParticles(prev => {
      const newParticles = prev.map(part => {
        const distance = Math.sqrt(part.x * part.x + part.y * part.y);
        
        if (distance > 5 && !part.isStuck) {
          return {
            ...part,
            x: 0,
            y: 0,
            velocityX: 0,
            velocityY: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            isStuck: true
          };
        }
        return part;
      });
      
      const allCentered = newParticles.every(p => {
        const dist = Math.sqrt(p.x * p.x + p.y * p.y);
        return dist < 1;
      });
      
      if (allCentered) {
        setShowFullLogo(true);
        isAssemblingRef.current = false;
      }
      
      return newParticles;
    });
  };

  // ========== ОСНОВНОЙ ЭФФЕКТ ==========
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = (e) => {
      const target = e.target;
      
      if (!target || typeof target.closest !== 'function') {
        return;
      }
      
      const isInteractive = 
        (target.tagName && (
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA'
        )) ||
        target.getAttribute('role') === 'button' ||
        target.onclick ||
        target.hasAttribute('tabindex') ||
        target.classList.contains('cursor-hover') ||
        (target.closest && (
          target.closest('button') ||
          target.closest('a') ||
          target.closest('[role="button"]') ||
          target.closest('[onclick]')
        ));

      if (isInteractive && !isHovering) {
        setIsHovering(true);
        scatterParticles();
      }
    };

    const handleMouseLeave = () => {
      if (isHovering) {
        setIsHovering(false);
        assembleParticles();
      }
    };

    // ========== ФУНКЦИЯ АНИМАЦИИ ЧАСТИЦ ==========
    const animateParticles = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.033);
      lastTimeRef.current = timestamp;

      cursorRotationRef.current = (cursorRotationRef.current + 0.5) % 360;

      setParticles(prev => {
        let allAssembled = true;
        
        const newParticles = prev.map((part, index) => {
          let { x, y, velocityX, velocityY, scale, opacity, rotation, isStuck } = part;
          
          if (isStuck) {
            return part;
          }
          
          if (isHovering) {
            allAssembled = false;
            
            velocityX *= 0.84;
            velocityY *= 0.84;
            
            x += velocityX * deltaTime;
            y += velocityY * deltaTime;
            
            if (Math.abs(velocityX) < 100 && Math.abs(velocityY) < 100) {
              velocityX += (Math.random() - 0.5) * 80 * deltaTime;
              velocityY += (Math.random() - 0.5) * 80 * deltaTime;
            }
            
            const randomPull = 0.03;
            velocityX -= x * randomPull;
            velocityY -= y * randomPull;
            
            rotation += velocityX * 0.02 * deltaTime;
            scale = 0.8 + Math.sin(timestamp * 0.003 + index) * 0.15;
            opacity = 0.7 + Math.sin(timestamp * 0.002 + index) * 0.15;
            
          } else if (isAssemblingRef.current) {
            const dx = 0 - x;
            const dy = 0 - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0.5) {
              allAssembled = false;
              
              const magneticForce = 50 + distance * 10;
              velocityX += dx * magneticForce * deltaTime;
              velocityY += dy * magneticForce * deltaTime;
              
              velocityX *= 0.7;
              velocityY *= 0.7;
              
              x += velocityX * deltaTime;
              y += velocityY * deltaTime;
              
              if (distance < 20) {
                const directPull = 0.3;
                x += dx * directPull;
                y += dy * directPull;
              }
              
              rotation = cursorRotationRef.current;
              scale = Math.min(1, scale + 3 * deltaTime);
              opacity = Math.min(1, opacity + 4 * deltaTime);
              
            } else {
              x = 0;
              y = 0;
              velocityX = 0;
              velocityY = 0;
              rotation = cursorRotationRef.current;
              scale = 1;
              opacity = 1;
            }
            
          } else {
            rotation = cursorRotationRef.current;
            scale = 1 + Math.sin(timestamp * 0.001 + index) * 0.03;
            opacity = 1;
            
            if (Math.abs(x) > 0.5 || Math.abs(y) > 0.5) {
              x *= 0.9;
              y *= 0.9;
              allAssembled = false;
            }
          }
          
          return {
            ...part,
            x, y, velocityX, velocityY, scale, opacity, rotation, isStuck
          };
        });
        
        const allCloseToCenter = newParticles.every(p => {
          const dist = Math.sqrt(p.x * p.x + p.y * p.y);
          return dist < 1;
        });
        
        if (isAssemblingRef.current && allCloseToCenter) {
          isAssemblingRef.current = false;
          setShowFullLogo(true);
          
          if (forceCenterTimeoutRef.current) {
            clearTimeout(forceCenterTimeoutRef.current);
            forceCenterTimeoutRef.current = null;
          }
        }
        
        return newParticles;
      });

      animationRef.current = requestAnimationFrame(animateParticles);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    animationRef.current = requestAnimationFrame(animateParticles);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (forceCenterTimeoutRef.current) {
        clearTimeout(forceCenterTimeoutRef.current);
      }
    };
  }, [isHovering, particles]);

  // ========== ОТКЛЮЧЕНИЕ НА МОБИЛЬНЫХ ==========
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    return null;
  }

  // ========== РЕНДЕРИНГ ==========
  const shouldShowFullLogo = showFullLogo && !isHovering && !isAssemblingRef.current;

  // Определяем цвет тени (плавный переход)
  const shadowOpacity = cursorColor === "#ffffff" ? "0.3" : "0.3";
  const shadowColor = cursorColor === "#ffffff" 
    ? `rgba(255, 255, 255, ${shadowOpacity})` 
    : `rgba(0, 0, 0, ${shadowOpacity})`;

  return (
    <div 
      ref={cursorRef}
      className="svg-cursor-container"
      style={{
        position: 'fixed',
        left: `${cursorPosition.x}px`,
        top: `${cursorPosition.y}px`,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        transition: 'transform 0.12s linear',
        transformOrigin: 'center center'
      }}
    >

      
      {/* Целое SVG лого с вращением */}
      {shouldShowFullLogo && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={fullSVG.viewBox}
          style={{
            position: 'absolute',
            left: '0',
            top: '0',
            width: '60px',
            height: '60px',
            transform: `translate(-50%, -50%) rotate(${cursorRotationRef.current}deg)`,
            opacity: 1,
            filter: `drop-shadow(0 2px 4px ${shadowColor})`,
            transition: 'opacity 0.3s ease, transform 0.1s linear, filter 0.3s ease',
            transformOrigin: 'center center'
          }}
        >
          {fullSVG.paths.map((path, index) => (
            <path 
              key={`full-${index}`}
              d={path} 
              fill={cursorColor}
              style={{
                transition: 'fill 0.3s ease'
              }}
            />
          ))}
        </svg>
      )}
      
      {/* Частицы */}
      {particles.map((part) => {
        if (shouldShowFullLogo && !part.isStuck) {
          return null;
        }
        
        return (
          <svg
            key={part.id}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 298.49 298.49"
            style={{
              position: 'absolute',
              left: `${part.x}px`,
              top: `${part.y}px`,
              width: '60px',
              height: '60px',
              transform: `translate(-50%, -50%) rotate(${part.rotation}deg) scale(${part.scale})`,
              opacity: part.opacity,
              transition: isAssemblingRef.current 
                ? 'transform 0.2s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.3s ease, filter 0.3s ease'
                : 'transform 0.15s ease-out, opacity 0.2s ease, filter 0.3s ease',
              filter: `drop-shadow(0 2px 4px ${shadowColor})`,
              willChange: 'transform, opacity, filter',
              display: shouldShowFullLogo && !part.isStuck ? 'none' : 'block'
            }}
          >
            <path 
              d={part.path} 
              fill={cursorColor}
              className="cursor-particle"
              style={{
                transition: 'fill 0.3s ease'
              }}
            />
          </svg>
        );
      })}
      

    </div>
  );
};

export default GlobalCursor;