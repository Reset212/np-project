import React, { useState, useEffect, useRef } from 'react';
import './GlobalCursor2.css';

const GlobalCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [svgPosition, setSvgPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [lastTime, setLastTime] = useState(Date.now());
  const [isSticky, setIsSticky] = useState(false);
  const [stickyTarget, setStickyTarget] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [rotation, setRotation] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [dotScale, setDotScale] = useState({ x: 1, y: 1 });
  
  const rafRef = useRef(null);
  const positionHistoryRef = useRef([]);
  const rotationHistoryRef = useRef([]);
  const MAX_HISTORY = 5;
  const ROTATION_SMOOTH_HISTORY = 3;

  const lerp = (start, end, factor) => {
    return start + (end - start) * factor;
  };

  const distance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
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
      setTimeout(() => setIsClicked(false), 300);
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
        el.tagName === 'SELECT'
      );
      
      setIsHovering(isOverInteractive);
    };

    const interval = setInterval(checkHover, 50);
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
      
      // УЛУЧШЕННАЯ ЛОГИКА ВРАЩЕНИЯ С ГИСТЕРЕЗИСОМ
      if (speed > 10) { // Увеличили порог с 5 до 10 для устранения дрожания
        const angle = Math.atan2(velocity.y, velocity.x);
        
        // Сглаживание угла через историю
        rotationHistoryRef.current.push(angle);
        if (rotationHistoryRef.current.length > ROTATION_SMOOTH_HISTORY) {
          rotationHistoryRef.current.shift();
        }
        
        // Вычисляем средний угол из истории
        let avgAngle = 0;
        let sinSum = 0;
        let cosSum = 0;
        
        rotationHistoryRef.current.forEach(a => {
          sinSum += Math.sin(a);
          cosSum += Math.cos(a);
        });
        
        avgAngle = Math.atan2(sinSum / rotationHistoryRef.current.length, 
                              cosSum / rotationHistoryRef.current.length);
        
        // Плавное изменение угла с учетом гистерезиса
        const angleDiff = Math.abs(avgAngle - rotation);
        const normalizedDiff = Math.min(angleDiff / Math.PI, 1);
        
        // Быстрое вращение при больших изменениях, медленное - при мелких
        const lerpFactor = normalizedDiff > 0.3 ? 0.3 : 0.1;
        
        setRotation(prev => {
          // Нормализуем углы для плавного перехода через 0
          const diff = avgAngle - prev;
          const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
          return prev + normalizedDiff * lerpFactor;
        });
        
        const stretchAmount = 1 + speedRatio * 0.5;
        const squeezeAmount = 1 - speedRatio * 0.2;
        
        setScale({
          x: stretchAmount,
          y: squeezeAmount
        });
      } else {
        // При медленном движении - плавный возврат к нулевому вращению
        setRotation(prev => {
          const diff = -prev;
          const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
          return prev + normalizedDiff * 0.08; // Очень плавный возврат
        });
        
        setScale({
          x: lerp(scale.x, 1, 0.15),
          y: lerp(scale.y, 1, 0.15)
        });
      }

      // Логика прилипания к кнопкам
      const buttons = document.querySelectorAll('button, a[href], [role="button"], input[type="submit"], input[type="button"]');
      let isOverButton = false;
      let buttonCenter = { x: 0, y: 0 };
      let buttonRadius = 0;

      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        
        const dist = distance(position.x, position.y, center.x, center.y);
        const radius = Math.max(rect.width, rect.height) / 2 + 30;
        
        if (dist < radius) {
          isOverButton = true;
          buttonCenter = center;
          buttonRadius = radius;
        }
      });

      if (isOverButton && !isSticky) {
        setIsSticky(true);
        setStickyTarget(buttonCenter);
        smoothFactor = 0.05;
      } else if (isSticky) {
        targetX = stickyTarget.x;
        targetY = stickyTarget.y;
        
        const pullAwayDistance = buttonRadius * 1.5;
        const currentDist = distance(position.x, position.y, stickyTarget.x, stickyTarget.y);
        if (currentDist > pullAwayDistance) {
          setIsSticky(false);
        }
      }

      // Деформация точки при прилипании
      if (isSticky && buttonRadius > 0) {
        const dx = position.x - stickyTarget.x;
        const dy = position.y - stickyTarget.y;
        const distFromCenter = Math.min(distance(0, 0, dx, dy), buttonRadius);
        
        const normDist = distFromCenter / buttonRadius;
        const angle = Math.atan2(dy, dx);
        
        const stretchAmount = 1 + normDist * 0.6;
        const squeezeAmount = 1 - normDist * 0.4;
        
        setDotScale({
          x: stretchAmount,
          y: squeezeAmount
        });
      } else {
        setDotScale(prev => ({
          x: lerp(prev.x, 1, 0.15),
          y: lerp(prev.y, 1, 0.15)
        }));
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
  }, [position, svgPosition, velocity, isSticky, stickyTarget, scale, rotation, dotScale]);

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
      {/* SVG курсор - скрывается при прилипании */}
      <div 
        className={`cursor-lens-backdrop ${isClicked ? 'clicked' : ''} ${isHovering ? 'hover' : ''}`}
        style={{
          left: `${svgPosition.x}px`,
          top: `${svgPosition.y}px`,
          transform: `translate(-50%, -50%) 
                     rotate(${rotation}rad)
                     scale(${scale.x}, ${scale.y})`,
          opacity: isSticky ? 0 : 1
        }}
      />
      
      {/* Деформируемая точка при прилипании */}
      <div 
        className="cursor-sticky-dot"
        style={{
          left: `${svgPosition.x}px`,
          top: `${svgPosition.y}px`,
          transform: `translate(-50%, -50%) 
                     scale(${dotScale.x}, ${dotScale.y})`,
          opacity: isSticky ? 1 : 0,
          '--deform-x': `${(dotScale.x - 1) * 50}%`,
          '--deform-y': `${(1 - dotScale.y) * 50}%`
        }}
      />
    </div>
  );
};

export default GlobalCursor;