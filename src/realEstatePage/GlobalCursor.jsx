import React, { useState, useEffect, useRef } from 'react';
import './GlobalCursor.css';

const GlobalCursor = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [particles, setParticles] = useState([]);
  const animationRef = useRef(null);
  const cursorRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Исходные позиции частей логотипа (относительно центра)
  const initialParts = [
    {
      id: 1,
      path: "M140.09,61.73l7.36-4.25c1.11-.64,2.47-.64,3.57,0l50.64,29.24c1.31.76,1.51,2.57.39,3.58l-29.4,26.85c-1.05.96-2.73.7-3.44-.53l-29.95-51.84c-.62-1.07-.25-2.44.82-3.05Z",
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      rotation: 0,
      targetX: 0,
      targetY: 0,
      velocityX: 0,
      velocityY: 0,
      orbitRadius: 0
    },
    {
      id: 2,
      path: "M68.57,165.37v-61.05c0-.8.43-1.54,1.12-1.93l52.67-30.42c1.07-.62,2.43-.25,3.05.82l32.19,55.75c.52.91.35,2.06-.43,2.77l-47.88,43.74c-.53.49-1.27.69-1.98.53l-36.99-8.02c-1.03-.22-1.76-1.13-1.76-2.18Z",
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      rotation: 0,
      targetX: 0,
      targetY: 0,
      velocityX: 0,
      velocityY: 0,
      orbitRadius: 0
    },
    {
      id: 3,
      path: "M196.38,215.23l-45.38,25.78c-1.1.62-2.44.62-3.53,0l-77.77-44.21c-.7-.4-1.13-1.14-1.13-1.94v-8.55c0-1.42,1.31-2.48,2.71-2.18l124.47,26.97c2,.43,2.41,3.11.63,4.13Z",
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      rotation: 0,
      targetX: 0,
      targetY: 0,
      velocityX: 0,
      velocityY: 0,
      orbitRadius: 0
    },
    {
      id: 4,
      path: "M229.92,104.32v90.55c0,.8-.43,1.55-1.13,1.94l-5.28,3c-.76.43-1.66.57-2.52.39l-89.15-19.3c-1.77-.38-2.37-2.61-1.03-3.83l86.84-79.32c.72-.66,1.78-.77,2.62-.29l8.53,4.92c.69.4,1.12,1.14,1.12,1.94Z",
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      rotation: 0,
      targetX: 0,
      targetY: 0,
      velocityX: 0,
      velocityY: 0,
      orbitRadius: 0
    }
  ];

  useEffect(() => {
    // Инициализация частиц с орбитами
    const initializedParticles = initialParts.map((part, index) => {
      const angle = (index / initialParts.length) * Math.PI * 2;
      const orbitRadius = 60 + Math.random() * 40; // радиус орбиты
      const speed = 0.5 + Math.random() * 0.3; // скорость вращения
      
      return {
        ...part,
        orbitRadius,
        orbitSpeed: speed,
        orbitAngle: angle,
        orbitOffset: Math.random() * Math.PI * 2,
        x: Math.cos(angle) * orbitRadius,
        y: Math.sin(angle) * orbitRadius,
        scale: 0.8 + Math.random() * 0.4,
        opacity: 0.7,
        rotation: Math.random() * 360
      };
    });
    
    setParticles(initializedParticles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Проверяем наведение на интерактивные элементы
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

      if (isInteractive) {
        setIsHovering(true);
        // При наведении собираем частицы вместе
        setParticles(prev => prev.map(part => ({
          ...part,
          targetX: 0,
          targetY: 0,
          velocityX: 0,
          velocityY: 0
        })));
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      // При уходе возвращаем частицы на орбиты
      setParticles(prev => prev.map(part => ({
        ...part,
        targetX: Math.cos(part.orbitAngle + part.orbitOffset) * part.orbitRadius,
        targetY: Math.sin(part.orbitAngle + part.orbitOffset) * part.orbitRadius
      })));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    // Анимация частиц
    const animateParticles = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setParticles(prev => prev.map(part => {
        if (isHovering) {
          // При наведении: плавно движемся к центру
          const dx = 0 - part.x;
          const dy = 0 - part.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 1) {
            return {
              ...part,
              x: part.x + dx * 0.1,
              y: part.y + dy * 0.1,
              rotation: part.rotation + 2,
              scale: 1,
              opacity: Math.min(1, part.opacity + 0.05)
            };
          }
          return {
            ...part,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1
          };
        } else {
          // В обычном состоянии: вращаемся по орбите
          const newOrbitAngle = part.orbitAngle + part.orbitSpeed * deltaTime;
          const orbitX = Math.cos(newOrbitAngle + part.orbitOffset) * part.orbitRadius;
          const orbitY = Math.sin(newOrbitAngle + part.orbitOffset) * part.orbitRadius;
          
          // Плавное движение к точке на орбите
          const dx = orbitX - part.x;
          const dy = orbitY - part.y;
          
          return {
            ...part,
            orbitAngle: newOrbitAngle,
            x: part.x + dx * 0.05,
            y: part.y + dy * 0.05,
            rotation: part.rotation + 1,
            scale: 0.7 + Math.sin(newOrbitAngle) * 0.1,
            opacity: 0.6 + Math.sin(newOrbitAngle * 0.5) * 0.2
          };
        }
      }));

      animationRef.current = requestAnimationFrame(animateParticles);
    };

    animationRef.current = requestAnimationFrame(animateParticles);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovering]);

  // Эффект для клика
  useEffect(() => {
    if (isClicking) {
      // При клике разбрасываем частицы
      setParticles(prev => prev.map(part => ({
        ...part,
        velocityX: (Math.random() - 0.5) * 1000,
        velocityY: (Math.random() - 0.5) * 1000,
        scale: 0.5,
        opacity: 0.5
      })));
    }
  }, [isClicking]);

  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    return null;
  }

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
        transition: isHovering ? 'transform 0.3s ease' : 'none',
        transformOrigin: 'center center'
      }}
    >
      {particles.map((part) => (
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
            transition: isHovering ? 'all 0.5s ease' : 'all 0.1s ease',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}
        >
          <path 
            d={part.path} 
            fill="#ededed"
            className="cursor-particle"
          />
        </svg>
      ))}
      
      {/* Центральная точка (опционально) */}
      {!isHovering && (
        <div 
          className="cursor-center-dot"
          style={{
            position: 'absolute',
            left: '0',
            top: '0',
            width: '15px',
            height: '15px',
            backgroundColor: '#ededed',
            borderRadius: '50%',
            opacity: 0.5,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
      
      {/* Собранное лого при наведении */}
      
    </div>
  );
};

export default GlobalCursor;