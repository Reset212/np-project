import React, { useState, useEffect, useRef } from 'react';
import './GlobalCursor2.css';

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
  const [buttonHasBackground, setButtonHasBackground] = useState(false);
  const [stretchEffect, setStretchEffect] = useState({ x: 1, y: 1 });
  const [isPulling, setIsPulling] = useState(false);
  const [circleOffset, setCircleOffset] = useState({ x: 0, y: 0 });
  const [circleSquash, setCircleSquash] = useState({ x: 1, y: 1 });
  
  const rafRef = useRef(null);
  const positionHistoryRef = useRef([]);
  const rotationHistoryRef = useRef([]);
  const stickyElementRef = useRef(null);
  const offsetHistoryRef = useRef([]);
  const stickStartTimeRef = useRef(0); // Время начала прилипания
  const isDetachingRef = useRef(false); // Флаг отлипания через ref
  const MAX_HISTORY = 5;
  const ROTATION_SMOOTH_HISTORY = 3;
  const OFFSET_SMOOTH_HISTORY = 3;

  const lerp = (start, end, factor) => {
    return start + (end - start) * factor;
  };

  const distance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  // Функция для проверки есть ли у элемента фон
  const hasBackground = (element) => {
    if (!element) return false;
    
    try {
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const backgroundImage = style.backgroundImage;
      
      const hasBgColor = backgroundColor && 
                        backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                        backgroundColor !== 'transparent';
      
      const hasBgImage = backgroundImage && backgroundImage !== 'none';
      const hasBoxShadow = style.boxShadow && style.boxShadow !== 'none';
      
      return hasBgColor || hasBgImage || hasBoxShadow;
    } catch (e) {
      return false;
    }
  };

  // Функция для получения точных размеров элемента
  const getElementMetrics = (element) => {
    const rect = element.getBoundingClientRect();
    
    const hasBg = hasBackground(element);
    setButtonHasBackground(hasBg);
    
    if (hasBg) {
      // Для кнопок с фоном - круг на весь фон
      const finalWidth = rect.width;
      const finalHeight = rect.height;
      
      const minSide = Math.min(finalWidth, finalHeight);
      const finalBorderRadius = Math.min(30, minSide / 2);
      
      return {
        x: rect.left,
        y: rect.top,
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
      const padding = {
        horizontal: 10,
        vertical: 8
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

  // Эффект растягивания
  const calculateStretchEffect = (cursorPos, buttonCenter, elementRect) => {
    if (!isSticky || !elementRect) return { x: 1, y: 1 };
    
    const dx = cursorPos.x - buttonCenter.x;
    const dy = cursorPos.y - buttonCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const maxStretchDist = Math.max(elementRect.width, elementRect.height) * 0.4;
    
    if (dist > maxStretchDist * 0.3) {
      const stretchIntensity = Math.min(dist / maxStretchDist, 1.2);
      const angle = Math.atan2(dy, dx);
      
      const stretchX = 1 + Math.abs(Math.cos(angle)) * stretchIntensity * 0.3;
      const stretchY = 1 + Math.abs(Math.sin(angle)) * stretchIntensity * 0.3;
      
      setIsPulling(true);
      
      return {
        x: stretchX,
        y: stretchY
      };
    } else {
      setIsPulling(false);
      return { x: 1, y: 1 };
    }
  };

  // Расчет смещения круга в сторону курсора
  const calculateCircleOffset = (cursorPos, buttonCenter, elementRect) => {
    if (!isSticky || !elementRect) return { x: 0, y: 0 };
    
    const dx = cursorPos.x - buttonCenter.x;
    const dy = cursorPos.y - buttonCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Максимальное расстояние, при котором работает смещение
    const maxOffsetDist = Math.max(elementRect.width, elementRect.height) * 0.8;
    
    if (dist < maxOffsetDist) {
      // Сила смещения (0-1) в зависимости от расстояния
      const offsetStrength = Math.min(dist / maxOffsetDist, 1);
      
      // Ограничиваем максимальное смещение (в пикселях)
      const maxOffset = Math.min(elementRect.width, elementRect.height) * 0.25; // Уменьшил с 0.3 до 0.25
      
      // Плавная кривая для смещения
      const smoothOffsetStrength = Math.pow(offsetStrength, 2); // Увеличил степень для более плавного начала
      
      return {
        x: dx * smoothOffsetStrength * maxOffset / maxOffsetDist,
        y: dy * smoothOffsetStrength * maxOffset / maxOffsetDist
      };
    }
    
    return { x: 0, y: 0 };
  };

  // Расчет сплющивания круга
  const calculateCircleSquash = (cursorPos, buttonCenter, elementRect, offset) => {
    if (!isSticky || !elementRect) return { x: 1, y: 1 };
    
    const dx = cursorPos.x - (buttonCenter.x + offset.x);
    const dy = cursorPos.y - (buttonCenter.y + offset.y);
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const maxSquashDist = Math.max(elementRect.width, elementRect.height) * 0.5;
    
    if (dist > 0) {
      const squashStrength = Math.min(dist / maxSquashDist, 0.2); // Уменьшил с 0.3 до 0.2
      const angle = Math.atan2(dy, dx);
      
      // Сплющиваем перпендикулярно направлению к курсору
      const squashX = 1 - Math.abs(Math.cos(angle)) * squashStrength * 0.15; // Уменьшил с 0.2 до 0.15
      const squashY = 1 - Math.abs(Math.sin(angle)) * squashStrength * 0.15; // Уменьшил с 0.2 до 0.15
      
      return {
        x: Math.max(0.85, squashX), // Увеличил с 0.8 до 0.85
        y: Math.max(0.85, squashY)  // Увеличил с 0.8 до 0.85
      };
    }
    
    return { x: 1, y: 1 };
  };

  // Функция для поиска ближайшего интерактивного элемента
  const findClosestInteractiveElement = (cursorPos) => {
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
      
      // Логика вращения только когда не прилипли
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
          
          const avgAngle = Math.atan2(sinSum / rotationHistoryRef.current.length, 
                                     cosSum / rotationHistoryRef.current.length);
          
          setRotation(prev => {
            const diff = avgAngle - prev;
            const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
            return prev + normalizedDiff * 0.3;
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
            return prev + normalizedDiff * 0.08;
          });
          
          setScale({
            x: lerp(scale.x, 1, 0.15),
            y: lerp(scale.y, 1, 0.15)
          });
        }
      } else {
        setRotation(0);
        setScale({ x: 1, y: 1 });
      }

      // Находим ближайший интерактивный элемент
      const { element: closestElement, distance: closestDistance } = findClosestInteractiveElement(position);
      
      // Прилипаем когда близко к элементу
      const STICKY_THRESHOLD = 50;
      const STICKY_HYSTERESIS = 10; // Гистерезис для предотвращения колебаний
      
      if (closestElement && closestDistance < STICKY_THRESHOLD && !isSticky) {
        // Добавляем задержку перед прилипанием для мелких элементов
        const metrics = getElementMetrics(closestElement);
        const elementSize = Math.min(metrics.originalRect.width, metrics.originalRect.height);
        
        // Для маленьких элементов увеличиваем порог
        const adjustedThreshold = elementSize < 40 ? STICKY_THRESHOLD * 1.5 : STICKY_THRESHOLD;
        
        if (closestDistance < adjustedThreshold) {
          // Проверяем, что курсор действительно хочет прилипнуть
          const timeSinceDetach = Date.now() - stickStartTimeRef.current;
          
          // Если недавно отлипли, добавляем дополнительную задержку
          if (!isDetachingRef.current || timeSinceDetach > 200) {
            setIsSticky(true);
            isDetachingRef.current = false;
            stickyElementRef.current = closestElement;
            
            // МГНОВЕННО устанавливаем размер кнопки для круга
            setCircleSize({
              width: metrics.width,
              height: metrics.height,
              borderRadius: metrics.borderRadius
            });
            
            // Сбрасываем смещение
            setCircleOffset({ x: 0, y: 0 });
            setCircleSquash({ x: 1, y: 1 });
            
            // Показываем круг, скрываем лого
            setShowCircle(true);
            
            targetX = metrics.center.x;
            targetY = metrics.center.y;
            
            setStickyTarget({
              x: metrics.center.x,
              y: metrics.center.y,
              width: metrics.width,
              height: metrics.height,
              borderRadius: metrics.borderRadius
            });
            
            smoothFactor = 0.1;
          }
        }
      } else if (isSticky && stickyElementRef.current) {
        const metrics = getElementMetrics(stickyElementRef.current);
        
        // Рассчитываем смещение круга в сторону курсора
        const newOffset = calculateCircleOffset(
          position, 
          metrics.center, 
          metrics.originalRect
        );
        
        // Сглаживаем смещение
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
        
        setCircleOffset(finalOffset);
        
        // Рассчитываем сплющивание круга
        const squash = calculateCircleSquash(
          position,
          metrics.center,
          metrics.originalRect,
          finalOffset
        );
        setCircleSquash(squash);
        
        // Обновляем растягивание
        const stretch = calculateStretchEffect(
          position, 
          { 
            x: metrics.center.x + finalOffset.x, 
            y: metrics.center.y + finalOffset.y 
          }, 
          metrics.originalRect
        );
        setStretchEffect(stretch);
        
        // Позиция круга с учетом смещения
        targetX = metrics.center.x + finalOffset.x;
        targetY = metrics.center.y + finalOffset.y;
        
        setStickyTarget({
          x: metrics.center.x,
          y: metrics.center.y,
          width: metrics.width,
          height: metrics.height,
          borderRadius: metrics.borderRadius
        });
        
        // Отлипаем когда ушли далеко (с гистерезисом)
        const dist = distance(position.x, position.y, metrics.center.x, metrics.center.y);
        const maxDistance = Math.max(metrics.originalRect.width, metrics.originalRect.height) * 0.8;
        
        // Для маленьких элементов увеличиваем дистанцию отлипания
        const elementSize = Math.min(metrics.originalRect.width, metrics.originalRect.height);
        const adjustedMaxDistance = elementSize < 40 ? maxDistance * 1.3 : maxDistance;
        
        if (dist > adjustedMaxDistance) {
          setIsSticky(false);
          isDetachingRef.current = true;
          stickStartTimeRef.current = Date.now();
          stickyElementRef.current = null;
          
          // МГНОВЕННО возвращаем размер лого для круга
          setCircleSize({ width: 60, height: 60, borderRadius: 30 });
          
          // Плавно сбрасываем смещение и сплющивание
          setCircleOffset(prev => ({ 
            x: lerp(prev.x, 0, 0.3), 
            y: lerp(prev.y, 0, 0.3) 
          }));
          setCircleSquash(prev => ({ 
            x: lerp(prev.x, 1, 0.3), 
            y: lerp(prev.y, 1, 0.3) 
          }));
          
          // Через небольшое время скрываем круг
          setTimeout(() => {
            if (!isSticky) {
              setShowCircle(false);
              setCircleOffset({ x: 0, y: 0 });
              setCircleSquash({ x: 1, y: 1 });
              offsetHistoryRef.current = [];
              setStretchEffect({ x: 1, y: 1 });
            }
          }, 150);
        }
      } else if (!isSticky && showCircle) {
        // Если не прилипли, но круг еще виден - плавно скрываем
        setCircleOffset(prev => ({ 
          x: lerp(prev.x, 0, 0.2), 
          y: lerp(prev.y, 0, 0.2) 
        }));
        setCircleSquash(prev => ({ 
          x: lerp(prev.x, 1, 0.2), 
          y: lerp(prev.y, 1, 0.2) 
        }));
        
        // Через небольшое время полностью скрываем
        if (Math.abs(circleOffset.x) < 0.1 && Math.abs(circleOffset.y) < 0.1) {
          setShowCircle(false);
          setCircleSize({ width: 60, height: 60, borderRadius: 30 });
          setCircleOffset({ x: 0, y: 0 });
          setCircleSquash({ x: 1, y: 1 });
          offsetHistoryRef.current = [];
          setStretchEffect({ x: 1, y: 1 });
        }
      }

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
  }, [position, svgPosition, velocity, isSticky, scale, rotation, showCircle, circleOffset]);

  const supportsBackdropFilter = () => {
    return CSS.supports('backdrop-filter', 'invert(1)') || 
           CSS.supports('-webkit-backdrop-filter', 'invert(1)');
  };

  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

  if (!supportsBackdropFilter() || isFirefox) {
    return null;
  }

  // Комбинированная трансформация: смещение + сплющивание + растягивание
  const combinedTransform = `
    translate(${circleOffset.x}px, ${circleOffset.y}px)
    scale(${circleSquash.x}, ${circleSquash.y})
    scale(${stretchEffect.x}, ${stretchEffect.y})
  `;

  return (
    <div className="cursor-container">
      {/* Лого-курсор (скрывается при прилипании) */}
      <div 
        className={`cursor-lens-backdrop ${isClicked ? 'clicked' : ''} ${isHovering ? 'hover' : ''}`}
        style={{
          left: `${svgPosition.x}px`,
          top: `${svgPosition.y}px`,
          transform: `translate(-50%, -50%) 
                     rotate(${rotation}rad)
                     scale(${scale.x}, ${scale.y})`,
          opacity: showCircle ? 0 : 1,
          display: showCircle ? 'none' : 'block',
          transition: showCircle ? 'opacity 0.15s ease, transform 0.2s ease' : 'opacity 0.15s ease, transform 0.2s ease'
        }}
      />
      
      {/* Круг для прилипания (показывается только при прилипании) */}
      {showCircle && (
        <div 
          className={`cursor-sticky-circle ${isClicked ? 'clicked' : ''} ${buttonHasBackground ? 'inside-button' : 'outside-button'} ${isPulling ? 'pulling' : ''}`}
          style={{
            left: `${svgPosition.x}px`,
            top: `${svgPosition.y}px`,
            width: `${circleSize.width}px`,
            height: `${circleSize.height}px`,
            borderRadius: `${circleSize.borderRadius}px`,
            transform: `translate(-50%, -50%) ${combinedTransform}`,
            opacity: 1,
            transformOrigin: 'center',
            transition: isSticky 
              ? 'opacity 0.15s ease, width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              : 'opacity 0.15s ease, width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        />
      )}
    </div>
  );
};

export default GlobalCursor;