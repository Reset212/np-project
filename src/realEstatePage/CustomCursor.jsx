import React, { useState, useEffect, useRef } from "react";
import "./CustomCursor.css";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('light');
  const [cursorColor, setCursorColor] = useState('dark'); // Новое состояние для цвета курсора
  const animationFrameRef = useRef();
  const lastPositionRef = useRef({ x: 0, y: 0 });

  // Функция для определения цвета под курсором
  const getColorUnderCursor = (x, y) => {
    if (typeof document === 'undefined') return 'light';
    
    const element = document.elementFromPoint(x, y);
    if (!element) return 'light';
    
    // Игнорируем сам курсор
    if (element.closest('.custom-cursor') || element.closest('.cursor-trail')) {
      return cursorColor; // Возвращаем текущий цвет
    }
    
    // Получаем цвет фона элемента
    const style = window.getComputedStyle(element);
    let bgColor = style.backgroundColor;
    
    // Если у элемента прозрачный фон, проверяем родителей
    if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      let parent = element.parentElement;
      let depth = 0;
      
      while (parent && depth < 5) {
        const parentStyle = window.getComputedStyle(parent);
        const parentBgColor = parentStyle.backgroundColor;
        
        if (parentBgColor !== 'rgba(0, 0, 0, 0)' && parentBgColor !== 'transparent') {
          bgColor = parentBgColor;
          break;
        }
        
        parent = parent.parentElement;
        depth++;
      }
    }
    
    // Анализируем цвет фона
    const rgbMatch = bgColor.match(/\d+/g);
    if (!rgbMatch) return 'light';
    
    const [r, g, b] = rgbMatch.map(Number);
    
    // Рассчитываем яркость (формула W3C)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Определяем, темный или светлый фон
    return brightness < 128 ? 'light' : 'dark';
  };

  // Функция для определения, нужно ли менять цвет курсора на элементе
  const shouldChangeCursorColor = (element) => {
    if (!element) return false;
    
    // Проверяем классы элемента
    const elementClasses = element.className?.toString() || '';
    const tagName = element.tagName.toLowerCase();
    
    // Белые элементы, на которых курсор должен быть темным
    const whiteElements = [
      'white', 'light', 'bg-white', 'bg-light', 
      'video-background-container', 'left-column',
      'right-column', 'contact-section', 'scroll-text-section'
    ];
    
    // Динамические элементы (видео, анимации и т.д.)
    const dynamicElements = [
      'video', 'video-background', 'sticky-text-container',
      'text-section', 'text-line', 'letter'
    ];
    
    // Проверяем классы
    for (const className of whiteElements) {
      if (elementClasses.includes(className)) return true;
    }
    
    // Проверяем теги
    if (dynamicElements.some(el => elementClasses.includes(el))) return true;
    if (tagName === 'video') return true;
    
    // Проверяем цвет фона элемента
    const style = window.getComputedStyle(element);
    const bgColor = style.backgroundColor;
    
    if (bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      const rgbMatch = bgColor.match(/\d+/g);
      if (rgbMatch) {
        const [r, g, b] = rgbMatch.map(Number);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // Если фон светлый (белый или близкий к белому)
        if (brightness > 200) return true;
      }
    }
    
    return false;
  };

  useEffect(() => {
    const updateCursor = () => {
      if (!animationFrameRef.current) return;
      
      const now = Date.now();
      const { x, y } = lastPositionRef.current;
      
      // Определяем цвет под курсором
      const element = document.elementFromPoint(x, y);
      const isOnWhiteElement = shouldChangeCursorColor(element);
      
      // Устанавливаем цвет курсора
      if (isOnWhiteElement) {
        setCursorColor('dark'); // Темный курсор на светлом фоне
      } else {
        // Используем логику определения цвета фона
        const bgColor = getColorUnderCursor(x, y);
        setCursorColor(bgColor === 'light' ? 'dark' : 'light');
      }
      
      animationFrameRef.current = requestAnimationFrame(updateCursor);
    };

    const moveCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      lastPositionRef.current = { x: e.clientX, y: e.clientY };
      
      // Определяем цвет фона для всей страницы
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const bgColor = getColorUnderCursor(e.clientX, e.clientY);
      setBackgroundColor(bgColor);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      
      // Проверяем, является ли элемент кликабельным
      const isClickable = target.tagName === 'BUTTON' || 
                         target.tagName === 'A' || 
                         target.classList.contains('nav-item') ||
                         target.classList.contains('chat-button') ||
                         target.classList.contains('view-project-button') ||
                         target.classList.contains('submit-button') ||
                         target.classList.contains('email-value') ||
                         target.hasAttribute('href') ||
                         target.hasAttribute('onclick') ||
                         target.style.cursor === 'pointer';
      
      if (isClickable) {
        setIsPointer(true);
        setIsHovering(true);
        
        // При наведении на кнопку на светлом фоне делаем курсор темным
        const bgColor = getColorUnderCursor(e.clientX, e.clientY);
        if (bgColor === 'light') {
          setCursorColor('dark');
        } else {
          setCursorColor('light');
        }
      }
    };

    const handleMouseOut = () => {
      setIsPointer(false);
      setIsHovering(false);
    };

    document.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    
    // Запускаем анимационный цикл
    animationFrameRef.current = requestAnimationFrame(updateCursor);

    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <div 
        className={`custom-cursor ${isPointer ? 'pointer' : ''} ${isHovering ? 'hovering' : ''} ${cursorColor}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="cursor-glass">
          <div className="cursor-ring"></div>
          <div className="cursor-center"></div>
        </div>
      </div>
      <div 
        className={`cursor-trail ${cursorColor}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  );
};

export default CustomCursor;