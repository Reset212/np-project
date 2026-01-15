import React, { useState, useEffect, useRef } from 'react';
import './GlobalCursor.css';

const GlobalCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [svgPosition, setSvgPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [lastTime, setLastTime] = useState(Date.now());
  const [isSticky, setIsSticky] = useState(false);
  const [stickyTarget, setStickyTarget] = useState({ 
    x: 0, y: 0, width: 0, height: 0, borderRadius: 0 
  });
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [rotation, setRotation] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [circleSize, setCircleSize] = useState({ width: 60, height: 60, borderRadius: 30 });
  const [showCircle, setShowCircle] = useState(false);
  const [isInsideButton, setIsInsideButton] = useState(false);
  const [buttonHasBackground, setButtonHasBackground] = useState(false);
  
  const rafRef = useRef(null);
  const positionHistoryRef = useRef([]);
  const rotationHistoryRef = useRef([]);
  const stickyElementRef = useRef(null);
  const targetSizeRef = useRef({ width: 60, height: 60, borderRadius: 30 });
  const MAX_HISTORY = 5;
  const ROTATION_SMOOTH_HISTORY = 3;

  const lerp = (start, end, factor) => {
    return start + (end - start) * factor;
  };

  const distance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  // Функция для проверки есть ли у элемента фон
  const hasBackground = (element) => {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    const backgroundColor = style.backgroundColor;
    const backgroundImage = style.backgroundImage;
    
    // Проверяем есть ли фон
    const hasBgColor = backgroundColor && 
                      backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                      backgroundColor !== 'transparent';
    
    const hasBgImage = backgroundImage && backgroundImage !== 'none';
    
    // Также проверяем есть ли градиент, тень и т.д.
    const hasBoxShadow = style.boxShadow && style.boxShadow !== 'none';
    const hasGradient = backgroundImage.includes('gradient');
    
    return hasBgColor || hasBgImage || hasBoxShadow || hasGradient;
  };

  // Функция для получения точных размеров элемента
  const getElementMetrics = (element) => {
    const rect = element.getBoundingClientRect();
    
    // Проверяем есть ли у элемента фон
    const hasBg = hasBackground(element);
    setButtonHasBackground(hasBg);
    
    // Для кнопок с фоном делаем круг ВНУТРИ (меньше)
    if (hasBg) {
      // Внутренние отступы - круг внутри кнопки
      const padding = {
        horizontal: 8,  // Меньше для внутреннего круга
        vertical: 6
      };
      
      const finalWidth = Math.max(rect.width - (padding.horizontal * 2), 40);
      const finalHeight = Math.max(rect.height - (padding.vertical * 2), 20);
      
      // Большое скругление для внутреннего круга
      const minSide = Math.min(finalWidth, finalHeight);
      const finalBorderRadius = Math.min(30, minSide / 2);
      
      return {
        x: rect.left + padding.horizontal,
        y: rect.top + padding.vertical,
        width: finalWidth,
        height: finalHeight,
        borderRadius: finalBorderRadius,
        center: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        },
        originalRect: rect,
        hasBackground: true
      };
    } else {
      // Для кнопок без фона - обычный круг СНАРУЖИ (больше)
      const padding = {
        horizontal: 14,
        vertical: 12
      };
      
      const finalWidth = rect.width + (padding.horizontal * 2);
      const finalHeight = rect.height + (padding.vertical * 2);
      
      const minSide = Math.min(finalWidth, finalHeight);
      const finalBorderRadius = Math.min(30, minSide / 2);
      
      return {
        x: rect.left - padding.horizontal,
        y: rect.top - padding.vertical,
        width: finalWidth,
        height: finalHeight,
        borderRadius: finalBorderRadius,
        center: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        },
        originalRect: rect,
        hasBackground: false
      };
    }
  };

  // ОЧЕНЬ быстрое изменение размера круга
  const animateCircleSize = () => {
    const targetSize = targetSizeRef.current;
    
    // Очень быстрые факторы для анимации
    const animationSpeed = isSticky ? 0.5 : 0.6;
    const newWidth = lerp(circleSize.width, targetSize.width, animationSpeed);
    const newHeight = lerp(circleSize.height, targetSize.height, animationSpeed);
    const newBorderRadius = lerp(circleSize.borderRadius, targetSize.borderRadius, animationSpeed);
    
    setCircleSize({
      width: newWidth,
      height: newHeight,
      borderRadius: newBorderRadius
    });
    
    // Показываем круг только когда прилипли или в процессе анимации
    const shouldShow = isSticky || circleSize.width > 65 || targetSize.width > 65;
    setShowCircle(shouldShow);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = Date.now();
      const dt = Math.min(now - lastTime, 32);
      
      if (dt > 0) {
        const newVelocity = {
          x: (e.clientX - lastPosition.x) / dt * 16,
          y: (e.clientY - lastPosition.y) / dt * 16
        };
        
        setVelocity(prev => ({
          x: lerp(prev.x, newVelocity.x, 0.5),
          y: lerp(prev.y, newVelocity.y, 0.5)
        }));
        
        setLastTime(now);
        setLastPosition({ x: e.clientX, y: e.clientY });
      }
      
      positionHistoryRef.current.push({ x: e.clientX, y: e.clientY });
      if (positionHistoryRef.current.length > MAX_HISTORY) {
        positionHistoryRef.current.shift();
      }
      
      const avgPosition = positionHistoryRef.current.reduce(
        (acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }),
        { x: 0, y: 0 }
      );
      const count = positionHistoryRef.current.length;
      
      setPosition({ 
        x: avgPosition.x / count, 
        y: avgPosition.y / count 
      });
    };

    const handleMouseDown = () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 200);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [lastPosition, lastTime]);

  useEffect(() => {
    const checkHover = () => {
      const elements = document.elementsFromPoint(position.x, position.y);
      const isOverInteractive = elements.some(el => 
        el.tagName === 'BUTTON' || 
        el.tagName === 'A' || 
        el.getAttribute('role') === 'button' ||
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'SELECT' ||
        el.closest('.logo') ||
        el.classList?.contains('logo-image')
      );
      
      setIsHovering(isOverInteractive);
    };

    const interval = setInterval(checkHover, 40);
    return () => clearInterval(interval);
  }, [position]);

  useEffect(() => {
    const animate = () => {
      let targetX = position.x;
      let targetY = position.y;
      let smoothFactor = 0.15;

      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      const maxSpeed = 50;
      const speedRatio = Math.min(speed / maxSpeed, 2);
      
      // Быстрая логика вращения
      if (speed > 10) {
        const angle = Math.atan2(velocity.y, velocity.x);
        
        rotationHistoryRef.current.push(angle);
        if (rotationHistoryRef.current.length > ROTATION_SMOOTH_HISTORY) {
          rotationHistoryRef.current.shift();
        }
        
        let sinSum = 0;
        let cosSum = 0;
        
        rotationHistoryRef.current.forEach(a => {
          sinSum += Math.sin(a);
          cosSum += Math.cos(a);
        });
        
        const avgAngle = Math.atan2(sinSum / rotationHistoryRef.current.length, 
                                   cosSum / rotationHistoryRef.current.length);
        
        setRotation(prev => {
          const diff = avgAngle - prev;
          const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
          return prev + normalizedDiff * 0.4;
        });
        
        const stretchAmount = 1 + speedRatio * 0.5;
        const squeezeAmount = 1 - speedRatio * 0.2;
        
        setScale({
          x: stretchAmount,
          y: squeezeAmount
        });
      } else {
        setRotation(prev => {
          const diff = -prev;
          const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
          return prev + normalizedDiff * 0.12;
        });
        
        setScale({
          x: lerp(scale.x, 1, 0.25),
          y: lerp(scale.y, 1, 0.25)
        });
      }

      // Быстрая проверка элементов для прилипания
      const interactiveSelectors = [
        'button',
        'a[href]',
        '[role="button"]',
        'input[type="submit"]',
        'input[type="button"]',
        '.logo',
        '.logo-image',
        '[data-discover="true"]'
      ];
      
      const interactiveElements = document.querySelectorAll(interactiveSelectors.join(','));
      let isOverInteractive = false;
      let closestElement = null;
      let closestDistance = Infinity;

      interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        
        // Расстояние до центра элемента
        const dist = distance(position.x, position.y, center.x, center.y);
        // Большой радиус прилипания для быстрого отклика
        const maxRadius = Math.sqrt(rect.width ** 2 + rect.height ** 2) / 2 + 30;
        
        if (dist < maxRadius && dist < closestDistance) {
          closestDistance = dist;
          closestElement = element;
          isOverInteractive = true;
        }
      });

      if (isOverInteractive && closestElement && !isSticky) {
        setIsSticky(true);
        const metrics = getElementMetrics(closestElement);
        
        // Сразу устанавливаем почти целевой размер для мгновенного отклика
        targetSizeRef.current = {
          width: metrics.width * 0.9,
          height: metrics.height * 0.9,
          borderRadius: metrics.borderRadius
        };
        
        // Быстро добираем до полного размера
        setTimeout(() => {
          targetSizeRef.current = {
            width: metrics.width,
            height: metrics.height,
            borderRadius: metrics.borderRadius
          };
        }, 10);
        
        setStickyTarget({
          x: metrics.center.x,
          y: metrics.center.y,
          width: metrics.width,
          height: metrics.height,
          borderRadius: metrics.borderRadius
        });
        
        stickyElementRef.current = closestElement;
        smoothFactor = 0.05;
      } else if (isSticky && stickyElementRef.current) {
        // Быстрое обновление позиции и размеров
        const metrics = getElementMetrics(stickyElementRef.current);
        targetX = metrics.center.x;
        targetY = metrics.center.y;
        
        targetSizeRef.current = {
          width: metrics.width,
          height: metrics.height,
          borderRadius: metrics.borderRadius
        };
        
        setStickyTarget({
          x: metrics.center.x,
          y: metrics.center.y,
          width: metrics.width,
          height: metrics.height,
          borderRadius: metrics.borderRadius
        });
        
        // Проверяем вышли ли мы из элемента
        const dist = distance(position.x, position.y, metrics.center.x, metrics.center.y);
        const maxDistance = Math.max(metrics.originalRect.width, metrics.originalRect.height) * 0.8;
        
        if (dist > maxDistance) {
          setIsSticky(false);
          stickyElementRef.current = null;
          // Мгновенно начинаем уменьшение
          targetSizeRef.current = { width: 60, height: 60, borderRadius: 30 };
        }
      } else if (!isSticky) {
        // Быстрый возврат к размеру лого
        targetSizeRef.current = { width: 60, height: 60, borderRadius: 30 };
      }

      // Супер быстрая анимация изменения размера
      animateCircleSize();

      // Быстрое плавное движение
      const offsetX = 0;
      const offsetY = 0;
      const targetSvgX = targetX + offsetX;
      const targetSvgY = targetY + offsetY;
      
      const speedFactor = Math.min(speed / 20, 1);
      const dynamicSmoothFactor = lerp(smoothFactor, 0.15, speedFactor);
      
      const newSvgX = lerp(svgPosition.x, targetSvgX, dynamicSmoothFactor);
      const newSvgY = lerp(svgPosition.y, targetSvgY, dynamicSmoothFactor);
      
      setSvgPosition({ x: newSvgX, y: newSvgY });
      
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [position, svgPosition, velocity, isSticky, scale, rotation, circleSize]);

  const supportsBackdropFilter = () => {
    return CSS.supports('backdrop-filter', 'invert(1)') || 
           CSS.supports('-webkit-backdrop-filter', 'invert(1)');
  };

  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

  if (!supportsBackdropFilter() || isFirefox) {
    return null;
  }

  return (
    <div className="cursor-container">
      {/* Лого-курсор (постоянно виден, скрывается при прилипании) */}
      <div 
        className={`cursor-lens-backdrop ${isClicked ? 'clicked' : ''} ${isHovering ? 'hover' : ''}`}
        style={{
          left: `${svgPosition.x}px`,
          top: `${svgPosition.y}px`,
          transform: `translate(-50%, -50%) 
                     rotate(${rotation}rad)
                     scale(${scale.x}, ${scale.y})`,
          opacity: showCircle ? 0 : 1
        }}
      />
      
      {/* Круг для прилипания (быстрая анимация) */}
      <div 
        className={`cursor-sticky-circle ${isClicked ? 'clicked' : ''} ${buttonHasBackground ? 'inside-button' : 'outside-button'}`}
        style={{
          left: `${svgPosition.x}px`,
          top: `${svgPosition.y}px`,
          width: `${circleSize.width}px`,
          height: `${circleSize.height}px`,
          borderRadius: `${circleSize.borderRadius}px`,
          transform: `translate(-50%, -50%)`,
          opacity: showCircle ? 1 : 0,
          transformOrigin: 'center'
        }}
      />
    </div>
  );
};

export default GlobalCursor;