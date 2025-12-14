import React, { useState, useEffect, useRef } from 'react';
import './GlobalCursor.css';

const GlobalCursor = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      
      if (cursorDotRef.current && cursorRingRef.current) {
        cursorDotRef.current.style.left = `${e.clientX}px`;
        cursorDotRef.current.style.top = `${e.clientY}px`;
        
        // Плавное следование кольца за точкой
        cursorRingRef.current.style.left = `${e.clientX}px`;
        cursorRingRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Проверяем наведение на интерактивные элементы
    const handleMouseEnter = (e) => {
      const target = e.target;
      
      // Проверяем, что target является элементом DOM
      if (!target || typeof target.closest !== 'function') {
        return;
      }
      
      // Проверяем интерактивные элементы
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
      }
    };

    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Используем capture phase для более надежного отслеживания
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    // Опционально: добавить атрибут для ручного управления
    document.addEventListener('mouseover', (e) => {
      if (e.target && e.target.dataset.cursorHover === 'true') {
        setIsHovering(true);
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target && e.target.dataset.cursorHover === 'true') {
        setIsHovering(false);
      }
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (!cursorRingRef.current || !cursorDotRef.current) return;

    // Анимация наведения
    if (isHovering) {
      cursorRingRef.current.style.width = '48px';
      cursorRingRef.current.style.height = '48px';
      cursorRingRef.current.style.borderWidth = '2px';
      cursorRingRef.current.style.borderColor = '#000000';
    } else {
      cursorRingRef.current.style.width = '78px';
      cursorRingRef.current.style.height = '78px';
      cursorRingRef.current.style.borderWidth = '1px';
      cursorRingRef.current.style.borderColor = '#000000';
    }

    // Анимация клика
    if (isClicking) {
      cursorDotRef.current.style.transform = 'translate(-50%, -50%) scale(0.8)';
      cursorDotRef.current.style.opacity = '0.7';
      cursorRingRef.current.style.transform = 'translate(-50%, -50%) scale(0.9)';
    } else {
      cursorDotRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorDotRef.current.style.opacity = '1';
      cursorRingRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  }, [isHovering, isClicking]);

  // Анимация для плавного движения кольца
  useEffect(() => {
    let animationFrameId;
    
    const animateRing = () => {
      if (cursorRingRef.current) {
        const ring = cursorRingRef.current;
        const currentLeft = parseFloat(ring.style.left) || cursorPosition.x;
        const currentTop = parseFloat(ring.style.top) || cursorPosition.y;
        
        const diffX = cursorPosition.x - currentLeft;
        const diffY = cursorPosition.y - currentTop;
        
        // Плавное движение с инерцией
        if (Math.abs(diffX) > 0.1 || Math.abs(diffY) > 0.1) {
          ring.style.left = `${currentLeft + diffX * 0.15}px`;
          ring.style.top = `${currentTop + diffY * 0.15}px`;
          animationFrameId = requestAnimationFrame(animateRing);
        }
      }
    };
    
    animationFrameId = requestAnimationFrame(animateRing);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [cursorPosition]);

  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    return null;
  }

  return (
    <>
      <div
        ref={cursorDotRef}
        className="global-cursor-dot"
        style={{
          position: 'fixed',
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
      <div
        ref={cursorRingRef}
        className="global-cursor-ring"
        style={{
          position: 'fixed',
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
          pointerEvents: 'none',
          zIndex: 9998,
        }}
      />
    </>
  );
};

export default GlobalCursor;