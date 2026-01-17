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
  const stickStartTimeRef = useRef(0);
  const isDetachingRef = useRef(false);
  const lastStickyStateRef = useRef(false);
  const lastElementRef = useRef(null);
  const logoVelocityRef = useRef({ x: 0, y: 0 });
  const logoPositionRef = useRef({ x: 0, y: 0 });
  
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
    
    // Определяем, маленькая ли круглая кнопка
    const isSmallButton = rect.width < 80 && rect.height < 80;
    const computedStyle = window.getComputedStyle(element);
    const borderRadius = parseFloat(computedStyle.borderRadius);
    const isRound = borderRadius >= rect.width * 0.4 || borderRadius >= rect.height * 0.4;
    const isSmallRoundButton = isSmallButton && isRound;
    
    // Определяем, является ли кнопка маленькой (до 100px)
    const isSmallElement = rect.width <= 100 && rect.height <= 100;
    
    if (hasBg) {
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
        hasBackground: true,
        isSmallRoundButton,
        isSmallElement // Добавляем флаг маленькой кнопки
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
        hasBackground: false,
        isSmallRoundButton,
        isSmallElement // Добавляем флаг маленькой кнопки
      };
    }
  };

  // Эффект растягивания - одинаковый для всех кнопок
  const calculateStretchEffect = (cursorPos, buttonCenter, elementRect, isSmallRoundButton, hasBackground) => {
    if (!isSticky || !elementRect) return { x: 1, y: 1 };
    
    const dx = cursorPos.x - buttonCenter.x;
    const dy = cursorPos.y - buttonCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // ОДИНАКОВЫЕ параметры для всех кнопок
    let maxDistForEffect;
    if (!hasBackground) {
      maxDistForEffect = Math.max(elementRect.width, elementRect.height) * 1.5; // Увеличено для кнопок без фона
    } else {
      maxDistForEffect = Math.max(elementRect.width, elementRect.height) * 1.2; // Увеличено для всех кнопок
    }
    
    const normalizedDist = Math.min(dist / maxDistForEffect, 1);
    
    let stretchIntensity;
    if (!hasBackground) {
      stretchIntensity = normalizedDist * 0.5; // Сильный эффект для кнопок без фона
    } else {
      stretchIntensity = normalizedDist * 0.35; // Средний эффект для всех кнопок с фоном
    }
    
    const angle = Math.atan2(dy, dx);
    
    const stretchX = 1 + Math.abs(Math.cos(angle)) * stretchIntensity;
    const stretchY = 1 + Math.abs(Math.sin(angle)) * stretchIntensity;
    
    // Порог для состояния "оттягивания"
    setIsPulling(dist > 20); // Одинаковый для всех
    
    return {
      x: Math.min(stretchX, 2.0), // Увеличено максимальное растяжение
      y: Math.min(stretchY, 2.0)
    };
  };

  // Расчет смещения круга в сторону курсора - одинаковый для всех кнопок
  const calculateCircleOffset = (cursorPos, buttonCenter, elementRect, isSmallRoundButton, hasBackground) => {
    if (!isSticky || !elementRect) return { x: 0, y: 0 };
    
    const dx = cursorPos.x - buttonCenter.x;
    const dy = cursorPos.y - buttonCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // ОДИНАКОВЫЕ параметры для всех кнопок
    let maxOffsetDist, maxOffset;
    
    if (!hasBackground) {
      maxOffsetDist = Math.max(elementRect.width, elementRect.height) * 1.8; // Большая зона смещения
      maxOffset = Math.min(elementRect.width, elementRect.height) * 0.4; // Большое смещение
    } else {
      maxOffsetDist = Math.max(elementRect.width, elementRect.height) * 1.5; // Средняя зона смещения
      maxOffset = Math.min(elementRect.width, elementRect.height) * 0.3; // Среднее смещение
    }
    
    if (dist < maxOffsetDist) {
      const offsetStrength = Math.min(dist / maxOffsetDist, 1);
      
      // Одинаковая кривая для всех
      const smoothOffsetStrength = Math.pow(offsetStrength, 1.5);
      
      return {
        x: dx * smoothOffsetStrength * maxOffset / maxOffsetDist,
        y: dy * smoothOffsetStrength * maxOffset / maxOffsetDist
      };
    }
    
    // Даже если курсор далеко, все равно смещаем пузырь немного
    const maxAllowedOffset = maxOffset * 0.3;
    const clampedOffset = {
      x: Math.max(-maxAllowedOffset, Math.min(maxAllowedOffset, dx * 0.3)),
      y: Math.max(-maxAllowedOffset, Math.min(maxAllowedOffset, dy * 0.3))
    };
    
    return clampedOffset;
  };

  // Расчет сплющивания круга
  const calculateCircleSquash = (cursorPos, buttonCenter, elementRect, offset, isSmallRoundButton, hasBackground) => {
    if (!isSticky || !elementRect) return { x: 1, y: 1 };
    
    const dx = cursorPos.x - (buttonCenter.x + offset.x);
    const dy = cursorPos.y - (buttonCenter.y + offset.y);
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Одинаковый для всех
    const maxSquashDist = Math.max(elementRect.width, elementRect.height) * 1.0;
    
    if (dist > 0) {
      const squashStrength = Math.min(dist / maxSquashDist, 0.2);
      const angle = Math.atan2(dy, dx);
      
      const squashX = 1 - Math.abs(Math.cos(angle)) * squashStrength;
      const squashY = 1 - Math.abs(Math.sin(angle)) * squashStrength;
      
      let minSquash = 0.8; // Одинаковый для всех
      if (!hasBackground) {
        minSquash = 0.7; // Сильнее сплющиваем кнопки без фона
      }
      
      return {
        x: Math.max(minSquash, squashX),
        y: Math.max(minSquash, squashY)
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
      
      // Логика вращения лого и его сплющивания от скорости
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
      
      const STICKY_THRESHOLD_IN = 50;
      const STICKY_THRESHOLD_OUT_LARGE = 140; // Для больших кнопок
      const STICKY_THRESHOLD_OUT_SMALL = 60; // Для маленьких кнопок (до 100px)
      
      // Проверяем, нужно ли прилипнуть
      if (closestElement && closestDistance < STICKY_THRESHOLD_IN && !isSticky) {
        const metrics = getElementMetrics(closestElement);
        
        setShowCircle(true);
        setCircleSize({
          width: metrics.width,
          height: metrics.height,
          borderRadius: metrics.borderRadius
        });
        
        setCircleOffset({ x: 0, y: 0 });
        setCircleSquash({ x: 1, y: 1 });
        
        targetX = metrics.center.x;
        targetY = metrics.center.y;
        
        setIsSticky(true);
        isDetachingRef.current = false;
        stickyElementRef.current = closestElement;
        setStickyTarget({
          x: metrics.center.x,
          y: metrics.center.y,
          width: metrics.width,
          height: metrics.height,
          borderRadius: metrics.borderRadius
        });
        
        smoothFactor = 0.1;
      } else if (isSticky && stickyElementRef.current) {
        const metrics = getElementMetrics(stickyElementRef.current);
        
        // Рассчитываем смещение пузыря в сторону курсора
        const newOffset = calculateCircleOffset(
          position, 
          metrics.center, 
          metrics.originalRect,
          metrics.isSmallRoundButton,
          metrics.hasBackground
        );
        
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
        
        // Рассчитываем сплющивание пузыря
        const squash = calculateCircleSquash(
          position,
          metrics.center,
          metrics.originalRect,
          finalOffset,
          metrics.isSmallRoundButton,
          metrics.hasBackground
        );
        setCircleSquash(squash);
        
        // Обновляем растягивание пузыря
        const stretch = calculateStretchEffect(
          position, 
          { 
            x: metrics.center.x + finalOffset.x, 
            y: metrics.center.y + finalOffset.y 
          }, 
          metrics.originalRect,
          metrics.isSmallRoundButton,
          metrics.hasBackground
        );
        setStretchEffect(stretch);
        
        // Позиция пузыря с учетом смещения
        targetX = metrics.center.x + finalOffset.x;
        targetY = metrics.center.y + finalOffset.y;
        
        // Проверяем расстояние для отлипания
        const dist = distance(position.x, position.y, metrics.center.x, metrics.center.y);
        
        // Динамический порог отрыва в зависимости от размера кнопки
        let stickyThresholdOut;
        if (metrics.isSmallElement) {
          // Маленькая кнопка (до 100px) - порог 100px
          stickyThresholdOut = STICKY_THRESHOLD_OUT_SMALL;
        } else {
          // Большая кнопка - порог 140px
          stickyThresholdOut = STICKY_THRESHOLD_OUT_LARGE;
        }
        
        // Дополнительная проверка для кнопок без фона (увеличиваем порог)
        if (!metrics.hasBackground) {
          stickyThresholdOut += 40; // Добавляем еще 40px для кнопок без фона
        }
        
        if (dist > stickyThresholdOut) {
          setShowCircle(false);
          setIsSticky(false);
          isDetachingRef.current = true;
          stickStartTimeRef.current = Date.now();
          stickyElementRef.current = null;
          
          // Сбрасываем параметры пузыря
          setCircleSize({ width: 60, height: 60, borderRadius: 30 });
          setCircleOffset({ x: 0, y: 0 });
          setCircleSquash({ x: 1, y: 1 });
          offsetHistoryRef.current = [];
          setStretchEffect({ x: 1, y: 1 });
        }
      } else if (!isSticky && showCircle) {
        // Дополнительная проверка: если не прилипли, но пузырь еще виден
        setShowCircle(false);
        setCircleSize({ width: 60, height: 60, borderRadius: 30 });
        setCircleOffset({ x: 0, y: 0 });
        setCircleSquash({ x: 1, y: 1 });
        setStretchEffect({ x: 1, y: 1 });
      }

      // Плавное следование лого за курсором с отставанием
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

  const combinedTransform = `
    translate(${circleOffset.x}px, ${circleOffset.y}px)
    scale(${circleSquash.x}, ${circleSquash.y})
    scale(${stretchEffect.x}, ${stretchEffect.y})
  `;

  const logoOpacity = showCircle ? 0 : 1;
  const logoDisplay = showCircle ? 'none' : 'block';

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
          opacity: logoOpacity,
          display: logoDisplay,
          transition: 'opacity 0.1s ease-out, display 0.1s step-end'
        }}
      />
      
      {/* Пузырь для прилипания (показывается только при прилипании) */}
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
            transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
          }}
        />
      )}
    </div>
  );
};

export default GlobalCursor;