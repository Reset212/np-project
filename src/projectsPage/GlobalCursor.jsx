import React, { useState, useEffect, useRef } from 'react';
import './GlobalCursor.css';

const GlobalCursor = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorColor, setCursorColor] = useState('light');
  const [isCursorExpanded, setIsCursorExpanded] = useState(false);
  const [isCursorClicked, setIsCursorClicked] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      setCursorVisible(true);
      
      // Обновляем позиции курсоров
      if (cursorDotRef.current && cursorRingRef.current) {
        cursorDotRef.current.style.left = `${e.clientX}px`;
        cursorDotRef.current.style.top = `${e.clientY}px`;
        cursorRingRef.current.style.left = `${e.clientX}px`;
        cursorRingRef.current.style.top = `${e.clientY}px`;
      }
      
      // Определение цвета курсора на основе позиции
      const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      if (elementUnderCursor) {
        // Проверяем, находится ли курсор над светлым элементом
        const style = window.getComputedStyle(elementUnderCursor);
        const bgColor = style.backgroundColor;
        const isLight = isColorLight(bgColor);
        
        setCursorColor(isLight ? 'dark' : 'light');
        
        // Проверяем, находится ли курсор над интерактивным элементом
        const isInteractive = 
          elementUnderCursor.tagName === 'BUTTON' || 
          elementUnderCursor.tagName === 'A' ||
          elementUnderCursor.tagName === 'INPUT' ||
          elementUnderCursor.tagName === 'TEXTAREA' ||
          elementUnderCursor.closest('button') ||
          elementUnderCursor.closest('a') ||
          elementUnderCursor.classList.contains('nav-item') ||
          elementUnderCursor.classList.contains('view-project-button') ||
          elementUnderCursor.classList.contains('chat-button') ||
          elementUnderCursor.classList.contains('burger-menu') ||
          elementUnderCursor.classList.contains('mobile-chat-button') ||
          elementUnderCursor.classList.contains('mobile-nav-item');
        
        setIsCursorExpanded(isInteractive);
      }
    };

    const handleMouseDown = () => {
      setIsCursorClicked(true);
      setTimeout(() => setIsCursorClicked(false), 150);
    };

    const handleMouseUp = () => {
      // Уже сброшено через таймаут
    };

    const handleMouseLeave = () => {
      setCursorVisible(false);
    };

    const handleMouseEnter = () => {
      setCursorVisible(true);
    };

    // Добавляем слушатели
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Функция для определения светлоты цвета
  const isColorLight = (color) => {
    if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
      return false;
    }
    
    const rgb = color.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const r = parseInt(rgb[0]);
      const g = parseInt(rgb[1]);
      const b = parseInt(rgb[2]);
      
      // Формула яркости
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128;
    }
    
    return false;
  };

  // Проверяем мобильное устройство
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    return null; // Не показываем курсор на мобильных
  }

  return (
    <>
      <div 
        ref={cursorDotRef}
        className={`global-cursor-dot ${cursorColor} ${isCursorExpanded ? 'expanded' : ''} ${isCursorClicked ? 'clicked' : ''}`}
        style={{
          position: 'fixed',
          transform: 'translate(-50%, -50%)',
          opacity: cursorVisible ? 1 : 0,
          pointerEvents: 'none',
          zIndex: 9999
        }}
      />
      <div 
        ref={cursorRingRef}
        className={`global-cursor-ring ${cursorColor} ${isCursorExpanded ? 'expanded' : ''} ${isCursorClicked ? 'clicked' : ''}`}
        style={{
          position: 'fixed',
          transform: 'translate(-50%, -50%)',
          opacity: cursorVisible ? 1 : 0,
          pointerEvents: 'none',
          zIndex: 9998
        }}
      />
    </>
  );
};

export default GlobalCursor;