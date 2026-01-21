import React, { useState, useEffect, useRef } from 'react';
import './GlobalCursor2.css';

const GlobalCursor = () => {
  const [svgPosition, setSvgPosition] = useState({ x: 0, y: 0 });
  const [isClicked, setIsClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showCircle, setShowCircle] = useState(false);
  
  // ВСЕ данные для анимации храним в refs
  const positionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());
  const isStickyRef = useRef(false);
  const buttonHasBackgroundRef = useRef(false);
  const isInsideStickyAreaRef = useRef(false);
  
  // Визуальные свойства для рендеринга
  const [circleStyle, setCircleStyle] = useState({
    width: 60,
    height: 60,
    borderRadius: 30,
    offset: { x: 0, y: 0 },
    squash: { x: 1, y: 1 },
    stretch: { x: 1, y: 1 },
    isPulling: false
  });
  
  const [logoStyle, setLogoStyle] = useState({
    rotation: 0,
    scale: { x: 1, y: 1 }
  });

  const rafRef = useRef(null);
  const positionHistoryRef = useRef([]);
  const rotationHistoryRef = useRef([]);
  const stickyElementRef = useRef(null);
  const offsetHistoryRef = useRef([]);
  const logoVelocityRef = useRef({ x: 0, y: 0 });
  const logoPositionRef = useRef({ x: 0, y: 0 });
  
  const MAX_HISTORY = 5;
  const ROTATION_SMOOTH_HISTORY = 3;
  const OFFSET_SMOOTH_HISTORY = 3;
  const PADDING_NO_BG = 15;

  const lerp = (start, end, factor) => {
    return start + (end - start) * factor;
  };

  const distance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const hasBackground = (element) => {
    if (!element) return false;
    
    try {
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      
      const hasBgColor = backgroundColor && 
                        backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                        backgroundColor !== 'transparent';
      
      return hasBgColor || 
             style.backgroundImage !== 'none' || 
             style.boxShadow !== 'none';
    } catch (e) {
      return false;
    }
  };

  const getElementMetrics = (element) => {
    const rect = element.getBoundingClientRect();
    const hasBg = hasBackground(element);
    
    if (hasBg) {
      const computedStyle = window.getComputedStyle(element);
      const borderRadius = parseFloat(computedStyle.borderRadius);
      
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        borderRadius: borderRadius,
        center: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        },
        originalRect: rect,
        hasBackground: true,
        isSmallElement: rect.width <= 100 && rect.height <= 100
      };
    } else {
      const finalWidth = rect.width + (PADDING_NO_BG * 2);
      const finalHeight = rect.height + (PADDING_NO_BG * 2);
      const minSide = Math.min(finalWidth, finalHeight);
      
      return {
        x: rect.left - PADDING_NO_BG,
        y: rect.top - PADDING_NO_BG,
        width: finalWidth,
        height: finalHeight,
        borderRadius: Math.min(30, minSide / 2),
        center: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        },
        originalRect: rect,
        hasBackground: false,
        isSmallElement: rect.width <= 100 && rect.height <= 100
      };
    }
  };

  const isCursorInsideStickyArea = (cursorPos, metrics) => {
    if (!metrics) return false;
    
    if (metrics.hasBackground) {
      return cursorPos.x >= metrics.originalRect.left && 
             cursorPos.x <= metrics.originalRect.right && 
             cursorPos.y >= metrics.originalRect.top && 
             cursorPos.y <= metrics.originalRect.bottom;
    } else {
      return cursorPos.x >= metrics.x && 
             cursorPos.x <= metrics.x + metrics.width && 
             cursorPos.y >= metrics.y && 
             cursorPos.y <= metrics.y + metrics.height;
    }
  };

  const findClosestInteractiveElement = (cursorPos) => {
    const interactiveElements = document.querySelectorAll(
      'button, a[href], [role="button"], input[type="submit"], input[type="button"], .logo'
    );
    
    let closestElement = null;
    let closestDistance = Infinity;
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      const dist = distance(cursorPos.x, cursorPos.y, center.x, center.y);
      
      if (dist < closestDistance) {
        closestDistance = dist;
        closestElement = element;
      }
    });
    
    return { element: closestElement, distance: closestDistance };
  };

  // Обработчик движения мыши - оптимизированный
  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = Date.now();
      const dt = Math.min(now - lastTimeRef.current, 32);
      
      if (dt > 0) {
        const newVelocity = {
          x: (e.clientX - lastPositionRef.current.x) / dt * 16,
          y: (e.clientY - lastPositionRef.current.y) / dt * 16
        };
        
        // Сглаживаем скорость
        velocityRef.current = {
          x: lerp(velocityRef.current.x, newVelocity.x, 0.5),
          y: lerp(velocityRef.current.y, newVelocity.y, 0.5)
        };
        
        lastTimeRef.current = now;
        lastPositionRef.current = { x: e.clientX, y: e.clientY };
      }
      
      // Сглаживаем позицию с историей
      positionHistoryRef.current.push({ x: e.clientX, y: e.clientY });
      if (positionHistoryRef.current.length > MAX_HISTORY) {
        positionHistoryRef.current.shift();
      }
      
      const avgPosition = positionHistoryRef.current.reduce(
        (acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }),
        { x: 0, y: 0 }
      );
      const count = positionHistoryRef.current.length;
      
      positionRef.current = { 
        x: avgPosition.x / count, 
        y: avgPosition.y / count 
      };
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
  }, []); // Пустые зависимости - обработчик создается один раз

  // Проверка ховера - оптимизированная
  useEffect(() => {
    const checkHover = () => {
      const elements = document.elementsFromPoint(
        positionRef.current.x, 
        positionRef.current.y
      );
      
      const isOverInteractive = elements.some(el => 
        el.tagName === 'BUTTON' || 
        el.tagName === 'A' || 
        el.getAttribute('role') === 'button' ||
        el.tagName === 'INPUT'
      );
      
      // Обновляем state только если значение изменилось
      setIsHovering(prev => prev !== isOverInteractive ? isOverInteractive : prev);
    };

    const interval = setInterval(checkHover, 40);
    return () => clearInterval(interval);
  }, []); // Пустые зависимости

  // Основная анимация - оптимизированная версия
  useEffect(() => {
    const animate = () => {
      const position = positionRef.current;
      const velocity = velocityRef.current;
      const isSticky = isStickyRef.current;
      
      let targetX = position.x;
      let targetY = position.y;
      let smoothFactor = 0.15;

      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      
      // Анимация логотипа - обновляем state только при значительных изменениях
      if (!isSticky) {
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
          
          const avgAngle = Math.atan2(
            sinSum / rotationHistoryRef.current.length, 
            cosSum / rotationHistoryRef.current.length
          );
          
          setLogoStyle(prev => {
            const diff = avgAngle - prev.rotation;
            const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
            const newRotation = prev.rotation + normalizedDiff * 0.3;
            
            const speedRatio = Math.min(speed / 50, 2);
            const newScale = {
              x: 1 + speedRatio * 0.5,
              y: 1 - speedRatio * 0.2
            };
            
            return {
              rotation: newRotation,
              scale: newScale
            };
          });
        } else {
          setLogoStyle(prev => ({
            rotation: lerp(prev.rotation, 0, 0.08),
            scale: {
              x: lerp(prev.scale.x, 1, 0.15),
              y: lerp(prev.scale.y, 1, 0.15)
            }
          }));
        }
      } else {
        setLogoStyle({
          rotation: 0,
          scale: { x: 1, y: 1 }
        });
      }

      // Поиск интерактивных элементов и логика прилипания
      const { element: closestElement, distance: closestDistance } = 
        findClosestInteractiveElement(position);
      
      const STICKY_THRESHOLD_IN = 50;
      const STICKY_THRESHOLD_OUT = 140;
      
      // Логика прилипания
      if (closestElement && closestDistance < STICKY_THRESHOLD_IN && !isSticky) {
        const metrics = getElementMetrics(closestElement);
        const isInside = isCursorInsideStickyArea(position, metrics);
        
        isInsideStickyAreaRef.current = isInside;
        isStickyRef.current = true;
        buttonHasBackgroundRef.current = metrics.hasBackground;
        stickyElementRef.current = closestElement;
        
        setShowCircle(true);
        
        // Обновляем стиль круга одним обновлением state
        setCircleStyle({
          width: metrics.width,
          height: metrics.height,
          borderRadius: metrics.borderRadius,
          offset: { x: 0, y: 0 },
          squash: { x: 1, y: 1 },
          stretch: { x: 1, y: 1 },
          isPulling: false
        });
        
        targetX = metrics.center.x;
        targetY = metrics.center.y;
        smoothFactor = 0.1;
        
      } else if (isSticky && stickyElementRef.current) {
        const metrics = getElementMetrics(stickyElementRef.current);
        const isInside = isCursorInsideStickyArea(position, metrics);
        
        isInsideStickyAreaRef.current = isInside;
        buttonHasBackgroundRef.current = metrics.hasBackground;
        
        let newCircleStyle = { ...circleStyle };
        let offsetChanged = false;
        
        // Для кнопок без фона и курсора снаружи - применяем эффекты
        if (!metrics.hasBackground && !isInside) {
          const dx = position.x - metrics.center.x;
          const dy = position.y - metrics.center.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Смещение
          const maxOffsetDist = Math.max(metrics.originalRect.width, metrics.originalRect.height) * 1.8;
          const maxOffset = Math.min(metrics.originalRect.width, metrics.originalRect.height) * 0.4;
          
          let newOffset = { x: 0, y: 0 };
          
          if (dist < maxOffsetDist) {
            const offsetStrength = Math.min(dist / maxOffsetDist, 1);
            const smoothOffsetStrength = Math.pow(offsetStrength, 1.5);
            
            newOffset = {
              x: dx * smoothOffsetStrength * maxOffset / maxOffsetDist,
              y: dy * smoothOffsetStrength * maxOffset / maxOffsetDist
            };
          } else {
            const maxAllowedOffset = maxOffset * 0.3;
            newOffset = {
              x: Math.max(-maxAllowedOffset, Math.min(maxAllowedOffset, dx * 0.3)),
              y: Math.max(-maxAllowedOffset, Math.min(maxAllowedOffset, dy * 0.3))
            };
          }
          
          offsetHistoryRef.current.push(newOffset);
          if (offsetHistoryRef.current.length > OFFSET_SMOOTH_HISTORY) {
            offsetHistoryRef.current.shift();
          }
          
          const smoothOffset = offsetHistoryRef.current.reduce(
            (acc, offset) => ({ x: acc.x + offset.x, y: acc.y + offset.y }),
            { x: 0, y: 0 }
          );
          const count = offsetHistoryRef.current.length;
          
          const finalOffset = {
            x: smoothOffset.x / count,
            y: smoothOffset.y / count
          };
          
          if (Math.abs(finalOffset.x - newCircleStyle.offset.x) > 0.1 || 
              Math.abs(finalOffset.y - newCircleStyle.offset.y) > 0.1) {
            newCircleStyle.offset = finalOffset;
            offsetChanged = true;
          }
          
          // Сплющивание
          const finalDx = position.x - (metrics.center.x + finalOffset.x);
          const finalDy = position.y - (metrics.center.y + finalOffset.y);
          const finalDist = Math.sqrt(finalDx * finalDy);
          
          if (finalDist > 0) {
            const maxSquashDist = Math.max(metrics.originalRect.width, metrics.originalRect.height) * 1.0;
            const squashStrength = Math.min(finalDist / maxSquashDist, 0.2);
            const angle = Math.atan2(finalDy, finalDx);
            
            newCircleStyle.squash = {
              x: Math.max(0.7, 1 - Math.abs(Math.cos(angle)) * squashStrength),
              y: Math.max(0.7, 1 - Math.abs(Math.sin(angle)) * squashStrength)
            };
          }
          
          // Растяжение
          const maxDistForEffect = Math.max(metrics.originalRect.width, metrics.originalRect.height) * 1.5;
          const normalizedDist = Math.min(dist / maxDistForEffect, 1);
          const stretchIntensity = normalizedDist * 0.5;
          const angle = Math.atan2(dy, dx);
          
          newCircleStyle.stretch = {
            x: Math.min(2.0, 1 + Math.abs(Math.cos(angle)) * stretchIntensity),
            y: Math.min(2.0, 1 + Math.abs(Math.sin(angle)) * stretchIntensity)
          };
          
          newCircleStyle.isPulling = dist > 20;
          
          targetX = metrics.center.x + finalOffset.x;
          targetY = metrics.center.y + finalOffset.y;
          
        } else {
          // Для кнопок с фоном или когда курсор внутри
          newCircleStyle = {
            ...newCircleStyle,
            offset: { x: 0, y: 0 },
            squash: { x: 1, y: 1 },
            stretch: { x: 1, y: 1 },
            isPulling: false
          };
          
          targetX = metrics.center.x;
          targetY = metrics.center.y;
        }
        
        // Проверка на отлипание
        const dist = distance(position.x, position.y, metrics.center.x, metrics.center.y);
        const stickyThresholdOut = metrics.isSmallElement ? 60 : STICKY_THRESHOLD_OUT;
        
        if (dist > stickyThresholdOut + (metrics.hasBackground ? 0 : 40)) {
          // Отлипаем
          setShowCircle(false);
          isStickyRef.current = false;
          isInsideStickyAreaRef.current = false;
          stickyElementRef.current = null;
          offsetHistoryRef.current = [];
          
          setCircleStyle({
            width: 60,
            height: 60,
            borderRadius: 30,
            offset: { x: 0, y: 0 },
            squash: { x: 1, y: 1 },
            stretch: { x: 1, y: 1 },
            isPulling: false
          });
        } else if (offsetChanged) {
          // Обновляем стиль круга только если есть изменения
          setCircleStyle(newCircleStyle);
        }
      }

      // Движение логотипа
      if (!isSticky) {
        const attractionForce = 0.15;
        const dx = position.x - logoPositionRef.current.x;
        const dy = position.y - logoPositionRef.current.y;
        
        logoVelocityRef.current.x += dx * attractionForce;
        logoVelocityRef.current.y += dy * attractionForce;
        
        const damping = 0.85;
        logoVelocityRef.current.x *= damping;
        logoVelocityRef.current.y *= damping;
        
        logoPositionRef.current.x += logoVelocityRef.current.x;
        logoPositionRef.current.y += logoVelocityRef.current.y;
        
        targetX = logoPositionRef.current.x;
        targetY = logoPositionRef.current.y;
        smoothFactor = 0.08;
      } else {
        logoPositionRef.current.x = targetX;
        logoPositionRef.current.y = targetY;
        logoVelocityRef.current.x = 0;
        logoVelocityRef.current.y = 0;
      }

      // Сглаживание позиции SVG
      const speedFactor = Math.min(speed / 20, 1);
      const dynamicSmoothFactor = lerp(smoothFactor, 0.15, speedFactor);
      
      const newSvgX = lerp(svgPosition.x, targetX, dynamicSmoothFactor);
      const newSvgY = lerp(svgPosition.y, targetY, dynamicSmoothFactor);
      
      // Батчинг обновления позиции
      setSvgPosition({ x: newSvgX, y: newSvgY });
      
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [svgPosition, circleStyle]); // Минимальные зависимости

  const supportsBackdropFilter = () => {
    return CSS.supports('backdrop-filter', 'invert(1)') || 
           CSS.supports('-webkit-backdrop-filter', 'invert(1)');
  };

  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

  if (!supportsBackdropFilter() || isFirefox) {
    return null;
  }

  const shouldShowEffects = !buttonHasBackgroundRef.current && !isInsideStickyAreaRef.current;
  const combinedTransform = shouldShowEffects
    ? `translate(${circleStyle.offset.x}px, ${circleStyle.offset.y}px)
       scale(${circleStyle.squash.x}, ${circleStyle.squash.y})
       scale(${circleStyle.stretch.x}, ${circleStyle.stretch.y})`
    : 'translate(0px, 0px) scale(1, 1) scale(1, 1)';

  const logoOpacity = showCircle ? 0 : 1;
  const logoDisplay = showCircle ? 'none' : 'block';

  return (
    <div className="cursor-container">
      <div 
        className={`cursor-lens-backdrop ${isClicked ? 'clicked' : ''} ${isHovering ? 'hover' : ''}`}
        style={{
          left: `${svgPosition.x}px`,
          top: `${svgPosition.y}px`,
          transform: `translate(-50%, -50%) 
                     rotate(${logoStyle.rotation}rad)
                     scale(${logoStyle.scale.x}, ${logoStyle.scale.y})`,
          opacity: logoOpacity,
          display: logoDisplay,
          transition: 'opacity 0.1s ease-out, display 0.1s step-end'
        }}
      />
      
      {showCircle && (
        <div 
          className={`cursor-sticky-circle ${isClicked ? 'clicked' : ''} ${buttonHasBackgroundRef.current ? 'inside-button' : 'outside-button'} ${circleStyle.isPulling ? 'pulling' : ''}`}
          style={{
            left: `${svgPosition.x}px`,
            top: `${svgPosition.y}px`,
            width: `${circleStyle.width}px`,
            height: `${circleStyle.height}px`,
            borderRadius: `${circleStyle.borderRadius}px`,
            transform: `translate(-50%, -50%) ${combinedTransform}`,
            opacity: 1,
            transformOrigin: 'center',
            transition: !shouldShowEffects 
              ? 'opacity 0.1s ease-out, width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' 
              : 'opacity 0.1s ease-out, transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        />
      )}
    </div>
  );
};

export default GlobalCursor;