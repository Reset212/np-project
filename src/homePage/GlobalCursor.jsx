import React, { useState, useEffect, useRef } from 'react';
import './GlobalCursor.css';

const GlobalCursor = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [ringPosition, setRingPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Основные размеры
  const DOT_SIZE = 10; // диаметр точки
  const RING_SIZE_NORMAL = 78; // диаметр кольца в нормальном состоянии
  const RING_SIZE_HOVER = 48; // диаметр кольца при наведении
  const MAX_RING_OFFSET = 20; // максимальное смещение кольца от точки

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      
      // Немедленно обновляем позицию точки
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${e.clientX}px`;
        cursorDotRef.current.style.top = `${e.clientY}px`;
      }
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
      }
    };

    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    // Ручное управление через data-атрибуты
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
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Анимация кольца с плавным отставанием
  useEffect(() => {
    const updateRingPosition = () => {
      if (!cursorRingRef.current || !cursorDotRef.current) return;

      const targetX = cursorPosition.x;
      const targetY = cursorPosition.y;
      
      // Текущая позиция кольца
      const currentRingX = parseFloat(cursorRingRef.current.style.left) || targetX;
      const currentRingY = parseFloat(cursorRingRef.current.style.top) || targetY;
      
      // Рассчитываем разницу
      const diffX = targetX - currentRingX;
      const diffY = targetY - currentRingY;
      
      // Плавное следование с инерцией
      const newRingX = currentRingX + diffX * 0.15; // Коэффициент плавности
      const newRingY = currentRingY + diffY * 0.15;
      
      // Ограничиваем смещение, чтобы кольцо не выходило за границы точки
      const currentRingSize = isHovering ? RING_SIZE_HOVER : RING_SIZE_NORMAL;
      const dotRadius = DOT_SIZE / 2;
      const ringRadius = currentRingSize / 2;
      
      // Максимально допустимое расстояние между центрами
      const maxDistance = Math.max(0, ringRadius - dotRadius - 2); // -2 для небольшого отступа
      const actualDistance = Math.sqrt(diffX * diffX + diffY * diffY);
      
      let finalRingX = newRingX;
      let finalRingY = newRingY;
      
      // Если кольцо слишком далеко от точки, ограничиваем его смещение
      if (actualDistance > maxDistance && maxDistance > 0) {
        const scale = maxDistance / actualDistance;
        finalRingX = targetX - diffX * scale;
        finalRingY = targetY - diffY * scale;
      }
      
      // Обновляем позицию кольца
      cursorRingRef.current.style.left = `${finalRingX}px`;
      cursorRingRef.current.style.top = `${finalRingY}px`;
      
      // Сохраняем позицию для состояния
      setRingPosition({ x: finalRingX, y: finalRingY });
      
      // Продолжаем анимацию
      animationFrameRef.current = requestAnimationFrame(updateRingPosition);
    };
    
    // Запускаем анимацию
    animationFrameRef.current = requestAnimationFrame(updateRingPosition);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cursorPosition, isHovering]);

  // Эффект для анимации наведения и клика
  useEffect(() => {
    if (!cursorRingRef.current || !cursorDotRef.current) return;

    // Анимация наведения
    if (isHovering) {
      cursorRingRef.current.style.width = `${RING_SIZE_HOVER}px`;
      cursorRingRef.current.style.height = `${RING_SIZE_HOVER}px`;
      cursorRingRef.current.style.borderWidth = '2px';
      cursorRingRef.current.style.borderColor = '#000000';
    } else {
      cursorRingRef.current.style.width = `${RING_SIZE_NORMAL}px`;
      cursorRingRef.current.style.height = `${RING_SIZE_NORMAL}px`;
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

  // Скрываем курсор на мобильных устройствах
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
          width: `${DOT_SIZE}px`,
          height: `${DOT_SIZE}px`,
        }}
      />
      <div
        ref={cursorRingRef}
        className="global-cursor-ring"
        style={{
          position: 'fixed',
          left: `${ringPosition.x}px`,
          top: `${ringPosition.y}px`,
          pointerEvents: 'none',
          zIndex: 9998,
        }}
      />
    </>
  );
};

export default GlobalCursor;