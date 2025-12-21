import React, { useState, useEffect, useRef } from 'react';
import './GlobalCursor.css';

const GlobalCursor = () => {
  // ========== СОСТОЯНИЯ ==========
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState([]);
  const [showFullLogo, setShowFullLogo] = useState(true);
  
  // ========== REF-Ы ==========
  const animationRef = useRef(null);
  const cursorRef = useRef(null);
  const lastTimeRef = useRef(0);
  const isAssemblingRef = useRef(false);
  const forceCenterTimeoutRef = useRef(null);
  const cursorRotationRef = useRef(0); // Ref для вращения курсора

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

  // ========== ИНИЦИАЛИЗАЦИЯ ==========
  useEffect(() => {
    setParticles(initialParticles);
  }, []);

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

    // ========== ФУНКЦИЯ АНИМАЦИИ ==========
    const animateParticles = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.033);
      lastTimeRef.current = timestamp;

      // ВРАЩЕНИЕ КУРСОРА ВСЕГДА (даже когда частицы собраны)
      cursorRotationRef.current = (cursorRotationRef.current + 0.5) % 360;

      setParticles(prev => {
        let allAssembled = true;
        
        const newParticles = prev.map((part, index) => {
          let { x, y, velocityX, velocityY, scale, opacity, rotation, isStuck } = part;
          
          if (isStuck) {
            return part;
          }
          
          if (isHovering) {
            // ========== РАЗЛЕТ ЧАСТИЦ ==========
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
            
            // Частицы вращаются независимо от курсора при разлете
            rotation += velocityX * 0.02 * deltaTime;
            scale = 0.8 + Math.sin(timestamp * 0.003 + index) * 0.15;
            opacity = 0.7 + Math.sin(timestamp * 0.002 + index) * 0.15;
            
          } else if (isAssemblingRef.current) {
            // ========== СБОРКА ЧАСТИЦ ==========
            
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
              
              // При сборке частицы вращаются вместе с курсором
              rotation = cursorRotationRef.current;
              scale = Math.min(1, scale + 3 * deltaTime);
              opacity = Math.min(1, opacity + 4 * deltaTime);
              
            } else {
              x = 0;
              y = 0;
              velocityX = 0;
              velocityY = 0;
              rotation = cursorRotationRef.current; // Вращение как у курсора
              scale = 1;
              opacity = 1;
            }
            
          } else {
            // ========== СОБРАННОЕ СОСТОЯНИЕ ==========
            // Частицы вращаются вместе с курсором
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

    // ========== ПОДПИСКА НА СОБЫТИЯ ==========
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    animationRef.current = requestAnimationFrame(animateParticles);

    // ========== ОЧИСТКА ==========
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
      {/* Пунктирный круг при наведении */}
      {isHovering && (
        <svg
          width="76"
          height="76"
          viewBox="0 0 76 76"
          style={{
            position: 'absolute',
            left: '0',
            top: '0',
            transform: 'translate(-50%, -50%)',
            opacity: 0.6,
            transition: 'opacity 0.2s ease'
          }}
        >
          <circle
            cx="38"
            cy="38"
            r="38"
            fill="none"
            stroke="#000000ff"
            strokeWidth="1.5"
            strokeDasharray="4, 4"
            strokeOpacity="0.7"
          />
        </svg>
      )}
      
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
            transform: `translate(-50%, -50%) rotate(${cursorRotationRef.current}deg)`, // ВРАЩЕНИЕ
            opacity: 1,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            transition: 'opacity 0.3s ease, transform 0.1s linear',
            transformOrigin: 'center center'
          }}
        >
          {fullSVG.paths.map((path, index) => (
            <path 
              key={`full-${index}`}
              d={path} 
              fill="#000000ff"
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
                ? 'transform 0.2s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.3s ease'
                : 'transform 0.15s ease-out, opacity 0.2s ease',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              willChange: 'transform, opacity',
              display: shouldShowFullLogo && !part.isStuck ? 'none' : 'block'
            }}
          >
            <path 
              d={part.path} 
              fill="#000000ff"
              className="cursor-particle"
            />
          </svg>
        );
      })}
      

    </div>
  );
};

export default GlobalCursor;